import { PrismaClient } from "@prisma/client";
import express from "express";
import {
  BAD_REQUEST,
  CREATED,
  NOT_FOUND,
  OK,
  SERVER_ERROR,
  UNAUTHORIZED,
} from "../constants/response-constant";
import isAuth from "../middlewares/is-auth";
import checkResourceAvailable from "../middlewares/is-resource";
import { data_to_workbook } from "../utils/excel-writer";
import { jsObjectsToSqlInsert } from "../utils/export-helper";
import logger from "../utils/logger";
import {
  aliasData,
  expressRequestQueryToPrismaQuery,
} from "../utils/query-helper";

const router = express.Router();
const prisma = new PrismaClient();

router
  .route("/")
  .get(isAuth, async (req, res) => {
    try {
      logger.info("Get all roles");
      logger.info(`Request Query: ${JSON.stringify(req.query)}`);

      const accessRights = await checkResourceAvailable(
        req.tokenData.userid,
        "schema",
        "role",
        "r"
      );
      if (!accessRights) {
        return res.status(UNAUTHORIZED.code).json({
          ...UNAUTHORIZED,
          message: "You don't have permission to access this resource",
        });
      }

      const prismaQuery = expressRequestQueryToPrismaQuery(req.query, [
        "id",
        "appid",
        "createdBy",
        "updatedBy",
        "creater",
        "updater",
        "name",
        "description",
      ]);

      if (req.tokenData.appid !== "iamv2") {
        prismaQuery.where.appid = req.tokenData.appid;
      }
      if (req.tokenData.level < 100) {
        prismaQuery.where.createdBy = {
          in: [req.tokenData.userid, ...accessRights],
        };
      }

      const roles = await prisma.role.findMany(prismaQuery);
      const data = aliasData(
        roles,
        (req.query.select as string) || (req.query.projections as string)
      );
      if (req.query.export_by) {
        const export_by = req.query.export_by as string;
        const file_name = `${Date.now()}_${export_by}`;
        if (
          export_by.endsWith(".csv") ||
          export_by.endsWith(".xls") ||
          export_by.endsWith(".xlsx")
        ) {
          const workbook = data_to_workbook("Roles", data);
          if (!workbook) {
            throw new Error("Error while creating workbook");
          }
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + file_name
          );

          logger.info("Exporting roles to excel");
          return workbook.xlsx.write(res).then(function () {
            res.status(200).end();
          });
        } else if (export_by.endsWith(".sql")) {
          const sql = jsObjectsToSqlInsert("Roles", data);
          res.setHeader("Content-Type", "text/plain");
          res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + file_name
          );
          logger.info("Exporting roles to sql");
          return res.send(sql);
        }
      }
      if (req.query.page && req.query.per_page) {
        const page = parseInt(req.query.page as string, 10);
        const per_page = parseInt(req.query.per_page as string, 10);
        delete prismaQuery.take;
        delete prismaQuery.skip;
        delete prismaQuery.select;
        const total = await prisma.role.count(prismaQuery);

        const page_counts = Math.ceil(total / per_page);
        return res.json({
          ...OK,
          data,
          page_counts,
          total,
          page,
          per_page,
        });
      }

      res.json({
        ...OK,
        data,
      });
      logger.info("get all roles success");
    } catch (err) {
      logger.error(`Error: ${err}`);
      res.status(SERVER_ERROR.code).json(SERVER_ERROR);
    }
  })
  .post(isAuth, async (req, res) => {
    try {
      logger.info("Create role");
      logger.info(`Request Body: ${JSON.stringify(req.body)}`);
      const accessRights = await checkResourceAvailable(
        req.tokenData.userid,
        "schema",
        "role",
        "c"
      );

      if (!accessRights) {
        return res.status(UNAUTHORIZED.code).json({
          ...UNAUTHORIZED,
          message: "You don't have permission to access this resource",
        });
      }
      const { name, description } = req.body;

      let appid: string = req.tokenData.appid;
      if (req.tokenData.appid === "iamv2") {
        appid = req.body.appid;
      }
      let role = await prisma.role.findFirst({
        where: {
          name,
          appid,
          status: 1,
        },
      });
      if (role) {
        return res.status(BAD_REQUEST.code).json({
          ...BAD_REQUEST,
          message: "Role already exist.",
        });
      }
      role = await prisma.role.create({
        data: {
          name,
          description,
          appid,
          createdBy: req.tokenData.userid,
          creater: req.tokenData.fullname,
          updatedBy: req.tokenData.userid,
          updater: req.tokenData.fullname,
        },
      });
      res.status(CREATED.code).json({
        ...CREATED,
        data: role,
      });
      logger.info("Create role success");
    } catch (err) {
      logger.error(`Error: ${err}`);
      res.status(SERVER_ERROR.code).json(SERVER_ERROR);
    }
  });

router
  .route("/:id")
  .get(isAuth, async (req, res) => {
    try {
      logger.info("Get role");
      logger.info(`Request Params: ${JSON.stringify(req.params)}`);
      logger.info(`Request Query: ${JSON.stringify(req.query)}`);
      const accessRights = await checkResourceAvailable(
        req.tokenData.userid,
        "schema",
        "role",
        "r"
      );
      if (!accessRights) {
        return res.status(UNAUTHORIZED.code).json({
          ...UNAUTHORIZED,
          message: "You don't have permission to access this resource",
        });
      }
      const prismaQuery = expressRequestQueryToPrismaQuery(req.query);
      const where: any = { id: req.params.id, status: 1 };
      if (req.tokenData.level < 100) {
        where.createdBy = { in: [req.tokenData.userid, ...accessRights] };
      }
      const role = await prisma.role.findFirst({
        where,
        select: prismaQuery.select,
      });
      if (!role) {
        return res
          .status(NOT_FOUND.code)
          .json({ ...NOT_FOUND, message: "Role not found" });
      }
      res.json({
        ...OK,
        data: aliasData(
          [role],
          (req.query.select as string) || (req.query.projections as string)
        )[0],
      });
      logger.info("Get role success");
    } catch (err) {
      logger.error(`Error: ${err}`);
      res.status(SERVER_ERROR.code).json(SERVER_ERROR);
    }
  })
  .put(isAuth, async (req, res) => {
    try {
      logger.info("Update role");
      logger.info(`Request Params: ${JSON.stringify(req.params)}`);
      logger.info(`Request Body: ${JSON.stringify(req.body)}`);
      const accessRights = await checkResourceAvailable(
        req.tokenData.userid,
        "schema",
        "role",
        "u"
      );
      if (!accessRights) {
        return res.status(UNAUTHORIZED.code).json({
          ...UNAUTHORIZED,
          message: "You don't have permission to access this resource",
        });
      }
      const { name, description } = req.body;
      let appid: string = req.tokenData.appid;
      if (req.tokenData.appid === "iamv2") {
        appid = req.body.appid;
      }
      let role = await prisma.role.findFirst({
        where: {
          id: req.params.id,
          status: 1,
        },
      });
      if (!role) {
        return res
          .status(NOT_FOUND.code)
          .json({ ...NOT_FOUND, message: "Role not found" });
      }
      if (
        req.tokenData.level < 100 &&
        ![req.tokenData.userid, ...accessRights].includes(role.createdBy)
      ) {
        return res.status(UNAUTHORIZED.code).json({
          ...UNAUTHORIZED,
          message: "You don't have permission to access this resource",
        });
      }
      role = await prisma.role.update({
        where: {
          id: req.params.id,
        },
        data: {
          name,
          description,
          appid,
          updatedBy: req.tokenData.userid,
          updater: req.tokenData.fullname,
        },
      });
      res.json({
        ...OK,
        data: role,
      });
      logger.info("Update role success");
    } catch (err) {
      logger.error(`Error: ${err}`);
      res.status(SERVER_ERROR.code).json(SERVER_ERROR);
    }
  })
  .delete(isAuth, async (req, res) => {
    try {
      logger.info("Delete role");
      logger.info(`Request Params: ${JSON.stringify(req.params)}`);

      const accessRights = await checkResourceAvailable(
        req.tokenData.userid,
        "schema",
        "role",
        "d"
      );
      if (!accessRights) {
        return res.status(UNAUTHORIZED.code).json({
          ...UNAUTHORIZED,
          message: "You don't have permission to access this resource",
        });
      }
      let role = await prisma.role.findFirst({
        where: {
          id: req.params.id,
          status: 1,
        },
      });
      if (!role) {
        return res
          .status(NOT_FOUND.code)
          .json({ ...NOT_FOUND, message: "Role not found" });
      }
      if (
        req.tokenData.level < 100 &&
        ![req.tokenData.userid, ...accessRights].includes(role.createdBy)
      ) {
        return res.status(UNAUTHORIZED.code).json({
          ...UNAUTHORIZED,
          message: "You don't have permission to access this resource",
        });
      }
      role = await prisma.role.update({
        where: {
          id: req.params.id,
        },
        data: {
          status: 0,
        },
      });
      res.json({
        ...OK,
        data: role,
      });
      logger.info("Delete role success");
    } catch (err) {
      logger.error(`Error: ${err}`);
      res.status(SERVER_ERROR.code).json(SERVER_ERROR);
    }
  });

export default router;

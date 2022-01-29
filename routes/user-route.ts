import express from "express";
import { PrismaClient } from "@prisma/client";
import isAuth from "../middlewares/is-auth";
import { writeDataUrlToFile } from "../utils/file-utils";
import {
  CREATED,
  NOT_FOUND,
  OK,
  SERVER_ERROR,
  UNAUTHORIZED,
} from "../constants/response-constant";
import checkResourceAvailable from "../middlewares/is-resource";
import logger from "../utils/log-utils";
import bcrypt from "bcryptjs";
import {
  aliasData,
  expressRequestQueryToPrismaQuery,
} from "../utils/query-utils";

const prisma = new PrismaClient();
const router = express.Router();

router
  .route("/")
  .get(isAuth, async (req, res) => {
    try {
      logger.info("Get all users");
      logger.info(`Request Query: ${JSON.stringify(req.query)}`);
      const isAvailable = await checkResourceAvailable(
        req.tokenData,
        "schema",
        "user",
        "r"
      );
      if (!isAvailable) {
        return res.status(UNAUTHORIZED.code).json({
          ...UNAUTHORIZED,
          message: "You don't have permission to access this resource",
        });
      }
      const prismaQuery = expressRequestQueryToPrismaQuery(req.query, [
        "id",
        "username",
        "fullname",
        "email",
        "mobile",
        "accstatus",
        "appid",
        "createdat",
        "updatedat",
        "createdBy",
        "updatedBy",
        "creater",
        "updater",
        "address",
        "dob",
      ]);
      console.log(prismaQuery);
      if (req.tokenData.appid !== "iamv2") {
        prismaQuery.where.appid = req.tokenData.appid;
      }
      const users = await prisma.user.findMany(prismaQuery);
      if (req.query.page && req.query.per_page) {
        const page = parseInt(req.query.page as string, 10);
        const per_page = parseInt(req.query.per_page as string, 10);
        delete prismaQuery.take;
        delete prismaQuery.skip;
        delete prismaQuery.select;
        const total = await prisma.user.count(prismaQuery);

        const page_counts = Math.ceil(
          total / parseInt(req.query.per_page as string)
        );
        return res.json({
          ...OK,
          data: aliasData(users, req.query.select as string),
          page_counts,
          total,
          page,
          per_page,
        });
      }

      res.json({ ...OK, data: aliasData(users, req.query.select as string) });
      logger.info("get all users success");
    } catch (err) {
      logger.error(`Error: ${err}`);
      res.status(SERVER_ERROR.code).json(SERVER_ERROR);
    }
  })
  .post(isAuth, async (req, res) => {
    try {
      logger.info("Creating user");
      logger.info(`Request Body: ${JSON.stringify(req.body)}`);
      const isAvailable = await checkResourceAvailable(
        req.tokenData,
        "schema",
        "user",
        "c"
      );
      if (!isAvailable) {
        return res.status(UNAUTHORIZED.code).json({
          ...UNAUTHORIZED,
          message: "You are not authorized to create user.",
        });
      }

      const {
        username,
        password,
        firstname,
        lastname,
        twofactor,
        email,
        mobile,
        address,
        dob,
        organizationid,
        accstatus,
      } = req.body;

      let appid: string = req.tokenData.appid;
      if (req.tokenData.appid === "iamv2") {
        appid = req.body.appid;
      }
      const hashedPwd = await bcrypt.hash(password, 10);
      let user = await prisma.user.create({
        data: {
          username,
          password: hashedPwd,
          firstname,
          lastname,
          fullname: firstname + " " + lastname,
          appid,
          twofactor,
          email,
          mobile,
          address,
          dob,
          organizationid,
          accstatus,
          createdBy: req.tokenData.userid,
          creater: firstname + " " + lastname,
          updatedBy: req.tokenData.userid,
          updater: firstname + " " + lastname,
        },
      });
      let profile = req.body.profile;
      if (profile) {
        profile = writeDataUrlToFile(profile, user.id);
        user = await prisma.user.update({
          where: { id: user.id },
          data: { profile },
        });
      }

      res.json({ ...CREATED, data: user });
      logger.info("User created successfully");
    } catch (err) {
      logger.error(`Error: ${err}`);
      res.status(SERVER_ERROR.code).json(SERVER_ERROR);
    }
  });

router
  .route("/:id")
  .get(isAuth, async (req, res) => {
    try {
      logger.info("Get user by id");
      logger.info(`Request Query: ${JSON.stringify(req.query)}`);
      const isAvailable = await checkResourceAvailable(
        req.tokenData,
        "schema",
        "user",
        "r"
      );
      if (!isAvailable) {
        return res.status(UNAUTHORIZED.code).json({
          ...UNAUTHORIZED,
          message: "You don't have permission to access this resource",
        });
      }
      const prismaQuery = expressRequestQueryToPrismaQuery(req.query, []);

      const user = await prisma.user.findFirst({
        select: prismaQuery.select,
        where: {
          id: req.params.id,
          status: 1,
        },
      });
      if (!user) {
        return res.status(NOT_FOUND.code).json({
          ...NOT_FOUND,
          message: "User not found",
        });
      }
      res.json({ ...OK, data: user });
      logger.info("get user by id success");
    } catch (err) {
      logger.error(`Error: ${err}`);
      res.status(SERVER_ERROR.code).json(SERVER_ERROR);
    }
  })
  .put(isAuth, async (req, res) => {
    try {
      logger.info("Update user by id");
      logger.info(`Request Query: ${JSON.stringify(req.query)}`);
      logger.info(`Request Body: ${JSON.stringify(req.body)}`);
      const isAvailable = await checkResourceAvailable(
        req.tokenData,
        "schema",
        "user",
        "u"
      );
      if (!isAvailable) {
        return res.status(UNAUTHORIZED.code).json({
          ...UNAUTHORIZED,
          message: "You don't have permission to access this resource",
        });
      }
      const {
        username,
        password,
        firstname,
        lastname,
        twofactor,
        email,
        mobile,
        address,
        dob,
        organizationid,
        accstatus,
        level,
      } = req.body;
      let appid: string = req.tokenData.appid;
      if (req.tokenData.appid === "iamv2") {
        appid = req.body.appid;
      }
      const hashedPwd = await bcrypt.hash(password, 10);
      let user = await prisma.user.update({
        where: { id: req.params.id },
        data: {
          username,
          password: hashedPwd,
          firstname,
          lastname,
          fullname: firstname + " " + lastname,
          appid,
          twofactor,
          email,
          mobile,
          address,
          dob,
          organizationid,
          accstatus,
          level,
          updatedBy: req.tokenData.userid,
          updater: firstname + " " + lastname,
        },
      });
      let profile = req.body.profile;
      if (profile) {
        profile = writeDataUrlToFile(profile, user.id);
        user = await prisma.user.update({
          where: { id: user.id },
          data: { profile },
        });
      }
      res.json({ ...OK, data: user });
    } catch (err) {
      logger.error(`Error: ${err}`);
      res.status(SERVER_ERROR.code).json(SERVER_ERROR);
    }
  })
  .delete(isAuth, async (req, res) => {
    try {
      logger.info("Delete user by id");
      logger.info(`Request Query: ${JSON.stringify(req.query)}`);
      const isAvailable = await checkResourceAvailable(
        req.tokenData,
        "schema",
        "user",
        "d"
      );
      if (!isAvailable) {
        return res.status(UNAUTHORIZED.code).json({
          ...UNAUTHORIZED,
          message: "You don't have permission to access this resource",
        });
      }

      const user = await prisma.user.findFirst({
        where: { id: req.params.id, status: 1 },
      });
      if (!user) {
        return res.status(NOT_FOUND.code).json({
          ...NOT_FOUND,
          message: "User not found",
        });
      }
      await prisma.user.update({
        data: { status: 0 },
        where: { id: req.params.id },
      });
      res.sendStatus(204);
      logger.info("Delete user by id success");
    } catch (err) {
      logger.error(`Error: ${err}`);
      res.status(SERVER_ERROR.code).json(SERVER_ERROR);
    }
  });

export default router;

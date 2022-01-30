import express from "express";
import { PrismaClient } from "@prisma/client";
import { OK, SERVER_ERROR, UNAUTHORIZED } from "../constants/response-constant";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import logger from "../utils/log-utils";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/refresh-token", async (req, res) => {
  try {
    logger.info("Refresh token");
    logger.info(`Request Query: ${JSON.stringify(req.query)}`);
    const token = req.query.token as string;
    if (!token) {
      return res.status(UNAUTHORIZED.code).json({
        ...UNAUTHORIZED,
        message: "No token provided",
      });
    }
    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, process.env.SECRET || "iamv2");
    } catch (err) {
      return res.status(UNAUTHORIZED.code).json({
        ...UNAUTHORIZED,
        message: "Invalid token",
      });
    }
    if (!decodedToken) {
      return res.status(UNAUTHORIZED.code).json({
        ...UNAUTHORIZED,
        message: "Not authenticated!",
      });
    }
    // check user is exist
    const user = await prisma.user.findFirst({
      where: {
        id: decodedToken.userid,
        status: 1,
        accstatus: "active",
      },
    });
    if (!user) {
      return res.status(UNAUTHORIZED.code).json({
        ...UNAUTHORIZED,
        message: "User not found",
      });
    }
    // generate new token
    const newToken = jwt.sign(decodedToken, process.env.SECRET || "iamv2", {
      expiresIn: process.env.TOKEN_EXPIRATION || "1h",
    });
    res.json({
      code: OK.code,
      token: newToken,
      message: "Token refreshed",
    });
    logger.info("Token refreshed");
  } catch (err) {
    logger.error(err);
    res.status(SERVER_ERROR.code).json(SERVER_ERROR);
  }
});

router.post("/login", async (req, res) => {
  try {
    logger.info("Login user");
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);
    const { username, password, appid } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        username,
        appid,
        status: 1,
      },
    });
    if (!user) {
      return res
        .status(UNAUTHORIZED.code)
        .json({ code: UNAUTHORIZED.code, message: "User not found" });
    }
    if (user.accstatus === "inactive") {
      return res.status(UNAUTHORIZED.code).json({
        code: UNAUTHORIZED.code,
        message: "User is inactive. Please contact administrator.",
      });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res
        .status(UNAUTHORIZED.code)
        .json({ code: UNAUTHORIZED.code, message: "Invalid Password" });
    }
    const token = jwt.sign(
      {
        userid: user.id,
        appid: user.appid,
        level: user.level,
      },
      process.env.SECRET || "iamv2",
      {
        expiresIn: process.env.TOKEN_EXPIRES_IN || "1h",
      }
    );
    const roles = await prisma.userRole.findMany({
      select: {
        role: true,
      },
      where: {
        userid: user.id,
        status: 1,
      },
    });
    res.json({
      ...OK,
      token,
      fullname: user.fullname,
      roles: roles.map((r) => r.role.name),
      profile: user.profile,
    });
    logger.info("Login user success");
  } catch (err) {
    logger.error(`Error: ${err}`);
    res.status(SERVER_ERROR.code).json(SERVER_ERROR);
  }
});

export default router;

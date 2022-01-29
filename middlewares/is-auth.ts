import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import logger from "../utils/log-utils";

export default async function isAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(419).json({ code: 419, message: "No auth header" });
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.SECRET || "iamv2");
  } catch (err) {
    return res.status(401).json({ code: 401, message: "Invalid Token" });
  }
  if (!decodedToken) {
    return res.status(401).json({ code: 401, message: "Not authenticated!" });
  }

  req.tokenData = decodedToken;
  logger.info(`Token Payload: ${JSON.stringify(req.tokenData)}`);
  next();
}

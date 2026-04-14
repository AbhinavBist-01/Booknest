import { NextFunction, Request, Response } from "express";
import { verifyUserToken } from "../utils/token";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized access",
      error: "Missing or invalid Authorization header",
    });
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyUserToken(token!);

  if (!payload) {
    return res.status(401).json({
      message: "Invalid token",
      error: "Token verification failed",
    });
  }

  res.locals.id = payload.id;
  next();
}

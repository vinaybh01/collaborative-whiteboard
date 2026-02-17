import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export function middleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  // If using Bearer token format
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    // @ts-ignore
    const decoded = jwt.verify(token, JWT_SECRET);

    // @ts-ignore
    req.userId = decoded.userId;

    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid token",
    });
  }
}

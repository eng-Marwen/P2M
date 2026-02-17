import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Custom Request interface with userId
interface AuthRequest extends Request {
  userId?: string;
}

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies["auth-token"];
    if (!token) {
      res.status(401).json({
        status: "fail",
        message: "Unauthorized - No token",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY as string,
    ) as JwtPayload & { userId: string };

    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
      res.status(401).json({
        status: "fail",
        message: "Token expired",
      });
      return;
    }

    res.status(401).json({
      status: "fail",
      message: "Invalid token",
    });
  }
};

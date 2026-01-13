import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Custom Request interface with userId
interface AuthRequest extends Request {
  userId?: string;
}

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies["auth-token"];
    if (!token) throw new Error("Unauthorized - invalid token");

    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY as string
    ) as JwtPayload & { userId: string };
    if (!decoded) throw new Error("Unauthorized - invalid token");

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};

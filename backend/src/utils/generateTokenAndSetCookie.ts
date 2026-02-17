import { CookieOptions, Response } from "express";
import jwt from "jsonwebtoken";

const isProduction: boolean = process.env.NODE_ENV === "production";

export const generateTokenAndSetCookie = (
  res: Response,
  userId: string,
): string => {
  const token = jwt.sign({ userId }, process.env.SECRET_KEY as string, {
    expiresIn: "7d",
  });

  console.log("Environment:", process.env.NODE_ENV);
  console.log("Setting cookie for userId:", userId);

  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction, //false for localhost testing true for production
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for production
    path: "/",
  };

  console.log("Cookie options:", cookieOptions);

  res.cookie("auth-token", token, cookieOptions);

  // Check if cookie was set in response headers
  console.log("Response headers:", res.getHeaders());

  return token;
};

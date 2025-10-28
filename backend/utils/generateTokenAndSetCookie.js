import jwt from "jsonwebtoken";


export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({userId}, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });
  res.cookie("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only send over HTTPS in production
    sameSite: "Strict", // or 'Lax' depending on use-case
    maxAge: 7*24*3600*1000, // 7 days in ms
  });
  return token;
};

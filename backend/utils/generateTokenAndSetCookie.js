import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({userId}, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });
  
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Setting cookie for userId:", userId);
  
  const cookieOptions = {
    httpOnly: true,
    secure: false, // Always false for localhost testing
    sameSite: "lax",
    maxAge: 7*24*60*60*1000,
    path: "/",
  };
  
  console.log("Cookie options:", cookieOptions);
  
  res.cookie("auth-token", token, cookieOptions);
  
  // Check if cookie was set in response headers
  console.log("Response headers:", res.getHeaders());
  
  return token;
};
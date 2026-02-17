import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import morgan from "morgan";
import { connectToMongoDB } from "./databases/mongoDB.js";
import authRoutes from "./routes/auth.route.js";
import cloudinaryRoutes from "./routes/cloudinary.route.js";
import houseRoutes from "./routes/house.route.js";

const app: Express = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // allow cookies/auth headers
  })
);

app.use(morgan("dev")); //HTTP request logger
app.use(express.json()); //allows us to parse incomming requests:req.body (json)
app.use(cookieParser()); //allows us to parse incomming cookies
const port: number = Number(process.env.PORT) || 2000;

//----------------------------Root Routes-----------------------------

app.use("/api/auth", authRoutes);
app.use("/api/houses", houseRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);
//----------------------------Start Server-----------------------------

app.listen(port, () => {
  connectToMongoDB();
  console.log("Server starting on port", port);
});

import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv"; //+dotenv.config() for accessing to strings in env file(do it just here)
import express, { Express } from "express";
import morgan from "morgan";
import { connectDB } from "./DB/connectDB"; //use  when u import local files
import authRoutes from "./routes/auth.route";
import cloudinaryRoutes from "./routes/cloudinary.route";
import houseRoutes from "./routes/house.route";
dotenv.config();
const app: Express = express();
app.use(
  cors({
    origin: "http://localhost:5173",
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
  connectDB();
  console.log("Server starting on port", port);
});

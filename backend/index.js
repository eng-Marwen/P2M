import express from "express";
import { connectDB } from "./DB/connectDB.js"; //use .js when u import local files
import dotenv from "dotenv"; //+dotenv.config() for accessing to strings in env file(do it just here)
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from "cors"
dotenv.config();
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // allow cookies/auth headers
  })
);

app.use(express.json());//allows us to parse incomming requests:req.body (json)
app.use(cookieParser());//allows us to parse incomming cookies
const port = process.env.PORT || 2000;

//----------------------------Root Routes-----------------------------

app.use("/api/auth", authRoutes);
app.use("/api/houses", authRoutes);



app.listen(port, () => {
  connectDB();
  console.log("Server starting on port", port);
});

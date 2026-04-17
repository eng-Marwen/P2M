import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import morgan from "morgan";
import { connectMongoDB } from "./databases/mongoDB.js";
import { connectRedis } from "./databases/redis.js";
import { connectRabbitMQ } from "./queue/rabbitmq.js";
import authRoutes from "./routes/auth.route.js";
import cloudinaryRoutes from "./routes/cloudinary.route.js";
import houseRoutes from "./routes/house.route.js";

const app: Express = express();

// ─── CORS Logs ───────────────────────────────────────────────
console.log("CLIENT_URL env:", process.env.CLIENT_URL);

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Incoming request origin:", origin);
      console.log("Allowed origin (CLIENT_URL):", process.env.CLIENT_URL);

      if (!origin || origin === process.env.CLIENT_URL) {
        callback(null, true);
      } else {
        console.log("CORS BLOCKED:", origin);
        callback(new Error(`CORS origin not allowed: ${origin}`));
      }
    },
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

const port: number = Number(process.env.PORT) || 4000;

// ─── Routes ───────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/houses", houseRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);

// ─── Start Server ─────────────────────────────────────────────
app.listen(port, async () => {
  console.log("═══════════════════════════════════");
  console.log("Server starting on port:", port);
  console.log("CLIENT_URL:", process.env.CLIENT_URL || "NOT SET ⚠️");
  console.log("NODE_ENV:", process.env.NODE_ENV || "NOT SET");
  console.log("═══════════════════════════════════");

  connectMongoDB();
  connectRedis();
  connectRabbitMQ();
});
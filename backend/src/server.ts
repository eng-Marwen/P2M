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
import {
  register,
  httpRequestsTotal,
  httpRequestDuration,
  httpActiveRequests,
} from "./monitoring/metrics.js";

const app: Express = express();

// ─── CORS Logs ───────────────────────────────────────────────

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
// ─── Monitor ───────────────────────────────────────────────────
console.log(">>> REGISTERING /metrics ROUTE");

app.get("/metrics", async(_req, res) => {
  console.log(">>> /metrics REQUEST RECEIVED");

  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use((req, res, next) => {
  const start = process.hrtime.bigint();

  httpActiveRequests.inc();

  res.on("finish", () => {
    const duration =
      Number(process.hrtime.bigint() - start) / 1_000_000_000;

    // Get the Express route after it has been resolved
    const route = req.route
      ? `${req.baseUrl}${req.route.path}`
      : "unmatched";

    const method = req.method;
    const statusCode = res.statusCode.toString();

    httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode,
    });

    httpRequestDuration.observe(
      {
        method,
        route,
        status_code: statusCode,
      },
      duration,
    );

    httpActiveRequests.dec();
  });

  next();
});


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
  //ADD COMMENT 
  connectRedis();
  connectRabbitMQ();
});
import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379/0",
});

redisClient.on("error", (err) => {
  console.error("Redis error message:", err);
});

export const connectRedis = async () => {
  await redisClient.connect();
  console.log("connected to redis");
};

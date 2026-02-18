import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL, 
});

redisClient.on("error", (err) => {
  console.error("Redis error message:", err);
});

export const connectRedis = async () => {
  await redisClient.connect();
  console.log("connected to redis");
};

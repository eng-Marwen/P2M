import amqp, { Channel } from "amqplib";

let channel: Channel;
const RABBITMQ_RETRY_MS = Number(process.env.RABBITMQ_RETRY_MS || 5000);

const resolveRabbitMQUrl = () => {
  const nodeEnv = (process.env.NODE_ENV || "development").trim().toLowerCase();
  const isProduction = nodeEnv === "production" || nodeEnv === "prod";

  if (isProduction && process.env.CLOUDAMQ_URL) {
    return process.env.CLOUDAMQ_URL;
  }

  return process.env.RABBITMQ_URL || "amqp://localhost:5672";
};

export const connectRabbitMQ = async () => {
  const url = resolveRabbitMQUrl();

  try {
    const connection = await amqp.connect(url);

    channel = await connection.createChannel();

    connection.on("error", (error) => {
      console.error("RabbitMQ connection error:", error);
    });

    connection.on("close", () => {
      console.error("RabbitMQ connection closed. Reconnecting...");
      setTimeout(() => {
        connectRabbitMQ().catch((error) => {
          console.error("RabbitMQ reconnect attempt failed:", error);
        });
      }, RABBITMQ_RETRY_MS);
    });

    console.log("connected to rabbitMQ");
  } catch (error) {
    console.error("RabbitMQ connection error:", error);

    setTimeout(() => {
      connectRabbitMQ().catch((err) => {
        console.error("RabbitMQ reconnect attempt failed:", err);
      });
    }, RABBITMQ_RETRY_MS);
  }
};

export const getChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }

  return channel;
};

import amqp, { Channel } from "amqplib";

let channel: Channel;
const RABBITMQ_RETRY_MS = Number(process.env.RABBITMQ_RETRY_MS || 5000);


export const connectRabbitMQ = async () => {
  const url = process.env.RABBITMQ_URL;

  try {
    const connection = await amqp.connect(url as string);

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

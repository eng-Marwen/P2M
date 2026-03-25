import amqp, { Channel } from "amqplib";

let channel: Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");

    channel = await connection.createChannel();

    console.log("connected to rabbitMQ");
  } catch (error) {
    console.error("RabbitMQ connection error:", error);
  }
};

export const getChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }

  return channel;
};

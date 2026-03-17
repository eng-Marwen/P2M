import { getChannel } from "./rabbitmq.js";

const QUEUE_NAME = "house.events";

export const publishHouseEvent = async (
  event: "house.create" | "house.update" | "house.delete",
  house: any,
) => {
  const channel = getChannel();

  await channel.assertQueue(QUEUE_NAME, { durable: true });

  const message = {
    event,
    data: house,
  };

  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });

  console.log("Event published:", event);
};

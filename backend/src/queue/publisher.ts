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

  const body = JSON.stringify(message);
  const payload = Buffer.from(body);
  const houseId =
    house?.id || house?._id || house?.data?.id || house?.data?._id;

  console.log("[RabbitMQ] Sending event", {
    queue: QUEUE_NAME,
    event,
    houseId: houseId || null,
    bytes: payload.length,
  });

  const acceptedByBuffer = channel.sendToQueue(QUEUE_NAME, payload, {
    persistent: true,
  });

  console.log("[RabbitMQ] Event sent", {
    queue: QUEUE_NAME,
    event,
    houseId: houseId || null,
    acceptedByBuffer,
  });
};

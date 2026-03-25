import json
import os
from app.queue.rabbitmq import get_connection
from app.services.vector_service import create_vector, update_vector, delete_vector


QUEUE_NAME = os.getenv("RABBITMQ_QUEUE", "house.events")


def callback(ch, method, properties, body):
    try:
        data = json.loads(body.decode("utf-8"))
        event = data.get("event")
        house = data.get("data") or {}

        print("Received event:", event)

        if event == "house.create":
            create_vector(house)
        elif event == "house.update":
            update_vector(house)
        elif event == "house.delete":
            house_id = house.get("id") or house.get("_id")
            if house_id is not None:
                delete_vector(str(house_id))
            else:
                raise ValueError("Missing house id for house.delete event")
        else:
            print("Unknown event type:", event)

        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as error:
        print("Consumer processing error:", error)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def start_consumer():
    connection = get_connection()
    channel = connection.channel()
    print("connected to rabbitmq")

    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    channel.basic_qos(prefetch_count=1)

    channel.basic_consume(
        queue=QUEUE_NAME,
        on_message_callback=callback,
        auto_ack=False
    )

    print(f"Waiting for events on queue: {QUEUE_NAME}")
    channel.start_consuming()
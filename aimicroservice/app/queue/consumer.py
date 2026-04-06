import json
import os
import time
from app.queue.rabbitmq import get_connection
from app.services.vector_service import create_vector, update_vector, delete_vector


QUEUE_NAME = os.getenv("RABBITMQ_QUEUE", "house.events")


def callback(ch, method, properties, body):
    started_at = time.perf_counter()
    body_size = len(body or b"")

    try:
        data = json.loads(body.decode("utf-8"))
        event = data.get("event")
        house = data.get("data") or {}
        house_id = house.get("id") or house.get("_id")

        print(
            "[Consumer] Received event",
            {
                "event": event,
                "house_id": str(house_id) if house_id is not None else None,
                "delivery_tag": method.delivery_tag,
                "redelivered": method.redelivered,
                "bytes": body_size,
            },
        )

        if event == "house.create":
            print(f"[Consumer] Processing create for house_id={house_id}")
            create_vector(house)
        elif event == "house.update":
            print(f"[Consumer] Processing update for house_id={house_id}")
            update_vector(house)
        elif event == "house.delete":
            house_id = house.get("id") or house.get("_id")
            if house_id is not None:
                print(f"[Consumer] Processing delete for house_id={house_id}")
                delete_vector(str(house_id))
            else:
                raise ValueError("Missing house id for house.delete event")
        else:
            print(f"[Consumer] Unknown event type: {event}")

        ch.basic_ack(delivery_tag=method.delivery_tag)
        elapsed_ms = round((time.perf_counter() - started_at) * 1000, 2)
        print(
            "[Consumer] ACK sent",
            {
                "event": event,
                "house_id": str(house_id) if house_id is not None else None,
                "delivery_tag": method.delivery_tag,
                "elapsed_ms": elapsed_ms,
            },
        )
    except Exception as error:
        elapsed_ms = round((time.perf_counter() - started_at) * 1000, 2)
        print(
            "[Consumer] Processing error",
            {
                "delivery_tag": method.delivery_tag,
                "elapsed_ms": elapsed_ms,
                "error": str(error),
            },
        )
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        print(
            "[Consumer] NACK sent",
            {
                "delivery_tag": method.delivery_tag,
                "requeue": False,
            },
        )


def start_consumer():
    connection = get_connection()
    channel = connection.channel()
    print("[Consumer] Connected to RabbitMQ")

    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    channel.basic_qos(prefetch_count=1)
    print(
        "[Consumer] Queue declared",
        {
            "queue": QUEUE_NAME,
            "durable": True,
            "prefetch_count": 1,
        },
    )

    channel.basic_consume(
        queue=QUEUE_NAME,
        on_message_callback=callback,
        auto_ack=False
    )

    print(f"[Consumer] Waiting for events on queue: {QUEUE_NAME}")
    channel.start_consuming()
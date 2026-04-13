import json
from app.queue.rabbitmq import get_connection
from app.services.rag_service.vector_service import create_vector, delete_vector, update_vector

QUEUE_NAME = "house.events"

def callback(ch, method, _properties, body):
    event = "unknown"
    try:
        data = json.loads(body.decode("utf-8"))
        event = data.get("event")
        house = data.get("data") or {}
        house_id = house.get("id") or house.get("_id")
        if event == "house.create":
            create_vector(house)
        elif event == "house.update":
            update_vector(house)
        elif event == "house.delete":
            delete_vector(str(house_id))
        else:
            print(f"[Consumer] Unsupported event '{event}', acknowledging message")

        ch.basic_ack(delivery_tag=method.delivery_tag)
        print(f"[Consumer] handled event: {event}")
    except Exception as error:
        print(f"[Consumer] Error consuming event '{event}' after{error}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def start_consumer():
    connection = get_connection()
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(
        queue=QUEUE_NAME,
        on_message_callback=callback,
        auto_ack=False,
    )

    print(f"[Consumer] Waiting for events on queue: {QUEUE_NAME}")
    channel.start_consuming()
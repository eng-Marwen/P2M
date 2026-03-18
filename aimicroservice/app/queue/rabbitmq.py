import pika
import os

def get_connection():
    rabbitmq_url = os.getenv("RABBITMQ_URL")

    if rabbitmq_url:
        params = pika.URLParameters(rabbitmq_url)
    else:
        params = pika.ConnectionParameters(
            host=os.getenv("RABBITMQ_HOST", "localhost"),
            port=int(os.getenv("RABBITMQ_PORT", "5672")),
            heartbeat=600,
            blocked_connection_timeout=300,
        )

    connection = pika.BlockingConnection(
        params
    )
    return connection
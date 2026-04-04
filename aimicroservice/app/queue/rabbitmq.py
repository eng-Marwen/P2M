import pika
import os


def get_connection():
    rabbitmq_url = os.getenv("RABBITMQ_URL")

    if rabbitmq_url:
        params = pika.URLParameters(rabbitmq_url)
    else:
        rabbitmq_host = os.getenv("RABBITMQ_HOST", "localhost:5672")
        if ":" in rabbitmq_host:
            host, port_str = rabbitmq_host.rsplit(":", 1)
            rabbitmq_port = int(port_str)
        else:
            host = rabbitmq_host
            rabbitmq_port = int(os.getenv("RABBITMQ_PORT", "5672"))

        params = pika.ConnectionParameters(
            host=host,
            port=rabbitmq_port,
            heartbeat=600,
            blocked_connection_timeout=300,
        )

    connection = pika.BlockingConnection(
        params
    )
    return connection


def check_rabbitmq_connection() -> None:
    connection = get_connection()
    connection.close()
    print("[Startup] RabbitMQ connectivity check passed")
import os
import pika
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    rabbitmq_url = os.getenv("RABBITMQ_URL", "").strip()
    params = pika.URLParameters(rabbitmq_url)
    params.heartbeat = 600
    params.blocked_connection_timeout = 300
    connection=pika.BlockingConnection(params)
    return connection

def check_rabbitmq_connection() -> None:
    connection = get_connection()
    connection.close()
    print("connected to rabbitMQ")
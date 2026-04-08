import os
from functools import lru_cache
from dotenv import load_dotenv
from redis.asyncio import Redis

load_dotenv()


@lru_cache(maxsize=1)
def get_redis_client() -> Redis:
    return Redis.from_url(os.getenv("REDIS_URL"), decode_responses=True)

async def check_redis_connection() -> None:
    redis = get_redis_client()
    await redis.ping()
    print("connected to redis")
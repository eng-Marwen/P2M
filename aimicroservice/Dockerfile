FROM python:3.10.14-slim

WORKDIR /app

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOME=/home/appuser \
    XDG_CACHE_HOME=/home/appuser/.cache

RUN adduser --disabled-password --gecos "" appuser && \
    mkdir -p /home/appuser/.cache/gdown && \
    chown -R appuser:appuser /home/appuser

COPY prod_dependencies.txt .
RUN pip install --no-compile -r prod_dependencies.txt && \
    find /usr/local/lib/python3.10/site-packages -type d -name '__pycache__' -prune -exec rm -rf '{}' +

COPY app ./app
COPY entrypoint.sh .

RUN mkdir -p /app/ai_models && \
    chown -R appuser:appuser /app && \
    chmod +x /app/entrypoint.sh

USER appuser

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
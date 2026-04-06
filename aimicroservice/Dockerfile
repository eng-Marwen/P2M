FROM python:3.10-slim
WORKDIR /app

ENV PIP_NO_CACHE_DIR=1 \
	PIP_DISABLE_PIP_VERSION_CHECK=1 \
	PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

COPY prod_dependencies.txt .
RUN pip install --no-cache-dir --no-compile -r prod_dependencies.txt && \
	pip install --no-cache-dir --no-compile \
	  torch==2.1.0+cpu \
	  torchvision==0.16.0+cpu \
	  -f https://download.pytorch.org/whl/torch_stable.html && \
	find /usr/local/lib/python3.10/site-packages -type d -name '__pycache__' -prune -exec rm -rf '{}' +

COPY app ./app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
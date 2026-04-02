FROM python:3.11-slim
RUN apt-get update && apt-get install -y ffmpeg libcairo2-dev pkg-config && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY pyproject.toml ./
RUN pip install --no-cache-dir fastapi uvicorn sqlalchemy pydantic manim python-multipart
COPY app ./app
EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]

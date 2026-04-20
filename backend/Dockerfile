FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN apt-get update && apt-get install -y netcat-openbsd gcc libpq-dev

RUN pip install --upgrade pip
RUN pip install django djangorestframework djangorestframework-simplejwt psycopg2-binary python-dotenv channels daphne channels-redis

COPY . .

EXPOSE 8000
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "core.asgi:application"]

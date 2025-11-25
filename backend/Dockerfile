FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt


RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt \
    --default-timeout=1000 \
    -i https://mirror.arvancloud.ir/pypi/simple \
    --trusted-host mirror.arvancloud.ir

COPY . /app/

RUN python manage.py collectstatic --noinput

EXPOSE 8000

RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]

# Spare Parts Shop - Docker Setup

This document explains how to set up and run the Spare Parts Shop application using Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine

## Quick Start

To start the application in production mode:

```bash
docker-compose up --build
```

To start the application in development mode:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

## Services Overview

The application consists of the following services:

1. **db**: PostgreSQL database
2. **backend**: Django REST API application
3. **frontend**: React frontend application

## Production Deployment

### Building and Running

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### Environment Variables

In production, you should set the following environment variables:

- `SECRET_KEY`: Django secret key
- `DEBUG`: Set to 0 for production
- `DJANGO_ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `POSTGRES_USER`: PostgreSQL user
- `POSTGRES_PASSWORD`: PostgreSQL password
- `POSTGRES_DB`: PostgreSQL database name

These can be set in an `.env` file in the backend directory.

## Development Deployment

For development, use the development compose file:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

This will mount your local code directories into the containers, allowing for live reloading during development.

## Accessing the Applications

Once the containers are running:

- Backend API: http://localhost:8000
- Frontend: http://localhost:3000
- Admin panel: http://localhost:8000/admin

## Stopping the Application

To stop the application:

```bash
# If using default docker-compose.yml
docker-compose down

# If using development docker-compose.dev.yml
docker-compose -f docker-compose.dev.yml down
```

To stop and remove volumes (including database data):

```bash
docker-compose down -v
```

## Running Management Commands

To run Django management commands:

```bash
# Using docker-compose exec
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser

# Or using docker-compose run
docker-compose run --rm backend python manage.py migrate
```

## Data Persistence

Data is persisted in Docker volumes:

- `postgres_data`: Database data (production)
- `postgres_data_dev`: Database data (development)
- `static_volume`: Django static files
- `media_volume`: Django media files

## Troubleshooting

If you encounter issues:

1. Make sure all required environment variables are set
2. Check container logs with `docker-compose logs <service_name>`
3. Ensure ports 8000 and 3000 are not already in use
4. For database connection issues, verify the database credentials in environment variables
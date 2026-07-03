#!/bin/sh
set -e

echo "Running migrations..."
python manage.py migrate --noinput

if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_EMAIL" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  echo "Ensuring superuser '$DJANGO_SUPERUSER_USERNAME' exists..."
  python manage.py createsuperuser --noinput || echo "Superuser already exists, skipping."
fi

echo "Starting gunicorn..."
exec gunicorn verso.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3

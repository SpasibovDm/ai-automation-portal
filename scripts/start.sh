#!/bin/sh
set -e

RUN_MIGRATIONS="${RUN_MIGRATIONS:-true}"
HOST="${API_HOST:-0.0.0.0}"
PORT="${API_PORT:-8000}"

if [ "$RUN_MIGRATIONS" = "true" ]; then
  alembic upgrade head
fi

exec uvicorn app.main:app --host "$HOST" --port "$PORT"

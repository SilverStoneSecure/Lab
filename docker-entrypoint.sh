#!/bin/sh
set -e
cd /app

# RUN_MIGRATE_ON_START: 1 = run migrations before start (default 1)
# RUN_SEED_ON_START:   1 = run seed before start (default 0; seed is idempotent but usually run once)
case "${RUN_MIGRATE_ON_START:-1}" in
  1|true|yes) npm run migrate ;;
  *) ;;
esac

case "${RUN_SEED_ON_START:-0}" in
  1|true|yes) npm run seed ;;
  *) ;;
esac

exec npm run start

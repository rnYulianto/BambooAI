#!/bin/bash
set -e

echo "Initializing databases and users..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB"<<-EOSQL
    CREATE USER langfuse WITH PASSWORD 'langfuse';
    CREATE DATABASE langfuse OWNER langfuse;
EOSQL

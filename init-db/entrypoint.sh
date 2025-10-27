#!/bin/bash
# Start SQL Server in the background
/opt/mssql/bin/sqlservr &

# Wait until SQL Server is ready to accept connections
echo "Waiting for SQL Server to start..."
sleep 15

# Run initialization script
echo "Running initialization script..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -i /init/init.sql

# Bring SQL Server back to foreground
wait
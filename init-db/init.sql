IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'genaidb')
BEGIN
    CREATE DATABASE genaidb;
END
GO
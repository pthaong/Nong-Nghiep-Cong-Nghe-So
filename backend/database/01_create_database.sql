IF DB_ID(N'SmartAgriculture') IS NULL
BEGIN
    EXEC(N'CREATE DATABASE [SmartAgriculture]');
END

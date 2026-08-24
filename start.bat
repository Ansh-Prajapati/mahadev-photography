@echo off
echo ========================================
echo Mahadev Photography Server
echo ========================================
echo.

echo Starting MySQL service...
net start MySQL80 2>nul
if %errorlevel% neq 0 (
    echo MySQL may already be running or not installed.
)

echo.
echo Installing/Checking dependencies...
pip install flask pymysql werkzeug python-dotenv

echo.
echo Testing database connection...
python test_db.py

echo.
echo Starting Flask server...
python app.py

pause
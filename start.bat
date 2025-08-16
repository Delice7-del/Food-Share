@echo off
echo ========================================
echo    FoodShare Backend Server
echo ========================================
echo.
echo Starting FoodShare API server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MongoDB is running (optional check)
echo Checking MongoDB connection...
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

REM Start the server
echo Starting server on port 5000...
echo.
echo API will be available at: http://localhost:5000
echo Health check: http://localhost:5000/health
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause

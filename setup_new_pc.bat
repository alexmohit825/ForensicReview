@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   ForensicReview - Medicolegal Workstation Setup
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python installation...
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python 3.10+ from python.org and check "Add python.exe to PATH".
    pause
    exit /b 1
)
python --version

echo.
echo [2/3] Installing dependencies (PyQt6, pymupdf, google-genai, docx, pptx)...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo [3/3] Checking API key configuration...
if not exist ".env.local" (
    echo .env.local not found.
    set /p USER_API_KEY="Enter your GEMINI_API_KEY (or press Enter to configure later): "
    if not "!USER_API_KEY!"=="" (
        echo GEMINI_API_KEY=!USER_API_KEY!> .env.local
        echo Created .env.local with your API key.
    ) else (
        echo GEMINI_API_KEY=your_key_here> .env.local
        echo Created blank .env.local. You can paste your key into .env.local anytime.
    )
) else (
    echo [OK] .env.local already exists.
)

echo.
echo Creating Desktop and Start Menu shortcuts...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0create_shortcuts.ps1"

echo.
echo ========================================================
echo   Setup Complete!
echo   Double-click 'ForensicReview App' on your Desktop.
echo ========================================================
pause

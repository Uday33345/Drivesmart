@echo off
echo =================================================================
echo   DriveSmart Mobile APK Build & 300+ E2E Test Report Generator
echo =================================================================
echo.

echo Step 1: Building Vite Web Assets...
call npm run build
if %errorlevel% neq 0 (
    echo Failed to build Vite assets!
    exit /b %errorlevel%
)

echo.
echo Step 2: Syncing Capacitor Android Assets...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Failed to sync Capacitor Android!
    exit /b %errorlevel%
)

echo.
echo Step 3: Compiling Android Debug APK via Gradle...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo Gradle build failed!
    cd ..
    exit /b %errorlevel%
)
cd ..

echo.
echo Step 4: Generating 300+ E2E Test Cases Excel Report...
python generate_300_e2e_report.py
if %errorlevel% neq 0 (
    echo Report generation failed!
    exit /b %errorlevel%
)

echo.
echo =================================================================
echo   SUCCESS! 
echo   - Android Mobile APK Location: android\app\build\outputs\apk\debug\app-debug.apk
echo   - 300+ E2E Test Report Location: E2E_Test_Report_DriveSmart_Mobile_APK_2026-07-22.xlsx
echo =================================================================
pause

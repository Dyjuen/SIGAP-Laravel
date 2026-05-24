@echo off
REM ============================================================================
REM SIGAP-Laravel - Newman API Test Runner
REM ============================================================================
REM 
REM Jalankan script ini dari folder: automation-testing/postman/
REM 
REM Prasyarat:
REM   npm install -g newman newman-reporter-htmlextra
REM 
REM Penggunaan:
REM   run-newman.bat
REM ============================================================================

echo ============================================
echo   SIGAP - Newman API Test Runner
echo ============================================
echo.

REM Buat folder reports jika belum ada
if not exist "..\reports\newman" mkdir "..\reports\newman"

echo [1/2] Menjalankan API tests...
echo.

npx newman run SIGAP-Kegiatan.postman_collection.json ^
  -e SIGAP-Local.postman_environment.json ^
  -r cli,htmlextra ^
  --reporter-htmlextra-export ..\reports\newman\report.html ^
  --reporter-htmlextra-title "SIGAP - Ajukan Kegiatan API Test Report" ^
  --reporter-htmlextra-darkTheme ^
  --timeout-request 30000 ^
  --delay-request 500

echo.
echo [2/2] Selesai!
echo.
echo Hasil testing:
echo   - CLI output: di atas ^
echo   - HTML Report: ..\reports\newman\report.html
echo.
echo ============================================
pause

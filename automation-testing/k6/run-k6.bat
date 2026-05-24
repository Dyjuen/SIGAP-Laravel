@echo off
REM ============================================================================
REM SIGAP-Laravel - k6 Load Test Runner
REM ============================================================================
REM
REM Prasyarat:
REM   - Install k6: winget install k6 --source winget
REM   - Atau download dari: https://github.com/grafana/k6/releases
REM   - Laravel app harus berjalan di http://localhost:8000
REM
REM Penggunaan:
REM   run-k6.bat              (jalankan semua test)
REM   run-k6.bat login        (hanya login test)
REM   run-k6.bat index        (hanya index test)
REM   run-k6.bat store        (hanya store test)
REM ============================================================================

echo ============================================
echo   SIGAP - k6 Load Test Runner
echo ============================================
echo.

REM Buat folder reports jika belum ada
if not exist "..\reports\k6" mkdir "..\reports\k6"

REM Check jika ada argumen spesifik
if "%1"=="login" goto :login
if "%1"=="index" goto :index
if "%1"=="store" goto :store

REM Jalankan semua test jika tanpa argumen
echo [1/3] Load Test: Login Endpoint
echo -------------------------------------------
k6 run --summary-trend-stats="avg,min,med,max,p(90),p(95)" --out json=..\reports\k6\login-load.json scripts\login-load.js
echo.

echo [2/3] Load Test: Kegiatan Index/Monitoring
echo -------------------------------------------
k6 run --summary-trend-stats="avg,min,med,max,p(90),p(95)" --out json=..\reports\k6\kegiatan-index-load.json scripts\kegiatan-index-load.js
echo.

echo [3/3] Load Test: Kegiatan Store (Submit)
echo -------------------------------------------
k6 run --summary-trend-stats="avg,min,med,max,p(90),p(95)" --out json=..\reports\k6\kegiatan-store-load.json scripts\kegiatan-store-load.js
echo.

goto :done

:login
echo [1/1] Load Test: Login Endpoint
k6 run --summary-trend-stats="avg,min,med,max,p(90),p(95)" --out json=..\reports\k6\login-load.json scripts\login-load.js
goto :done

:index
echo [1/1] Load Test: Kegiatan Index/Monitoring
k6 run --summary-trend-stats="avg,min,med,max,p(90),p(95)" --out json=..\reports\k6\kegiatan-index-load.json scripts\kegiatan-index-load.js
goto :done

:store
echo [1/1] Load Test: Kegiatan Store (Submit)
k6 run --summary-trend-stats="avg,min,med,max,p(90),p(95)" --out json=..\reports\k6\kegiatan-store-load.json scripts\kegiatan-store-load.js
goto :done

:done
echo.
echo ============================================
echo   Semua load test selesai!
echo ============================================
echo.
echo Hasil testing:
echo   - Console summary: di atas
echo   - JSON reports: ..\reports\k6\
echo.
echo Untuk analisis lebih lanjut, buka JSON report
echo atau gunakan k6 cloud (opsional).
echo ============================================
pause

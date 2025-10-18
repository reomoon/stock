@echo off
chcp 65001 >nul
echo ============================================================
echo Playwright 설치 스크립트
echo ============================================================
echo.

echo [1/2] Playwright 패키지 설치 중...
pip install playwright
if %errorlevel% neq 0 (
    echo ❌ pip 설치 실패
    pause
    exit /b 1
)
echo ✓ Playwright 패키지 설치 완료
echo.

echo [2/2] Chromium 브라우저 다운로드 중...
python -m playwright install chromium
if %errorlevel% neq 0 (
    echo ❌ 브라우저 설치 실패
    pause
    exit /b 1
)
echo ✓ Chromium 브라우저 설치 완료
echo.

echo ============================================================
echo ✅ Playwright 설치 완료!
echo.
echo 이제 capture_realestate.bat 를 실행하세요.
echo ============================================================
pause

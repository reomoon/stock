@echo off
chcp 65001 >nul
echo ============================================================
echo 부동산맵 모바일 스크린샷 캡처
echo ============================================================
echo.

REM Playwright 설치 확인
echo [1/3] Playwright 설치 확인 중...
python -m playwright install chromium >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Playwright 설치 실패
    echo.
    echo 다음 명령어를 먼저 실행하세요:
    echo   pip install playwright
    echo   python -m playwright install chromium
    pause
    exit /b 1
)
echo ✓ Playwright 준비 완료
echo.

REM Python 스크립트 실행
echo [2/3] 스크린샷 캡처 시작...
python capture_realestate.py
if %errorlevel% neq 0 (
    echo ❌ 스크립트 실행 실패
    pause
    exit /b 1
)
echo.

REM 완료 메시지
echo [3/3] 완료!
echo.
echo 📂 스크린샷 폴더 열기...
start "" "screenshots"
echo.
echo ============================================================
echo 작업 완료! 아무 키나 눌러 종료하세요.
echo ============================================================
pause >nul

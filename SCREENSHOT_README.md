# 부동산맵 모바일 스크린샷 캡처 도구

## 📋 개요
Playwright를 사용하여 부동산맵 탭의 주요 섹션들을 모바일 화면으로 자동 캡처합니다.

## 🎯 캡처되는 섹션
1. **부동산 매매지수 지도** - 네이버 지도와 마커
2. **부동산 매매 가격지수 현황** - 매매/전세 가격지수 테이블
3. **주택 매매 거래량 (월별)** - 월별 거래량 테이블
4. **전체 페이지** - 부동산맵 탭 전체 화면

## 🚀 사용 방법

### 1. 최초 설치 (한 번만 실행)
```cmd
install_playwright.bat
```

### 2. 스크린샷 캡처
```cmd
capture_realestate.bat
```

## 📱 모바일 설정
- 디바이스: iPhone 12 Pro
- 해상도: 390 x 844
- Scale Factor: 3x (Retina)

## 💾 저장 위치
캡처된 스크린샷은 `screenshots/` 폴더에 저장됩니다.

파일명 형식:
- `YYYYMMDD_부동산_매매지수_지도.png`
- `YYYYMMDD_부동산_매매_가격지수_현황.png`
- `YYYYMMDD_주택_매매거래량_월별.png`
- `YYYYMMDD_부동산맵_전체.png`

## 🛠️ 수동 설치 (필요시)
```bash
pip install playwright
python -m playwright install chromium
```

## 📝 참고사항
- 인터넷 연결 필요 (웹페이지 접속)
- 첫 실행 시 Chromium 브라우저 다운로드 (약 100MB)
- 스크린샷 생성 시간: 약 10-15초

## 🔧 커스터마이징
`capture_realestate.py` 파일에서:
- `viewport`: 화면 크기 조정
- `url`: 캡처할 페이지 URL 변경
- 섹션 선택자 수정 가능

## ⚠️ 문제 해결
### Playwright 설치 오류
```bash
pip install --upgrade pip
pip install playwright
python -m playwright install
```

### 스크린샷 실패
- 인터넷 연결 확인
- 페이지 로딩 시간 증가 (`wait_for_timeout` 값 늘리기)

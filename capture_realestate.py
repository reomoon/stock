"""
부동산맵 탭의 주요 섹션을 모바일 화면으로 캡처하는 스크립트
Playwright를 사용하여 스크린샷 생성
"""
import asyncio
from playwright.async_api import async_playwright
from datetime import datetime
import os

async def capture_realestate_sections():
    """부동산맵 섹션들을 캡처"""
    
    # 스크린샷 저장 디렉토리
    # 오늘 날짜 폴더 생성(YYYY-MM-DD 형식)
    today_folder = datetime.now().strftime("%Y-%m-%d")
    screenshot_dir = f"screenshots/{today_folder}"
    os.makedirs(screenshot_dir, exist_ok=True)
    # 오늘 날짜 문자열 (YYYYMMDD)
    today = datetime.now().strftime("%Y%m%d")
    # 기존 오늘 날짜의 모든 캡처 파일 삭제
    for fname in os.listdir(screenshot_dir):
        if fname.startswith(f"{today}_부동산캡처") and fname.endswith(".png"):
            try:
                os.remove(os.path.join(screenshot_dir, fname))
                print(f"삭제: {os.path.join(screenshot_dir, fname)}")
            except Exception as e:
                print(f"삭제 실패: {fname} - {e}")
    
    async with async_playwright() as p:
        # Chromium 브라우저 시작
        browser = await p.chromium.launch(headless=True)

        # 모바일 뷰포트 설정 (안드로이드)
        VIEWPORT_WIDTH = 412
        VIEWPORT_HEIGHT = 830

        context = await browser.new_context(
            viewport={'width': VIEWPORT_WIDTH, 'height': VIEWPORT_HEIGHT},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True,
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        )

        page = await context.new_page()
        
        # 페이지 로드
        url = "https://reomoon-stock.vercel.app/main"
        print(f"페이지 로딩 중: {url}")
        await page.goto(url, wait_until='networkidle')
        # 부동산 탭 클릭
        print("부동산 탭 클릭...")
        await page.click('button[data-tab="realestate-main-tab"]')
        await page.wait_for_timeout(3000)  # 3초 대기 (콘텐츠 로딩)
        
        # 매매 가격지수 섹션 시작 Y 좌표를 찾음
        print("월간 데이터 섹션 시작 위치 계산 중...")
        start_y = await page.evaluate("() => { const el = document.querySelector('section.monthly-data-section'); return el ? el.offsetTop : 0 }")
        total_height = await page.evaluate("() => document.body.scrollHeight")
        print(f"페이지 전체 높이: {total_height}px, 시작 Y: {start_y}px")

        # 캡처 루프: viewport 높이(VIEWPORT_HEIGHT) 단위로 스크롤하며 저장
        # 글자가 잘리지 않도록 오버랩을 줌 (50px 정도)
        OVERLAP = 0
        SCROLL_STEP = VIEWPORT_HEIGHT - OVERLAP
            
        current_y = start_y
        idx = 1
        max_scroll_top = max(0, total_height - VIEWPORT_HEIGHT)

        # 보정: 만약 전체 높이가 뷰포트보다 작으면 한 번만 캡처
        if total_height <= VIEWPORT_HEIGHT:
            out_path = f"{screenshot_dir}/{today}_부동산캡처{idx}.png"
            if os.path.exists(out_path):
                os.remove(out_path)
            await page.screenshot(path=out_path)
            print(f"   ✓ 저장: {out_path}")
        else:
            while True:
                # 7번째 캡처부터 VIEWPORT_HEIGHT를 820으로 변경
                if idx == 7:
                    VIEWPORT_HEIGHT = 820
                    await page.set_viewport_size({"width": VIEWPORT_WIDTH, "height": VIEWPORT_HEIGHT})
                    SCROLL_STEP = VIEWPORT_HEIGHT - OVERLAP
                # 9,10,11번째 캡처는 VIEWPORT_HEIGHT를 810으로 변경
                if idx in (9, 10, 11):
                    VIEWPORT_HEIGHT = 805
                    await page.set_viewport_size({"width": VIEWPORT_WIDTH, "height": VIEWPORT_HEIGHT})
                    SCROLL_STEP = VIEWPORT_HEIGHT - OVERLAP

                scroll_top = min(current_y, max_scroll_top)
                print(f"캡처 {idx}: 스크롤 위치 {scroll_top}px (VIEWPORT_HEIGHT={VIEWPORT_HEIGHT})")
                await page.evaluate(f'window.scrollTo(0, {scroll_top})')
                await page.wait_for_timeout(1200)
                out_path = f"{screenshot_dir}/{today}_부동산캡처{idx}.png"
                if os.path.exists(out_path):
                    os.remove(out_path)
                await page.screenshot(path=out_path)
                print(f"   ✓ 저장: {out_path}")

                # 마지막 영역에 도달했으면 종료
                if scroll_top >= max_scroll_top:
                    break

                current_y += SCROLL_STEP
                idx += 1
        
        # 브라우저 종료
        await browser.close()
        
        print("\n✅ 모든 스크린샷 캡처 완료!")
        print(f"저장 위치: {os.path.abspath(screenshot_dir)}")

if __name__ == "__main__":
    print("=" * 60)
    print("부동산맵 스크린샷 캡처 시작")
    print("=" * 60)
    asyncio.run(capture_realestate_sections())

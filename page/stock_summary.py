from bs4 import BeautifulSoup
import os
import openai
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# .env 파일에서 환경 변수를 로드합니다.
load_dotenv()

# --- 설정값 ---
BASE_URL = "https://www.hankyung.com"
NEWS_WALL_URL = f"{BASE_URL}/globalmarket/news-wallstreet-now"
ARTICLE_BODY_SELECTOR = '#articletxt' 

# === 최종 확정된 핵심 선택자 그룹 (사용자 제공 HTML 기반) ===
ARTICLE_ITEM_SELECTOR = 'ul.news-list li' 
TITLE_SELECTOR = '.news-tit a'
DATE_SELECTOR = '.txt-date' 
# =================================================

"""
python page/stock_summary.py 2025.10.23 지정된 날짜로 테스트 요약 실행하기
"""
def summarize_text(text: str) -> str:
    """ChatGPTAPI를 사용하여 원하는 형식으로 텍스트를 요약합니다."""
    
    if not text:
        return "요약할 내용이 없습니다."
    # 로컬 및 사이트 조건 추가
    api_key = os.getenv('OPENAI_API_KEY') or os.getenv('CHATGPT_API_KEY')
    if not api_key:
        return "❌ 오류: OPENAI_API_KEY 또는 CHATGPT_API_KEY 환경 변수를 설정해야 ChatGPT API를 사용할 수 있습니다."

    prompt = (
        "다음 [기사 본문]을 한국어로 읽고, 핵심 내용을 3~4개의 주요 주제로 나누어 요약해. "
        "각 주제는 반드시 '1. 2. 3.'과 같이 번호로 시작해야 하며, [ ] 괄호 없이 작성해. "
        "요약은 아래 예시와 같이 '번호. 주제'와 그에 대한 2~3줄의 핵심 내용 구조를 따라. "
        "불필요한 서론이나 결론 없이, 바로 주제와 요약 내용만 출력하세요. 모든 내용은 간결하고, 존대말(공송한 말투)작성."
        "전체 요약 결과가 600 토큰 이내로 나오도록 분량을 조절.\n\n"
        "[예시 형식]\n"
        "1. 9월 CPI 발표와 금리 인하 기대\n"
        "9월 CPI 데이터가 예상보다 좋았으며, 관세 인플레이션 우려가 없음을 보여줬다고 분석했습니다.\n"
        f"{text}"
    )
    
    try:
        client = openai.OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "당신은 한국어 요약 경제 전문가입니다."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=600, # 요약 결과가 600 토큰 이내로 제한
            temperature=0.5,
        )
        content = response.choices[0].message.content if response.choices and response.choices[0].message else None
        if content:
            return content.strip()
        else:
            return "❌ ChatGPT API 응답이 비어 있습니다."
    except Exception as e:
        return f"❌ ChatGPT API 호출 오류가 발생했습니다: {e}"
    
import requests
from bs4 import BeautifulSoup
from datetime import datetime

"""
playwright 없이 파싱하여 기사 본문을 추출
"""

# ...기존 상수 및 summarize_text 함수 유지...

def get_latest_article_requests(target_date: str = None) -> dict | None:
    if target_date is None:
        target_date = datetime.now().strftime("%Y.%m.%d")
    print(f"[정보] {target_date} 날짜 기사를 우선 찾고 있습니다.")
    try:
        resp = requests.get(NEWS_WALL_URL, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")
        news_list = soup.select(ARTICLE_ITEM_SELECTOR)
        latest_article = None
        for i, item in enumerate(news_list):
            title_tag = item.select_one(TITLE_SELECTOR)
            date_tag = item.select_one(DATE_SELECTOR)
            if title_tag and date_tag:
                article_date = date_tag.get_text(strip=True).split()[0]
                article_url = title_tag.get('href')
                if not article_url or not isinstance(article_url, str):
                    continue
                if not article_url.startswith('http'):
                    article_url = BASE_URL + article_url
                current_article = {
                    'title': title_tag.get_text(strip=True),
                    'url': article_url,
                    'date': article_date
                }
                if i == 0:
                    latest_article = current_article
                if article_date == target_date:
                    return current_article
        # 원하는 날짜 기사 없으면 최신 기사 반환
        if latest_article:
            print(f"{target_date} 기사 없음, 최신 기사로 대체")
            return latest_article
        print(f"{target_date} 기사 없음")
        return None
    except Exception as e:
        print(f"❌ 웹 크롤링 중 오류 발생: {e}")
        return None

def get_article_content_requests(url: str) -> str | None:
    try:
        resp = requests.get(url, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")
        content_element = soup.select_one(ARTICLE_BODY_SELECTOR)
        if content_element:
            for ad_tag in content_element.find_all(class_='atc-ad-area'):
                ad_tag.decompose()
            for script_tag in content_element.find_all('script'):
                script_tag.decompose()
            return content_element.get_text('\n', strip=True)
        return None
    except Exception as e:
        print(f"❌ 기사 본문 접속 또는 추출 오류 ({url}): {e}")
        return None

def main():
    import sys
    print("📰 한경 월스트리트나우 요약 스크립트 (requests) 실행 시작")
    # 인자로 날짜(YYYY.MM.DD) 받기, 없으면 오늘
    target_date = None
    if len(sys.argv) > 1:
        target_date = sys.argv[1]
    article = get_latest_article_requests(target_date)
    if not article:
        print("START_SUMMARY_BODY")
        print(f"{target_date or '오늘'} 기사 없음")
        print("END_SUMMARY_BODY")
        return
    print(f"\n✅ 기사 1개를 발견했습니다. (날짜: {article['date']})")
    print(f"  └ 제목: {article['title']}")
    print(f"  └ URL: {article['url']}")
    content = get_article_content_requests(article['url'])
    if content:
        print("[정보] ChatGPTAPI를 사용하여 요약을 요청 중...")
        summary = summarize_text(content)
        print("START_SUMMARY_BODY", flush=True)
        print(summary, flush=True)
        print("END_SUMMARY_BODY", flush=True)
        print(f"URL: {article['url']}", flush=True)
    else:
        print("START_SUMMARY_BODY")
        print("기사 본문을 가져올 수 없습니다.")
        print("END_SUMMARY_BODY")

if __name__ == "__main__":
    main()


"""
playwright vercel 배포 시 용량 250mb 제한으로 인해 삭제
"""
# async def get_latest_article_playwright(page) -> Optional[Dict[str, Any]]:
#     """
#     Playwright 페이지 객체를 사용하여 동적 로딩된 페이지에서 최신 기사를 추출합니다.
#     (오늘 날짜 기사를 우선 찾고, 없으면 목록의 맨 위 기사를 가져옵니다.)
#     """
#     today_date = datetime.now().strftime("%Y.%m.%d")
#     print(f"[정보] 오늘 ({today_date}) 날짜 기사를 우선 찾고 있습니다.")

#     try:
#         await page.goto(NEWS_WALL_URL, wait_until='domcontentloaded') 
#         await page.locator(ARTICLE_ITEM_SELECTOR).first.wait_for(state="attached", timeout=15000)

#         content = await page.content()
#         soup = BeautifulSoup(content, 'html.parser')

#         news_list = soup.select(ARTICLE_ITEM_SELECTOR) 
        
#         if not news_list:
#             print("❌ 기사 목록 요소를 찾지 못했습니다. 최종 선택자 확인이 필요합니다.")
#             return None
        
#         # --- 기사 정보 추출 및 로직 수정 ---
#         target_article = None
        
#         for i, item in enumerate(news_list):
#             title_tag = item.select_one(TITLE_SELECTOR)
#             date_tag = item.select_one(DATE_SELECTOR)
            
#             if title_tag and date_tag:
#                 title = title_tag.get_text(strip=True)
#                 relative_url = title_tag.get('href')
                
#                 article_url = relative_url
#                 if not article_url.startswith('http'):
#                     article_url = BASE_URL + article_url

#                 full_date_time = date_tag.get_text(strip=True)
#                 article_date = full_date_time.split()[0]
                
#                 current_article = {
#                     'title': title,
#                     'url': article_url,
#                     'date': article_date
#                 }

#                 # 1. 목록의 맨 위에 있는 기사를 무조건 저장 (가장 최신 기사)
#                 if i == 0:
#                     target_article = current_article
                
#                 # 2. 오늘 날짜 기사를 발견하면 그것을 최종 타겟으로 설정하고 반복 종료
#                 if article_date == today_date:
#                     target_article = current_article
#                     break # 오늘 기사를 찾았으니 반복을 멈춥니다.
        
#         if target_article:
#             if target_article['date'] == today_date:
#                  print(f"✅ 오늘 날짜 기사({today_date})를 발견했습니다.")
#             else:
#                  print(f"⚠️ 오늘 날짜 기사가 없어, 가장 최신 날짜({target_article['date']}) 기사를 가져옵니다.")
#             return target_article
        
#         return None

#     except Exception as e:
#         print(f"❌ 웹 크롤링 중 오류 발생: {e}")
#         return None


# async def get_article_content_playwright(page, url: str) -> Optional[str]:
#     """Playwright를 사용하여 개별 기사 본문을 추출합니다."""
#     try:
#         await page.goto(url, wait_until='domcontentloaded')
        
#         await page.locator(ARTICLE_BODY_SELECTOR).wait_for(state="attached", timeout=15000)

#         content = await page.content()
#         soup = BeautifulSoup(content, 'html.parser')
#         content_element = soup.select_one(ARTICLE_BODY_SELECTOR)
        
#         if content_element:
#             for ad_tag in content_element.find_all(class_='atc-ad-area'):
#                 ad_tag.decompose()
#             for script_tag in content_element.find_all('script'):
#                 script_tag.decompose()
                
#             content = content_element.get_text('\n', strip=True)
#             return content
#         else:
#             return None

#     except Exception as e:
#         print(f"❌ 기사 본문 접속 또는 추출 오류 ({url}): {e}")
#         return None

# async def main_async():
#     """메인 비동기 함수: Playwright로 기사를 가져와 요약합니다."""
#     print("📰 한경 월스트리트나우 요약 스크립트 (Playwright) 실행 시작")
    
#     async with async_playwright() as p:
#         browser = await p.chromium.launch(headless=True)
#         page = await browser.new_page()

#         try:
#             # 1. 오늘 또는 가장 최신 기사 가져오기
#             article = await get_latest_article_playwright(page)

#             if not article:
#                 print("\n[완료] 크롤링할 기사를 찾지 못했습니다. 스크립트를 종료합니다.")
#                 return

#             print(f"\n✅ 기사 1개를 발견했습니다. (날짜: {article['date']})")
#             print(f"  └ 제목: {article['title']}")
#             print(f"  └ URL: {article['url']}")
            
#             # 2. 기사 본문 가져오기
#             print("\n[정보] 기사 본문을 추출 중...")
#             content = await get_article_content_playwright(page, article['url'])
            
#             if content:
#                 # 3. ChatGPTAPI를 사용하여 요약 수행
#                 print("[정보] ChatGPTAPI를 사용하여 요약을 요청 중...")
#                 summary = summarize_text(content)
                
#                 # 4. 결과 출력: 구분선을 제거하고 깔끔한 시작/끝 태그만 남깁니다.
#                 print("START_SUMMARY_BODY", flush=True)
#                 print(summary, flush=True)
#                 print("END_SUMMARY_BODY", flush=True)
#                 print(f"URL: {article['url']}", flush=True)
#             else:
#                 print("\n❌ 기사 본문을 가져오는 데 실패하여 요약할 수 없습니다.")
        
#         finally:
#             await browser.close()
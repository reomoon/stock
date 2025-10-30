"""
# [run.py]
# 로컬에서 정적 HTML(main.html) 생성용
# 데이터 수집/가공 후 파일로 저장, 서버 없이 미리보기 가능
"""
import json
import os
import subprocess
import re
from page.market import stock
from page.plot_averages import make_nasdaq_ma_graphs
from page.news import economy_news, realestate_news
from page.realestate import realestate, get_weekly_real_estate_data, get_apt2me_transaction_volume, generate_realestate_map

# 네이버 클라우드 플랫폼 Maps API 클라이언트 ID
NAVER_CLIENT_ID = "wohmf5ntoz"

# 미국주식 stock_summary.py 실행하여 요약문 가져오기
import subprocess
import re # 정규식은 제거하지만, subprocess를 위해 필요할 수 있습니다.

def get_stock_summary():
    script_path = os.path.join(os.path.dirname(__file__), "page", "stock_summary.py")
    try:
        result = subprocess.run(
            ["python", "-X", "utf8", script_path],
            capture_output=True, text=True, encoding="utf-8", timeout=60
        )
    except Exception as e:
        print("stock_summary.py 실행 오류:", e)
        return ""

    # 여기서 인코딩 에러가 나면 cp949로 강제 변환
    try:
        stdout = result.stdout
    except UnicodeDecodeError:
        stdout = result.stdout.encode('cp949').decode('utf-8', errors='replace')

    # 디버깅
    print("==== stock_summary.py 출력 ====")
    print("stock_summary.py 전체 출력:\n", stdout)
    if result.stderr.strip():
        print("stderr (오류 출력):\n", result.stderr)
    else:
        print("stderr (오류 출력): 오류 없음")
    print("==== end ====")

    # 1. 요약 본문 시작/끝 구분자를 기준으로 분리
    start_tag = "START_SUMMARY_BODY"
    end_tag = "END_SUMMARY_BODY"

    if start_tag not in stdout or end_tag not in stdout:
        print("❗ 요약 결과를 찾지 못했습니다. stock_summary.py 출력:\n", stdout)
        return ""

    # 요약 본문 추출
    summary_start = stdout.find(start_tag) + len(start_tag)
    summary_end = stdout.find(end_tag)

    summary = stdout[summary_start:summary_end].strip()

    # 2. URL 추출 (stdout의 끝 부분에서 'URL: '을 찾습니다)
    url_match = re.search(r"URL:\s*(.+)", stdout)
    url = url_match.group(1).strip() if url_match else None

    if summary:
        # 번호가 없는 경우 1. 2. 3. 형식으로 강제 번호 붙이기
        import re as _re
        lines = summary.strip().splitlines()
        numbered_lines = []
        num = 1
        prev_blank = True
        for line in lines:
            # 이미 번호가 붙은 경우는 그대로
            if _re.match(r"^\d+\. ", line.strip()):
                numbered_lines.append(line)
                prev_blank = False
                num += 1
            elif line.strip() != "":
                # 제목(주제)로 추정되는 줄에만 번호 붙이기: 빈 줄 다음이거나 첫 줄이면서 '-'로 시작하지 않는 줄
                if prev_blank and not line.strip().startswith("-"):
                    numbered_lines.append(f"{num}. {line.strip()}")
                    num += 1
                    prev_blank = False
                else:
                    numbered_lines.append(line)
                    prev_blank = False
            else:
                numbered_lines.append(line)
                prev_blank = True
        summary_numbered = "\n".join(numbered_lines)
        url_html = f"<div style=\"text-align:left; margin-top:8px;\"><a href=\"{url}\" target=\"_blank\" rel=\"noopener\" style=\"color:#2563eb; text-decoration:underline; font-size:0.8em;\">기사 원문 바로가기</a></div>" if url else ""
        return f"""
        <section class=\"stock-summary-section\" style=\"margin-bottom:24px;\">
            <h2 style=\"font-size:1.1em; margin-bottom:8px;\">오늘의 미국 주식 요약</h2>
            <div style=\"font-size:0.98em; line-height:1.7; background:#f8fafc; border-radius:8px; padding:16px; border:1px solid #e2e8f0; position:relative;\">
                <button id=\"copy-summary-btn\" title=\"요약 복사\" style=\"position:absolute; top:10px; right:10px; background:none; border:none; cursor:pointer; padding:2px;\">
                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" fill=\"#888\" viewBox=\"0 0 20 20\"><rect x=\"6\" y=\"2\" width=\"9\" height=\"14\" rx=\"2\" fill=\"#e2e8f0\" stroke=\"#888\" stroke-width=\"1\"/><rect x=\"3\" y=\"5\" width=\"9\" height=\"13\" rx=\"2\" fill=\"none\" stroke=\"#888\" stroke-width=\"1\"/></svg>
                </button>
                <pre id=\"stock-summary-pre\" style=\"white-space:pre-wrap; font-family:inherit; background:none; border:none; margin:0;\">{summary_numbered}</pre>
                {url_html}
            </div>
            <div id=\"stock-summary-toast\" style=\"display:none; position:fixed; bottom:40px; left:50%; transform:translateX(-50%); background:#222; color:#fff; padding:10px 22px; border-radius:6px; font-size:1em; z-index:9999; opacity:0.95; box-shadow:0 2px 8px rgba(0,0,0,0.15);\">복사 되었습니다.</div>
            <script>
            function showToast(msg) {{
                var toast = document.getElementById('stock-summary-toast');
                if (!toast) return;
                toast.textContent = msg;
                toast.style.display = 'block';
                toast.style.opacity = '0.95';
                setTimeout(function() {{ toast.style.opacity = '0'; }}, 1200);
                setTimeout(function() {{ toast.style.display = 'none'; }}, 1600);
            }}
            document.addEventListener('DOMContentLoaded', function() {{
                var btn = document.getElementById('copy-summary-btn');
                var handler = function() {{
                    var pre = document.getElementById('stock-summary-pre');
                    if (pre) {{
                        var text = pre.innerText;
                        navigator.clipboard.writeText(text).then(function() {{
                            showToast('복사 되었습니다.');
                            btn.title = '복사됨!';
                            btn.style.opacity = '0.6';
                            setTimeout(function() {{ btn.title = '요약 복사'; btn.style.opacity = '1'; }}, 1200);
                        }});
                    }}
                }};
                if (btn) {{
                    btn.addEventListener('click', handler);
                    btn.addEventListener('touchstart', handler);
                }}
            }});
            </script>
        </section>
        """
    else:
        print("❗ 요약 결과를 찾지 못했습니다. 디버깅 정보:")
        return ""


import datetime

def is_realestate_update_day():
    # 금(4), 토(5)만 True
    return datetime.datetime.now().weekday() in [4, 5]

def save_realestate_cache(weekly_data, monthly_data, realestate_data, realestate_map_data):
    cache_dir = "cache"
    if not os.path.exists(cache_dir):
        os.makedirs(cache_dir)
    with open(os.path.join(cache_dir, "weekly_data.json"), "w", encoding="utf-8") as f:
        json.dump(weekly_data, f, ensure_ascii=False)
    with open(os.path.join(cache_dir, "monthly_data.json"), "w", encoding="utf-8") as f:
        json.dump(monthly_data, f, ensure_ascii=False)
    with open(os.path.join(cache_dir, "realestate_data.json"), "w", encoding="utf-8") as f:
        json.dump(realestate_data, f, ensure_ascii=False)
    with open(os.path.join(cache_dir, "realestate_map_data.json"), "w", encoding="utf-8") as f:
        json.dump(realestate_map_data, f, ensure_ascii=False)

def load_realestate_cache():
    cache_dir = "cache"
    def load_json(name):
        try:
            with open(os.path.join(cache_dir, name), "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return ""
    return (
        load_json("weekly_data.json"),
        load_json("monthly_data.json"),
        load_json("realestate_data.json"),
        load_json("realestate_map_data.json")
    )

def generate_static_html(main_only=False, realestate_only=False):
    if not os.path.exists("public"):
        os.makedirs("public")

    # 주식/뉴스 데이터 (realestate_only가 아니면)
    if not realestate_only:
        ma_graphs_html = make_nasdaq_ma_graphs()
        stock_data = stock()
        economy_news_data = economy_news()
        realestate_news_data = realestate_news()
        stock_summary_html = get_stock_summary()
    else:
        ma_graphs_html = stock_data = economy_news_data = realestate_news_data = stock_summary_html = ""

    # 부동산 데이터: 금/토에는 새로 갱신, 평일에는 캐시에서 읽기
    if is_realestate_update_day() or realestate_only:
        weekly_data = get_weekly_real_estate_data()
        from page.realestate import REGION_CODES
        monthly_data = [
            {
                "area_code": code,
                "area": name,
                "monthly_volumes": get_apt2me_transaction_volume(code)
            }
            for code, name in REGION_CODES.items()
        ]
        realestate_data = realestate()
        realestate_map_data = generate_realestate_map()
        save_realestate_cache(weekly_data, monthly_data, realestate_data, realestate_map_data)
    else:
        weekly_data, monthly_data, realestate_data, realestate_map_data = load_realestate_cache()

    print("실제 데이터 사용")
    print("weekly_data:", weekly_data)
    print("monthly_data:", monthly_data)
    with open("public/main.html", "w", encoding="utf-8") as f:
        f.write(f"""<!DOCTYPE html>
<html lang=\"ko\">
<head>
    <meta charset=\"UTF-8\">
    <title>Stock & News Dashboard</title>
    <link rel=\"stylesheet\" href=\"./style.css\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
    <!-- 네이버 클라우드 플랫폼 Maps API -->
    <script type="text/javascript" src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId={NAVER_CLIENT_ID}&callback=initNaverMap"></script>
</head>
<body>
    <!-- <header>
        <h1>오늘의 주가 및 주요 뉴스</h1>
    </header> -->
    
    <!-- 메인 탭 네비게이션 -->

    <nav class="main-nav">
        <div class="main-tab-buttons">
            <button class="main-tab-button active" data-tab="economy-main-tab" style="height: 40px; padding: 2px 10px; font-size: 1.2em;">경제</button>
            <button class="main-tab-button" data-tab="realestate-map-main-tab" style="height: 40px; padding: 2px 10px; font-size: 1.2em;">부동산맵</button>
        </div>
        <div class="main-nav-extra-buttons" style="display: flex; gap: 8px; justify-content: flex-end; align-items: center; margin: 0; padding: 0; background: none; box-shadow: none; border: none; font-size: 0.95em; line-height: 1;">
            <!-- 필요시 버튼 추가 -->
        </div>
    </nav>
    
    <!-- 경제 메인 탭 (주식 + 경제뉴스) -->
    <div id="economy-main-tab" class="main-tab-content active">
        <!-- 기본 주식 정보 -->
        <section id=\"stock\">
            <h2>주식 정보</h2>
            {stock_data}
            <h2>나스닥 이동평균선</h2>
            <div id=\"ma-graphs\">
                {ma_graphs_html}
            </div>
        </section>
        
        <!-- 오늘의 미국 주식 요약 -->
        {stock_summary_html}    
        
        <section id=\"economy\">
            <h2>경제 뉴스</h2>
            {economy_news_data}
        </section>


    </div>
    
    <!-- 부동산맵 메인 탭 -->
    <div id="realestate-map-main-tab" class="main-tab-content">
        <!-- 부동산 매매지수 지도 -->
        <section class=\"map-s<section class="map-section" style="padding-right: 5px;padding-left: 5px;padding-top: 5px;">
            <h2>부동산 매매지수 지도</h2>
            <div class=\"map-controls\">
                <div class=\"map-type-buttons\">
                    <button class=\"map-type-btn active\" onclick=\"changeMapDisplay('index')\">매매지수</button>
                    <button class=\"map-type-btn\" onclick=\"changeMapDisplay('weekly_change')\">주간변동</button>
                    <button class=\"map-type-btn\" onclick=\"changeMapDisplay('monthly_change')\">월간변동</button>
                </div>
                <!-- map-legend moved below -->
            </div>
            <div class=\"naver-map-container\">
                <div id=\"naver-map-realestate\" style=\"margin-bottom: 10px;\"></div>
            </div>
            <div style=\"display: flex; justify-content: space-between; align-items: center; margin-top: 10px;\">
                <small style=\"font-size: 13px; color: #4a5568;\">업데이트: <span id=\"update-date\"></span></small>
                <div class=\"map-legend\" style=\"display: flex; gap: 10px; align-items: center;\">
                    <div class=\"legend-item\" style=\"display: flex; align-items: center; gap: 4px;\">
                        <div class=\"legend-color\" style=\"background: #ff4444; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #fff;\"></div>
                        <span style=\"font-size: 12px; color: #333;\">높음</span>
                    </div>
                    <div class=\"legend-item\" style=\"display: flex; align-items: center; gap: 4px;\">
                        <div class=\"legend-color\" style=\"background: #ffaa00; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #fff;\"></div>
                        <span style=\"font-size: 12px; color: #333;\">보통</span>
                    </div>
                    <div class=\"legend-item\" style=\"display: flex; align-items: center; gap: 4px;\">
                        <div class=\"legend-color\" style=\"background: #44ff44; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #fff;\"></div>
                        <span style=\"font-size: 12px; color: #333;\">낮음</span>
                    </div>
                </div>
            </div>
            <div class=\"map-info\" style=\"margin-top: 10px;\">
                <p>※ 지역을 클릭하면 상세 정보를 확인할 수 있습니다</p>
                <p>※ 매매지수: 2022년 1월 = 100.0 기준</p>
                <p>※ 데이터 출처: KB부동산 통계</p>
            </div>

        </section>
        
        <!-- 월간매매지수 -->
        <section class="monthly-data-section">
            <h2>부동산 매매 가격지수 현황</h2>
            {realestate_data}
        </section>
        
        <!-- 월간 거래량 차트 -->
        <section class="monthly-volume-section" 
                    style="
                padding-left: 5px;
                padding-right: 5px;
            ">
            <h2>월간 거래량</h2>
            <div id=\"monthly-transaction-chart\"></div>
        </section>
        
        <!-- 주간 매매지수 차트 -->
        <section class="weekly-index-section"
            style="
                padding-left: 5px;
                padding-right: 5px;
            ">
            <h2>주간 매매지수</h2>
            <div id=\"weekly-index-chart\"></div>
        </section>
    </div>
    <!-- JS 및 데이터는 body 끝에서 로드 -->
    <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
    <script>
    window.weeklyIndexData = {json.dumps(weekly_data, ensure_ascii=False, separators=(',', ':'))};
    window.monthlyIndexData = {json.dumps(monthly_data, ensure_ascii=False, separators=(',', ':'))};
    window.monthly_volume_data = window.monthlyIndexData;
    </script>
    <script src="js/nasdaq_chart.js"></script>
    <script src="js/weekly_index_chart.js"></script>
    <script src="js/monthly_transaction_chart.js"></script>
    <!-- 메인 탭 및 네이버맵 스크립트 -->
    <script src="js/main_tabs.js"></script>
    <script src="js/naver_map.js"></script>
    
    <!-- 오늘 날짜 표시 -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {{
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const updateDateElement = document.getElementById('update-date');
            if (updateDateElement) {{
                updateDateElement.textContent = `${{year}}년 ${{month}}월 ${{day}}일`;
            }}
        }});
    </script>
</body>
</html>
""")

if __name__ == '__main__':
    import sys
    main_only = '--main-only' in sys.argv
    realestate_only = '--realestate-only' in sys.argv
    generate_static_html(main_only=main_only, realestate_only=realestate_only)
    print("HTML 파일이 생성되었습니다.")
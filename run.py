"""
# [run.py]
# 로컬에서 정적 HTML(main.html) 생성용
# 데이터 수집/가공 후 파일로 저장, 서버 없이 미리보기 가능
"""
import json
import os
from page.market import stock
from page.plot_averages import make_nasdaq_ma_graphs
from page.news import economy_news, realestate_news
from page.realestate import realestate, get_weekly_real_estate_data, get_apt2me_transaction_volume, generate_realestate_map

# 네이버 클라우드 플랫폼 Maps API 클라이언트 ID
NAVER_CLIENT_ID = "wohmf5ntoz"



# 정적 HTML 파일 생성 (GitHub Actions용)
def generate_static_html():
    ma_graphs_html = make_nasdaq_ma_graphs()
    stock_data = stock()
    economy_news_data = economy_news()
    realestate_news_data = realestate_news()

    # 실제 데이터 호출
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
            <button class="main-tab-button active" data-tab="economy-main-tab">경제</button>
            <button class="main-tab-button" data-tab="realestate-map-main-tab">부동산맵</button>
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
        
        <section id=\"economy\">
            <h2>경제 뉴스</h2>
            {economy_news_data}
        </section>
        
        <!-- 부동산 뉴스 섹션 -->
        <section id=\"realestate-news\">
            <h2>부동산 뉴스</h2>
            {realestate_news_data}
        </section>
    </div>
    
    <!-- 부동산맵 메인 탭 -->
    <div id="realestate-map-main-tab" class="main-tab-content">
        <!-- 부동산 매매지수 지도 -->
        <section class=\"map-section\">
            <h2>부동산 매매지수 지도</h2>
            <div class=\"map-controls\">
                <div class=\"map-type-buttons\">
                    <button class=\"map-type-btn active\" onclick=\"changeMapDisplay('index')\">매매지수</button>
                    <button class=\"map-type-btn\" onclick=\"changeMapDisplay('weekly_change')\">지난주 대비</button>
                    <button class=\"map-type-btn\" onclick=\"changeMapDisplay('monthly_change')\">지난달 대비</button>
                </div>
                <div class=\"map-legend\">
                    <div class=\"legend-item\">
                        <div class=\"legend-color\" style=\"background: #ff4444;\"></div>
                        <span>높음</span>
                    </div>
                    <div class=\"legend-item\">
                        <div class=\"legend-color\" style=\"background: #ffaa00;\"></div>
                        <span>보통</span>
                    </div>
                    <div class=\"legend-item\">
                        <div class=\"legend-color\" style=\"background: #44ff44;\"></div>
                        <span>낮음</span>
                    </div>
                </div>
            </div>
            <div class=\"naver-map-container\">
                <div id=\"naver-map-realestate\"></div>
            </div>
            <div class=\"map-info\">
                <p>※ 지역을 클릭하면 상세 정보를 확인할 수 있습니다</p>
                <p>※ 매매지수: 2020년 1월 = 100.0 기준</p>
                <p>※ 데이터 출처: KB부동산 통계</p>
            </div>
        </section>
        
        <!-- 월간매매지수 -->
        <section class="monthly-data-section">
            <h2>부동산 매매 가격지수 현황</h2>
            {realestate_data}
        </section>
        
        <!-- 월간 거래량 차트 -->
        <section class="monthly-volume-section">
            <h2>월간 거래량</h2>
            <div id=\"monthly-transaction-chart\"></div>
        </section>
        
        <!-- 주간 매매지수 차트 -->
        <section class="weekly-index-section">
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
</body>
</html>
""")

if __name__ == '__main__':
    generate_static_html()
    print("HTML 파일이 생성되었습니다.")
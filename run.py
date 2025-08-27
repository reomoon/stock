import json
from page.market import stock
from page.plot_averages import make_nasdaq_ma_graphs
from page.news import economy_news, realestate_news
from page.realestate import realestate, get_weekly_real_estate_data, get_apt2me_transaction_volume

# 정적 HTML 파일 생성 (GitHub Actions용)
def generate_static_html():
    ma_graphs_html = make_nasdaq_ma_graphs()
    stock_data = stock()
    economy_news_data = economy_news()
    realestate_news_data = realestate_news()
    weekly_data = get_weekly_real_estate_data()
    # 모든 지역의 월별 거래량 데이터를 REGION_CODES 기반으로 생성
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
    with open("public/main.html", "w", encoding="utf-8") as f:
        f.write(f"""<!DOCTYPE html>
<html lang=\"ko\">
<head>
    <meta charset=\"UTF-8\">
    <title>Stock & News Dashboard</title>
    <link rel=\"stylesheet\" href=\"./style.css\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
</head>
<body>
    <header>
        <h1>오늘의 주가 및 주요 뉴스</h1>
    </header>
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
    <section id=\"realestate-news\">
        <h2>부동산 뉴스</h2>
        {realestate_news_data}
    </section>
    <section id=\"realestate-chart\">
        <div id=\"weekly-index-chart\"></div>
        <div id="monthly-transaction-chart"></div>
    </section>
    <section id=\"realestate-data\">
        <h2>부동산 매매 가격지수 현황</h2>
        {realestate_data}
    </section>
    <!-- JS 및 데이터는 body 끝에서 로드 -->
    <script src=\"https://cdn.plot.ly/plotly-2.27.0.min.js\"></script>
    <script>
    window.weeklyIndexData = {json.dumps(weekly_data, ensure_ascii=False)};
    window.monthlyIndexData = {json.dumps(monthly_data, ensure_ascii=False)};
    </script>
    <script src=\"js/nasdaq_chart.js\"></script>
    <script src=\"js/weekly_index_chart.js\"></script>
    <script src=\"js/monthly_transaction_chart.js\"></script>
</body>
</html>
""")

if __name__ == '__main__':
    generate_static_html()
    print("HTML 파일이 생성되었습니다.")
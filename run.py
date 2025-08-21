from page.market import stock
from plot_averages import make_nasdaq_ma_graphs
from page.news import economy_news, realestate_news
from page.realestate import realestate
from datetime import datetime

# 정적 HTML 파일 생성 (GitHub Actions용)
def generate_static_html():
    ma_graphs_html = make_nasdaq_ma_graphs()
    stock_data = stock()
    economy_news_data = economy_news()
    realestate_news_data = realestate_news()
    realestate_data = realestate()
    
    # 주간 매매 지수 그래프 HTML 생성 (예시: 최근 8주, 실제 데이터 연동 필요)
    from page.weekly_chart_html import get_weekly_sale_chart_html
    # 예시 데이터: 최근 8주
    weekly_labels = [f"{i+1}주전" for i in range(8)][::-1]
    weekly_sale_index = [100 + i for i in range(8)]
    realestate_chart_html = get_weekly_sale_chart_html(weekly_labels, weekly_sale_index)

    with open("public/main.html", "w", encoding="utf-8") as f:
        f.write(f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Stock & News Dashboard</title>
    <link rel="stylesheet" href="./style.css"> <!-- 절대경로로 변경 --!>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body>
    <header>
        <h1>오늘의 주가 및 주요 뉴스</h1>
    </header>
    <section id="stock">
        <h2>주식 정보</h2>
        {stock_data}
        <h2>나스닥 이동평균선</h2>
        <div id="ma-graphs">
            {ma_graphs_html}
        </div>
    </section>
    <section id="economy">
        <h2>경제 뉴스</h2>
        {economy_news_data}
    </section>
    <section id="realestate-news">
        <h2>부동산 뉴스</h2>
        {realestate_news_data}
    </section>
    <section id="realestate-data">
        <h2>부동산 매매 가격지수 현황</h2>
        {realestate_chart_html}
        {realestate_data}
    </section>
</body>
</html>
""")

if __name__ == '__main__':
    generate_static_html()
    print("HTML 파일이 생성되었습니다.")
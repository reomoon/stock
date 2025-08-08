from page.market import stock
from plot_averages import make_nasdaq_ma_graphs
from page.news import economy_news, realestate_news
from page.realestate import realestate
from datetime import datetime

ma_graphs_html = make_nasdaq_ma_graphs()
stock_data = stock()
economy_news_data = economy_news()
realestate_news_data = realestate_news()
realestate_data = realestate()

with open("main.html", "w", encoding="utf-8") as f:
    f.write(f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Stock & News Dashboard</title>
    <link rel="stylesheet" href="style.css">
    <meta name="viewport" content="width=device-width, initial-scale=1">
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
    <section id="realestate">
        <h2>부동산 뉴스</h2>
        {realestate_news_data}
        <h2>부동산 매매 가격지수</h2>
        {realestate_data}
    </section>
</body>
</html>
""")
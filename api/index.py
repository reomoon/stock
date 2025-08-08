import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask
from page.market import stock
from plot_averages import make_nasdaq_ma_graphs
from page.news import economy_news, realestate_news
from page.realestate import realestate

app = Flask(__name__)

def handler(request):
    try:
        ma_graphs_html = make_nasdaq_ma_graphs()
        stock_data = stock()
        economy_news_data = economy_news()
        realestate_news_data = realestate_news()
        realestate_data = realestate()
        
        # CSS 파일 읽기
        css_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'style.css')
        try:
            with open(css_path, "r", encoding="utf-8") as f:
                css_content = f.read()
        except:
            css_content = ""
        
        html_template = f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Stock & News Dashboard</title>
    <style>
    {css_content}
    </style>
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
        {realestate_data}
    </section>
</body>
</html>
"""
        return html_template
        
    except Exception as e:
        return f"""
        <html>
        <body>
            <h1>오류 발생</h1>
            <p>데이터를 불러오는 중 오류가 발생했습니다: {str(e)}</p>
        </body>
        </html>
        """

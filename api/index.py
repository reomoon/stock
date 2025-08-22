import sys
import os
from http.server import BaseHTTPRequestHandler

# 상위 디렉토리의 모듈들을 import하기 위해 경로 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from page.market import stock
    from page.plot_averages import make_nasdaq_ma_graphs
    from page.news import economy_news, realestate_news
    from page.realestate import realestate
except ImportError as e:
    print(f"Import error: {e}")

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
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
            
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(html_template.encode('utf-8'))
            
        except Exception as e:
            error_html = f"""
            <html>
            <body>
                <h1>오류 발생</h1>
                <p>데이터를 불러오는 중 오류가 발생했습니다: {str(e)}</p>
                <p>경로: {sys.path}</p>
            </body>
            </html>
            """
            
            self.send_response(500)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(error_html.encode('utf-8'))

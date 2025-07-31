import yfinance as yf
from datetime import date

import yfinance as yf
from datetime import date
import requests

def kospi():
    try:
        data = yf.download("^KS11", period="2d", interval="1d")
        # 데이터가 비었거나 2개 미만이면 오류 반환
        if data.empty or len(data["Close"]) < 2:
            return "<tr><td>KOSPI</td><td colspan='2'>데이터 오류 - 데이터가 부족합니다.</td></tr>"
        today = data["Close"].iloc[-1]
        yesterday = data["Close"].iloc[-2]
        diff = today - yesterday
        percent = (diff / yesterday) * 100 if yesterday != 0 else 0
        emoji = "🟢" if diff > 0 else "🔴" if diff < 0 else "⏸️"
        diff_class = "up" if diff > 0 else "down" if diff < 0 else "neutral"
        return f"<tr><td>KOSPI</td><td>{today:,.2f}</td><td class='{diff_class}'>{emoji} ({percent:+.1f}%, {diff:+.2f})</td></tr>"
    except Exception as e:
        return f"<tr><td>KOSPI</td><td colspan='2'>데이터 오류 - {e}</td></tr>"

def bitcoin():
    try:
        url = "https://api.upbit.com/v1/ticker?markets=KRW-BTC"
        response = requests.get(url)
        data = response.json()[0]
        trade_price = data["trade_price"]
        prev_closing_price = data["prev_closing_price"]
        diff = trade_price - prev_closing_price
        percent = (diff / prev_closing_price) * 100 if prev_closing_price != 0 else 0
        emoji = "🟢" if diff > 0 else "🔴" if diff < 0 else "⏸️"
        diff_class = "up" if diff > 0 else "down" if diff < 0 else "neutral"
        return f"<tr><td>BTC(Upbit)</td><td>{trade_price:,.0f}원</td><td class='{diff_class}'>{emoji} ({percent:+.1f}%, {diff:+.0f})</td></tr>"
    except Exception as e:
        return f"<tr><td>BTC(Upbit)</td><td colspan='2'>데이터 오류 - {e}</td></tr>"

def stock():
    tickers = ["^IXIC", "AAPL", "MSFT", "NVDA", "AMZN", "META", "GOOGL", "TSLA"]
    data = yf.download(tickers, period="2d", interval="1d")
    today_str = date.today().strftime("%Y-%m-%d")
    html = f"<div class='stock-table-wrap'><div>📊[{today_str}] 주요 미국 주식 종가 변동</div><table class='stock-table'><tr><th>종목</th><th>종가</th><th>변동</th></tr>"
    for ticker in tickers:
        try:
            today = data["Close"][ticker].iloc[-1]
            yesterday = data["Close"][ticker].iloc[-2]
            diff = today - yesterday
            percent = (diff / yesterday) * 100 if yesterday != 0 else 0
            emoji = "🟢" if diff > 0 else "🔴" if diff < 0 else "⏸️"
            display_ticker = "NASDAQ" if ticker == "^IXIC" else ticker
            diff_class = "up" if diff > 0 else "down" if diff < 0 else "neutral"
            html += (
                f"<tr><td>{display_ticker}</td><td>{today:.2f}</td>"
                f"<td class='{diff_class}'>{emoji} ({percent:+.1f}%, {diff:+.2f})</td></tr>"
            )
        except Exception as e:
            html += f"<tr><td>{ticker}</td><td colspan='2'>데이터 오류 - {e}</td></tr>"
    
    # 코스피와 비트코인 추가
    html += bitcoin()
    html += kospi()
    html += "</table></div>"
    return html

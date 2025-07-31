import yfinance as yf
from datetime import date

def stock():
    tickers = ["^IXIC", "AAPL", "MSFT", "NVDA", "AMZN", "META", "GOOGL", "TSLA"]
    data = yf.download(tickers, period="2d", interval="1d")
    today_str = date.today().strftime("%Y-%m-%d")
    html = f"<div class='stock-table-wrap'><div>📊[{today_str}] 주요 미국 주식 종가 변동:</div><table class='stock-table'><tr><th>종목</th><th>종가</th><th>변동</th></tr>"
    for ticker in tickers:
        try:
            today = data["Close"][ticker].iloc[-1]
            yesterday = data["Close"][ticker].iloc[-2]
            diff = today - yesterday
            emoji = "🟢" if diff > 0 else "🔴" if diff < 0 else "⏸️"
            display_ticker = "NASDAQ" if ticker == "^IXIC" else ticker
            diff_class = "up" if diff > 0 else "down" if diff < 0 else "neutral"
            html += f"<tr><td>{display_ticker}</td><td>${today:.2f}</td><td class='{diff_class}'>{emoji} ({diff:+.2f})</td></tr>"
        except Exception as e:
            html += f"<tr><td>{ticker}</td><td colspan='2'>데이터 오류 - {e}</td></tr>"
    html += "</table></div>"
    return html

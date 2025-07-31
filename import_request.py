import yfinance as yf

tickers = ["^IXIC", "AAPL", "MSFT", "NVDA", "AMZN", "META", "GOOGL", "TSLA"]
data = yf.download(tickers, period="2d", interval="1d")  # 최근 2일 데이터

print("📊 주요 미국 주식 종가 변동:\n")

for ticker in tickers:
    try:
        today = data["Close"][ticker][-1]
        yesterday = data["Close"][ticker][-2]
        diff = today - yesterday
        emoji = "🟢" if diff > 0 else "🔴" if diff < 0 else "⏸️"
        print(f"{ticker}: ${today:.2f} {emoji} ({diff:+.2f})")
    except Exception as e:
        print(f"{ticker}: 데이터 오류 - {e}")

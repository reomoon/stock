import yfinance as yf
import requests
from datetime import datetime, timezone, timedelta

# 예시: 2025-08-04 14:23 (KST)
kst = timezone(timedelta(hours=9))
now_str = datetime.now(kst).strftime("%Y-%m-%d %H:%M")

def kospi():
    import yfinance as yf
    try:
        data = yf.download("^KS11", period="2d", interval="1d", progress=False, auto_adjust=True)

        if data.empty or "Close" not in data.columns or len(data) < 2:
            raise ValueError("yfinance KOSPI 데이터 오류")

        close = data["Close"]
        if hasattr(close, 'ndim') and close.ndim > 1:
            close = close.iloc[:, 0]
        today = close.iloc[-1]
        yesterday = close.iloc[-2]
        diff = today - yesterday
        percent = (diff / yesterday) * 100 if yesterday != 0 else 0
        emoji = "&#9650;" if diff > 0 else "&#9660;" if diff < 0 else "&#8212;"
        diff_class = "up" if diff > 0 else "down" if diff < 0 else "neutral"
        return f"<tr><td>KOSPI</td><td>{today:,.2f}</td><td class='{diff_class}'>{emoji} ({percent:+.1f}%, {diff:+.2f})</td></tr>"
    except Exception as e:
        # Fallback: 네이버 금융에서 크롤링
        try:
            import requests
            from bs4 import BeautifulSoup
            url = "https://finance.naver.com/sise/sise_index.naver?code=KOSPI"
            resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=5)
            soup = BeautifulSoup(resp.text, "html.parser")
            price_tag = soup.select_one(".no_today .blind")
            if not price_tag:
                raise ValueError("네이버 금융에서 KOSPI 지수 파싱 실패")
            today = float(price_tag.text.replace(",", ""))
            # 전일 대비 변동/등락률 파싱
            diff_tag = soup.select_one(".no_exday .blind")
            percent_tag = soup.select_one(".no_exday span.blind+span")
            diff = float(diff_tag.text.replace(",", "")) if diff_tag else 0
            percent = float(percent_tag.text.replace("%", "").replace(",", "")) if percent_tag else 0
            emoji = "&#9650;" if diff > 0 else "&#9660;" if diff < 0 else "&#8212;"
            diff_class = "up" if diff > 0 else "down" if diff < 0 else "neutral"
            return f"<tr><td>KOSPI</td><td>{today:,.2f}</td><td class='{diff_class}'>{emoji} ({percent:+.1f}%, {diff:+.2f})</td></tr>"
        except Exception as e2:
            return f"<tr><td>KOSPI</td><td colspan='2'>데이터 오류 - {e} / 네이버 금융 오류 - {e2}</td></tr>"

def bitcoin():
    try:
        url = "https://api.upbit.com/v1/ticker?markets=KRW-BTC"
        response = requests.get(url)
        data = response.json()[0]
        trade_price = data["trade_price"]
        prev_closing_price = data["prev_closing_price"]
        diff = trade_price - prev_closing_price
        percent = (diff / prev_closing_price) * 100 if prev_closing_price != 0 else 0
        emoji = "&#9650;" if diff > 0 else "&#9660;" if diff < 0 else "&#8212;"
        diff_class = "up" if diff > 0 else "down" if diff < 0 else "neutral"
        return f"<tr><td>BTC(Upbit)</td><td>{trade_price:,.0f}원</td><td class='{diff_class}'>{emoji} ({percent:+.1f}%, {diff:+.0f})</td></tr>"
    except Exception as e:
        return f"<tr><td>BTC(Upbit)</td><td colspan='2'>데이터 오류 - {e}</td></tr>"

def stock():
    tickers = ["^IXIC", "AAPL", "MSFT", "NVDA", "AMZN", "META", "GOOGL", "TSLA"]
    data = yf.download(tickers, period="2d", interval="1d", auto_adjust=True)
    html = f"<div class='stock-table-wrap'><div>주요 미국 주식 종가 변동({now_str})</div><table class='stock-table'><tr><th>종목</th><th>종가</th><th>변동</th></tr>"
    for ticker in tickers:
        try:
            today = data["Close"][ticker].iloc[-1]
            yesterday = data["Close"][ticker].iloc[-2]
            diff = today - yesterday
            percent = (diff / yesterday) * 100 if yesterday != 0 else 0
            emoji = "&#9650;" if diff > 0 else "&#9660;" if diff < 0 else "&#8212;"
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

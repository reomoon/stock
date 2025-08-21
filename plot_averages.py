import yfinance as yf
import json
import pandas as pd
import os

def load_nasdaq_cache():
    try:
        if os.path.exists('data/nasdaq_cache.pkl'):
            return pd.read_pickle('data/nasdaq_cache.pkl')
    except:
        pass
    return None

def save_nasdaq_cache(df):
    try:
        os.makedirs('data', exist_ok=True)
        df.to_pickle('data/nasdaq_cache.pkl')
        return True
    except:
        return False

def make_nasdaq_ma_graphs():
    df = load_nasdaq_cache()
    if df is None:
        ticker = "^IXIC" # 나스닥 티커
        print("Downloading fresh NASDAQ data...")
        df = yf.download(ticker, period="2y", interval="1d")
        if df.empty:
            return "" # 데이터가 없으면 빈 문자 반환
        if hasattr(df.columns, 'levels'):  # MultiIndex인 경우
            df.columns = df.columns.droplevel(1)  # 두 번째 레벨 제거
        if "Close" not in df.columns:
            return ""
        df["120MA"] = df["Close"].rolling(window=120).mean()
        df["200MA"] = df["Close"].rolling(window=200).mean()
        save_nasdaq_cache(df)

    first_valid_idx = df["200MA"].first_valid_index()
    if first_valid_idx is not None:
        df = df.loc[first_valid_idx:]
    df = df.tail(132)
    labels = [d.strftime("%Y-%m-%d") for d in df.index]
    def safe_convert(series):
        if hasattr(series, 'iloc') and len(series.shape) > 1:
            series = series.iloc[:, 0]
        return series.round(2).tolist()
    close_data = safe_convert(df["Close"])
    ma120 = safe_convert(df["120MA"])
    ma200 = safe_convert(df["200MA"])

    return f"""
    <!-- 나스닥 차트 영역 -->
    <div id=\"nasdaqChart\" style=\"width:100%; height:350px;\"></div>
    <!-- Plotly.js CDN -->
    <script src=\"https://cdn.plot.ly/plotly-latest.min.js\"></script>
    <!-- 파이썬에서 JS로 데이터 전달 -->
    <script>
    window.nasdaqData = {{
        "labels": {json.dumps(labels)},
        "close_data": {json.dumps(close_data)},
        "ma120": {json.dumps(ma120)},
        "ma200": {json.dumps(ma200)}
    }};
    </script>
    <!-- 차트 렌더링 및 이벤트는 nasdaq_chart.js에서 처리 -->
    <script src=\"nasdaq_chart.js\"></script>
    """

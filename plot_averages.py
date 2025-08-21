import yfinance as yf
import json
import pandas as pd
import os
from datetime import datetime, timedelta

def is_cache_valid(cache_file, hours=4):
    """캐시 파일이 유효한지 확인 (4시간 이내)"""
    if not os.path.exists(cache_file):
        return False
    
    file_time = datetime.fromtimestamp(os.path.getmtime(cache_file))
    return datetime.now() - file_time < timedelta(hours=hours)

def save_nasdaq_cache(df):
    """나스닥 데이터를 캐시로 저장"""
    try:
        os.makedirs('data', exist_ok=True)
        df.to_pickle('data/nasdaq_cache.pkl')
        return True
    except:
        return False

def load_nasdaq_cache():
    """캐시된 나스닥 데이터 로드"""
    try:
        if is_cache_valid('data/nasdaq_cache.pkl'):
            return pd.read_pickle('data/nasdaq_cache.pkl')
    except:
        pass
    return None

def make_nasdaq_ma_graphs():
    ticker = "^IXIC" # 나스닥 티커
    
    # 캐시된 데이터 먼저 확인
    df = load_nasdaq_cache()
    
    if df is None:
        # 캐시가 없거나 오래된 경우 새로 다운로드
        print("Downloading fresh NASDAQ data...")
        # 2년치 데이터 다운로드 (200일선을 위해)
        df = yf.download(ticker, period="2y", interval="1d")
        if df.empty:
            return "" # 데이터가 없으면 빈 문자 반환
        
        # MultiIndex 컬럼 문제 해결
        if hasattr(df.columns, 'levels'):  # MultiIndex인 경우
            df.columns = df.columns.droplevel(1)  # 두 번째 레벨 제거
        
        if "Close" not in df.columns:
            return ""
        
        # 이동평균선 계산 (120일, 200일만)
        df["120MA"] = df["Close"].rolling(window=120).mean()
        df["200MA"] = df["Close"].rolling(window=200).mean()
        
        # 캐시로 저장
        save_nasdaq_cache(df)
        # Plotly.js 차트 데이터만 전달, 실제 차트 생성은 nasdaq_chart.js에서 처리
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

    # ...JS 차트 생성 코드는 nasdaq_chart.js에서 관리...

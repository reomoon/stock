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
        print("Data cached successfully!")
    else:
        print("Using cached NASDAQ data...")
    

    # 200일선이 유효한 구간부터 데이터 잘라내기
    first_valid_idx = df["200MA"].first_valid_index()
    if first_valid_idx is not None:
        df = df.loc[first_valid_idx:]
    
    # 최근 6개 데이터만 표시 (약 22거래일)
    df = df.tail(132)

    # 날짜 리스트 생성 (x축)
    labels = [d.strftime("%Y-%m-%d") for d in df.index]

    # 캔들차트용 OHLC 데이터 준비
    def safe_convert(series):
        if hasattr(series, 'iloc') and len(series.shape) > 1:
            series = series.iloc[:, 0]
        return series.round(2).tolist()
    
    open_data = safe_convert(df["Open"])
    high_data = safe_convert(df["High"])
    low_data = safe_convert(df["Low"])
    close_data = safe_convert(df["Close"])
    ma120 = safe_convert(df["120MA"])
    ma200 = safe_convert(df["200MA"])

    # Plotly.js로 캔들차트 + 이동평균선 생성
    return f"""
<div id="nasdaqChart" style="width:100%; height:350px;"></div>
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script>
// 캔들차트
var candlestick = {{
    x: {json.dumps(labels)},
    open: {json.dumps(open_data)}, //시작가
    high: {json.dumps(high_data)}, 
    low: {json.dumps(low_data)},
    close: {json.dumps(close_data)}, // 종가
    type: 'candlestick',
    name: '나스닥',
    increasing: {{line: {{color: '#FFA7A7'}}}},  // 상승 빨간색
    decreasing: {{line: {{color: '#6799FF'}}}}   // 하락 파란색

}};

// 120일 이동평균선
var ma120_trace = {{
    x: {json.dumps(labels)},
    y: {json.dumps(ma120)},
    type: 'scatter',
    mode: 'lines',
    name: '120일선',
    line: {{color: '#FFA7A7', width: 2}}  // 연한 빨간색
}};

// 200일 이동평균선
var ma200_trace = {{
    x: {json.dumps(labels)},
    y: {json.dumps(ma200)},
    type: 'scatter',
    mode: 'lines',
    name: '200일선',
    line: {{color: '#5F00FF', width: 2}}  // 보라색
}};

var data = [candlestick, ma120_trace, ma200_trace];

var layout = {{
    title: {{
        text: '나스닥 종합지수 (최근 6개월)',
        font: {{ size: 16, color: '#333' }}
    }},
    xaxis: {{
        // title: '날짜',
        showgrid: true,
        gridcolor: '#E8E8E8',
        rangeslider: {{ visible: false }}  // 하단 슬라이더 제거
    }},
    yaxis: {{
        // title: '지수',
        showgrid: true,
        gridcolor: '#E8E8E8'
    }},
    hovermode: 'x unified',
    plot_bgcolor: '#FAFAFA',
    paper_bgcolor: 'white',
    legend: {{
        x: 0,
        y: 1,
        bgcolor: 'rgba(255,255,255,0.8)',
        bordercolor: '#E8E8E8',
        borderwidth: 1
    }},
    margin: {{l: 40, r: 40, t: 40, b: 40}},
    dragmode: false  // 드래그 비활성화
}};

var config = {{
    responsive: true,
    displayModeBar: false,  // 툴바 완전히 숨기기
    scrollZoom: false,      // 스크롤 줌 비활성화
    doubleClick: false,     // 더블클릭 줌 비활성화
    displaylogo: false
}};

Plotly.newPlot('nasdaqChart', data, layout, config);
</script>
"""

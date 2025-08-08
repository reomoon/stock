import yfinance as yf
import json
import pandas as pd

def make_nasdaq_ma_graphs():
    ticker = "^IXIC" # 나스닥 티커
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

    # 200일선이 유효한 구간부터 데이터 잘라내기
    first_valid_idx = df["200MA"].first_valid_index()
    if first_valid_idx is not None:
        df = df.loc[first_valid_idx:]
    
    # 최근 1년 데이터만 표시
    df = df.tail(250)

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
<div id="nasdaqChart" style="width:100%; height:500px;"></div>
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script>
// 캔들차트
var candlestick = {{
    x: {json.dumps(labels)},
    open: {json.dumps(open_data)},
    high: {json.dumps(high_data)},
    low: {json.dumps(low_data)},
    close: {json.dumps(close_data)},
    type: 'candlestick',
    name: '나스닥',
    increasing: {{line: {{color: '#FF4444'}}}},  // 상승 빨간색
    decreasing: {{line: {{color: '#4444FF'}}}}   // 하락 파란색
}};

// 120일 이동평균선
var ma120_trace = {{
    x: {json.dumps(labels)},
    y: {json.dumps(ma120)},
    type: 'scatter',
    mode: 'lines',
    name: '120일선',
    line: {{color: '#FF4500', width: 2}}
}};

// 200일 이동평균선
var ma200_trace = {{
    x: {json.dumps(labels)},
    y: {json.dumps(ma200)},
    type: 'scatter',
    mode: 'lines',
    name: '200일선',
    line: {{color: '#4169E1', width: 2}}
}};

var data = [candlestick, ma120_trace, ma200_trace];

var layout = {{
    title: {{
        text: '나스닥 종합지수 & 이동평균선',
        font: {{ size: 18, color: '#333' }}
    }},
    xaxis: {{
        title: '날짜',
        showgrid: true,
        gridcolor: '#E8E8E8',
        rangeslider: {{ visible: false }}  // 하단 슬라이더 제거
    }},
    yaxis: {{
        title: '지수',
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
    margin: {{l: 50, r: 50, t: 50, b: 50}}
}};

var config = {{
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
    displaylogo: false
}};

Plotly.newPlot('nasdaqChart', data, layout, config);
</script>
"""

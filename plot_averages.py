import yfinance as yf
import plotly.graph_objs as go

def make_nasdaq_ma_graphs():
    ticker = "^IXIC" # 나스닥 티커
    # 1년치 데이터 다운로드
    df = yf.download(ticker, period="1y", interval="1d")
    if df.empty or "Close" not in df.columns:
        return "" # 데이터가 없으면 빈 문자 반환
    # 120 / 200일 이동평균선 계산
    df["120MA"] = df["Close"].rolling(window=120).mean()
    df["200MA"] = df["Close"].rolling(window=200).mean()

    # plotly Figure 생성 및 선 추가
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=df.index, y=df["Close"], name="종가", line=dict(color="gray")))
    fig.add_trace(go.Scatter(x=df.index, y=df["120MA"], name="120일선", line=dict(color="blue")))
    fig.add_trace(go.Scatter(x=df.index, y=df["200MA"], name="200일선", line=dict(color="red")))

    # 그래프 레이아웃(제목, 축) 설정
    fig.update_layout(
        title="NASDAQ 120/200일 이동평균선",
        xaxis_title="날짜",
        yaxis_title="지수",
        autosize=True
    )
    # HTML 코드로 반환 (main.html에 바로 삽입 가능)
    return fig.to_html(full_html=False, include_plotlyjs='cdn')

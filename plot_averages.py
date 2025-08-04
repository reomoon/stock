import yfinance as yf
import json

def make_nasdaq_ma_graphs():
    ticker = "^IXIC" # 나스닥 티커
    # 1년치 데이터 다운로드
    df = yf.download(ticker, period="1y", interval="1d")
    if df.empty or "Close" not in df.columns:
        return "" # 데이터가 없으면 빈 문자 반환
    # 120일 이동평균선 계산
    df["120MA"] = df["Close"].rolling(window=120).mean()
    # df["200MA"] = df["Close"].rolling(window=200).mean()

    # 날짜 리스트 생성 (x축)
    labels = [d.strftime("%Y-%m-%d") for d in df.index]

    # 종가(Series) 소수점 2자리로 반올림
    close = df["Close"].round(2)
    # 만약 종가가 DataFrame(2차원)이면 첫 번째 컬럼만 선택 (Series로 변환)
    if hasattr(close, "columns"):
        close = close.iloc[:, 0]
    # Series를 파이썬 리스트로 변환 (Chart.js에서 사용할 수 있게)
    close = close.tolist()
    # 120일 이동평균선(Series)을 소수점 2자리로 반올림 후 리스트로 변환
    ma120 = df["120MA"].round(2).tolist() # tolist()는 pandas Series를 파이썬 리스트로 바꿔줌
    # ma200 = df["200MA"].round(2).tolist()

    # f-string에서 JS 객체 중괄호는 {{ }}로 작성해야 실제 JS에서는 { }로 출력됨
    return f"""
<canvas id="nasdaqChart" style="max-width:100%;"></canvas>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
const ctx = document.getElementById('nasdaqChart').getContext('2d');
const nasdaqChart = new Chart(ctx, {{
    type: 'line',
    data: {{
        labels: {json.dumps(labels)},
        datasets: [
            {{
                label: '종가',
                data: {json.dumps(close)},
                borderColor: '#333', // 진한 회색
                borderWidth: 1,      // 선 굵기
                fill: false,
                pointRadius: 0
            }},
            {{
                label: '120일선',
                data: {json.dumps(ma120)},
                borderColor: 'red',  // 빨간색
                borderWidth: 1,      // 선 굵기
                fill: false,
                pointRadius: 0
            }}
    
        ]
    }},
    options: {{
        responsive: true,
        plugins: {{
            legend: {{
                position: 'top',
                labels: {{
                    boxWidth: 10,   // 범례 네모 크기
                    boxHeight: 10,  // 범례 네모 높이
                    font: {{ size: 12 }}
                }}
            }}
        }},
        interaction: {{ mode: 'nearest', intersect: false }},
        scales: {{
            x: {{ display: true, title: {{ display: true, text: '날짜' }} }},
            y: {{ display: true, title: {{ display: true, text: '지수' }} }}
        }}
    }}
}});
</script>
"""
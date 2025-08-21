import json

def get_weekly_sale_chart_html(labels, sale_index):
    """
    주간별 매매 가격지수 차트 HTML 코드 반환
    labels: 주간 시작일 리스트
    sale_index: 매매 가격지수 리스트
    """
    return f'''
    <div id="weeklySaleChart" style="width:100%; height:350px;"></div>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <script>
    window.weeklyIndexData = {{
        "labels": {json.dumps(labels)},
        "sale_index": {json.dumps(sale_index)}
    }};
    </script>
    <script src="weekly_index_chart.js"></script>
    '''

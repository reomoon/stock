
// 즉시 실행 함수로 전체 코드 감싸기 (중복 선언 및 이벤트 제거)
(function() {
    // 1. 종가 라인차트 트레이스 생성
    var close_trace = {
        "x": window.nasdaqData.labels,
        "y": window.nasdaqData.close_data,
        "type": "scatter",
        "mode": "lines",
        "name": "나스닥 종가",
        "line": {"color": "#0000B7", "width": 2},
    "hovertemplate": "<b>%{x}</b><br>종가: %{y:,.0f}<extra></extra>"
    };

    // 2. 120일 이동평균선 트레이스 생성
    var ma120_trace = {
        "x": window.nasdaqData.labels,
        "y": window.nasdaqData.ma120,
        "type": "scatter",
        "mode": "lines",
        "name": "120일선",
        "line": {"color": "#FF8C00", "width": 1},
    "hovertemplate": "120일선: %{y:,.0f}<extra></extra>"
    };

    // 3. 200일 이동평균선 트레이스 생성
    var ma200_trace = {
        "x": window.nasdaqData.labels,
        "y": window.nasdaqData.ma200,
        "type": "scatter",
        "mode": "lines",
        "name": "200일선",
        "line": {"color": "#9C27B0", "width": 1},
    "hovertemplate": "200일선: %{y:,.0f}<extra></extra>"
    };

    // 4. 모든 트레이스 배열로 묶기
    var data = [close_trace, ma120_trace, ma200_trace];

    // 5. 차트 레이아웃 설정
    var layout = {
        title: {
            text: '나스닥 종합지수 (최근 1개월)',
            font: { size: 16, color: '#333' }
        },
        xaxis: {
            showgrid: true,
            gridcolor: '#E8E8E8',
            fixedrange: true
        },
        yaxis: {
            showgrid: true,
            gridcolor: '#E8E8E8',
            fixedrange: true
        },
        hovermode: 'x unified',
        plot_bgcolor: '#FAFAFA',
        paper_bgcolor: 'white',
        legend: {
            x: 0,
            y: 1,
            bgcolor: 'rgba(255,255,255,0.8)',
            bordercolor: '#E8E8E8',
            borderwidth: 1
        },
        margin: {l: 40, r: 40, t: 40, b: 40},
        dragmode: false
    };

    // 6. 차트 렌더링 옵션 설정
    var config = {
        responsive: true,
        displayModeBar: false,
        scrollZoom: false,
        doubleClick: false,
        displaylogo: false,
        staticPlot: false,
        modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d', 'resetScale2d', 'zoomIn2d', 'zoomOut2d']
    };

    // 7. 차트 그리기 (반응형)
    Plotly.newPlot('nasdaqChart', data, layout, config);
    // 리사이즈 이벤트: 모바일 회전/브라우저 크기 변경 시 차트 리플로우
    window.addEventListener('resize', function() {
        Plotly.Plots.resize('nasdaqChart');
    });

    // 8. 터치/펜 드래그 중에도 hover 유지 이벤트
    var nasdaqDiv = document.getElementById('nasdaqChart');
    nasdaqDiv.addEventListener('touchmove', function(e) {
        var touch = e.touches[0];
        var rect = nasdaqDiv.getBoundingClientRect();
        var x = touch.clientX - rect.left;
        var y = touch.clientY - rect.top;
        Plotly.Fx.hover('nasdaqChart', [{xval: x, yval: y}], 'xy');
    });
    nasdaqDiv.addEventListener('pointermove', function(e) {
        if (e.pointerType === 'touch' || e.pointerType === 'pen') {
            var x = e.clientX - nasdaqDiv.getBoundingClientRect().left;
            var y = e.clientY - nasdaqDiv.getBoundingClientRect().top;
            Plotly.Fx.hover('nasdaqChart', [{xval: x, yval: y}], 'xy');
        }
    });
})();

// js/weekly_index_chart.js
// 주간 매매 가격지수 차트 (x축: 4주전, 3주전, 2주전, 1주전, 최신지수)
// window.weeklyIndexData를 사용하여 차트 렌더링

const xLabels = ["4주전", "3주전", "2주전", "1주전", "최신지수"];

function renderWeeklyIndexChart(region) {
    const data = window.weeklyIndexData;
    if (!data || !data.price_index) return;
    const regionData = data.price_index.find(d => d.area === region);
    if (!regionData) return;
    const trace = {
        x: xLabels,
        y: regionData.indices,
        type: 'scatter',
        mode: 'lines+markers',
        name: region,
        line: { shape: 'linear', color: '#007bff' },
        marker: { size: 8 },
        hovertemplate: `%{text}<br>%{x}: <b>%{y:.2f}</b><extra></extra>`,
        text: xLabels.map((label, i) => `${region}`)
    };
    const layout = {
        title: `${region} 주간 매매 가격지수`,
        xaxis: { title: '주간', tickvals: xLabels },
        yaxis: { title: '가격지수', range: [80, 120], tick0: 80, dtick: 1 },
        width: 600,
        height: 350,
        margin: { t: 40, l: 60, r: 30, b: 40 },
        legend: {
            orientation: 'h', // 수평 범례
            x: 0,
            y: -0.2,
            xanchor: 'left',
            yanchor: 'top'
        },
        hovermode: 'x unified' // x축 기준 통합 호버
    };
    // Plotly 차트 생성
    // 'weekly-index-chart'는 HTML의 <div id="weekly-index-chart"></div>와 연결됨
    // 즉, 해당 div 영역에 차트를 그려줌
    // staticPlot: 차트 상호작용(줌, 팬 등) 비활성화
    // displayModeBar: 툴바(모드바) 숨김
    // scrollZoom: 스크롤로 줌 비활성화
    Plotly.newPlot('weekly-index-chart', [trace], layout, {
        staticPlot: true,         // 차트 상호작용(줌, 팬 등) 비활성화
        displayModeBar: true,     // 툴바(모드바) 항상 표시
        scrollZoom: false         // 스크롤로 줌 비활성화
    });

    // 차트 클릭(터치) 시 해당 지역의 최신지수(가장 최근 값) 팝업으로 표시
    // 모바일 터치, PC 클릭 모두 지원
    const chartDiv = document.getElementById('weekly-index-chart');
    if (chartDiv) {
        function showIndexAlert(region, idx, value) {
            alert(`${region} ${xLabels[idx]}: ${value.toFixed(2)}`);
        }
        chartDiv.on('plotly_click', function(data){
            if (data && data.points && data.points.length > 0) {
                const idx = data.points[0].pointIndex;
                const value = data.points[0].y;
                showIndexAlert(region, idx, value);
            }
        });
        chartDiv.addEventListener('touchend', function(e) {
            if (window.Plotly && chartDiv.data && chartDiv.data.length === 1) {
                var touch = e.changedTouches[0];
                var rect = chartDiv.getBoundingClientRect();
                var x = touch.clientX - rect.left;
                var width = rect.width;
                var idx = Math.round((x / width) * (xLabels.length - 1));
                idx = Math.max(0, Math.min(xLabels.length - 1, idx));
                var value = chartDiv.data[0].y[idx];
                showIndexAlert(region, idx, value);
            }
        });
        chartDiv.on('plotly_hover', function(data){
            if (data && data.points && data.points.length > 0) {
                const idx = data.points[0].pointIndex;
                const value = data.points[0].y;
                showIndexAlert(region, idx, value);
            }
        });
    }
}

// 예시: 첫 지역 차트 자동 렌더링
// 체크박스 UI 컨테이너 생성 (차트 위에 표시)
// 차트(div id='weekly-index-chart') 바로 위에 지역 선택 체크박스 UI를 동적으로 생성
const chartContainer = document.getElementById('weekly-index-chart');
let checkboxContainer = document.getElementById('region-checkbox-container');
if (!checkboxContainer) {
    checkboxContainer = document.createElement('div');
    checkboxContainer.id = 'region-checkbox-container';
    checkboxContainer.style.marginBottom = '16px';
    // 차트 바로 위에 체크박스 컨테이너 삽입
    chartContainer.parentNode.insertBefore(checkboxContainer, chartContainer);
}
// 차트 좌측 정렬 스타일 적용
if (chartContainer) {
    chartContainer.style.textAlign = 'left';
}

// 지역코드/지역명 기준 체크박스 생성
// window.weeklyIndexData.price_index에서 지역코드(code)와 지역명(area) 추출
// code가 없으면 area(지역명)으로 대체
const regionList = window.weeklyIndexData.price_index.map(d => ({code: d.code || d.area, area: d.area}));
// 디폴트 체크박스: 첫 5개 지역만 checked
regionList.forEach((region, idx) => {
    const label = document.createElement('label');
    label.style.marginRight = '12px';
    // 첫 2개만 checked
    const checkedAttr = idx < 2 ? 'checked' : '';
    label.innerHTML = `<input type="checkbox" value="${region.code}" ${checkedAttr}> ${region.area}`;
    checkboxContainer.appendChild(label);
});

// 여러 지역 차트 렌더링 함수
function renderWeeklyIndexChartMulti(codes) {
    // 선택된 지역코드(codes) 배열을 기준으로 여러 지역의 주간 가격지수 차트(trace) 생성
    const traces = [];
    codes.forEach(code => {
        // code(지역코드)로 해당 지역 데이터 찾기
        const regionData = window.weeklyIndexData.price_index.find(d => (d.code || d.area) === code);
        if (!regionData) return;
        // 각 지역별 Plotly trace 생성
        traces.push({
            x: xLabels,                  // x축: 4주전~최신지수
            y: regionData.indices,       // y축: 해당 지역의 5주간 가격지수
            type: 'scatter',
            mode: 'lines+markers',
            name: regionData.area,       // 범례: 지역명
            line: { shape: 'linear' },
            marker: { size: 8 },
            hovertemplate: `%{text}<br>%{x}: <b>%{y:.2f}</b><extra></extra>`,
            text: xLabels.map((label, i) => `${regionData.area}`)
        });
    });
    // Plotly 차트 레이아웃 설정
    const layout = {
        // title: `주간 매매 가격지수`, // 타이틀 제거
        xaxis: { tickvals: xLabels },
        yaxis: { range: [80, 120] },
        width: 340,
        height: 350,
        margin: { t: 40, l: 60, r: 30, b: 40 },
        legend: {
            orientation: 'h', // 수평 범례
            x: 0,
            y: -0.2,
            xanchor: 'left',
            yanchor: 'top'
        },
        hovermode: 'x unified' // x축 기준 통합 호버
    };
    // 여러 지역 trace를 한 번에 렌더링, 툴바/줌/아웃 비활성화
    Plotly.newPlot('weekly-index-chart', traces, layout, {
        staticPlot: true,
        displayModeBar: true,
        scrollZoom: false
    });
    // 클릭 이벤트 핸들러 추가 (멀티 트레이스)
    const chartDiv = document.getElementById('weekly-index-chart');
    if (chartDiv) {
        chartDiv.on('plotly_click', function(data){
            if (data && data.points && data.points.length > 0) {
                const point = data.points[0];
                const region = point.data.name;
                const idx = point.pointIndex;
                const value = point.y;
                alert(`${region} ${xLabels[idx]}: ${value.toFixed(2)}`);
            }
        });
    }
}

// 체크박스 이벤트: 최대 5개까지 선택 가능
// 체크박스 변경 이벤트 핸들러
// 최대 5개까지 선택 가능, 6개 이상 체크 시 alert 및 체크 해제
checkboxContainer.addEventListener('change', function(e) {
    // 현재 체크된 체크박스 목록
    const checked = Array.from(checkboxContainer.querySelectorAll('input[type=checkbox]:checked'));
    if (checked.length > 5) {
        // 5개 초과 시 체크 해제 및 경고
        e.target.checked = false;
        alert('5개 까지 가능합니다.');
        return;
    }
    // 선택된 지역코드 배열
    const selectedCodes = checked.map(cb => cb.value);
    if (selectedCodes.length > 0) {
        // 선택된 지역이 있으면 여러 지역 차트 렌더링
        renderWeeklyIndexChartMulti(selectedCodes);
    } else {
        // 아무것도 선택 안하면 첫 지역만 차트 표시
        renderWeeklyIndexChart(window.weeklyIndexData.price_index[0].area);
    }
});

// 최초 로딩 시 첫 지역 차트
// 페이지 최초 로딩 시 첫 지역 차트 자동 렌더링
if (window.weeklyIndexData && window.weeklyIndexData.price_index && window.weeklyIndexData.price_index.length > 0) {
    // 첫 2개 지역코드로 차트 렌더링
    const first2Codes = regionList.slice(0, 2).map(r => r.code);
    renderWeeklyIndexChartMulti(first2Codes);
}

// 터치/펜 드래그 중에도 hover 유지 이벤트 (Plotly)
var weeklyDiv = document.getElementById('weekly-index-chart');
if (weeklyDiv) {
    weeklyDiv.addEventListener('touchmove', function(e) {
        var touch = e.touches[0];
        var rect = weeklyDiv.getBoundingClientRect();
        var x = touch.clientX - rect.left;
        var y = touch.clientY - rect.top;
        Plotly.Fx.hover('weekly-index-chart', [{xval: x, yval: y}], 'xy');
    });
    weeklyDiv.addEventListener('pointermove', function(e) {
        if (e.pointerType === 'touch' || e.pointerType === 'pen') {
            var x = e.clientX - weeklyDiv.getBoundingClientRect().left;
            var y = e.clientY - weeklyDiv.getBoundingClientRect().top;
            Plotly.Fx.hover('weekly-index-chart', [{xval: x, yval: y}], 'xy');
        }
    });
}

// 지역 선택시 차트 갱신 함수 필요시 아래처럼 사용
// renderWeeklyIndexChart('서울 강남구');

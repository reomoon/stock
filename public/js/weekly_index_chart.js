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
        marker: { size: 8 }
    };
    const layout = {
        title: `${region} 주간 매매 가격지수`,
        xaxis: { title: '주간', tickvals: xLabels },
        yaxis: { title: '가격지수', range: [50, 150] },
        width: 600,
        height: 350,
        margin: { t: 40, l: 60, r: 30, b: 40 },
        legend: {
            orientation: 'h', // 수평 범례
            x: 0,
            y: -0.2,
            xanchor: 'left',
            yanchor: 'top'
        }
    };
    // Plotly 차트 생성
    // 'weekly-index-chart'는 HTML의 <div id="weekly-index-chart"></div>와 연결됨
    // 즉, 해당 div 영역에 차트를 그려줌
    // staticPlot: 차트 상호작용(줌, 팬 등) 비활성화
    // displayModeBar: 툴바(모드바) 숨김
    // scrollZoom: 스크롤로 줌 비활성화
    Plotly.newPlot('weekly-index-chart', [trace], layout, {
        staticPlot: true,         // 차트 상호작용(줌, 팬 등) 비활성화
        displayModeBar: false,    // 툴바(모드바) 숨김
        scrollZoom: false         // 스크롤로 줌 비활성화
    });

    // 차트 클릭(터치) 시 해당 지역의 최신지수(가장 최근 값) 팝업으로 표시
    // 모바일 터치, PC 클릭 모두 지원
    const chartDiv = document.getElementById('weekly-index-chart');
    if (chartDiv) {
        chartDiv.on('plotly_click', function(data){
            // indices 배열의 마지막 값이 최신지수
            const latest = regionData.indices[regionData.indices.length - 1];
            alert(`${region} 최신지수: ${latest}`);
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

// 지역코드/지역명 기준 체크박스 생성
// window.weeklyIndexData.price_index에서 지역코드(code)와 지역명(area) 추출
// code가 없으면 area(지역명)으로 대체
const regionList = window.weeklyIndexData.price_index.map(d => ({code: d.code || d.area, area: d.area}));
regionList.forEach(region => {
    // 각 지역별 체크박스(label) 생성 및 컨테이너에 추가
    const label = document.createElement('label');
    label.style.marginRight = '12px';
    label.innerHTML = `<input type="checkbox" value="${region.code}"> ${region.area}`;
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
            marker: { size: 8 }
        });
    });
    // Plotly 차트 레이아웃 설정
    const layout = {
        title: `선택 지역 주간 매매 가격지수`,
        xaxis: { tickvals: xLabels },
        yaxis: { range: [50, 150] },
        width: 356.67,
        height: 350,
        margin: { t: 40, l: 60, r: 30, b: 40 },
        legend: {
            orientation: 'h', // 수평 범례
            x: 0,
            y: -0.2,
            xanchor: 'left',
            yanchor: 'top'
        }
    };
    // 여러 지역 trace를 한 번에 렌더링, 툴바/줌/아웃 비활성화
    Plotly.newPlot('weekly-index-chart', traces, layout, {
        staticPlot: true,
        displayModeBar: false,
        scrollZoom: false
    });
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
    renderWeeklyIndexChart(window.weeklyIndexData.price_index[0].area);
}

// 지역 선택시 차트 갱신 함수 필요시 아래처럼 사용
// renderWeeklyIndexChart('서울 강남구');

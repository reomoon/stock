// js/monthly_transaction_chart.js
// 월별 거래량 차트 (x축: 1년전~저번달, y축: 거래량)
// window.weeklyIndexData.transaction_volume 사용

const transactionDefaultCodes = ["11680", "11440", "11740", "41135", "41465"];

function getMonthLabels() {
    // 최근 12개월 (좌측이 1년전, 우측이 저번달)
    const now = new Date();
    let labels = [];
    for (let i = 12; i >= 1; i--) {
        let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(`${d.getFullYear()}-${d.getMonth() + 1}월`);
    }
    return labels;
}

function renderMonthlyTransactionChartMulti(codes) {
    const data = window.monthlyIndexData;
    if (!data || !Array.isArray(data)) return;
    const monthLabels = getMonthLabels();
    const traces = [];
    codes.forEach(code => {
        const regionData = data.find(d => (d.area_code || d.area) === code || d.area === code);
        if (!regionData) return;
        // 월별 거래량 추출 (monthLabels 기준)
        const yData = monthLabels.map(label => {
            // label: "2024-8월" 등, 실제 데이터는 "8월" 등일 수 있음
            const month = label.split('-')[1];
            let found = null;
            Object.keys(regionData.monthly_volumes).forEach(k => {
                if (k === month) found = regionData.monthly_volumes[k];
            });
            return found || 0;
        });
        traces.push({
            x: monthLabels,
            y: yData,
            type: 'bar',
            name: regionData.area,
            marker: {line: {width: 1}}
        });
    });
    const layout = {
        // title: `지역 월별 거래량`,
        xaxis: {tickvals: monthLabels, tickangle: -45},
        yaxis: {title: '', rangemode: 'tozero'},
        width: 600,
        height: 350,
        margin: {t: 40, l: 60, r: 30, b: 80},
        legend: {
            orientation: 'h',
            x: 0,
            y: -0.2,
            xanchor: 'left',
            yanchor: 'top'
        }
    };
    Plotly.newPlot('monthly-transaction-chart', traces, layout, {
        staticPlot: true,
        displayModeBar: false,
        scrollZoom: false
    });
    // 클릭 시 해당 월 거래량 팝업
    const chartDiv = document.getElementById('monthly-transaction-chart');
    if (chartDiv) {
        chartDiv.on('plotly_click', function(data){
            if (data && data.points && data.points.length > 0) {
                const idx = data.points[0].pointIndex;
                const value = data.points[0].y;
                const region = data.points[0].data.name;
                alert(`${region} ${monthLabels[idx]} 거래량: ${value}건`);
            }
        });
        // 터치/펜 드래그 중에도 hover 유지 이벤트 (Plotly)
        chartDiv.addEventListener('touchmove', function(e) {
            var touch = e.touches[0];
            var rect = chartDiv.getBoundingClientRect();
            var x = touch.clientX - rect.left;
            var y = touch.clientY - rect.top;
            Plotly.Fx.hover('monthly-transaction-chart', [{xval: x, yval: y}], 'xy');
        });
        chartDiv.addEventListener('pointermove', function(e) {
            if (e.pointerType === 'touch' || e.pointerType === 'pen') {
                var x = e.clientX - chartDiv.getBoundingClientRect().left;
                var y = e.clientY - chartDiv.getBoundingClientRect().top;
                Plotly.Fx.hover('monthly-transaction-chart', [{xval: x, yval: y}], 'xy');
            }
        });
    }
}

// 체크박스 UI 생성 (차트 위)
function setupTransactionCheckboxes() {
    const chartContainer = document.getElementById('monthly-transaction-chart');
    let checkboxContainer = document.getElementById('transaction-region-checkbox-container');
    if (!checkboxContainer) {
        checkboxContainer = document.createElement('div');
        checkboxContainer.id = 'transaction-region-checkbox-container';
        checkboxContainer.style.marginBottom = '16px';
        chartContainer.parentNode.insertBefore(checkboxContainer, chartContainer);
    }
    // 차트 좌측 정렬 스타일 적용
    if (chartContainer) {
        chartContainer.style.textAlign = 'left';
    }
    // 지역코드/지역명 기준 체크박스 생성
    const regionList = window.monthlyIndexData.map(d => ({code: d.area_code || d.area, area: d.area}));
    checkboxContainer.innerHTML = '';
    regionList.forEach((region, idx) => {
        const label = document.createElement('label');
        label.style.marginRight = '12px';
        // 첫 2개만 checked
        const checkedAttr = idx < 2 ? 'checked' : '';
        label.innerHTML = `<input type="checkbox" value="${region.code}" ${checkedAttr}> ${region.area}`;
        checkboxContainer.appendChild(label);
    });
    // 이벤트 핸들러
    checkboxContainer.addEventListener('change', function(e) {
        const checked = Array.from(checkboxContainer.querySelectorAll('input[type=checkbox]:checked'));
        if (checked.length > 5) {
            e.target.checked = false;
            alert('5개 까지 가능합니다.');
            return;
        }
        const selectedCodes = checked.map(cb => cb.value);
        if (selectedCodes.length > 0) {
            renderMonthlyTransactionChartMulti(selectedCodes);
        } else {
            renderMonthlyTransactionChartMulti([regionList[0].code]);
        }
    });
}

// 최초 로딩 시 차트 및 체크박스 생성
window.addEventListener('DOMContentLoaded', function() {
    if (window.monthlyIndexData && Array.isArray(window.monthlyIndexData) && window.monthlyIndexData.length > 0) {
        setupTransactionCheckboxes();
        // 첫 2개 지역코드로 차트 렌더링
        const first2Codes = window.monthlyIndexData.slice(0, 2).map(d => d.area_code || d.area);
        renderMonthlyTransactionChartMulti(first2Codes);
    }
});

// 주택 매매 거래량(월별) 차트 렌더링
// main.html에서 window.monthlyVolumeData로 데이터 전달 필요

// 체크박스 기반 지역 선택, 차트 크기 확대, 줌/드래그 비활성화
function getSelectedRegions() {
    const checkboxes = document.querySelectorAll('.region-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value).slice(0, 5);
}

function drawMonthlyVolumeChart() {
    if (!window.monthlyVolumeData) return;
    const labels = window.monthlyVolumeData.labels;
    const allRegions = window.monthlyVolumeData.regions;
    const allData = window.monthlyVolumeData.data;
    const regions = getSelectedRegions();
    let chartLabels = labels;
    let reversed = false;
    if (labels && labels.length > 0) {
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // JS: 0~11, 실제: 1~12
        const currentMonthLabel = `${currentMonth}월`;
        if (labels[0].includes(currentMonthLabel)) {
            chartLabels = [...labels].reverse();
            reversed = true;
        }
    }
    const traces = regions.map((region, idx) => {
        const regionIdx = allRegions.indexOf(region);
        const colorList = ["#0074D9", "#FF4136", "#2ECC40", "#FF851B", "#B10DC9"];
        let regionData = allData[regionIdx];
        if (reversed) {
            regionData = [...regionData].reverse();
        }
        return {
            x: chartLabels,
            y: regionData,
            type: 'scatter',
            mode: 'lines+markers',
            name: region,
            line: {color: colorList[idx % colorList.length], width: 3},
            marker: {size: 6}
        };
    });
    const layout = {
        title: '주택 매매 거래량(월별)',
        xaxis: { title: ' ' },
        yaxis: { title: ' ' },
        legend: { orientation: 'h', x: 0, y: -0.2 },
        height: 500,
        width: 356.67
    };
    Plotly.newPlot('monthlyVolumeChart', traces, layout, {
        responsive: true,
        displayModeBar: false,
        staticPlot: true
    });
}

window.addEventListener('DOMContentLoaded', function() {
    // regionCheckboxContainer가 이미 있으면 그대로 사용
    if (!document.getElementById('regionCheckboxContainer')) {
        const container = document.createElement('div');
        container.id = 'regionCheckboxContainer';
        container.style.marginBottom = '10px';
        document.body.insertBefore(container, document.getElementById('monthlyVolumeChart'));
    }
    // 지역 체크박스 생성 (동적)
    const regionList = window.monthlyVolumeData.regions || [];
    const container = document.getElementById('regionCheckboxContainer');
    container.innerHTML = regionList.map(region =>
        `<label style="margin-right:12px;"><input type="checkbox" class="region-checkbox" value="${region}"> ${region}</label>`
    ).join('');
    // 기본 5개 선택
    Array.from(container.querySelectorAll('input')).slice(0,5).forEach(cb => cb.checked = true);
    drawMonthlyVolumeChart();
    container.addEventListener('change', drawMonthlyVolumeChart);
});

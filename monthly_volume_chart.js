// 주택 매매 거래량(월별) 차트 렌더링
// main.html에서 window.monthlyVolumeData로 데이터 전달 필요

document.addEventListener('DOMContentLoaded', function() {
    if (!window.monthlyVolumeData) return;
    const labels = window.monthlyVolumeData.labels;
    const regions = window.monthlyVolumeData.regions;
    const data = window.monthlyVolumeData.data;

    // 각 지역별 거래량을 선 그래프로 표시
    const traces = regions.map((region, idx) => ({
        x: labels,
        y: data[idx],
        type: 'scatter',
        mode: 'lines+markers',
        name: region
    }));

    const layout = {
        title: '주택 매매 거래량(월별)',
        xaxis: { title: '월' },
        yaxis: { title: ' ' },
        legend: { orientation: 'h', x: 0, y: -0.2 },
        height: 500
    };

    Plotly.newPlot('monthlyVolumeChart', traces, layout, {responsive: true});
});

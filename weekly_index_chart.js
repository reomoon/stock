// 주간별 매매 가격지수 라인차트 생성
// window.weeklyIndexData: { labels: [...], sale_index: [...] }

var sale_trace = {
    x: window.weeklyIndexData.labels,
    y: window.weeklyIndexData.sale_index,
    type: "scatter",
    mode: "lines+markers",
    name: "매매 가격지수",
    line: {color: "#0074D9", width: 3},
    marker: {size: 6}
};

var data = [sale_trace];

var layout = {
    title: {text: "주간별 매매 가격지수", font: {size: 16}},
    xaxis: {title: "주간", showgrid: true, gridcolor: "#E8E8E8"},
    yaxis: {title: "지수", showgrid: true, gridcolor: "#E8E8E8"},
    plot_bgcolor: "#FAFAFA",
    paper_bgcolor: "white",
    margin: {l: 40, r: 40, t: 40, b: 40}
};

Plotly.newPlot("weeklySaleChart", data, layout, {responsive: true});

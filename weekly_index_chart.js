// 체크박스 기반 지역 선택, 차트 크기 확대
function getSelectedRegions() {
	const checkboxes = document.querySelectorAll('.region-checkbox:checked');
	return Array.from(checkboxes).map(cb => cb.value).slice(0, 5);
}

function drawWeeklyChart() {
	const regions = getSelectedRegions();
	let chartLabels = window.weeklyIndexData.labels;
	if (window.weeklyIndexData.labels && window.weeklyIndexData.labels.length > 0) {
		chartLabels = [...window.weeklyIndexData.labels].reverse();
	}
	const traces = regions.map((region, idx) => {
		const colorList = ["#0074D9", "#FF4136", "#2ECC40", "#FF851B", "#B10DC9"];
		let regionData = window.weeklyIndexData[region];
		regionData = [...regionData].reverse();
		return {
			x: chartLabels,
			y: regionData,
			type: "scatter",
			mode: "lines+markers",
			name: region,
			line: {color: colorList[idx % colorList.length], width: 3},
			marker: {size: 6}
		};
	});
	var layout = {
		title: {text: "주간별 매매 가격지수", font: {size: 16}},
		xaxis: {
			title: " ",
			showgrid: true,
			gridcolor: "#E8E8E8",
			tickvals: chartLabels,
			ticktext: chartLabels
		},
		yaxis: {title: "지수", showgrid: true, gridcolor: "#E8E8E8", rangemode: "tozero", autorange: false, range: [50, 200]},
		plot_bgcolor: "#FAFAFA",
		paper_bgcolor: "white",
		margin: {l: 40, r: 40, t: 40, b: 40},
		legend: {orientation: 'h', x: 0, y: -0.2},
		height: 500,
		width: 350
	};
	Plotly.newPlot("weeklySaleChart", traces, layout, {
		responsive: true,
		displayModeBar: false,
		staticPlot: true
	});
}

function setupRegionCheckboxes() {
	const regionList = window.weeklyIndexData.regions || [];
	const container = document.getElementById('regionCheckboxContainer');
	container.innerHTML = regionList.map(region =>
		`<label style="margin-right:12px;"><input type="checkbox" class="region-checkbox" value="${region}"> ${region}</label>`
	).join('');
	// 기본 5개 선택
	Array.from(container.querySelectorAll('input')).slice(0,5).forEach(cb => cb.checked = true);
}

window.addEventListener('DOMContentLoaded', function() {
	setupRegionCheckboxes();
	drawWeeklyChart();
	document.getElementById('regionCheckboxContainer').addEventListener('change', drawWeeklyChart);
});
// ...existing code...

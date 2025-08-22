// 체크박스 기반 지역 선택, 차트 크기 확대
function getSelectedRegions() {
	const checkboxes = document.querySelectorAll('.region-checkbox:checked');
	return Array.from(checkboxes).map(cb => cb.value).slice(0, 5);
}

function drawWeeklyChart() {
	const regions = getSelectedRegions();
	const traces = regions.map((region, idx) => {
		const colorList = ["#0074D9", "#FF4136", "#2ECC40", "#FF851B", "#B10DC9"];
		let regionData = window.weeklyIndexData[region];
		// 데이터가 최신순이면 역순으로 뒤집기 (좌측이 8주전, 우측이 1주전)
		if (regionData && window.weeklyIndexData.labels && regionData.length === window.weeklyIndexData.labels.length) {
			// x축이 8주전~1주전 순서면 그대로, 아니면 뒤집기
			const firstLabel = window.weeklyIndexData.labels[0];
			if (firstLabel.includes("1주전")) {
				regionData = [...regionData].reverse();
			}
		}
		return {
			x: window.weeklyIndexData.labels,
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
			title: "주간",
			showgrid: true,
			gridcolor: "#E8E8E8",
			tickvals: window.weeklyIndexData.labels,
			ticktext: window.weeklyIndexData.labels
		},
		yaxis: {title: "지수", showgrid: true, gridcolor: "#E8E8E8", rangemode: "tozero", autorange: false, range: [50, 200]},
		plot_bgcolor: "#FAFAFA",
		paper_bgcolor: "white",
		margin: {l: 40, r: 40, t: 40, b: 40},
		height: 500
	};
	Plotly.newPlot("weeklySaleChart", traces, layout, {
		responsive: true,
		displayModeBar: false,
		staticPlot: true
	});
}

function setupRegionCheckboxes() {
	const regionList = [
		"서울 강남구", "서울 용산구", "서울 성동구", "서울 마포구", "서울 동작구",
		"경기 성남시 분당구", "경기 광명시", "경기 하남시", "경기 용인시 수지구",
		"경기 안양시 동안구", "경기 수원시 영통구", "경기 고양시", "인천 부평구"
	];
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

// realestate_map.js
// 서울/수도권 부동산 매매지수 지도 시각화

let realestateMapData = null;
let mapBoundariesData = null;

// 지도 데이터 로딩
async function loadMapData() {
    try {
        console.log('지도 경계 데이터 로딩 시작...');
        const response = await fetch('data/seoul_metro_boundaries.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        mapBoundariesData = await response.json();
        console.log('지도 경계 데이터 로딩 완료:', mapBoundariesData.features.length + '개 지역');
        return true;
    } catch (error) {
        console.error('지도 데이터 로딩 실패:', error);
        return false;
    }
}

// 매매지수 데이터와 지도 경계 데이터 매칭
function prepareMapData() {
    if (!window.realestateMapData || !mapBoundariesData) {
        console.log('데이터가 준비되지 않음');
        return null;
    }

    const priceIndexData = window.realestateMapData.price_index || [];
    
    // GeoJSON 데이터에 매매지수 정보 추가
    const features = mapBoundariesData.features.map(feature => {
        const areaCode = feature.properties.area_code;
        const areaName = feature.properties.area_name;
        
        // 지역코드 또는 지역명으로 매칭
        const priceData = priceIndexData.find(item => {
            // 지역명으로 매칭
            return item.area === areaName;
        });

        if (priceData) {
            console.log(`매칭 성공: ${areaName} -> 지수: ${priceData.index}`);
        } else {
            console.log(`매칭 실패: ${areaName}`);
        }

        return {
            ...feature,
            properties: {
                ...feature.properties,
                price_index: priceData ? priceData.index : 100,
                change: priceData ? priceData.change : 0,
                rate: priceData ? priceData.rate : 0,
                area_name_kr: areaName
            }
        };
    });

    return {
        type: "FeatureCollection",
        features: features
    };
}

// 매매지수에 따른 색상 결정
function getColorByIndex(index) {
    // 매매지수 범위에 따른 색상 구분
    if (index >= 115) return '#d73027';      // 매우 높음 (빨강)
    else if (index >= 110) return '#f46d43'; // 높음 (주황)
    else if (index >= 105) return '#fdae61'; // 보통-높음 (연주황)
    else if (index >= 100) return '#fee08b'; // 보통 (연노랑)
    else if (index >= 95) return '#e6f598';  // 보통-낮음 (연녹)
    else if (index >= 90) return '#abdda4';  // 낮음 (녹색)
    else return '#66c2a5';                   // 매우 낮음 (진녹)
}

// 변동률에 따른 색상 결정 (대안)
function getColorByRate(rate) {
    if (rate >= 1.0) return '#d73027';       // 1% 이상 상승
    else if (rate >= 0.5) return '#f46d43';  // 0.5% 이상 상승
    else if (rate >= 0.2) return '#fdae61';  // 0.2% 이상 상승
    else if (rate >= 0) return '#fee08b';    // 상승
    else if (rate >= -0.2) return '#e6f598'; // 소폭 하락
    else if (rate >= -0.5) return '#abdda4'; // 하락
    else return '#66c2a5';                   // 큰 폭 하락
}

// Plotly 지도 렌더링
function renderRealestateMap(colorBy = 'index') {
    const mapData = prepareMapData();
    if (!mapData) {
        console.error('지도 데이터 준비 실패');
        return;
    }

    const features = mapData.features;
    
    // 지역별 데이터 추출
    const locations = features.map(f => f.properties.area_code);
    const texts = features.map(f => f.properties.area_name_kr);
    const hoverTexts = features.map(f => {
        const name = f.properties.area_name_kr;
        const index = f.properties.price_index || 100;
        const change = f.properties.change || 0;
        const rate = f.properties.rate || 0;
        const arrow = change >= 0 ? '▲' : '▼';
        return `<b>${name}</b><br>` +
               `매매지수: ${index.toFixed(2)}<br>` +
               `변동: ${arrow} ${Math.abs(change).toFixed(2)}<br>` +
               `변동률: ${rate > 0 ? '+' : ''}${rate.toFixed(2)}%`;
    });

    // 색상 값 결정
    let zValues, colorscale, zmin, zmax, zmid;
    
    if (colorBy === 'index') {
        zValues = features.map(f => f.properties.price_index || 100);
        zmin = Math.min(...zValues);
        zmax = Math.max(...zValues);
        zmid = (zmin + zmax) / 2;
        colorscale = [
            [0, '#66c2a5'],    // 낮은 지수
            [0.2, '#abdda4'],
            [0.4, '#e6f598'],
            [0.6, '#fee08b'],
            [0.8, '#fdae61'],
            [1, '#d73027']     // 높은 지수
        ];
    } else {
        zValues = features.map(f => f.properties.rate || 0);
        zmin = Math.min(...zValues);
        zmax = Math.max(...zValues);
        zmid = 0;
        colorscale = [
            [0, '#3288bd'],    // 하락
            [0.5, '#e6f598'],  // 보합
            [1, '#d73027']     // 상승
        ];
    }

    const data = [{
        type: "choropleth",
        locationmode: 'geojson-id',
        geojson: mapData,
        locations: locations,
        z: zValues,
        text: texts,
        hovertemplate: hoverTexts.map(text => text + '<extra></extra>'),
        colorscale: colorscale,
        zmin: zmin,
        zmax: zmax,
        zmid: zmid,
        colorbar: {
            title: {
                text: colorBy === 'index' ? '매매지수' : '변동률(%)',
                font: {size: 14}
            },
            thickness: 15,
            len: 0.7,
            x: 1.02
        },
        marker: {
            line: {
                color: 'rgb(180,180,180)',
                width: 0.5
            }
        }
    }];

    const layout = {
        title: {
            text: '서울/수도권 지역별 아파트 매매지수',
            font: {size: 18, family: 'Arial, sans-serif'},
            x: 0.5
        },
        geo: {
            fitbounds: "locations",
            visible: false,
            bgcolor: 'rgba(0,0,0,0)',
            projection: {
                type: 'mercator'
            }
        },
        margin: {t: 50, l: 0, r: 80, b: 0},
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            family: 'Arial, sans-serif'
        }
    };

    const config = {
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        responsive: true
    };

    Plotly.newPlot('realestate-map', data, layout, config);

    // 클릭 이벤트 추가
    document.getElementById('realestate-map').on('plotly_click', function(data) {
        if (data.points && data.points.length > 0) {
            const point = data.points[0];
            const location = point.location;
            const feature = features.find(f => f.properties.area_code === location);
            
            if (feature) {
                const props = feature.properties;
                const message = `${props.area_name_kr}\n` +
                              `매매지수: ${props.price_index.toFixed(2)}\n` +
                              `변동: ${props.change > 0 ? '+' : ''}${props.change.toFixed(2)}\n` +
                              `변동률: ${props.rate > 0 ? '+' : ''}${props.rate.toFixed(2)}%`;
                alert(message);
            }
        }
    });
}

// 지도 유형 변경 함수
function changeMapType(type) {
    renderRealestateMap(type);
    
    // 버튼 활성화 상태 변경
    document.querySelectorAll('.map-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[onclick="changeMapType('${type}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// 범례 생성
function createMapLegend() {
    const legendContainer = document.getElementById('map-legend');
    if (!legendContainer) return;

    const legendItems = [
        {range: '115 이상', color: '#d73027', label: '매우 높음'},
        {range: '110-115', color: '#f46d43', label: '높음'},
        {range: '105-110', color: '#fdae61', label: '보통-높음'},
        {range: '100-105', color: '#fee08b', label: '보통'},
        {range: '95-100', color: '#e6f598', label: '보통-낮음'},
        {range: '90-95', color: '#abdda4', label: '낮음'},
        {range: '90 미만', color: '#66c2a5', label: '매우 낮음'}
    ];

    let legendHTML = '<div class="legend-title">매매지수 범례</div>';
    legendItems.forEach(item => {
        legendHTML += `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${item.color}"></div>
                <div class="legend-text">${item.range} - ${item.label}</div>
            </div>
        `;
    });

    legendContainer.innerHTML = legendHTML;
}

// 초기화 함수
async function initRealestateMap() {
    console.log('=== 부동산 지도 초기화 시작 ===');
    console.log('Plotly 사용 가능:', typeof Plotly !== 'undefined');
    console.log('window.realestateMapData:', window.realestateMapData);
    
    // 지도 컨테이너 확인
    const mapContainer = document.getElementById('realestate-map');
    if (!mapContainer) {
        console.error('지도 컨테이너를 찾을 수 없습니다');
        return;
    }
    console.log('지도 컨테이너 확인:', mapContainer);

    // 로딩 표시
    mapContainer.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 400px; color: #666;">지도 데이터 로딩 중...</div>';
    
    // 지도 데이터 로딩 대기
    console.log('지도 경계 데이터 로딩 시작...');
    const dataLoaded = await loadMapData();
    if (!dataLoaded) {
        console.error('지도 데이터 로딩 실패');
        mapContainer.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 400px; color: #e53e3e;">지도 데이터를 불러올 수 없습니다</div>';
        return;
    }
    console.log('지도 경계 데이터 로딩 성공');

    // 기존 데이터가 로딩될 때까지 대기
    let attempts = 0;
    const waitForData = setInterval(() => {
        attempts++;
        console.log(`데이터 대기 중... (${attempts}/50)`);
        if (window.realestateMapData && window.realestateMapData.price_index) {
            clearInterval(waitForData);
            console.log('부동산 데이터 확인 완료');
            
            // 지도 렌더링
            console.log('지도 렌더링 시작...');
            renderRealestateMap('index');
            
            // 범례 생성
            createMapLegend();
            
            console.log('부동산 지도 초기화 완료');
        } else if (attempts > 50) { // 5초 후 타임아웃
            clearInterval(waitForData);
            console.error('부동산 데이터 로딩 타임아웃');
            mapContainer.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 400px; color: #e53e3e;">부동산 데이터를 불러올 수 없습니다</div>';
        }
    }, 100);
}

// DOM 로딩 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    // Plotly가 로딩된 후 지도 초기화
    if (typeof Plotly !== 'undefined') {
        initRealestateMap();
    } else {
        // Plotly 로딩 대기
        const checkPlotly = setInterval(() => {
            if (typeof Plotly !== 'undefined') {
                clearInterval(checkPlotly);
                initRealestateMap();
            }
        }, 100);
    }
});
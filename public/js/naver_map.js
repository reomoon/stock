// naver_map.js - 네이버 클라우드 플랫폼 Dynamic Maps를 사용한 부동산 지수 시각화

let naverMap;
let currentMapType = 'index'; // 'index', 'weekly_change'
let regionMarkers = []; // 지역 마커들을 저장

// 지역별 좌표 매핑 (REGION_CODES 기준)
const REGION_COORDINATES = {
    "11680": { lat: 37.5172, lng: 127.0473, name: "서울 강남구" },
    "11650": { lat: 37.4844, lng: 127.0311, name: "서울 서초구" },
    "11170": { lat: 37.5384, lng: 126.9656, name: "서울 용산구" },
    "11710": { lat: 37.5145, lng: 127.1061, name: "서울 송파구" },
    "11200": { lat: 37.5631, lng: 127.0370, name: "서울 성동구" },
    "11440": { lat: 37.5663, lng: 126.9013, name: "서울 마포구" },
    "11110": { lat: 37.5735, lng: 126.9788, name: "서울 종로구" },
    "11320": { lat: 37.5384, lng: 127.0822, name: "서울 광진구" },
    "11140": { lat: 37.5640, lng: 126.9979, name: "서울 중구" },
    "11215": { lat: 37.5502, lng: 127.0729, name: "서울 광진구" },
    "11560": { lat: 37.5264, lng: 126.8962, name: "서울 영등포구" },
    "11470": { lat: 37.5168, lng: 126.8664, name: "서울 양천구" },
    "11740": { lat: 37.5301, lng: 127.1238, name: "서울 강동구" },
    "11590": { lat: 37.5124, lng: 126.9393, name: "서울 동작구" },
    "11230": { lat: 37.5744, lng: 127.0396, name: "서울 동대문구" },
    "11500": { lat: 37.5509, lng: 126.8495, name: "서울 강서구" },
    "11410": { lat: 37.5790, lng: 126.9368, name: "서울 서대문구" },
    "11620": { lat: 37.4781, lng: 126.9514, name: "서울 관악구" },
    "11290": { lat: 37.5894, lng: 127.0164, name: "서울 성북구" },
    "11530": { lat: 37.4955, lng: 126.8874, name: "서울 구로구" },
    "11380": { lat: 37.6026, lng: 126.9291, name: "서울 은평구" },
    "11260": { lat: 37.6063, lng: 127.0925, name: "서울 중랑구" },
    "11350": { lat: 37.640484, lng: 127.075950, name: "서울 노원구" },
    "11305": { lat: 37.6396, lng: 127.0257, name: "서울 강북구" },
    "11545": { lat: 37.4569, lng: 126.8954, name: "서울 금천구" },
    "11320": { lat: 37.667367, lng: 127.036726, name: "서울 도봉구"},
    "41135": { lat: 37.3595, lng: 127.1052, name: "경기 성남시 분당구" },
    "41290": { lat: 37.4279, lng: 126.9883, name: "경기 과천시" },
    "41210": { lat: 37.4783, lng: 126.8644, name: "경기 광명시" },
    "41450": { lat: 37.5392, lng: 127.2148, name: "경기 하남시" },
    "41465": { lat: 37.3207, lng: 127.1286, name: "경기 용인시 수지구" },
    "41131": { lat: 37.4201, lng: 127.1267, name: "경기 성남시 수정구" },
    "41310": { lat: 37.5943, lng: 127.1294, name: "경기 구리시" },
    "41173": { lat: 37.3943, lng: 126.9568, name: "경기 안양시 동안구" },
    "41117": { lat: 37.251814, lng: 127.071197, name: "경기 수원시 영통구" },
    "41115": { lat: 37.2792, lng: 127.0127, name: "경기 수원시 팔달구" },
    "41171": { lat: 37.404798, lng: 126.918992, name: "경기 안양시 만안구" },
    "41590": { lat: 37.1999, lng: 126.8319, name: "경기 화성시" },
    "41430": { lat: 37.3448, lng: 126.9687, name: "경기 의왕시" },
    "41360": { lat: 37.6369, lng: 127.2158, name: "경기 남양주시" },
    "41610": { lat: 37.4291, lng: 127.2550, name: "경기 광주시" },
    "41285": { lat: 37.6583, lng: 126.7762, name: "경기 고양시 일산동구" },
    "41192": { lat: 37.5058, lng: 126.7659, name: "경기 부천시 원미구" },
    "41194": { lat: 37.4846, lng: 126.7905, name: "경기 부천시 소사구" },
    "41570": { lat: 37.6151, lng: 126.7157, name: "경기 김포시" },
    "41390": { lat: 37.3800, lng: 126.8031, name: "경기 시흥시" },
    "41150": { lat: 37.7381, lng: 127.0337, name: "경기 의정부시" },
    "41273": { lat: 37.3236, lng: 126.8219, name: "경기 안산시 단원구" },
    "41220": { lat: 36.9922, lng: 127.1129, name: "경기 평택시" },
    "41480": { lat: 37.7600, lng: 126.7780, name: "경기 파주시" },
    "41630": { lat: 37.7854, lng: 127.1098, name: "경기 양주시" },
    "41370": { lat: 37.1498, lng: 127.0773, name: "경기 오산시" },
    "41500": { lat: 37.2722, lng: 127.4348, name: "경기 이천시" },
    "41550": { lat: 37.0078, lng: 127.2695, name: "경기 안성시" },
    "41670": { lat: 37.2982, lng: 127.6378, name: "경기 여주시" },
    "41650": { lat: 37.8948, lng: 127.2002, name: "경기 포천시" },
    "41250": { lat: 37.9033, lng: 127.0605, name: "경기 동두천시" },
    "28185": { lat: 37.4106, lng: 126.6784, name: "인천 연수구" },
    "28260": { lat: 37.5454, lng: 126.6759, name: "인천 서구" },
    "28237": { lat: 37.4897, lng: 126.7218, name: "인천 부평구" },
    "28245": { lat: 37.5373, lng: 126.7329, name: "인천 계양구" },
    "28200": { lat: 37.4484, lng: 126.7315, name: "인천 남동구" },
    "28177": { lat: 37.4633, lng: 126.6505, name: "인천 미추홀구" },
    "28140": { lat: 37.4739, lng: 126.6321, name: "인천 동구" },
    "28110": { lat: 37.491393, lng: 126.518311, name: "인천 중구" },
    "44133": { lat: 36.819919, lng: 127.108604, name: "충남 서북구" },
    "44200": { lat: 36.7898, lng: 127.0017, name: "충남 아산시" },
    "43113": { lat: 36.645721, lng: 127.429612, name: "청주 흥덕구" } , 
};

// 네이버맵 초기화
function initNaverMap() {
    console.log("=== 네이버맵 초기화 시작 ===");

    // 전역 인증 실패 훅이 호출될 경우 사용자에게 친절한 안내를 표시하도록 미리 정의
    if (typeof window.navermap_authFailure !== 'function') {
        window.navermap_authFailure = function() {
            console.error('naver_map.js: window.navermap_authFailure 호출됨 — 인증 실패');
            const containers = ['naver-map', 'naver-map-economy', 'naver-map-realestate'];
            containers.forEach(id => {
                const container = document.getElementById(id);
                if (container) {
                    container.innerHTML = `\n                        <div style="color: #dc3545; text-align: center; padding: 40px; background: #fff7f7; border: 1px solid #f5c6cb; border-radius: 8px;">\n                            <h4>🛑 네이버 지도 인증 실패</h4>\n                            <p>API 키 또는 허용 출처(Referer)가 올바르지 않습니다.</p>\n                            <p>설정한 Client ID: <strong>wohmf5ntoz</strong></p>\n                            <small>브라우저 개발자 도구(Network)에서 maps.js 응답 본문을 확인하고, Naver Cloud 콘솔에서 허용 출처를 추가하세요.</small>\n                        </div>\n                    `;
                }
            });
        };
    }
    
    // 네이버맵 API 확인
    console.log("window.naver 상태:", window.naver);
    console.log("window.naver.maps 상태:", window.naver?.maps);
    
    if (!window.naver || !window.naver.maps) {
        console.error("네이버맵 API가 로드되지 않았습니다.");
        
        // 모든 지도 컨테이너에 에러 메시지 표시
        const containers = ['naver-map', 'naver-map-economy', 'naver-map-realestate'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `
                    <div style="color: #dc3545; text-align: center; padding: 40px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px;">
                        <h4>🗺️ 네이버 지도 로딩 실패</h4>
                        <p>네이버 클라우드 플랫폼 Maps API를 불러올 수 없습니다.</p>
                        <p>API 키: wohmf5ntoz (${id})</p>
                        <small style="color: #6c757d;">브라우저 콘솔에서 네트워크 오류를 확인해주세요.</small>
                    </div>
                `;
            }
        });
        return;
    }
    
    // 데이터 확인
    console.log("weeklyIndexData 상태:", window.weeklyIndexData);
    if (!window.weeklyIndexData || !window.weeklyIndexData.price_index) {
        console.error("부동산 데이터가 없습니다.");
        
        // 모든 지도 컨테이너에 데이터 없음 메시지 표시
        const containers = ['naver-map', 'naver-map-economy', 'naver-map-realestate'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `
                    <div style="color: #856404; text-align: center; padding: 40px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px;">
                        <h4>📊 부동산 데이터 없음</h4>
                        <p>부동산 매매지수 데이터를 불러올 수 없습니다.</p>
                        <p>데이터: ${JSON.stringify(window.weeklyIndexData).substring(0, 100)}...</p>
                    </div>
                `;
            }
        });
        return;
    }
    
    // 지도 컨테이너 (부동산맵 탭용)
    let mapContainer = document.getElementById('naver-map-realestate');
    
    // 다른 지도 컨테이너도 확인
    if (!mapContainer) {
        mapContainer = document.getElementById('naver-map');
    }
    if (!mapContainer) {
        mapContainer = document.getElementById('naver-map-economy');
    }
    
    console.log("지도 컨테이너 상태:", mapContainer);
    if (!mapContainer) {
        console.error("지도 컨테이너를 찾을 수 없습니다.");
        return;
    }
    
    // 컨테이너 크기 설정
    mapContainer.style.width = '100%';
    mapContainer.style.height = '500px';
    console.log("지도 컨테이너 크기 설정 완료:", mapContainer.style.width, mapContainer.style.height);
    
    // 지도 옵션
    const mapOptions = {
        center: new naver.maps.LatLng(37.5665, 126.9780), // 서울시청 좌표
        zoom: 11, // 확대 레벨
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: naver.maps.MapTypeControlStyle.BUTTON,
            position: naver.maps.Position.TOP_RIGHT
        },
        zoomControl: true,
        zoomControlOptions: {
            style: naver.maps.ZoomControlStyle.SMALL,
            position: naver.maps.Position.TOP_LEFT
        }
    };
    
    // 지도 생성
    try {
        console.log("지도 생성 시도 중... 컨테이너:", mapContainer.id, "옵션:", mapOptions);
        naverMap = new naver.maps.Map(mapContainer, mapOptions);
        console.log("✅ 네이버맵 생성 성공:", naverMap);
        
        // 지도 로딩 완료 이벤트 리스너
        naver.maps.Event.addListener(naverMap, 'tilesloaded', function() {
            console.log("✅ 네이버맵 타일 로딩 완료");
        });
        
        // 지도 초기화 완료 이벤트
        naver.maps.Event.addListener(naverMap, 'init', function() {
            console.log("✅ 네이버맵 초기화 완료");
        });
        
        // 지역별 마커 생성
        setTimeout(() => {
            console.log("마커 생성 시작...");
            createRegionMarkers();
        }, 1000);
        
    } catch (error) {
        console.error("❌ 네이버맵 생성 실패:", error);
        mapContainer.innerHTML = `
            <div style="color: #dc3545; text-align: center; padding: 40px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px;">
                <h4>🗺️ 지도 생성 실패</h4>
                <p>네이버 지도를 초기화할 수 없습니다.</p>
                <p><strong>오류:</strong> ${error.message}</p>
                <small style="color: #6c757d;">컨테이너: ${mapContainer.id}</small>
            </div>
        `;
        return;
    }
}

// 지역별 마커 생성
function createRegionMarkers() {
    console.log("지역별 마커 생성 시작...");
    
    // 기존 마커 제거
    regionMarkers.forEach(marker => marker.setMap(null));
    regionMarkers = [];
    
    const priceIndexData = window.weeklyIndexData.price_index || [];
    
    // 각 지역별로 마커 생성
    Object.keys(REGION_COORDINATES).forEach(regionCode => {
        const coordinate = REGION_COORDINATES[regionCode];
        const regionName = coordinate.name;
        
        // 해당 지역의 데이터 찾기
        const regionData = priceIndexData.find(data => data.area === regionName);
        
        if (regionData) {
            // 마커 생성
            const marker = createRegionMarker(regionData, coordinate);
            regionMarkers.push(marker);
            
            console.log(`${regionName} 마커 생성 완료`);
        }
    });
    
    console.log(`총 ${regionMarkers.length}개 지역 마커 생성 완료`);
}

// 개별 마커 생성
function createRegionMarker(regionData, coordinate) {
    const markerColor = getMarkerColor(regionData, currentMapType);
    const markerSize = getMarkerSize(regionData, currentMapType);
    
    // 커스텀 마커 HTML 생성
    const markerContent = createMarkerContent(regionData, currentMapType);
    
    // 네이버맵 마커 생성
    const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(coordinate.lat, coordinate.lng),
        map: naverMap,
        icon: {
            content: markerContent,
            size: new naver.maps.Size(markerSize.width, markerSize.height),
            anchor: new naver.maps.Point(markerSize.width / 2, markerSize.height)
        }
    });
    
    // 마커 클릭 이벤트 - 정보창 표시
    const infoWindow = new naver.maps.InfoWindow({
        content: createInfoWindowContent(regionData, currentMapType),
        maxWidth: 300,
        backgroundColor: "#ffffff",
        borderColor: "transparent",
        borderWidth: 0,
        anchorSize: new naver.maps.Size(10, 10)
    });
    
    naver.maps.Event.addListener(marker, 'click', function() {
        if (infoWindow.getMap()) {
            infoWindow.close();
        } else {
            infoWindow.open(naverMap, marker);
        }
    });
    
    return marker;
}

// 마커 콘텐츠 생성
function createMarkerContent(regionData, displayType) {
    let mainValue, changeValue, changeClass;
    
    switch (displayType) {
        case 'index':
            mainValue = `${regionData.index.toFixed(1)}`;
            const rateValue = (regionData.rate || 0);
            changeValue = `<span style="font-size: 10px;">${rateValue >= 0 ? '+' : ''}${rateValue.toFixed(2)}</span><span style="font-size: 8px;">%</span>`;
            changeClass = (regionData.rate || 0) >= 0 ? 'up' : 'down';
            break;
        case 'weekly_change':
            // 지난주 대비 (1주전 변동률)
            const weeklyRate = regionData.rate || 0;
            mainValue = `<span style="font-size: 10px;">${weeklyRate >= 0 ? '+' : ''}${weeklyRate.toFixed(2)}</span><span style="font-size: 8px;">%</span>`;
            changeValue = '지난주';
            changeClass = weeklyRate >= 0 ? 'up' : 'down';
            break;
        case 'monthly_change':
            // 지난달 대비 (2주전 변동률로 월간 대용)
            const monthlyRate = regionData.rate_2w || 0;
            mainValue = `<span style="font-size: 10px;">${monthlyRate >= 0 ? '+' : ''}${monthlyRate.toFixed(2)}</span><span style="font-size: 8px;">%</span>`;
            changeValue = '지난달';
            changeClass = monthlyRate >= 0 ? 'up' : 'down';
            break;
        default:
            mainValue = `${regionData.index.toFixed(1)}`;
            const defaultRateValue = (regionData.rate || 0);
            changeValue = `<span style="font-size: 10px;">${defaultRateValue >= 0 ? '+' : ''}${defaultRateValue.toFixed(2)}</span><span style="font-size: 8px;">%</span>`;
            changeClass = (regionData.rate || 0) >= 0 ? 'up' : 'down';
    }
    
    const backgroundColor = getMarkerColor(regionData, displayType);
    const shortName = regionData.area.replace('서울 ', '').replace('경기 ', '').replace('인천 ', '').replace('시 ', '').substring(0, 4);
    
    // 매매지수에서도 변동률 표시
    const showChangeValue = true; // 모든 경우에 변동률 표시
    const changeDisplay = showChangeValue ? `<div class="region-change ${changeClass}">${changeValue}</div>` : '';
    
    return `
        <div class="region-marker" style="background-color: ${backgroundColor}; width: 60px; height: 60px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-family: Arial, sans-serif; position: relative;">
            <div style="font-size: 12px; font-weight: bold; color: white; text-shadow: 1px 1px 1px rgba(0,0,0,0.5); line-height: 1;">${shortName}</div>
            <div style="font-size: 11px; font-weight: bold; color: white; text-shadow: 1px 1px 1px rgba(0,0,0,0.5); line-height: 1; margin: 1px 0;">${mainValue}</div>
            <div style="position: absolute; bottom: 5px; right: 10px; font-size: 8px; font-weight: bold; color: white; text-shadow: 1px 1px 1px rgba(0,0,0,0.5); line-height: 1;">${changeValue}</div>
        </div>
    `;
}

// 정보창 콘텐츠 생성
function createInfoWindowContent(regionData, displayType) {
    let mainValue, changeValue, changeClass, description;
    
    switch (displayType) {
        case 'index':
            mainValue = `매매지수: ${regionData.index.toFixed(1)}`;
            changeValue = `지난주 대비: ${(regionData.rate || 0) >= 0 ? '+' : ''}${(regionData.rate || 0).toFixed(2)}%`;
            changeClass = (regionData.rate || 0) >= 0 ? 'up' : 'down';
            description = '';
            break;
        case 'weekly_change':
            // 지난주 대비 변동률 (1주전 대비)
            const weeklyRate = regionData.rate || 0;
            mainValue = `지난주 대비: ${weeklyRate >= 0 ? '+' : ''}${weeklyRate.toFixed(2)}%`;
            changeValue = '주간 변동';
            changeClass = weeklyRate >= 0 ? 'up' : 'down';
            description = '지난주 대비 가격 변동률';
            break;
        case 'monthly_change':
            // 지난달 대비 변동률 (2주전 대비로 월간 대용)
            const monthlyRate = regionData.rate_2w || 0;
            mainValue = `지난달 대비: ${monthlyRate >= 0 ? '+' : ''}${monthlyRate.toFixed(2)}%`;
            changeValue = '월간 변동';
            changeClass = monthlyRate >= 0 ? 'up' : 'down';
            description = '지난달 대비 가격 변동률';
            break;
        default:
            mainValue = `매매지수: ${regionData.index.toFixed(1)}`;
            changeValue = `${(regionData.rate || 0) >= 0 ? '+' : ''}${(regionData.rate || 0).toFixed(2)}%`;
            changeClass = (regionData.rate || 0) >= 0 ? 'up' : 'down';
            description = '2020년 1월 기준';
    }
    
    return `
        <div class="info-window-content">
            <div class="info-title">${regionData.area}</div>
            <div class="info-main">${mainValue}</div>
            <div class="info-change ${changeClass}">${changeValue}</div>
            <div class="info-desc">${description}</div>
        </div>
    `;
}

// 마커 색상 결정
function getMarkerColor(regionData, displayType) {
    let value;
    
    switch (displayType) {
        case 'index':
            value = regionData.index;
            // 매매지수 기준
            if (value <= 80) return '#28a745'; // 녹색 (낮음)
            else if (value <= 100) return '#ffc107'; // 노랑 (보통)
            else return '#dc3545'; // 빨강 (높음)
            
        case 'weekly_change':
            // 지난주 대비 변동률 (1주전 대비)
            value = regionData.rate || 0;
            // 변동률 기준: 0.5% 넘으면 빨간색, 0.5% 이하 노란색, 0% 이하 초록색
            if (value <= 0) return '#28a745'; // 녹색 (하락)
            else if (value < 0.5) return '#ffc107'; // 노랑 (보합)
            else return '#dc3545'; // 빨강 (상승)
        case 'monthly_change':
            // 지난달 대비 변동률 (2주전 대비로 월간 대용)
            value = regionData.rate_2w || 0;
            // 변동률 기준: 1.0% 넘으면 빨간색, 1.0% 이하 노란색, 0% 이하 초록색
            if (value <= 0) return '#28a745'; // 녹색 (하락)
            else if (value < 1.0) return '#ffc107'; // 노랑 (보합)
            else return '#dc3545'; // 빨강 (상승)
        default:
            return '#ffc107'; // 기본 노랑
    }
}

// 마커 크기 결정 (고정 크기로 변경)
function getMarkerSize(regionData, displayType) {
    const size = 60; // 모든 마커 동일한 크기로 고정
    return { width: size, height: size };
}

// 지도 표시 방식 변경
function changeMapDisplay(type) {
    currentMapType = type;
    
    // 버튼 활성화 상태 변경
    document.querySelectorAll('.map-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 클릭된 버튼 활성화
    const clickedBtn = document.querySelector(`[onclick="changeMapDisplay('${type}')"]`);
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
    
    // 마커 다시 생성
    createRegionMarkers();
    
    console.log(`지도 표시 방식 변경: ${type}`);
}

// 네이버맵 API 로드 확인 및 초기화
function waitForNaverAPI() {
    if (window.naver && window.naver.maps) {
        console.log("네이버맵 API 로드 완료");
        return true;
    } else {
        console.log("네이버맵 API 로딩 중...");
        return false;
    }
}

// 네이버맵이 실패할 때 대체 부동산 데이터 카드 표시
function showRealEstateCards() {
    if (!window.weeklyIndexData || !window.weeklyIndexData.price_index) {
        return;
    }
    
    const containers = ['naver-map', 'naver-map-economy', 'naver-map-realestate'];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let cardsHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; padding: 20px;">';
        
        window.weeklyIndexData.price_index.forEach(data => {
            const rateClass = data.rate >= 1 ? 'high-rate' : data.rate >= 0.5 ? 'medium-rate' : 'low-rate';
            const rateColor = data.rate >= 1 ? '#dc3545' : data.rate >= 0.5 ? '#ffc107' : '#28a745';
            const arrow = data.rate >= 0 ? '▲' : '▼';
            
            cardsHtml += `
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 4px solid ${rateColor};">
                    <h4 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">🏢 ${data.area}</h4>
                    <div style="font-size: 28px; font-weight: bold; color: ${rateColor}; margin-bottom: 10px;">
                        ${data.index.toFixed(1)}
                    </div>
                    <div style="color: ${rateColor}; font-weight: bold; font-size: 16px;">
                        ${arrow} ${data.rate >= 0 ? '+' : ''}${data.rate.toFixed(2)}% (주간)
                    </div>
                    <div style="font-size: 14px; color: #666; margin-top: 10px;">
                        매매지수 (2020.01 = 100)
                    </div>
                    <div style="font-size: 12px; color: #999; margin-top: 5px;">
                        지수: ${data.indices ? data.indices[data.indices.length-1].toFixed(1) : '데이터 없음'}
                    </div>
                </div>
            `;
        });
        
        cardsHtml += '</div>';
        
        // 기존 내용 뒤에 카드 추가
        container.innerHTML += cardsHtml;
    });
}

// initKakaoMap 함수명 유지 (기존 탭 스크립트 호환성을 위해)
function initKakaoMap() {
    initNaverMap();
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('네이버맵 스크립트 로드 완료');
    
    // 네이버맵 API 로딩 대기
    let checkCount = 0;
    const checkInterval = setInterval(() => {
        checkCount++;
        if (waitForNaverAPI()) {
            clearInterval(checkInterval);
            console.log('✅ 네이버맵 API 준비 완료');
            
            // 경제 탭이 기본으로 활성화되어 있으므로 바로 초기화
            setTimeout(() => {
                console.log('⏰ 지도 초기화 타이머 시작...');
                initNaverMap();
            }, 1000);
            
            // 추가 시도 (네트워크 지연 대비)
            setTimeout(() => {
                if (!naverMap) {
                    console.log('🔄 지도 재초기화 시도...');
                    initNaverMap();
                }
            }, 3000);
        } else if (checkCount > 50) { // 5초 후 타임아웃
            clearInterval(checkInterval);
            console.error("네이버맵 API 로딩 타임아웃");
            
            // 타임아웃 시 대체 표시 (부동산 데이터 카드)
            showRealEstateCards();
            
            const containers = ['naver-map', 'naver-map-economy', 'naver-map-realestate'];
            containers.forEach(id => {
                const container = document.getElementById(id);
                if (container) {
                    container.innerHTML = `
                        <div style="color: #e74c3c; text-align: center; padding: 30px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px;">
                            <h4>🗺️ 네이버 지도 로딩 실패</h4>
                            <p>네이버 지도 API를 불러올 수 없습니다. 아래 부동산 데이터를 참고하세요.</p>
                            <button onclick="location.reload()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                                🔄 새로고침
                            </button>
                        </div>
                    `;
                }
            });
        }
    }, 100);
});
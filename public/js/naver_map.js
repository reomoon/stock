// naver_map.js - 네이버 클라우드 플랫폼 Dynamic Maps를 사용한 부동산 지수 시각화

let naverMap;
let currentMapType = 'index'; // 'index', 'weekly_change', 'monthly_change'
let regionMarkers = []; // 지역 마커들을 저장

// 지역별 좌표 매핑 (REGION_CODES 기준)
const REGION_COORDINATES = {
    "11680": { lat: 37.5172, lng: 127.0473, name: "서울 강남구" },
    "11170": { lat: 37.5384, lng: 126.9656, name: "서울 용산구" },
    "11710": { lat: 37.5145, lng: 127.1061, name: "서울 송파구" },
    "11200": { lat: 37.5631, lng: 127.0370, name: "서울 성동구" },
    "11440": { lat: 37.5663, lng: 126.9013, name: "서울 마포구" },
    "11560": { lat: 37.5264, lng: 126.8962, name: "서울 영등포구" },
    "11590": { lat: 37.5124, lng: 126.9393, name: "서울 동작구" },
    "11740": { lat: 37.5301, lng: 127.1238, name: "서울 강동구" },
    "11230": { lat: 37.5744, lng: 127.0396, name: "서울 동대문구" },
    "11500": { lat: 37.5509, lng: 126.8495, name: "서울 강서구" },
    "11410": { lat: 37.5790, lng: 126.9368, name: "서울 서대문구" },
    "11290": { lat: 37.5894, lng: 127.0164, name: "서울 성북구" },
    "11305": { lat: 37.6396, lng: 127.0257, name: "서울 강북구" },
    "41135": { lat: 37.3595, lng: 127.1052, name: "경기 성남시 분당구" },
    "41210": { lat: 37.4783, lng: 126.8644, name: "경기 광명시" },
    "41450": { lat: 37.5392, lng: 127.2148, name: "경기 하남시" },
    "41465": { lat: 37.3207, lng: 127.1286, name: "경기 용인시 수지구" },
    "41173": { lat: 37.3943, lng: 126.9568, name: "경기 안양시 동안구" },
    "41117": { lat: 37.2636, lng: 127.0286, name: "경기 수원시 영통구" },
    "41115": { lat: 37.2792, lng: 127.0127, name: "경기 수원시 팔달구" },
    "41360": { lat: 37.6369, lng: 127.2158, name: "경기 남양주시" },
    "41285": { lat: 37.6583, lng: 126.7762, name: "경기 고양시 일산동구" },
    "41192": { lat: 37.5058, lng: 126.7659, name: "경기 부천시 원미구" },
    "41570": { lat: 37.6151, lng: 126.7157, name: "경기 김포시" },
    "41390": { lat: 37.3800, lng: 126.8031, name: "경기 시흥시" },
    "41150": { lat: 37.7381, lng: 127.0337, name: "경기 의정부시" },
    "41590": { lat: 37.1999, lng: 126.8319, name: "경기 화성시" },
    "41220": { lat: 36.9922, lng: 127.1129, name: "경기 평택시" },
    "28237": { lat: 37.4897, lng: 126.7218, name: "인천 부평구" },
    "28185": { lat: 37.4106, lng: 126.6784, name: "인천 연수구" },
    "28260": { lat: 37.5454, lng: 126.6759, name: "인천 서구" },
    "44133": { lat: 36.7594, lng: 126.4521, name: "충남 서북구" },
    "44200": { lat: 36.7898, lng: 127.0017, name: "충남 아산시" },
    "43113": { lat: 36.6424, lng: 127.4890, name: "청주 흥덕구" }
};

// 네이버맵 초기화
function initNaverMap() {
    console.log("네이버맵 초기화 시작...");
    
    if (!window.naver || !window.naver.maps) {
        console.error("네이버맵 API가 로드되지 않았습니다.");
        return;
    }
    
    if (!window.weeklyIndexData) {
        console.error("부동산 데이터가 없습니다.");
        return;
    }
    
    // 지도 컨테이너
    const mapContainer = document.getElementById('naver-map');
    if (!mapContainer) {
        console.error("지도 컨테이너를 찾을 수 없습니다.");
        return;
    }
    
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
    naverMap = new naver.maps.Map(mapContainer, mapOptions);
    console.log("네이버맵 생성 완료");
    
    // 지역별 마커 생성
    createRegionMarkers();
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
        borderColor: "#007bff",
        borderWidth: 2,
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
            changeValue = `${(regionData.rate || 0) >= 0 ? '+' : ''}${(regionData.rate || 0).toFixed(2)}%`;
            changeClass = (regionData.rate || 0) >= 0 ? 'up' : 'down';
            break;
        case 'weekly_change':
            const weeklyRate = regionData.rate || 0;
            mainValue = `${weeklyRate >= 0 ? '+' : ''}${weeklyRate.toFixed(2)}%`;
            changeValue = '지난주';
            changeClass = weeklyRate >= 0 ? 'up' : 'down';
            break;
        case 'monthly_change':
            const monthlyRate = regionData.rate || 0;
            mainValue = `${monthlyRate >= 0 ? '+' : ''}${monthlyRate.toFixed(2)}%`;
            changeValue = '지난달';
            changeClass = monthlyRate >= 0 ? 'up' : 'down';
            break;
        default:
            mainValue = `${regionData.index.toFixed(1)}`;
            changeValue = `${(regionData.rate || 0) >= 0 ? '+' : ''}${(regionData.rate || 0).toFixed(2)}%`;
            changeClass = (regionData.rate || 0) >= 0 ? 'up' : 'down';
    }
    
    const backgroundColor = getMarkerColor(regionData, displayType);
    const shortName = regionData.area.replace('서울 ', '').replace('경기 ', '').replace('인천 ', '').replace('시 ', '').substring(0, 4);
    
    return `
        <div class="region-marker" style="background-color: ${backgroundColor};">
            <div class="region-name">${shortName}</div>
            <div class="region-value">${mainValue}</div>
        </div>
    `;
}

// 정보창 콘텐츠 생성
function createInfoWindowContent(regionData, displayType) {
    let mainValue, changeValue, changeClass, description;
    
    switch (displayType) {
        case 'index':
            mainValue = `매매지수: ${regionData.index.toFixed(1)}`;
            changeValue = `전월 대비: ${(regionData.rate || 0) >= 0 ? '+' : ''}${(regionData.rate || 0).toFixed(2)}%`;
            changeClass = (regionData.rate || 0) >= 0 ? 'up' : 'down';
            description = '2020년 1월 기준 100';
            break;
        case 'weekly_change':
            const weeklyRate = regionData.rate || 0;
            mainValue = `주간 변동률: ${weeklyRate >= 0 ? '+' : ''}${weeklyRate.toFixed(2)}%`;
            changeValue = '지난주 대비 변동';
            changeClass = weeklyRate >= 0 ? 'up' : 'down';
            description = '1주일간 가격 변동률';
            break;
        case 'monthly_change':
            const monthlyRate = regionData.rate || 0;
            mainValue = `월간 변동률: ${monthlyRate >= 0 ? '+' : ''}${monthlyRate.toFixed(2)}%`;
            changeValue = '지난달 대비 변동';
            changeClass = monthlyRate >= 0 ? 'up' : 'down';
            description = '1개월간 가격 변동률';
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
            if (value <= 95) return '#28a745'; // 녹색 (낮음)
            else if (value <= 105) return '#ffc107'; // 노랑 (보통)
            else return '#dc3545'; // 빨강 (높음)
            
        case 'weekly_change':
        case 'monthly_change':
            value = regionData.rate || 0;
            // 변동률 기준
            if (value <= -0.3) return '#28a745'; // 녹색 (하락)
            else if (value <= 0.3) return '#ffc107'; // 노랑 (보합)
            else return '#dc3545'; // 빨강 (상승)
            
        default:
            return '#ffc107'; // 기본 노랑
    }
}

// 마커 크기 결정
function getMarkerSize(regionData, displayType) {
    let size = 60; // 기본 크기
    
    switch (displayType) {
        case 'index':
            // 지수가 높을수록 크게
            if (regionData.index > 110) size = 70;
            else if (regionData.index > 100) size = 65;
            break;
        case 'weekly_change':
        case 'monthly_change':
            // 변동률 절댓값이 클수록 크게
            const absRate = Math.abs(regionData.rate || 0);
            if (absRate > 1.0) size = 70;
            else if (absRate > 0.5) size = 65;
            break;
    }
    
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
            console.log('네이버맵 API 준비 완료');
            // 탭이 부동산맵으로 전환될 때까지 대기
        } else if (checkCount > 50) { // 5초 후 타임아웃
            clearInterval(checkInterval);
            console.error("네이버맵 API 로딩 타임아웃");
        }
    }, 100);
});
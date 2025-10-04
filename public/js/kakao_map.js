// kakao_map.js - 카카오맵을 사용한 부동산 지수 시각화

let kakaoMap;
let currentMapType = 'index'; // 'index', 'weekly_change', 'monthly_change'
let regionOverlays = []; // 지역 오버레이들을 저장

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

// 카카오맵 초기화
function initKakaoMap() {
    console.log("카카오맵 초기화 시작...");
    
    if (!window.kakao || !window.kakao.maps) {
        console.error("카카오맵 API가 로드되지 않았습니다.");
        return;
    }
    
    if (!window.weeklyIndexData) {
        console.error("부동산 데이터가 없습니다.");
        return;
    }
    
    // 지도 컨테이너
    const mapContainer = document.getElementById('kakao-map');
    if (!mapContainer) {
        console.error("지도 컨테이너를 찾을 수 없습니다.");
        return;
    }
    
    // 지도 옵션
    const mapOption = {
        center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울시청 좌표
        level: 8 // 확대 레벨
    };
    
    // 지도 생성
    kakaoMap = new kakao.maps.Map(mapContainer, mapOption);
    console.log("카카오맵 생성 완료");
    
    // 지역별 마커 및 오버레이 생성
    createRegionMarkers();
}

// 지역별 마커 생성
function createRegionMarkers() {
    console.log("지역별 마커 생성 시작...");
    
    // 기존 오버레이 제거
    regionOverlays.forEach(overlay => overlay.setMap(null));
    regionOverlays = [];
    
    const priceIndexData = window.weeklyIndexData.price_index || [];
    
    // 각 지역별로 마커 생성
    Object.keys(REGION_COORDINATES).forEach(regionCode => {
        const coordinate = REGION_COORDINATES[regionCode];
        const regionName = coordinate.name;
        
        // 해당 지역의 데이터 찾기
        const regionData = priceIndexData.find(data => data.area === regionName);
        
        if (regionData) {
            // 지역별 색상 결정
            const color = getRegionColor(regionData, currentMapType);
            
            // 커스텀 오버레이 생성
            const overlayContent = createOverlayContent(regionData, currentMapType);
            
            const customOverlay = new kakao.maps.CustomOverlay({
                position: new kakao.maps.LatLng(coordinate.lat, coordinate.lng),
                content: overlayContent,
                yAnchor: 0.5
            });
            
            customOverlay.setMap(kakaoMap);
            regionOverlays.push(customOverlay);
            
            console.log(`${regionName} 마커 생성 완료`);
        }
    });
    
    console.log(`총 ${regionOverlays.length}개 지역 마커 생성 완료`);
}

// 오버레이 콘텐츠 생성
function createOverlayContent(regionData, displayType) {
    let mainValue, changeValue, changeClass;
    
    switch (displayType) {
        case 'index':
            mainValue = `${regionData.index.toFixed(1)}`;
            changeValue = `전월: ${regionData.rate >= 0 ? '+' : ''}${regionData.rate?.toFixed(2) || '0.00'}%`;
            changeClass = (regionData.rate || 0) >= 0 ? 'up' : 'down';
            break;
        case 'weekly_change':
            const weeklyRate = regionData.rate || 0;
            mainValue = `${weeklyRate >= 0 ? '+' : ''}${weeklyRate.toFixed(2)}%`;
            changeValue = '지난주 대비';
            changeClass = weeklyRate >= 0 ? 'up' : 'down';
            break;
        case 'monthly_change':
            const monthlyRate = regionData.rate || 0;
            mainValue = `${monthlyRate >= 0 ? '+' : ''}${monthlyRate.toFixed(2)}%`;
            changeValue = '지난달 대비';
            changeClass = monthlyRate >= 0 ? 'up' : 'down';
            break;
        default:
            mainValue = `${regionData.index.toFixed(1)}`;
            changeValue = `${(regionData.rate || 0) >= 0 ? '+' : ''}${(regionData.rate || 0).toFixed(2)}%`;
            changeClass = (regionData.rate || 0) >= 0 ? 'up' : 'down';
    }
    
    const backgroundColor = getRegionColor(regionData, displayType);
    
    return `
        <div class="region-overlay" style="background-color: ${backgroundColor};">
            <div class="region-name">${regionData.area.replace('서울 ', '').replace('경기 ', '').replace('인천 ', '')}</div>
            <div class="region-index">${mainValue}</div>
            <div class="region-change ${changeClass}">${changeValue}</div>
        </div>
    `;
}

// 지역 색상 결정
function getRegionColor(regionData, displayType) {
    let value;
    
    switch (displayType) {
        case 'index':
            value = regionData.index;
            // 매매지수 기준 (95 이하: 녹색, 95-105: 노랑, 105 이상: 빨강)
            if (value <= 95) return 'rgba(68, 255, 68, 0.8)'; // 녹색
            else if (value <= 105) return 'rgba(255, 170, 0, 0.8)'; // 노랑
            else return 'rgba(255, 68, 68, 0.8)'; // 빨강
            
        case 'weekly_change':
        case 'monthly_change':
            value = regionData.rate || 0;
            // 변동률 기준 (-0.3% 이하: 녹색, -0.3%~0.3%: 노랑, 0.3% 이상: 빨강)
            if (value <= -0.3) return 'rgba(68, 255, 68, 0.8)'; // 녹색
            else if (value <= 0.3) return 'rgba(255, 170, 0, 0.8)'; // 노랑
            else return 'rgba(255, 68, 68, 0.8)'; // 빨강
            
        default:
            return 'rgba(255, 170, 0, 0.8)'; // 기본 노랑
    }
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

// 카카오맵 API 로드 확인 및 초기화
function waitForKakaoAPI() {
    if (window.kakao && window.kakao.maps) {
        console.log("카카오맵 API 로드 완료");
        return true;
    } else {
        console.log("카카오맵 API 로딩 중...");
        return false;
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('카카오맵 스크립트 로드 완료');
    
    // 카카오맵 API 로딩 대기
    let checkCount = 0;
    const checkInterval = setInterval(() => {
        checkCount++;
        if (waitForKakaoAPI()) {
            clearInterval(checkInterval);
            console.log('카카오맵 API 준비 완료');
            // 탭이 부동산맵으로 전환될 때까지 대기
        } else if (checkCount > 50) { // 5초 후 타임아웃
            clearInterval(checkInterval);
            console.error("카카오맵 API 로딩 타임아웃");
        }
    }, 100);
});
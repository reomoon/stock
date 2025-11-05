// apartment_price_map.js - 대장 단지 실거래 시세 지도

let apartmentPriceMap;
let apartmentMarkers = [];

// 지역별 좌표 매핑 
// 📍 아파트 추가/수정 시 함께 편집: c:\python\stock\page\apartment_price.py (FLAGSHIP_APARTMENTS)
const APT_REGION_COORDINATES = {
    "11680": { lat: 37.533160, lng: 127.028120, name: "서울 강남구" },
    "11650": { lat: 37.506755, lng: 126.998555, name: "서울 서초구" },
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
    "41287": { lat: 37.694429, lng: 126.743460, name: "경기 고양시 일산서구"},
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

// 대장 단지 지도 초기화
function initApartmentPriceMap() {
    console.log("=== 대장 단지 실거래 시세 지도 초기화 ===");
    
    if (!window.naver || !window.naver.maps) {
        console.error("네이버맵 API가 로드되지 않았습니다.");
        return;
    }
    
    // 아파트 시세 데이터 확인
    console.log("apartmentPrices 상태:", window.apartmentPrices);
    if (!window.apartmentPrices) {
        console.error("아파트 시세 데이터가 없습니다.");
        return;
    }
    
    const mapContainer = document.getElementById('naver-map-apartment-price');
    if (!mapContainer) {
        console.error("대장 단지 지도 컨테이너를 찾을 수 없습니다.");
        return;
    }
    
    // 컨테이너 크기 설정
    mapContainer.style.width = '100%';
    mapContainer.style.height = '500px';
    
    // 지도 옵션
    const mapOptions = {
        center: new naver.maps.LatLng(37.5665, 126.9780),
        zoom: 11,
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
    
    try {
        apartmentPriceMap = new naver.maps.Map(mapContainer, mapOptions);
        console.log("✅ 대장 단지 지도 생성 성공");
        
        // 마커 생성
        setTimeout(() => {
            createApartmentMarkers();
        }, 500);
        
    } catch (error) {
        console.error("❌ 대장 단지 지도 생성 실패:", error);
    }
}

// 대장 단지 마커 생성
function createApartmentMarkers() {
    console.log("대장 단지 마커 생성 시작...");
    
    // 기존 마커 제거
    apartmentMarkers.forEach(marker => marker.setMap(null));
    apartmentMarkers = [];
    
    // 각 지역별로 마커 생성
    Object.keys(APT_REGION_COORDINATES).forEach(regionCode => {
        const coordinate = APT_REGION_COORDINATES[regionCode];
        const apartmentData = window.apartmentPrices[regionCode];
        
        if (apartmentData) {
            const marker = createApartmentMarker(apartmentData, coordinate);
            apartmentMarkers.push(marker);
            console.log(`${coordinate.name} 대장 단지 마커 생성 완료`);
        }
    });
    
    console.log(`총 ${apartmentMarkers.length}개 대장 단지 마커 생성 완료`);
}

// 개별 대장 단지 마커 생성
function createApartmentMarker(apartmentData, coordinate) {
    // 마커 콘텐츠 생성 (대장 단지명 + 평균 매매가)
    let priceText = 'N/A';
    if (apartmentData.sale_price && apartmentData.sale_price.avg && apartmentData.sale_price.avg !== 'N/A') {
        // "12,345만원"에서 억 단위로 변환
        const avgStr = apartmentData.sale_price.avg.replace(/,/g, '').replace('만원', '');
        const avgNum = parseInt(avgStr);
        if (!isNaN(avgNum)) {
            const billions = Math.floor(avgNum / 10000);
            const millions = Math.floor((avgNum % 10000) / 1000);
            if (billions > 0) {
                priceText = millions > 0 ? `${billions}.${millions}` : `${billions}`;
            } else {
                priceText = `0.${Math.floor(avgNum / 1000)}`;
            }
        }
    }
    
    // 110~133㎡ 범위의 마지막 거래 정보 추출
    let displayArea = '';
    let displayPrice = priceText;
    
    if (apartmentData.sale_price && apartmentData.sale_price.recent_list && apartmentData.sale_price.recent_list.length > 0) {
        const recentDeal = apartmentData.sale_price.recent_list[0]; // 이미 날짜순 정렬되어 있음
        if (recentDeal.area) {
            // "110.5㎡ (33.4평)" 형식에서 숫자만 추출
            const areaMatch = recentDeal.area.match(/(\d+\.?\d*)㎡/);
            if (areaMatch) {
                displayArea = areaMatch[1] + '㎡';
            }
        }
        if (recentDeal.price) {
            // 거래금액 포맷팅 ("12,500" -> "12.5억")
            const priceNum = parseFloat(recentDeal.price.replace(/,/g, ''));
            if (priceNum >= 10000) {
                const billions = Math.floor(priceNum / 10000);
                const millions = Math.floor((priceNum % 10000) / 1000);
                displayPrice = millions > 0 ? `${billions}.${millions}` : `${billions}`;
            } else {
                displayPrice = `0.${Math.floor(priceNum / 1000)}`;
            }
        }
    }
    
    const markerContent = `
        <div style="background: white; padding: 6px 10px; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); border: 1px solid #ddd; cursor: pointer;">
            <div style="text-align: center; line-height: 1.2;">
                <div style="font-size: 13px; font-weight: bold; color: #FF6B6B;">${displayPrice}억</div>
                ${displayArea ? `<div style="font-size: 10px; color: #666; margin-top: 2px;">${displayArea}</div>` : ''}
            </div>
        </div>
    `;
    
    const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(coordinate.lat, coordinate.lng),
        map: apartmentPriceMap,
        icon: {
            content: markerContent,
            size: new naver.maps.Size(70, 40),
            anchor: new naver.maps.Point(35, 20)
        }
    });
    
    // 정보창 생성
    const infoWindow = new naver.maps.InfoWindow({
        content: createApartmentInfoWindow(apartmentData, coordinate.name),
        maxWidth: 400,
        backgroundColor: "#ffffff",
        borderColor: "transparent",
        borderWidth: 0,
        anchorSize: new naver.maps.Size(10, 10)
    });
    
    // 마커 클릭 이벤트
    naver.maps.Event.addListener(marker, 'click', function() {
        if (infoWindow.getMap()) {
            infoWindow.close();
        } else {
            infoWindow.open(apartmentPriceMap, marker);
            
            // 인포윈도우가 열린 후 탭 이벤트 리스너 추가
            setTimeout(() => {
                setupTabEventListeners();
            }, 100);
        }
    });
    
    return marker;
}

// 탭 전환 이벤트 리스너 설정
function setupTabEventListeners() {
    const tabButtons = document.querySelectorAll('.apt-tab-btn');
    
    tabButtons.forEach(button => {
        button.onclick = function() {
            const tabName = this.getAttribute('data-tab');
            const parentDiv = this.closest('[id^="apt-info-"]');
            
            // 모든 탭 버튼 비활성화
            parentDiv.querySelectorAll('.apt-tab-btn').forEach(btn => {
                btn.style.background = '#e9ecef';
                btn.style.color = '#333';
            });
            
            // 현재 탭 버튼 활성화
            this.style.background = tabName === 'sale' ? '#dc3545' : tabName === 'jeonse' ? '#28a745' : '#007bff';
            this.style.color = 'white';
            
            // 모든 탭 콘텐츠 숨기기
            parentDiv.querySelectorAll('.apt-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // 선택된 탭 콘텐츠 표시
            const selectedContent = parentDiv.querySelector(`.apt-tab-content[data-content="${tabName}"]`);
            if (selectedContent) {
                selectedContent.style.display = 'block';
            }
        };
    });
}

// 대장 단지 정보창 생성 (탭 형태)
function createApartmentInfoWindow(apartmentData, regionName) {
    const aptName = apartmentData.apartment_name || '대장 단지';
    const salePrice = apartmentData.sale_price;
    const jeonsePrice = apartmentData.jeonse_price;
    const rentPrice = apartmentData.rent_price;
    
    // 고유 ID 생성
    const windowId = `apt-info-${regionName.replace(/\s/g, '-')}`;
    
    let html = `
        <div id="${windowId}" style="padding: 15px; font-family: 'Noto Sans KR', sans-serif; width: 500px; max-height: 600px; overflow-y: auto;">
            <div style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 8px;">
                🏢 ${regionName}
            </div>
            <div style="font-size: 14px; color: #666; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #007bff;">
                ${aptName}
            </div>
            
            <!-- 탭 버튼 -->
            <div style="display: flex; gap: 8px; margin-bottom: 12px; border-bottom: 1px solid #ddd;">
                <button class="apt-tab-btn active" data-tab="sale" style="flex: 1; padding: 8px 12px; border: none; background: #dc3545; color: white; font-weight: bold; cursor: pointer; border-radius: 4px 4px 0 0;">
                    매매
                </button>
                <button class="apt-tab-btn" data-tab="jeonse" style="flex: 1; padding: 8px 12px; border: none; background: #e9ecef; color: #333; font-weight: bold; cursor: pointer; border-radius: 4px 4px 0 0;">
                    전세
                </button>
                <button class="apt-tab-btn" data-tab="rent" style="flex: 1; padding: 8px 12px; border: none; background: #e9ecef; color: #333; font-weight: bold; cursor: pointer; border-radius: 4px 4px 0 0;">
                    월세
                </button>
            </div>
            
            <!-- 매매 탭 -->
            <div class="apt-tab-content active" data-content="sale">
                ${createSaleListHTML(salePrice)}
            </div>
            
            <!-- 전세 탭 -->
            <div class="apt-tab-content" data-content="jeonse" style="display: none;">
                ${createJeonseListHTML(jeonsePrice)}
            </div>
            
            <!-- 월세 탭 -->
            <div class="apt-tab-content" data-content="rent" style="display: none;">
                ${createRentListHTML(rentPrice)}
            </div>
            
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #dee2e6; font-size: 11px; color: #999; text-align: center;">
                실거래가 기준 최근 데이터 (국토교통부)
            </div>
        </div>
    `;
    
    return html;
}

// 매매 리스트 HTML 생성
function createSaleListHTML(salePrice) {
    if (!salePrice || !salePrice.recent_list || salePrice.recent_list.length === 0) {
        return '<div style="padding: 20px; text-align: center; color: #999;">매매 실거래 데이터가 없습니다</div>';
    }
    
    let html = `
        <div style="margin-bottom: 10px; padding: 10px; background: #fff3cd; border-radius: 6px;">
            <div style="font-size: 12px; color: #856404;">
                <strong>평균:</strong> ${salePrice.avg || 'N/A'} &nbsp;|&nbsp; 
                <strong>범위:</strong> ${salePrice.min || 'N/A'} ~ ${salePrice.max || 'N/A'}
            </div>
        </div>
        <div style="max-height: 400px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead style="background: #f8f9fa; position: sticky; top: 0;">
                    <tr>
                        <th style="padding: 8px; border-bottom: 2px solid #dee2e6; text-align: left;">거래일</th>
                        <th style="padding: 8px; border-bottom: 2px solid #dee2e6; text-align: right;">금액</th>
                        <th style="padding: 8px; border-bottom: 2px solid #dee2e6; text-align: center;">면적</th>
                        <th style="padding: 8px; border-bottom: 2px solid #dee2e6; text-align: center;">층</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    salePrice.recent_list.forEach((item, idx) => {
        const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8f9fa';
        html += `
            <tr style="background: ${bgColor};">
                <td style="padding: 6px 8px; border-bottom: 1px solid #e9ecef;">${item.date || '-'}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #e9ecef; text-align: right; font-weight: bold; color: #dc3545;">${item.price || '-'}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.area || '-'}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.floor || '-'}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

// 전세 리스트 HTML 생성
function createJeonseListHTML(jeonsePrice) {
    if (!jeonsePrice || !jeonsePrice.recent_list || jeonsePrice.recent_list.length === 0) {
        return '<div style="padding: 20px; text-align: center; color: #999;">전세 실거래 데이터가 없습니다</div>';
    }
    
    let html = `
        <div style="margin-bottom: 10px; padding: 10px; background: #d1ecf1; border-radius: 6px;">
            <div style="font-size: 12px; color: #0c5460;">
                <strong>평균:</strong> ${jeonsePrice.avg || 'N/A'} &nbsp;|&nbsp; 
                <strong>범위:</strong> ${jeonsePrice.min || 'N/A'} ~ ${jeonsePrice.max || 'N/A'}
            </div>
        </div>
        <div style="max-height: 400px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead style="background: #f8f9fa; position: sticky; top: 0;">
                    <tr>
                        <th style="padding: 8px; border-bottom: 2px solid #dee2e6; text-align: left;">거래일</th>
                        <th style="padding: 8px; border-bottom: 2px solid #dee2e6; text-align: right;">보증금</th>
                        <th style="padding: 8px; border-bottom: 2px solid #dee2e6; text-align: center;">면적</th>
                        <th style="padding: 8px; border-bottom: 2px solid #dee2e6; text-align: center;">층</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    jeonsePrice.recent_list.forEach((item, idx) => {
        const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8f9fa';
        html += `
            <tr style="background: ${bgColor};">
                <td style="padding: 6px 8px; border-bottom: 1px solid #e9ecef;">${item.date || '-'}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #e9ecef; text-align: right; font-weight: bold; color: #28a745;">${item.deposit || '-'}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.area || '-'}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.floor || '-'}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

// 월세 리스트 HTML 생성
function createRentListHTML(rentPrice) {
    if (!rentPrice || !rentPrice.recent_list || rentPrice.recent_list.length === 0) {
        return '<div style="padding: 20px; text-align: center; color: #999;">월세 실거래 데이터가 없습니다</div>';
    }
    
    let html = `
        <div style="max-height: 400px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead style="background: #f8f9fa; position: sticky; top: 0;">
                    <tr>
                        <th style="padding: 8px; border-bottom: 2px solid #dee2e6; text-align: left;">거래일</th>
                        <th style="padding: 8px; border-bottom: 2px solid #dee2e6; text-align: right;">보증금</th>
                        <th style="padding: 8px; border-bottom: 2px solid #dee2e6; text-align: right;">월세</th>
                        <th style="padding: 8px; border-bottom: 2px solid #dee2e6; text-align: center;">면적</th>
                        <th style="padding: 8px; border-bottom: 2px solid #dee2e6; text-align: center;">층</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    rentPrice.recent_list.forEach((item, idx) => {
        const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8f9fa';
        html += `
            <tr style="background: ${bgColor};">
                <td style="padding: 6px 8px; border-bottom: 1px solid #e9ecef;">${item.date || '-'}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #e9ecef; text-align: right; font-weight: bold; color: #007bff;">${item.deposit || '-'}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #e9ecef; text-align: right; font-weight: bold; color: #007bff;">${item.monthly || '-'}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.area || '-'}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.floor || '-'}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('대장 단지 지도 스크립트 로드 완료');
    
    // 네이버맵 API 로딩 대기 후 초기화
    let checkCount = 0;
    const checkInterval = setInterval(() => {
        checkCount++;
        if (window.naver && window.naver.maps) {
            clearInterval(checkInterval);
            console.log('✅ 네이버맵 API 준비 완료 (대장 단지)');
            
            // 부동산맵 탭이 활성화될 때까지 대기
            setTimeout(() => {
                const mapContainer = document.getElementById('naver-map-apartment-price');
                if (mapContainer && mapContainer.offsetParent !== null) {
                    initApartmentPriceMap();
                } else {
                    // 탭 전환 이벤트 감지
                    const observer = new MutationObserver((mutations) => {
                        const mapContainer = document.getElementById('naver-map-apartment-price');
                        if (mapContainer && mapContainer.offsetParent !== null && !apartmentPriceMap) {
                            initApartmentPriceMap();
                            observer.disconnect();
                        }
                    });
                    
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: ['class', 'style']
                    });
                }
            }, 2000);
            
        } else if (checkCount > 50) {
            clearInterval(checkInterval);
            console.error("네이버맵 API 로딩 타임아웃 (대장 단지)");
        }
    }, 100);
});

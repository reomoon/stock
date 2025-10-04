// main_tabs.js - 메인 탭 (Stock/부동산맵) 기능 관리

function initMainTabs() {
    const mainTabButtons = document.querySelectorAll('.main-tab-button');
    const mainTabContents = document.querySelectorAll('.main-tab-content');
    
    mainTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // 모든 메인 탭 버튼 비활성화
            mainTabButtons.forEach(btn => btn.classList.remove('active'));
            // 모든 메인 탭 콘텐츠 숨기기
            mainTabContents.forEach(content => content.classList.remove('active'));
            
            // 클릭된 탭 활성화
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // 부동산맵 탭이 선택되면 지도 초기화
            if (targetTab === 'realestate-tab') {
                setTimeout(() => {
                    console.log('부동산맵 탭 선택됨, 네이버맵 초기화 시작');
                    if (typeof initNaverMap === 'function') {
                        initNaverMap();
                    } else {
                        console.error('initNaverMap 함수를 찾을 수 없습니다.');
                    }
                }, 200);
            }
            
            console.log(`메인 탭 전환: ${targetTab}`);
        });
    });
}

// 서브 탭 (부동산 데이터/지도) 기능 관리
function initSubTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // 모든 서브 탭 버튼 비활성화
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // 모든 서브 탭 콘텐츠 숨기기
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 클릭된 탭 활성화
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // 지도 탭이 선택되면 지도 초기화
            if (targetTab === 'map-tab') {
                setTimeout(() => {
                    console.log('지도 탭 선택됨, 네이버맵 초기화 시작');
                    if (typeof initNaverMap === 'function') {
                        initNaverMap();
                    }
                }, 100);
            }
            
            console.log(`서브 탭 전환: ${targetTab}`);
        });
    });
}

// DOM 로딩 완료 후 탭 초기화
document.addEventListener('DOMContentLoaded', function() {
    initMainTabs();
    initSubTabs();
    console.log('메인 탭 스크립트 로드 완료');
});
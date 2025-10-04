// tabs.js - 탭 기능 관리

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // 모든 탭 버튼 비활성화
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // 모든 탭 콘텐츠 숨기기
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 클릭된 탭 활성화
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // 부동산맵 탭이 선택되면 지도 초기화
            if (targetTab === 'realestate-map-tab') {
                setTimeout(() => {
                    console.log('부동산맵 탭 선택됨, 지도 초기화 시작');
                    initNaverMap();
                }, 100);
            }
        });
    });
}

// DOM 로딩 완료 후 탭 초기화
document.addEventListener('DOMContentLoaded', initTabs);

console.log('탭 스크립트 로드 완료');
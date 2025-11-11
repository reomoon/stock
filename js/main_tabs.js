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

            // 모든 main-tab-content 숨기기
            mainTabContents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });

            // 해당 탭 내부의 섹션들만 보이게 (data-main-tab 속성 기반)
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.display = 'block';

                // 비슷한 섹션들이 다른 탭에 잘못 렌더링되는 경우를 방지하기 위해
                // 페이지에 있는 모든 섹션 중 data-main-tab 속성이 있으면 해당 값과
                // 현재 탭을 비교해 표시/숨김 처리합니다.
                document.querySelectorAll('section[data-main-tab]').forEach(sec => {
                    if (sec.getAttribute('data-main-tab') === targetTab.replace('-main-tab','')) {
                        sec.style.display = '';
                    } else {
                        sec.style.display = 'none';
                    }
                });
            }
            
            // 부동산 탭이 선택되면 매매지수 지도 초기화
            if (targetTab === 'realestate-main-tab') {
                setTimeout(() => {
                    console.log('부동산 탭 선택됨, 매매지수 지도 초기화');
                    if (typeof initNaverMap === 'function') {
                        initNaverMap();
                    } else {
                        console.error('initNaverMap 함수를 찾을 수 없습니다.');
                    }
                }, 200);
            }
            
            // 부동산맵 탭이 선택되면 대장 단지 지도 초기화
            if (targetTab === 'realestate-map-main-tab') {
                setTimeout(() => {
                    console.log('부동산맵 탭 선택됨, 대장 단지 지도 초기화');
                    if (typeof initApartmentPriceMap === 'function') {
                        initApartmentPriceMap();
                    } else {
                        console.error('initApartmentPriceMap 함수를 찾을 수 없습니다.');
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

// // 스와이프 탭 전환 기능
// let touchStartX = 0;
// let touchEndX = 0;

// function handleGesture() {
//     if (touchEndX < touchStartX - 50) {
//         // 오른쪽에서 왼쪽으로 스와이프 → 다음 탭
//         document.querySelector('.main-tab-button[data-tab="realestate-map-main-tab"]').click();
//     }
//     if (touchEndX > touchStartX + 50) {
//         // 왼쪽에서 오른쪽으로 스와이프 → 이전 탭
//         document.querySelector('.main-tab-button[data-tab="economy-main-tab"]').click();
//     }
// }

// document.addEventListener('touchstart', function(e) {
//     touchStartX = e.changedTouches[0].screenX;
//     // 표 내부에서 스와이프 시작 시 플래그 저장
//     let el = e.target;
//     let insideTable = false;
//     while (el) {
//         if (el.tagName === 'TABLE' || el.tagName === 'TD' || el.tagName === 'TH') {
//             insideTable = true;
//             break;
//         }
//         el = el.parentElement;
//     }
//     document._swipeInsideTable = insideTable;
// }, false);

// document.addEventListener('touchend', function(e) {
//     // 표 내부에서 시작된 스와이프는 무시
//     if (document._swipeInsideTable) {
//         document._swipeInsideTable = false;
//         return;
//     }
//     touchEndX = e.changedTouches[0].screenX;
//     handleGesture();
// }, false);
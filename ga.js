// Google Analytics 4 (G-ZW5EMNB1MV) - 사람들이 어디서 와서(인스타·검색·카톡 공유 등) 들어오는지와
// 설치·시작 버튼을 얼마나 누르는지만 본다. 앱 안의 행동은 PostHog 가 따로 잰다.
// 광고용 신호(Google 신호 · 광고 맞춤)는 끈다. 개인정보 처리방침 10. 자동 수집 장치 참고.
// 모든 페이지 <head> 에서 이 파일 하나만 불러온다 (gtag.js 는 시행 뒤에 여기서 붙인다).
// 개인정보 처리방침 1.3 시행 시각부터만 켠다 (그 전엔 쿠키도 안 만들고 아무것도 보내지 않음).
// 시행일을 바꾸면 여기와 privacy.html 14. 을 같이 바꾼다.
var BG_GA_START = new Date('2026-11-15T00:00:00+09:00');
var BG_GA_ON = new Date() >= BG_GA_START;
window.dataLayer = window.dataLayer || [];
function gtag() { if (BG_GA_ON) dataLayer.push(arguments); }
if (BG_GA_ON) {
  var bgTag = document.createElement('script');
  bgTag.async = true;
  bgTag.src = 'https://www.googletagmanager.com/gtag/js?id=G-ZW5EMNB1MV';
  document.head.appendChild(bgTag);
}
gtag('js', new Date());
gtag('config', 'G-ZW5EMNB1MV', { allow_google_signals: false, allow_ad_personalization_signals: false });

// 설치·시작으로 나가는 링크를 누르면 install_click 이벤트 (어디로 갔는지 install_target 으로 구분)
function bgInstallTarget(href) {
  if (/apps\.apple\.com|testflight\.apple\.com/.test(href)) return 'app_store';
  if (/play\.google\.com/.test(href)) return 'play_store';
  if (/\.apk(\?|#|$)/.test(href)) return 'apk';
  if (/\/\/app\.bogomagazine\.co\.kr/.test(href)) return 'webapp';
  return null;
}
document.addEventListener('click', function (e) {
  var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
  if (!a) return;
  var target = bgInstallTarget(a.href);
  if (target) gtag('event', 'install_click', { install_target: target, link_url: a.href });
}, true);

// 열리자마자 다른 주소로 넘기는 페이지(/start)용: 이벤트를 보낸 뒤 이동한다.
// GA 가 막혀 있거나 느려도 0.8초 뒤엔 무조건 이동한다.
function bgTrackAndGo(url) {
  if (!BG_GA_ON) { location.replace(url); return; }
  var gone = false;
  function go() { if (!gone) { gone = true; location.replace(url); } }
  gtag('event', 'install_click', { install_target: bgInstallTarget(url) || 'other', link_url: url, auto_redirect: true, event_callback: go });
  setTimeout(go, 800);
}

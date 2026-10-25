// 나타남 애니메이션 (앱 motion 규칙: 떠오르듯 한 번만. 동작 줄이기면 즉시 표시)
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (e) { io.observe(e); });
})();

// 플랫폼 탭 (설치 안내). 기기에 맞는 탭을 먼저 연다
(function () {
  var tabs = document.querySelectorAll('[role="tab"]');
  if (!tabs.length) return;
  function pick(id) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('aria-controls') === id;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      var p = document.getElementById(t.getAttribute('aria-controls'));
      if (p) p.hidden = !on;
    });
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* 무시 */ }
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { pick(t.getAttribute('aria-controls')); });
  });
  var fromHash = location.hash.replace('#', '');
  var isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  pick(fromHash === 'ios' || fromHash === 'android' ? fromHash : (isiOS ? 'ios' : 'android'));
})();

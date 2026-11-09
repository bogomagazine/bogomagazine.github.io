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

// ===== 4차 랜딩 · 정책 페이지 =====

// 상단바 로고: 메인에서는 맨 위로, 다른 페이지에서는 메인으로 (개발 메모 7번)
(function () {
  var onMain = !!document.getElementById('top');
  document.querySelectorAll('[data-home]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!onMain) return;
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try { history.replaceState(null, '', location.pathname); } catch (err) { /* 무시 */ }
    });
  });
})();

// 첫 호 무료 D-day: 띠와 ⑥ 카드가 같은 값. 마감 11/13 23:59:59 KST, 1초마다 갱신, 마감 후 "이벤트가 끝났어요"
(function () {
  var labels = document.querySelectorAll('[data-dday-label]');
  if (!labels.length) return;
  var DEADLINE = Date.UTC(2026, 10, 13, 14, 59, 59); // = 2026-11-13 23:59:59 KST
  var KST = 9 * 3600 * 1000, DAY = 86400000;
  var band = document.querySelector('[data-dday-band]');
  var card = document.querySelector('[data-dday-card]');
  var time = document.querySelector('[data-dday-time]');
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var timer;
  function tick() {
    var now = Date.now();
    var left = DEADLINE - now;
    if (left <= 0) {
      if (band) band.firstElementChild.textContent = '첫 호 무료 이벤트가 끝났어요';
      if (card) card.classList.add('ended');
      labels.forEach(function (el) { if (!band || !band.contains(el)) el.textContent = '이벤트가 끝났어요'; });
      if (time) time.hidden = true;
      clearInterval(timer);
      return;
    }
    // D-day 는 한국 날짜 기준: 마감일과 오늘의 날짜 차이 (당일이면 D-DAY)
    var days = Math.floor((DEADLINE + KST) / DAY) - Math.floor((now + KST) / DAY);
    var label = days > 0 ? 'D-' + days : 'D-DAY';
    labels.forEach(function (el) { el.textContent = label; });
    if (time) {
      var s = Math.floor(left / 1000);
      time.textContent = Math.floor(s / 86400) + '일 ' + pad(Math.floor(s / 3600) % 24) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60);
    }
  }
  tick();
  timer = setInterval(tick, 1000);
})();

// [첫 호 무료로 시작하기]: 휴대폰은 바로 웹앱으로, PC 는 QR 팝업 (Figma 랜딩페이지 2655:15053)
var WEBAPP_URL = 'https://app.bogomagazine.co.kr';
(function () {
  var dialog = document.getElementById('start');
  if (!dialog) return;
  var ua = navigator.userAgent || '';
  var isPhone = /Android|iPhone|iPod|iPad|Mobile/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var lastFocus = null;
  function open(trigger) {
    lastFocus = trigger || null;
    dialog.hidden = false;
    document.documentElement.classList.add('lp-lock');
    setTimeout(function () { dialog.querySelector('[data-close]').focus(); }, 0);
  }
  function close() {
    dialog.hidden = true;
    document.documentElement.classList.remove('lp-lock');
    if (location.hash === '#start' || location.hash === '#signup') { try { history.replaceState(null, '', location.pathname); } catch (e) { /* 무시 */ } }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll('[data-start]').forEach(function (a) {
    a.href = WEBAPP_URL;
    a.addEventListener('click', function (e) {
      if (isPhone) return; // 같은 창에서 바로 웹앱
      e.preventDefault(); open(a);
    });
  });
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog || e.target.closest('[data-close]')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (dialog.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(dialog.querySelectorAll('button, a[href]'), function (el) { return el.offsetParent !== null; });
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  // 정책 페이지에서 ./#start (옛 주소 ./#signup 포함) 로 들어오면
  if (location.hash === '#start' || location.hash === '#signup') {
    if (isPhone) location.replace(WEBAPP_URL); else open();
  }
})();

// (지금은 쓰지 않음 · 앱 출시 때 다시 쓰기) // 출시 알림 신청 팝업: [첫 호 무료로 시작하기] → ① 입력 → ② 완료
// 저장은 앱 서버 신청 API 로 한다. 주소가 생기면 SIGNUP_API_URL 에 넣는다 (백엔드 요청: 저장 · 같은 번호 중복 방지 · 누적 수)
var SIGNUP_API_URL = '';          // 예: 'https://api.bogomagazine.co.kr/launch-signups' (백엔드 확정 후)
var SIGNUP_COUNT_MIN = 50;        // 누적 신청 수는 이 수를 넘었을 때만 보여 준다 (기준 미정 · 제안값)
(function () {
  var dialog = document.getElementById('signup');
  if (!dialog) return;
  var formPop = dialog.querySelector('[data-step="form"]');
  var donePop = dialog.querySelector('[data-step="done"]');
  var form = formPop.querySelector('form');
  var phone = form.elements.phone;
  var err = document.getElementById('signup-phone-err');
  var submit = form.querySelector('[type="submit"]');
  var termsBtn = form.querySelector('[data-terms]');
  var terms = document.getElementById('signup-terms');
  var lastFocus = null;

  function digits(v) { return (v || '').replace(/\D/g, '').slice(0, 11); }
  function format(d) {
    if (d.length < 4) return d;
    if (d.length < 8) return d.slice(0, 3) + '-' + d.slice(3);
    if (d.length === 10) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
    return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
  }
  function phoneOk() { return /^01[016789]\d{7,8}$/.test(digits(phone.value)); }
  function platform() { var c = form.querySelector('[name="platform"]:checked'); return c ? c.value : ''; }
  // 백엔드 연결 전에는 신청 버튼을 막아 둔다 (SIGNUP_API_URL 이 생기면 자동으로 풀린다)
  var ready = !!SIGNUP_API_URL;
  var notReady = form.querySelector('[data-not-ready]');
  if (notReady) notReady.hidden = ready;
  function update() { submit.disabled = !ready || !(phoneOk() && platform() && form.elements.agree.checked); }
  function showErr(on, msg) {
    err.textContent = msg || '번호를 다시 확인해 주세요.';
    err.hidden = !on;
    phone.setAttribute('aria-invalid', on && !msg ? 'true' : 'false');
  }

  phone.addEventListener('input', function () {
    phone.value = format(digits(phone.value));
    if (phoneOk()) showErr(false);
    update();
  });
  phone.addEventListener('blur', function () { showErr(phone.value !== '' && !phoneOk()); });
  form.addEventListener('change', update);
  termsBtn.addEventListener('click', function () {
    var open = terms.hidden;
    terms.hidden = !open;
    termsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  function showCount(n) {
    dialog.querySelectorAll('[data-signup-count]').forEach(function (el) {
      var on = typeof n === 'number' && n >= SIGNUP_COUNT_MIN;
      el.hidden = !on;
      if (on) el.innerHTML = '지금까지 <b class="lp-brand">' + n.toLocaleString('ko-KR') + '가족</b>이 신청했어요';
    });
  }
  function fetchCount() {
    if (!SIGNUP_API_URL || !window.fetch) return;
    fetch(SIGNUP_API_URL + '/count').then(function (r) { return r.json(); })
      .then(function (j) { showCount(j && j.count); }).catch(function () { /* 숫자 없이 둔다 */ });
  }
  // 백엔드 연결 전에는 저장하지 않고 완료 화면만 보여 준다
  function send(data) {
    if (!SIGNUP_API_URL || !window.fetch) return Promise.resolve({ count: null });
    return fetch(SIGNUP_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submit.disabled) return;
    submit.disabled = true;
    submit.textContent = '보내는 중…';
    var d = digits(phone.value);
    send({ phone: d, platform: platform(), agreedAt: new Date().toISOString() }).then(function (res) {
      donePop.querySelector('[data-signup-phone]').textContent = format(d);
      showCount(res && res.count);
      formPop.hidden = true;
      donePop.hidden = false;
      donePop.querySelector('.lp-btn').focus();
    }, function () {
      showErr(true, '잠시 후 다시 시도해 주세요.');
    }).then(function () { submit.textContent = '출시 알림 받기'; update(); });
  });

  function open(trigger) {
    lastFocus = trigger || null;
    form.reset(); phone.value = ''; showErr(false);
    terms.hidden = true; termsBtn.setAttribute('aria-expanded', 'false');
    formPop.hidden = false; donePop.hidden = true; update();
    dialog.hidden = false;
    document.documentElement.classList.add('lp-lock');
    fetchCount();
    setTimeout(function () { phone.focus(); }, 0);
  }
  function close() {
    dialog.hidden = true;
    document.documentElement.classList.remove('lp-lock');
    if (location.hash === '#signup') { try { history.replaceState(null, '', location.pathname); } catch (e) { /* 무시 */ } }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll('[data-signup]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); open(a); });
  });
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog || e.target.closest('[data-close]')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (dialog.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    // 팝업 안에서만 초점이 돈다
    var pop = formPop.hidden ? donePop : formPop;
    var f = Array.prototype.filter.call(pop.querySelectorAll('button, input, a[href]'), function (el) { return !el.disabled && el.offsetParent !== null; });
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  // 정책 페이지 등에서 ./#signup 으로 들어오면 바로 연다
})();

// 정책 페이지: 지금 읽는 조항을 목차에 표시 + 모바일 표 → 카드 이름표
(function () {
  var toc = document.querySelector('.doc-toc');
  if (!toc) return;
  var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
  var heads = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var ticking = false;
  function mark() {
    ticking = false;
    var cur = 0;
    heads.forEach(function (h, i) { if (h && h.getBoundingClientRect().top <= 140) cur = i; });
    links.forEach(function (a, i) { if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(mark); } }, { passive: true });
  mark();
  document.querySelectorAll('.doc-text table').forEach(function (t) {
    var rows = t.querySelectorAll('tr');
    if (!rows.length) return;
    var head = rows[0].children;
    var allTh = Array.prototype.every.call(head, function (c) { return c.tagName === 'TH'; });
    if (!allTh || rows.length < 2) return;
    rows[0].classList.add('head-row');
    for (var r = 1; r < rows.length; r++) {
      Array.prototype.forEach.call(rows[r].children, function (c, j) { if (head[j]) c.setAttribute('data-label', head[j].textContent.trim()); });
    }
  });
})();

// ⑤ 잡지 넘겨보기: 표지 한 면 → 펼친 두 면 → 뒤표지 한 면. 버튼·면 클릭·좌우 밀기·방향키
(function () {
  var mag = document.querySelector('[data-flipbook]');
  if (!mag) return;
  var book = mag.querySelector('.mag-book');
  var leaves = mag.querySelectorAll('.mag-leaf');
  var prev = mag.querySelector('[data-flip-prev]');
  var next = mag.querySelector('[data-flip-next]');
  var count = mag.querySelector('[data-flip-count]');
  var labels = ['표지', '2 – 3면', '7 – 8면', '뒤표지'];
  var n = leaves.length, at = 0;
  function show() {
    leaves.forEach(function (l, i) {
      var on = i < at;
      l.classList.toggle('flipped', on);
      // 넘긴 장은 나중 것이 위, 안 넘긴 장은 앞 것이 위. 넘어가는 장은 잠시 맨 위
      l.style.zIndex = on ? i + 1 : n - i;
    });
    mag.setAttribute('data-at', at === 0 ? '0' : at === n ? 'end' : 'mid');
    prev.disabled = at === 0;
    next.disabled = at === n;
    count.textContent = labels[at];
  }
  function go(d) {
    var to = Math.max(0, Math.min(n, at + d));
    if (to === at) return;
    var leaf = leaves[d > 0 ? at : to];
    at = to;
    show();
    leaf.style.zIndex = n + 1;
    mag.classList.add('turning');
    clearTimeout(leaf._t);
    leaf._t = setTimeout(function () { mag.classList.remove('turning'); show(); }, 720);
  }
  prev.addEventListener('click', function () { go(-1); });
  next.addEventListener('click', function () { go(1); });
  var x0 = null;
  book.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
  book.addEventListener('pointerup', function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 30) { go(dx < 0 ? 1 : -1); return; }
    var r = book.getBoundingClientRect();
    go(e.clientX > r.left + r.width / 2 ? 1 : -1);
  });
  book.addEventListener('pointercancel', function () { x0 = null; });
  mag.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { go(1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { go(-1); e.preventDefault(); }
  });
  show();
})();

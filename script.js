(function () {
  var root = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear() + ' ';
  });

  // Condensing header
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('condensed', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var menuButton = document.querySelector('.menu-button');
  var nav = document.querySelector('.primary-nav');
  menuButton.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.textContent = open ? 'Close' : 'Menu';
  });

  // Dropdowns: two only, keyboard-operable, Escape-dismissible
  var toggles = Array.prototype.slice.call(document.querySelectorAll('.sub-toggle'));
  function closeAll(except) {
    toggles.forEach(function (t) {
      if (t === except) return;
      t.setAttribute('aria-expanded', 'false');
      document.getElementById(t.getAttribute('aria-controls')).classList.remove('open');
    });
  }
  toggles.forEach(function (t) {
    var menu = document.getElementById(t.getAttribute('aria-controls'));
    t.addEventListener('click', function () {
      var open = t.getAttribute('aria-expanded') !== 'true';
      closeAll(t);
      t.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('open', open);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = toggles.filter(function (t) { return t.getAttribute('aria-expanded') === 'true'; })[0];
    closeAll();
    if (open) open.focus();
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-item')) closeAll();
  });

  // Dated events take themselves down the day after they end
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  document.querySelectorAll('.events-area').forEach(function (area) {
    var left = 0;
    area.querySelectorAll('.event[data-ends]').forEach(function (ev) {
      var p = ev.getAttribute('data-ends').split('-');
      if (new Date(+p[0], +p[1] - 1, +p[2]) < today) ev.remove();
      else left += 1;
    });
    if (!left) {
      area.classList.add('is-empty');
      area.querySelector('.empty-state').classList.add('show');
    }
  });

  // Momence schedule loads only when a visitor reaches it
  var slot = document.getElementById('ribbon-schedule');
  function loadSchedule() {
    var s = document.createElement('script');
    s.type = 'module';
    s.async = true;
    s.setAttribute('host_id', '16657');
    s.setAttribute('teacher_ids', '[]');
    s.setAttribute('location_ids', '[]');
    s.setAttribute('tag_ids', '[]');
    s.src = 'https://momence.com/plugin/host-schedule/host-schedule.js';
    // The widget renders beside its own script tag
    slot.parentNode.insertBefore(s, slot.nextSibling);
    setTimeout(function () {
      if (!document.getElementById('momence-plugin-host-schedule')) {
        slot.parentNode.querySelector('.schedule-fallback').classList.add('show');
      }
    }, 10000);
  }
  if (slot) {
    if ('IntersectionObserver' in window) {
      var slotWatch = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { slotWatch.disconnect(); loadSchedule(); }
      }, { rootMargin: '400px' });
      slotWatch.observe(slot);
    } else {
      loadSchedule();
    }
  }

  // The settle and the rule, once each
  var targets = document.querySelectorAll('.settle, .heading');
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var watch = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      watch.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  targets.forEach(function (el) { watch.observe(el); });
})();

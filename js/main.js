/* Router, 16:9 scaling and the small bits of in-screen interaction. */
(function () {
  const stage = document.getElementById('stage');
  const viewport = document.getElementById('viewport');
  const byRoute = Object.fromEntries(SCREENS.map(s => [s.route, s]));
  let timer = null;

  /* ---------- scale the 1920 x 1080 stage to the window ---------- */
  function fit() {
    const w = window.innerWidth, h = window.innerHeight;
    const s = Math.min(w / 1920, h / 1080);
    stage.style.transform = `translate(${(w - 1920 * s) / 2}px, ${(h - 1080 * s) / 2}px) scale(${s})`;
  }
  window.addEventListener('resize', fit);

  /* ---------- routing ---------- */
  function current() {
    const r = location.hash.replace(/^#\/?/, '');
    return byRoute[r] ? r : 'today';
  }
  function render() {
    clearTimeout(timer);
    const route = current();
    const screen = byRoute[route];
    stage.innerHTML = screen.render();
    document.title = `${screen.name} · Front Desk Hub`;
    buildMenu(route);
    /* the "writing" draft finishes on its own, like the AI reply would */
    if (route === 'inbox/alex/writing') timer = setTimeout(() => navigate('inbox/alex'), 2600);
  }
  function navigate(route) {
    if (!route) return;
    if (current() === route) render(); else location.hash = '#/' + route;
  }
  window.addEventListener('hashchange', render);

  /* ---------- clicks ---------- */
  stage.addEventListener('click', e => {
    const goEl = e.target.closest('[data-go]');
    if (goEl) { e.preventDefault(); navigate(goEl.dataset.go); return; }
    const act = e.target.closest('[data-act]');
    if (!act || !act.dataset.act) return;
    const a = act.dataset.act;
    if (a === 'lang') {
      act.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === act));
    } else if (a === 'toggle') {
      act.classList.toggle('on');
    } else if (a === 'pick') {
      act.parentElement.querySelectorAll(`[data-group="${act.dataset.group}"]`).forEach(o => {
        const on = o === act;
        o.classList.toggle('selected', on);
        const tag = o.querySelector('.key');
        if (tag) tag.classList.toggle('accent', on);
      });
    } else if (a === 'chip') {
      act.parentElement.querySelectorAll(`[data-group="${act.dataset.group}"]`).forEach(o => {
        const on = o === act;
        o.classList.toggle('on', on);
        const has = o.querySelector('.ic');
        if (on && !has) o.insertAdjacentHTML('afterbegin', icon('check'));
        if (!on && has) has.remove();
      });
    } else if (a === 'task') {
      const on = !act.classList.contains('on');
      act.classList.toggle('on', on);
      act.innerHTML = on ? icon('check') : '';
      const row = act.closest('.task-row');
      row.querySelector('[data-task-text]').classList.toggle('c-mut', on);
      row.querySelector('[data-task-status]').innerHTML = on ? pill('Done', 'accent') : pill('To do');
    }
  });

  /* search box in the inbox filters chats by guest name */
  stage.addEventListener('input', e => {
    if (!e.target.matches('[data-search]')) return;
    const q = e.target.value.trim().toLowerCase();
    stage.querySelectorAll('.chat-row').forEach(r => { r.style.display = !q || r.dataset.name.includes(q) ? '' : 'none'; });
  });

  /* ---------- screens menu, for presenting ---------- */
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');
  toggle.innerHTML = icon('grid') + 'Screens';
  toggle.addEventListener('click', () => { menu.classList.toggle('open'); toggle.classList.toggle('open'); });
  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) { menu.classList.remove('open'); toggle.classList.remove('open'); }
  });
  function buildMenu(route) {
    let html = '', group = '';
    SCREENS.forEach((s, i) => {
      if (s.group !== group) { group = s.group; html += `<h3>${group}</h3>`; }
      html += `<a href="#/${s.route}" class="${s.route === route ? 'on' : ''}"><span class="k">${String(i + 1).padStart(2, '0')}</span>${s.name}</a>`;
    });
    html += `<p class="hint">Arrow keys step through every screen. Press M to open this list. The button sits in the bottom left corner.</p>`;
    menu.innerHTML = html;
  }
  menu.addEventListener('click', e => { if (e.target.closest('a')) { menu.classList.remove('open'); toggle.classList.remove('open'); } });

  /* arrow keys step through the screens in order */
  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, [contenteditable="true"]')) return;
    const i = SCREENS.findIndex(s => s.route === current());
    if (e.key === 'ArrowRight') navigate(SCREENS[(i + 1) % SCREENS.length].route);
    if (e.key === 'ArrowLeft') navigate(SCREENS[(i - 1 + SCREENS.length) % SCREENS.length].route);
    if (e.key === 'Escape') { menu.classList.remove('open'); toggle.classList.remove('open'); }
    if (e.key === 'm' || e.key === 'M') { menu.classList.toggle('open'); toggle.classList.toggle('open'); }
  });

  fit();
  render();
  /* show the screens button for a moment on load so people know it is there */
  toggle.classList.add('peek');
  setTimeout(() => toggle.classList.remove('peek'), 3500);
  viewport.removeAttribute('hidden');
})();

/* Shared building blocks, one function per Figma component. Each returns an HTML string. */

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const go = route => route ? ` data-go="${route}"` : '';

const CH = {
  LINE: 'line', WhatsApp: 'whatsapp', 'Booking platform': 'booking', 'Call note': 'call'
};

function keyTag(n, tone = '') {
  return `<span class="key ${tone}"><span class="ring"></span>${esc(n)}</span>`;
}

function pill(text, tone = '') {
  return `<span class="pill ${tone}"><span class="dot"></span>${esc(text)}</span>`;
}

function btn(label, kind = 'secondary', opts = {}) {
  const cls = ['btn', kind, opts.cls || ''].join(' ');
  const attrs = (opts.go ? go(opts.go) : '') + (opts.act ? ` data-act="${opts.act}"` : '') + (kind === 'disabled' ? ' disabled aria-disabled="true"' : '');
  return `<button class="${cls}"${attrs}>${opts.icon ? icon(opts.icon) : ''}${esc(label)}</button>`;
}

function channel(name) {
  return `<span class="channel"><span class="dot ch-${CH[name]}"></span>${esc(name)}</span>`;
}

function avatar(initials, sm = false) {
  return `<span class="avatar${sm ? ' sm' : ''}">${esc(initials)}</span>`;
}

/* Language switch. Pass a route for the other language to follow the Figma link,
   otherwise the switch just toggles in place. */
function langSwitch(active, routes = {}) {
  const b = lang => {
    const on = active === lang;
    const attr = on ? '' : (routes[lang] ? go(routes[lang]) : ` data-act="lang"`);
    return `<button class="${on ? 'on' : ''}"${attr}>${lang}</button>`;
  };
  return `<span class="lang">${b('EN')}${b('TH')}</span>`;
}

function toast(text, undoRoute) {
  return `<div class="toast" role="status">${icon('circle-check')}<span>${esc(text)}</span><button${go(undoRoute)}>Undo</button></div>`;
}

function inlineNote(text) {
  return `<div class="inline-note">${icon('circle-alert')}<span>${esc(text)}</span></div>`;
}

/* ---------- Sidebar ---------- */
function sidebar(active, counts = {}) {
  const c = Object.assign({ inbox: 6, rooms: 1, team: 3 }, counts);
  const item = (key, label, ic, route, trailing) => {
    const on = active === key;
    return `<button class="nav-item${on ? ' active' : ''}"${on ? '' : go(route)}>${icon(ic)}<span>${label}</span><span class="spacer"></span>${trailing || ''}</button>`;
  };
  const plain = n => `<span class="mono t12 c-mut">${n}</span>`;
  const badge = n => n ? `<span class="count-badge">${n}</span>` : '';
  const chan = (name, n) => `<div class="channel-row"><span class="dotbox"><span class="dot ch-${CH[name]}"></span></span><span>${name}</span><span class="spacer"></span><span class="mono t12 c-mut">${n}</span></div>`;
  return `
  <aside class="sidebar">
    <div class="property">
      <div class="mark">${icon('key')}</div>
      <div class="col"><span class="t14 w5">Baan Mali</span><span class="t12 c-mut">12 rooms</span></div>
    </div>
    <nav class="nav">
      ${item('today', 'Today', 'sun', 'today')}
      ${item('inbox', 'Inbox', 'inbox', 'inbox/alex', plain(c.inbox))}
      ${item('rooms', 'Rooms', 'rooms', 'rooms', badge(c.rooms))}
      ${item('team', 'Team', 'users', 'team/schedule', badge(c.team))}
    </nav>
    <div class="channels">
      <div class="label t12 c-mut">Channels</div>
      ${chan('LINE', 3)}${chan('WhatsApp', 3)}${chan('Booking platform', 3)}${chan('Call note', 1)}
    </div>
    <div class="spacer"></div>
    <div class="signed-in">
      ${avatar('N')}
      <div class="col"><span class="t13 w5">Nok</span><span class="t12 c-mut">Front desk manager</span></div>
    </div>
  </aside>`;
}

function shell(active, content, counts) {
  return `<div class="app">${sidebar(active, counts)}<main class="main">${content}</main></div>`;
}

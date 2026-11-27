/* Shared building blocks, one function per Figma component. Each returns an HTML string. */

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const go = route => route ? ` data-go="${esc(route)}"` : '';
const dataAttrs = (d = {}) => Object.entries(d).map(([k, v]) => ` data-${k}="${esc(v)}"`).join('');
const act = (name, d = {}) => ` data-act="${name}"${dataAttrs(d)}`;

const CH = {
  LINE: 'line', WhatsApp: 'whatsapp', 'Booking platform': 'booking', 'Call note': 'call'
};

function keyTag(n, tone = '') {
  return `<span class="key ${tone}"><span class="ring"></span>${esc(n)}</span>`;
}

function pill(text, tone = '') {
  return `<span class="pill ${tone}"><span class="dot"></span>${esc(text)}</span>`;
}

/* opts: go, act, data, cls, icon, disabled, id */
function btn(label, kind = 'secondary', opts = {}) {
  const disabled = kind === 'disabled' || opts.disabled;
  const cls = ['btn', disabled ? 'disabled' : kind, opts.cls || ''].join(' ');
  let attrs = '';
  if (!disabled) attrs += (opts.go ? go(opts.go) : '') + (opts.act ? act(opts.act, opts.data) : '');
  else attrs += ' disabled aria-disabled="true"';
  return `<button class="${cls}"${attrs}>${opts.icon ? icon(opts.icon) : ''}${esc(label)}</button>`;
}

function channel(name) {
  return `<span class="channel"><span class="dot ch-${CH[name]}"></span>${esc(name)}</span>`;
}

function avatar(initials, sm = false) {
  return `<span class="avatar${sm ? ' sm' : ''}">${esc(initials)}</span>`;
}

/* EN and TH switch. Each button carries the action and its language. */
function langSwitch(active, actName, data = {}) {
  const b = lang => `<button class="${active === lang ? 'on' : ''}"${active === lang ? '' : act(actName, Object.assign({ lang }, data))} aria-pressed="${active === lang}">${lang}</button>`;
  return `<span class="lang">${b('EN')}${b('TH')}</span>`;
}

function inlineNote(text, tone = '') {
  return `<div class="inline-note ${tone}">${icon('circle-alert')}<span>${esc(text)}</span></div>`;
}

/* ---------- Sidebar ---------- */
function sidebar(active) {
  const c = counts();
  const open = S.chats.filter(x => !x.done);
  const item = (key, label, ic, route, trailing) => {
    const on = active === key;
    return `<button class="nav-item${on ? ' active' : ''}"${go(route)}>${icon(ic)}<span>${label}</span><span class="spacer"></span>${trailing || ''}</button>`;
  };
  const plain = n => `<span class="mono t12 c-mut">${n}</span>`;
  const badge = n => n ? `<span class="count-badge">${n}</span>` : '';
  const chan = name => {
    const n = open.filter(x => x.ch === name).length;
    const on = active === 'inbox' && U.channel === name;
    return `<button class="channel-row${on ? ' on' : ''}"${act('channel', { ch: name })}><span class="dotbox"><span class="dot ch-${CH[name]}"></span></span><span>${name}</span><span class="spacer"></span><span class="mono t12 c-mut">${n}</span></button>`;
  };
  return `
  <aside class="sidebar">
    <div class="property">
      <div class="mark">${icon('key')}</div>
      <div class="col"><span class="t14 w5">Baan Mali</span><span class="t12 c-mut">12 rooms</span></div>
    </div>
    <nav class="nav">
      ${item('today', 'Today', 'sun', 'today')}
      ${item('inbox', 'Inbox', 'inbox', 'inbox', plain(c.inbox))}
      ${item('rooms', 'Rooms', 'rooms', 'rooms', badge(c.rooms))}
      ${item('team', 'Team', 'users', 'team/schedule', badge(c.team))}
    </nav>
    <div class="channels">
      <div class="label t12 c-mut">Channels</div>
      ${chan('LINE')}${chan('WhatsApp')}${chan('Booking platform')}${chan('Call note')}
    </div>
    <div class="spacer"></div>
    <div class="signed-in">
      ${avatar('N')}
      <div class="col"><span class="t13 w5">Nok</span><span class="t12 c-mut">Front desk manager</span></div>
    </div>
  </aside>`;
}

function shell(active, content, extra = '') {
  return `<div class="app">${sidebar(active)}<main class="main">${content}</main>${extra}</div>`;
}

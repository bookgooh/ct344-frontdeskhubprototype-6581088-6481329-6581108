/* Every Figma frame on the Rebuild page is one route here.
   Links follow the prototype connections set up in Figma. */

/* =====================================================================
   TODAY
   ===================================================================== */
function screenToday() {
  const stat = (label, value, detail, alert) => `
    <div class="stat"><span class="t13 c-sec">${label}</span><span class="mono t28 w5 ${alert ? 'c-alert' : ''}">${value}</span><span class="t12 c-mut">${detail}</span></div>`;
  const ny = (lead, title, detail, pillHtml, label, route) => `
    <div class="ny-row"><div class="lead">${lead}</div>
      <div class="col grow" style="gap:2px"><span class="t14 w5">${title}</span><span class="t12 c-mut">${detail}</span></div>
      ${pillHtml}${btn(label, 'secondary', { cls: 'w96', go: route })}</div>`;
  const hk = (room, tone, who, detail, p) => `
    <div class="list-row">${keyTag(room, tone)}<div class="col"><span class="t13 w5">${who}</span><span class="t12 c-mut">${detail}</span></div><span class="spacer"></span>${p}</div>`;
  const arr = (time, room, who, detail, p) => `
    <div class="list-row"><span class="mono t12 w5 c-sec">${time}</span>${keyTag(room)}<div class="col"><span class="t13 w5">${who}</span><span class="t12 c-mut">${detail}</span></div><span class="spacer"></span>${p}</div>`;

  return shell('today', `
  <div class="page">
    <div class="page-head">
      <div><div class="sub">Thu 12 Nov</div><h1>Today</h1></div>
      <span class="spacer"></span>${btn('Open room board', 'secondary', { go: 'rooms' })}
    </div>
    <div class="card counts">
      ${stat('Waiting on you', '6', '2 have waited over 1 hour')}
      ${stat('Arrivals today', '3', 'First check in at 14:00')}
      ${stat('Booked twice', '1', 'Room 07 on Sat 14 Nov', true)}
      ${stat('Tasks left', '7', '2 of 5 rooms ready')}
    </div>
    <div class="today-body">
      <div class="grow">
        <div class="card">
          <div class="section-head"><span class="t15 w5">Needs you</span><span class="spacer"></span><span class="mono t12 c-mut">6 open</span></div>
          ${ny(keyTag('07', 'alert'), 'Booking request from Mia Laurent', 'LINE · 19 to 21 Nov · 3 guests', pill('2 to fix', 'alert'), 'Review', 'inbox/mia')}
          ${ny(keyTag('04'), 'Booking request from Noor Haddad', 'WhatsApp · 15 to 17 Nov · 2 guests', pill('All clear', 'accent'), 'Review', 'inbox/noor')}
          ${ny(keyTag('07', 'alert'), 'Room 07 is booked twice', 'Kenji Sato and Khun Pim on Sat 14 Nov', pill('Overlap', 'alert'), 'Fix', 'rooms/overlap')}
          ${ny(icon('message'), 'Alex Morgan is waiting for a reply', 'WhatsApp · asked about check in time', pill('1 h 20 m', 'wait'), 'Open chat', 'inbox/alex/writing')}
          ${ny(icon('message'), 'Khun Pim is waiting for a reply', 'LINE · wants a second room', pill('1 h 05 m', 'wait'), 'Open chat', 'inbox/pim')}
          ${ny(keyTag('12'), 'Room 12 is assigned to Arm', 'Arm is off today', pill('Off shift', 'alert'), 'Reassign', 'team/floors')}
        </div>
      </div>
      <div class="today-right">
        <div class="card">
          <div class="row" style="padding:16px 20px 8px"><span class="t15 w5">Housekeeping</span><span class="spacer"></span><span class="mono t12 c-mut">2 of 5 ready</span></div>
          <div style="padding:4px 20px 12px"><div class="progress"><span style="width:128px"></span></div></div>
          ${hk('04', 'accent', 'Dao', 'Alex Morgan at 14:00', pill('Ready', 'accent'))}
          ${hk('01', 'accent', 'Dao', 'Checked out 11:00', pill('Ready', 'accent'))}
          ${hk('09', '', 'Ploy', 'Chen family at 15:00', pill('Cleaning', 'wait'))}
          ${hk('11', '', 'Ploy', 'Khun Nida at 18:30', pill('To do'))}
          ${hk('07', '', 'Ploy', 'Kenji Sato tomorrow', pill('To do'))}
        </div>
        <div class="card">
          <div class="row" style="padding:16px 20px 8px"><span class="t15 w5">Arrivals today</span><span class="spacer"></span><span class="mono t12 c-mut">3</span></div>
          ${arr('14:00', '04', 'Alex Morgan', 'WhatsApp · 2 guests', pill('Checked in', 'accent'))}
          ${arr('15:00', '09', 'Chen family', 'Booking platform · 4 guests', pill('Not yet'))}
          ${arr('18:30', '11', 'Khun Nida', 'LINE · 1 guest', pill('Not yet'))}
        </div>
      </div>
    </div>
  </div>`);
}

/* =====================================================================
   INBOX
   ===================================================================== */
const CHATS = [
  { id: 'mia', name: 'Mia Laurent', ini: 'ML', time: '2 min', preview: 'Hi, do you have a room for 3 people from 19 to 21 Nov?', ch: 'LINE', pill: ['Request', 'alert'], route: 'inbox/mia' },
  { id: 'noor', name: 'Noor Haddad', ini: 'NH', time: '8 min', preview: 'Booking request for 15 to 17 Nov, 2 guests', ch: 'WhatsApp', pill: ['Request', 'accent'], route: 'inbox/noor' },
  { id: 'alex', name: 'Alex Morgan', ini: 'AM', time: '1 h 20 m', preview: 'We land at 11 today. Can we check in early?', ch: 'WhatsApp', pill: ['Draft ready', 'wait'], route: 'inbox/alex' },
  { id: 'pim', name: 'Khun Pim', ini: 'KP', time: '1 h 05 m', preview: 'ขอจองเพิ่มอีกห้องได้ไหมคะ', ch: 'LINE', pill: ['Draft ready', 'wait'], route: 'inbox/pim' },
  { id: 'kenji', name: 'Kenji Sato', ini: 'KS', time: '42 min', preview: 'Is there an airport pickup on Friday?', ch: 'Booking platform', pill: ['Draft ready', 'wait'], route: 'inbox/kenji' },
  { id: 'somchai', name: 'Khun Somchai', ini: 'KS', time: '25 min', preview: 'Wants dinner moved to 19:00', ch: 'Call note', pill: ['Needs reply', ''], route: null }
];

function chatList(selected, overrides = {}, filters = {}) {
  const f = Object.assign({ open: 6, requests: 2, drafts: 3, done: 4 }, filters);
  const rows = CHATS.map(c => {
    const o = Object.assign({}, c, overrides[c.id] || {});
    const sel = o.id === selected;
    return `<button class="chat-row${sel ? ' selected' : ''}" data-name="${esc(o.name.toLowerCase())}"${sel ? '' : go(o.route)}>
      ${avatar(o.ini)}
      <div class="body">
        <div class="row" style="gap:8px"><span class="t14 w5 nowrap">${o.name}</span><span class="spacer"></span><span class="mono t12 c-mut nowrap">${o.time}</span></div>
        <div class="preview">${esc(o.preview)}</div>
        <div class="row" style="gap:8px">${channel(o.ch)}<span class="spacer"></span>${pill(o.pill[0], o.pill[1])}</div>
      </div>
    </button>`;
  }).join('');
  const tab = (label, n, on) => `<span class="ftab${on ? ' on' : ''}">${label}<span class="n">${n}</span></span>`;
  return `
  <section class="chat-list">
    <div class="list-head">
      <div class="row"><span class="t18 w5">Inbox</span><span class="spacer"></span><span class="mono t12 c-mut">${f.open} open</span></div>
      <label class="search">${icon('search')}<input type="search" placeholder="Search guests" data-search aria-label="Search guests"></label>
      <div class="filters">${tab('Open', f.open, true)}${tab('Requests', f.requests)}${tab('Drafts', f.drafts)}${tab('Done', f.done)}</div>
    </div>
    <div class="chat-rows">${rows}</div>
  </section>`;
}

function threadHead(ini, name, ch) {
  return `<div class="thread-head">${avatar(ini)}<div class="col"><span class="t15 w5">${name}</span>${channel(ch)}</div><span class="spacer"></span>${btn('Mark done')}</div>`;
}

/* message helpers */
const M = {
  day: (t = 'Today') => `<div class="day-label">${t}</div>`,
  inn: (text, time, translated) => `<div class="msg"><div class="bubble"><p class="text">${esc(text)}</p>${translated ? `<p class="t12 c-mut">${esc(translated)}</p>` : ''}<span class="time">${time}</span></div></div>`,
  out: (text, time, label, translated) => `<div class="msg out"><div class="bubble sent">${label ? `<span class="t12 c-mut">${label}</span>` : ''}<p class="text">${esc(text)}</p>${translated ? `<p class="t12 c-mut">${esc(translated)}</p>` : ''}<span class="time">${time}</span></div></div>`,
  request: (ref, line, p) => `<div class="msg"><div class="req-card"><div class="row" style="gap:8px;width:100%">${icon('bed', 'c-sec')}<span class="t13 w5">Booking request</span><span class="spacer"></span><span class="mono t12 c-mut">${ref}</span></div><span class="t13 c-sec">${line}</span>${p}</div></div>`,
  offer: (ic, title, sub, cta, p) => `<div class="msg out"><div class="offer-card"><div class="row" style="gap:10px"><span class="ibox">${icon(ic)}</span><div class="col"><span class="t14 w5">${title}</span><span class="t12 c-mut">${sub}</span></div></div><span class="cta">${cta}</span>${p || ''}</div></div>`,
  roomOffer: (room, title, sub, cta, p) => `<div class="msg out"><div class="offer-card"><div class="row" style="gap:10px">${keyTag(room, 'accent')}<div class="col"><span class="t14 w5">${title}</span><span class="t12 c-mut">${sub}</span></div></div><span class="cta">${cta}</span>${p || ''}</div></div>`
};

function replyBox() {
  return `<div class="composer"><div class="reply-box"><input placeholder="Write a reply" aria-label="Write a reply"><button class="offer-btn">${icon('bed')}Offer</button><button class="send" aria-label="Send">${icon('send')}</button></div></div>`;
}

const OFFER_ICONS = { 'Book another room': 'bed', 'Check in online': 'key', 'Taxi from airport': 'arrow-right' };
function offerChip(label, on) {
  return `<button class="offer-chip${on ? ' on' : ''}" data-act="toggle">${icon(OFFER_ICONS[label] || 'bed')}${label}</button>`;
}

/* AI draft card. state is ready, writing or editing. */
function draftCard({ state = 'ready', text, note, lang = 'EN', langRoutes = {}, chips, ghost, ghostGo, approveGo }) {
  const pillHtml = state === 'writing' ? pill('Writing', 'wait') : state === 'editing' ? pill('Editing') : pill('Not sent');
  let body;
  if (state === 'writing') body = `<div class="skeleton"><span style="width:100%"></span><span style="width:78%"></span><span style="width:45%"></span></div>`;
  else if (state === 'editing') body = `<div class="editor" contenteditable="true" spellcheck="false">${esc(text)}</div>`;
  else body = `<p class="text">${esc(text)}</p>`;
  const approve = state === 'writing' ? btn('Approve and send', 'disabled') : btn('Approve and send', 'primary', { go: approveGo });
  return `
  <div class="draft">
    <div class="row" style="gap:8px">${icon('pencil', 'c-acc')}<span class="t13 w5">Draft reply</span>${pillHtml}<span class="spacer"></span>${langSwitch(lang, langRoutes)}</div>
    ${body}
    ${note ? `<p class="t12 c-mut">${esc(note)}</p>` : ''}
    <div class="row${state === 'writing' ? ' dim' : ''}" style="gap:8px"><span class="t12 c-mut">Add to message</span>${chips.map(c => offerChip(c[0], c[1])).join('')}</div>
    <div class="row" style="gap:8px"><span class="t12 c-mut">Nothing is sent until you approve</span><span class="spacer"></span>${btn(ghost, 'ghost', { go: ghostGo })}${approve}</div>
  </div>`;
}

function detailRow(label, value, opt = {}) {
  let v;
  if (opt.tag) v = `<span class="row" style="gap:8px"><span class="w5">${value}</span>${keyTag(opt.tag, opt.tone || '')}</span>`;
  else v = `<span class="${opt.mono ? 'mono ' : ''}w5">${value}</span>`;
  return `<div class="detail-row"><span class="c-sec">${label}</span><span class="spacer"></span>${v}</div>`;
}
function checkItem(text, done) {
  return `<div class="check-item">${done ? icon('circle-check', 'c-acc') : icon('clock', 'c-mut')}<span class="${done ? '' : 'c-sec'}">${text}</span></div>`;
}
function hotelNote() {
  return `<div style="padding:8px 20px"><div class="note-box"><span class="t12 c-mut">Hotel note</span><span class="t13">The front desk is open until midnight.</span></div></div>`;
}

function inbox(selected, { listOverrides, filters, thread, panel, toastHtml }) {
  return shell('inbox', `
  <div class="inbox">
    ${chatList(selected, listOverrides, filters)}
    <section class="thread">${thread}</section>
    ${panel}
  </div>`) .replace('</main></div>', `</main>${toastHtml || ''}</div>`);
}

/* ---------- Alex Morgan ---------- */
const ALEX_DRAFT = 'Hi Alex, check in starts at 14:00. If you arrive earlier you can leave your bags with us and we will message you as soon as Room 04 is ready. You can also check in online now to save time at the desk.';

function alexPanel() {
  return `
  <aside class="panel">
    <div class="panel-head"><span class="t15 w5">Stay</span><span class="spacer"></span>${pill('Confirmed', 'accent')}</div>
    <div style="padding:16px 20px">
      ${detailRow('Room', 'Deluxe', { tag: '04' })}
      ${detailRow('Dates', '12 to 14 Nov', { mono: true })}
      ${detailRow('Nights', '2')}
      ${detailRow('Guests', '2')}
      ${detailRow('Booked through', 'WhatsApp')}
      ${detailRow('Ref', '2036', { mono: true })}
    </div>
    <div class="panel-sec"><span class="t13 w5">Check in</span>${checkItem('Passport details', true)}${checkItem('Arrival time, 14:00', true)}${checkItem('Payment at desk', false)}</div>
    ${hotelNote()}
  </aside>`;
}
function alexThread(composer, sent) {
  return threadHead('AM', 'Alex Morgan', 'WhatsApp') + `
    <div class="messages">${M.day()}${M.inn('Hi, we are booked from today. Our flight lands at 11:00.', '12:38')}${M.inn('We land at 11 today. Can we check in early?', '12:41')}${sent ? M.out(ALEX_DRAFT, '14:02', 'Sent by Nok') : ''}</div>
    ${composer}`;
}
const ALEX_CHIPS = [['Book another room', false], ['Check in online', true]];

function screenAlex(state) {
  if (state === 'sent') {
    return inbox('alex', {
      listOverrides: { alex: { time: '14:02', pill: ['Replied', ''] } }, filters: { drafts: 2 },
      thread: alexThread(replyBox(), true), panel: alexPanel(),
      toastHtml: toast('Reply sent to Alex on WhatsApp', 'inbox/alex')
    });
  }
  const cfg = {
    ready: { ghost: 'Edit', ghostGo: 'inbox/alex/editing' },
    writing: { ghost: 'Stop', ghostGo: 'inbox/alex' },
    editing: { ghost: 'Cancel', ghostGo: 'inbox/alex' }
  }[state];
  const composer = `<div class="composer">${draftCard(Object.assign({ state, text: ALEX_DRAFT, chips: ALEX_CHIPS, approveGo: 'inbox/alex/sent' }, cfg))}</div>`;
  return inbox('alex', { thread: alexThread(composer), panel: alexPanel() });
}

/* ---------- Kenji Sato ---------- */
const KENJI_DRAFT = 'Hi Kenji, thank you for asking. We are sorry, but the hotel does not offer airport pickup. A taxi from Suvarnabhumi is the easiest way to reach us, and we can write our address in Thai for your driver. We look forward to welcoming you on Friday 13 Nov.';

function screenKenji(state = 'ready') {
  const msgs = M.day() + M.inn('Hello, we land at Suvarnabhumi on Friday 13 Nov at 09:40.', '13:17') + M.inn('Is there an airport pickup on Friday?', '13:19');
  let thread, extra = {};
  if (state === 'sent') {
    thread = threadHead('KS', 'Kenji Sato', 'Booking platform') + `<div class="messages">${msgs}${M.out(KENJI_DRAFT, '14:02', 'Sent by Nok')}</div>${replyBox()}`;
    extra = { listOverrides: { kenji: { time: '14:02', pill: ['Replied', ''] } }, filters: { drafts: 2 }, toastHtml: toast('Reply sent to Kenji on Booking platform', 'inbox/kenji') };
  } else {
    const cfg = state === 'editing' ? { ghost: 'Cancel', ghostGo: 'inbox/kenji' } : { ghost: 'Edit', ghostGo: 'inbox/kenji/editing' };
    thread = threadHead('KS', 'Kenji Sato', 'Booking platform') + `
    <div class="messages">${msgs}</div>
    <div class="composer">${draftCard(Object.assign({ state, text: KENJI_DRAFT, chips: [['Taxi from airport', true], ['Check in online', false]], approveGo: 'inbox/kenji/sent' }, cfg))}</div>`;
  }
  const panel = `
  <aside class="panel">
    <div class="panel-head"><span class="t15 w5">Stay</span><span class="spacer"></span>${pill('Booked first', 'accent')}</div>
    <div style="padding:16px 20px">
      ${detailRow('Room', 'Deluxe', { tag: '07' })}
      ${detailRow('Dates', '13 to 16 Nov', { mono: true })}
      ${detailRow('Nights', '3')}
      ${detailRow('Guests', '2')}
      ${detailRow('Booked through', 'Booking platform')}
      ${detailRow('Ref', '2031', { mono: true })}
    </div>
    <div class="panel-sec"><span class="t13 w5">Check in</span>${checkItem('Passport details', false)}${checkItem('Arrival time, Fri 11:00', false)}${checkItem('Paid on booking platform', true)}</div>
    ${hotelNote()}
  </aside>`;
  return inbox('kenji', Object.assign({ thread, panel }, extra));
}

/* ---------- Khun Pim ---------- */
const PIM_TH = 'ได้ค่ะคุณพิม เลือกห้องจากลิงก์ด้านล่างได้เลยค่ะ และเช็คอินออนไลน์ล่วงหน้าได้ค่ะ';
const PIM_EN = 'Yes, Khun Pim. You can pick a room from the link below and check in online ahead.';

function pimPanel(sent) {
  const offerRow = (name, status) => `<div class="row" style="height:32px"><span class="t13 c-sec">${name}</span><span class="spacer"></span><span class="mono t12 c-mut">${status}</span></div>`;
  return `
  <aside class="panel">
    <div class="panel-head"><span class="t15 w5">Stay</span><span class="spacer"></span>${pill('Booked twice', 'alert')}</div>
    <div style="padding:16px 20px 0">
      <div class="overlap-note">${icon('alert')}<div class="col" style="gap:2px"><span class="t13 w5">Room 07 is also held by Kenji Sato on 14 Nov</span><span class="t12">Fix it on the room board before she arrives</span></div></div>
    </div>
    <div style="padding:8px 20px">
      ${detailRow('Room', 'Deluxe', { tag: '07', tone: 'alert' })}
      ${detailRow('Dates', '14 to 16 Nov')}
      ${detailRow('Guests', '2')}
      ${detailRow('Booked through', 'LINE')}
      ${detailRow('Ref', '2038')}
    </div>
    <div class="panel-sec">
      <div class="row"><span class="t13 w5">Check in</span><span class="spacer"></span><span class="mono t12 c-mut">${sent ? '1 of 3' : '0 of 3'}</span></div>
      ${sent ? checkItem('Opened check in link', true) : checkItem('Check in link opened', false)}${checkItem('Passport details', false)}${checkItem('Arrival time', false)}
    </div>
    <div class="panel-sec">
      <span class="t13 w5">Offers in this chat</span>
      ${offerRow('Book another room', sent ? 'Not opened' : 'Not sent')}
      ${offerRow('Check in online', sent ? 'Opened 13:15' : 'Not sent')}
    </div>
    <div style="padding:8px 20px">${btn('Open room board', 'secondary', { cls: 'full', go: 'rooms/overlap' })}</div>
  </aside>`;
}

function screenPim(state) {
  const first = M.inn('ขอจองเพิ่มอีกห้องได้ไหมคะ วันที่ 14 ถึง 16 พ.ย. สำหรับเพื่อน 2 คน', '12:07', 'Translated. Can I book one more room, 14 to 16 Nov, for 2 friends?');
  if (state === 'sent') {
    const thread = threadHead('KP', 'Khun Pim', 'LINE') + `
      <div class="messages">${M.day()}${first}
        ${M.out(PIM_TH, '13:12', '', 'Sent in Thai. You can pick a room from the link below and check in online ahead.')}
        ${M.offer('bed', 'Book another room', 'Deluxe or Standard, 14 to 16 Nov', 'Choose a room', pill('Sent 13:12, not opened'))}
        ${M.offer('key', 'Check in online', 'Booking 2038, Room 07', 'Start check in', pill('Opened 13:15', 'accent'))}
      </div>${replyBox()}`;
    return inbox('pim', { listOverrides: { pim: { time: '13:12', pill: ['Offers sent', ''] } }, filters: { drafts: 2 }, thread, panel: pimPanel(true) });
  }
  /* state is th, en, editing (Thai) or en-editing */
  const th = !state.startsWith('en');
  const editing = state.endsWith('editing');
  const base = th ? 'inbox/pim' : 'inbox/pim/en';
  const thread = threadHead('KP', 'Khun Pim', 'LINE') + `
    <div class="messages">${M.day()}${first}</div>
    <div class="composer">${draftCard({
      state: editing ? 'editing' : 'ready',
      text: th ? PIM_TH : PIM_EN,
      note: th ? 'In English. ' + PIM_EN : 'Khun Pim wrote in Thai. Switch to TH to send this in Thai.',
      lang: th ? 'TH' : 'EN',
      langRoutes: th ? { EN: editing ? 'inbox/pim/en/editing' : 'inbox/pim/en' } : { TH: editing ? 'inbox/pim/editing' : 'inbox/pim' },
      chips: [['Book another room', true], ['Check in online', true]],
      ghost: editing ? 'Cancel' : 'Edit', ghostGo: editing ? base : base + '/editing', approveGo: 'inbox/pim/sent'
    })}</div>`;
  return inbox('pim', { thread, panel: pimPanel(false) });
}

/* ---------- Booking requests (Mia and Noor) ---------- */
function requestHead(ch, ref) {
  return `<div class="panel-head"><span class="t15 w5">Booking request</span>${channel(ch)}<span class="spacer"></span><span class="mono t12 c-mut">Ref ${ref}</span></div>`;
}
function summary(dates, guests, type, room, tone) {
  const s = (l, v) => `<div class="stat-s"><span class="t12 c-mut">${l}</span>${v}</div>`;
  return `<div class="summary">${s('Dates', `<span class="mono t13 w5">${dates}</span>`)}${s('Guests', `<span class="mono t13 w5">${guests}</span>`)}${s('Room type', `<span class="t13 w5">${type}</span>`)}${s('Room', keyTag(room, tone))}</div>`;
}
function checkRow(kind, title, desc, link, route) {
  const ic = { block: icon('alert', 'c-alert'), warn: icon('clock', 'c-wait'), clear: icon('circle-check', 'c-acc') }[kind];
  const res = { block: '<span class="t12 w5 c-alert nowrap">Blocks approval</span>', warn: '<span class="t12 w5 c-wait nowrap">Warning</span>', clear: '<span class="t12 w5 c-acc nowrap">Clear</span>' }[kind];
  const tag = route ? 'button' : 'div';
  return `<${tag} class="check-row"${go(route)}>${ic}<div class="col grow" style="gap:2px"><span class="t13 w5">${title}</span><span class="t12 c-sec">${desc}</span>${link ? `<span class="link">${link}${icon('arrow-right')}</span>` : ''}</div>${res}</${tag}>`;
}
function timeline(rows) {
  return `<div class="col">${rows.map(r => `<div class="timeline-row${r[2] ? ' pending' : ''}"><span class="mono t12 ${r[2] ? 'c-mut' : 'c-sec'}">${r[0]}</span><span class="tl-dot"></span><span class="t13 ${r[2] ? 'c-sec' : ''}">${r[1]}</span></div>`).join('')}</div>`;
}
function success(title, sub) {
  return `<div class="success">${icon('circle-check')}<div class="col" style="gap:2px"><span class="t13 w5">${title}</span><span class="t12">${sub}</span></div></div>`;
}

/* Shared request panels, used by Mia and Noor */
function suggestPanel({ ch, ref, back, heading, options, guest, message, sendGo }) {
  const opt = ([room, title, sub, mode]) => `
      <button class="option${mode === 'sel' ? ' selected' : ''}${mode === 'na' ? ' unavailable' : ''}" data-act="${mode === 'na' ? '' : 'pick'}" data-group="room">
        <span class="radio"></span>${keyTag(room, mode === 'sel' ? 'accent' : '')}
        <div class="col grow"><span class="t13 w5 ${mode === 'na' ? 'c-mut' : ''}">${title}</span><span class="t12 ${mode === 'na' ? 'c-alert' : 'c-sec'}">${sub}</span></div>
      </button>`;
  return `
    <aside class="panel">
      ${requestHead(ch, ref)}
      <div class="panel-body">
        <button class="back-link"${go(back)}>${icon('chevron-left')}Back to checks</button>
        <span class="t14 w5">${heading}</span>
        <div class="col" style="gap:8px">${options.map(opt).join('')}</div>
        <div class="row"><span class="t14 w5">Message to ${guest} on ${ch}</span><span class="spacer"></span>${langSwitch('EN')}</div>
        <div class="msg-field" contenteditable="true" spellcheck="false">${esc(message)}</div>
        <span class="t12 c-mut">You can edit this before sending</span>
      </div>
      <div class="panel-foot"><div class="row" style="gap:8px">${btn('Cancel', 'ghost', { go: back })}${btn('Send suggestion', 'primary', { cls: 'fill', go: sendGo })}</div></div>
    </aside>`;
}

function declinePanel({ ch, ref, back, guest, reason, message, note, sendGo }) {
  const chip = t => `<button class="choice${t === reason ? ' on' : ''}" data-act="chip" data-group="reason">${t === reason ? icon('check') : ''}${t}</button>`;
  return `
    <aside class="panel">
      ${requestHead(ch, ref)}
      <div class="panel-body">
        <button class="back-link"${go(back)}>${icon('chevron-left')}Back to checks</button>
        <span class="t14 w5">Reason</span>
        <div class="row" style="gap:8px;flex-wrap:wrap">${['Not available for these dates', 'Over capacity', 'Other'].map(chip).join('')}</div>
        <div class="row"><span class="t14 w5">Message to ${guest} on ${ch}</span><span class="spacer"></span>${langSwitch('EN')}</div>
        <div class="msg-field" contenteditable="true" spellcheck="false">${esc(message)}</div>
        <span class="t12 c-mut">You can edit this before sending</span>
        ${inlineNote(note)}
      </div>
      <div class="panel-foot"><div class="row" style="gap:8px">${btn('Cancel', 'ghost', { go: back })}${btn('Send decline', 'danger', { cls: 'fill', go: sendGo })}</div></div>
    </aside>`;
}

function outcomePanel({ ch, ref, title, sub, steps, footnote }) {
  return `
    <aside class="panel">
      ${requestHead(ch, ref)}
      <div class="panel-body">
        ${success(title, sub)}
        <span class="t14 w5">What happened</span>
        ${timeline(steps)}
        <p class="t12 c-mut">${footnote}</p>
      </div>
      <div class="panel-foot"><div class="row" style="gap:8px">${btn('Open room board', 'secondary', { go: 'rooms' })}${btn('Done', 'primary', { cls: 'fill', go: 'today' })}</div></div>
    </aside>`;
}

const MIA_Q ='Hi, do you have a room for 3 people from 19 to 21 Nov? We would like the Deluxe room if possible.';
const MIA_SUGGEST = 'Hi Mia, Room 07 is not free on those dates and sleeps 2. Room 09 is a Family room for up to 4 people and is free from 19 to 21 Nov, at THB 800 more a night. Tap below to book it.';
const MIA_DECLINE = 'Hi Mia, thank you for asking. We are sorry, Room 07 is not available from 19 to 21 Nov. We hope to welcome you another time.';

function miaThread(reqPill, extra = '') {
  return threadHead('ML', 'Mia Laurent', 'LINE') + `
    <div class="messages">${M.day()}${M.inn(MIA_Q, '13:58')}
      ${M.request('2041', 'Deluxe · 19 to 21 Nov · 3 guests', reqPill)}
      ${M.out('Thanks Mia, we have your request and will reply within 15 minutes.', '13:58', 'Auto reply')}
      ${extra}
    </div>${replyBox()}`;
}

function screenMia(state) {
  const checking = pill('Being checked in the panel', 'wait');
  let thread = miaThread(checking), panel, over = {}, filters = {};

  if (state === 'review') {
    panel = `
    <aside class="panel">
      ${requestHead('LINE', '2041')}
      <div class="panel-body">
        <span class="t12 c-mut">Mia Laurent asked 2 min ago</span>
        ${summary('19 to 21 Nov', '3', 'Deluxe', '07', 'alert')}
        <div class="row"><span class="t14 w5">Checks</span><span class="spacer"></span>${pill('2 to fix, 2 to look at', 'alert')}</div>
        <div class="checks">
          ${checkRow('block', 'Overlapping bookings', 'Hall holds Room 07 until 20 Nov', 'See room board', 'rooms')}
          ${checkRow('block', 'Guest count', 'Deluxe sleeps 2, request is for 3', 'Suggest Room 09', 'inbox/mia/suggest')}
          ${checkRow('warn', 'Room cleaned', 'Room 07 is not cleaned yet, due before 19 Nov', 'Add cleaning task', 'team/tasks')}
          ${checkRow('warn', 'Staff on duty', 'No one is rostered on 19 Nov', 'Open roster', 'team/schedule')}
        </div>
      </div>
      <div class="panel-foot">
        <p class="t12 c-sec">Fix the 2 blocking checks to approve. Any staff member can resolve this.</p>
        ${btn('Approve', 'disabled', { cls: 'full' })}
        <div class="row" style="gap:8px">${btn('Suggest another room', 'secondary', { cls: 'fill', go: 'inbox/mia/suggest' })}${btn('Decline', 'secondary', { cls: 'fill', go: 'inbox/mia/decline' })}</div>
      </div>
    </aside>`;
  }

  if (state === 'suggest') {
    panel = suggestPanel({
      ch: 'LINE', ref: '2041', back: 'inbox/mia', guest: 'Mia', message: MIA_SUGGEST, sendGo: 'inbox/mia/suggested',
      heading: 'Rooms free 19 to 21 Nov for 3 guests',
      options: [['09', 'Family · Sleeps 4', 'THB 800 more a night', 'sel'], ['10', 'Family · Sleeps 4', 'THB 800 more a night', ''], ['12', 'Deluxe · Sleeps 2', 'Too small for 3', 'na']]
    });
  }

  if (state === 'decline') {
    panel = declinePanel({
      ch: 'LINE', ref: '2041', back: 'inbox/mia', guest: 'Mia', reason: 'Not available for these dates', message: MIA_DECLINE, sendGo: 'inbox/mia/declined',
      note: 'Room 09 is free and fits 3. You could suggest it instead.'
    });
  }

  if (state === 'suggested') {
    over = { mia: { time: '14:03', pill: ['Room suggested', ''] } };
    filters = { requests: 1 };
    thread = miaThread(pill('Other room suggested'),
      M.out(MIA_SUGGEST, '14:03') + M.roomOffer('09', 'Family room', '19 to 21 Nov · 3 guests', 'Book this room', pill('Sent 14:03')));
    panel = outcomePanel({
      ch: 'LINE', ref: '2041', title: 'Mia has a reply', sub: 'Room 09 suggested on LINE at 14:03',
      steps: [['13:58', 'Request received on LINE'], ['13:58', 'Auto reply sent'], ['14:01', 'Checks run, 2 to fix'], ['14:03', 'Room 09 suggested to Mia'], ['--:--', 'Waiting for Mia to choose', true]],
      footnote: 'Room 07 stays free for Hall. Room 09 is held for Mia for 24 hours.'
    });
  }

  if (state === 'declined') {
    over = { mia: { time: '14:03', pill: ['Declined', ''] } };
    filters = { requests: 1 };
    thread = miaThread(pill('Declined'), M.out(MIA_DECLINE, '14:03'));
    panel = outcomePanel({
      ch: 'LINE', ref: '2041', title: 'Decline sent to Mia', sub: 'Sent on LINE at 14:03',
      steps: [['13:58', 'Request received on LINE'], ['13:58', 'Auto reply sent'], ['14:01', 'Checks run, 2 to fix'], ['14:03', 'Declined, not free on those dates'], ['14:03', 'Request closed']],
      footnote: 'Room 07 stays with Hall. Nothing is held for Mia.'
    });
  }

  return inbox('mia', { listOverrides: over, filters, thread, panel });
}

const NOOR_CONFIRM = 'Hi Noor, your Deluxe room is confirmed for 15 to 17 Nov, Room 04. Check in starts at 14:00. You can check in online now from the link below.';

const NOOR_SUGGEST = 'Hi Noor, thank you for your request. Room 05 is also a Deluxe room for 2 and is free from 15 to 17 Nov at the same price. Tap below to book it.';
const NOOR_DECLINE = 'Hi Noor, thank you for asking. We are sorry, we cannot take this booking from 15 to 17 Nov. We hope to welcome you another time.';

function screenNoor(state) {
  const approved = state === 'approved';
  const reqPill = {
    approved: pill('Approved, Room 04', 'accent'),
    suggested: pill('Other room suggested'),
    declined: pill('Declined')
  }[state] || pill('Being checked in the panel', 'wait');
  const extraMsgs = {
    approved: M.out(NOOR_CONFIRM, '14:05') + M.offer('key', 'Check in online', 'Booking 2040, Room 04', 'Start check in'),
    suggested: M.out(NOOR_SUGGEST, '14:05') + M.roomOffer('05', 'Deluxe room', '15 to 17 Nov · 2 guests', 'Book this room', pill('Sent 14:05')),
    declined: M.out(NOOR_DECLINE, '14:05')
  }[state] || '';
  const thread = threadHead('NH', 'Noor Haddad', 'WhatsApp') + `
    <div class="messages">${M.day()}${M.inn('Hello, I would like to book a Deluxe room for 2 people from 15 to 17 Nov.', '13:50')}
      ${M.request('2040', 'Deluxe · 15 to 17 Nov · 2 guests', reqPill)}
      ${M.out('Thanks Noor, we have your request and will reply within 15 minutes.', '13:50', 'Auto reply')}
      ${extraMsgs}
    </div>${replyBox()}`;

  let panel;
  if (state === 'review') {
    panel = `
    <aside class="panel">
      ${requestHead('WhatsApp', '2040')}
      <div class="panel-body">
        <span class="t12 c-mut">Noor Haddad asked 8 min ago</span>
        ${summary('15 to 17 Nov', '2', 'Deluxe', '04', 'accent')}
        <div class="row"><span class="t14 w5">Checks</span><span class="spacer"></span>${pill('All clear', 'accent')}</div>
        <div class="checks">
          ${checkRow('clear', 'Overlapping bookings', 'Room 04 is free 15 to 17 Nov')}
          ${checkRow('clear', 'Guest count', 'Deluxe sleeps 2, request is for 2')}
          ${checkRow('clear', 'Room cleaned', 'Cleaning booked for 15 Nov morning')}
          ${checkRow('clear', 'Staff on duty', 'Nok and Dao are rostered on 15 Nov')}
        </div>
      </div>
      <div class="panel-foot">
        <p class="t12 c-sec">Approving holds Room 04 and sends Noor a confirmation on WhatsApp.</p>
        ${btn('Approve', 'primary', { cls: 'full', go: 'inbox/noor/approved' })}
        <div class="row" style="gap:8px">${btn('Suggest another room', 'secondary', { cls: 'fill', go: 'inbox/noor/suggest' })}${btn('Decline', 'secondary', { cls: 'fill', go: 'inbox/noor/decline' })}</div>
      </div>
    </aside>`;
  } else if (state === 'suggest') {
    panel = suggestPanel({
      ch: 'WhatsApp', ref: '2040', back: 'inbox/noor', guest: 'Noor', message: NOOR_SUGGEST, sendGo: 'inbox/noor/suggested',
      heading: 'Other rooms free 15 to 17 Nov for 2 guests',
      options: [['05', 'Deluxe · Sleeps 2', 'Same price', 'sel'], ['12', 'Deluxe · Sleeps 2', 'Same price', ''], ['09', 'Family · Sleeps 4', 'Chen family stays until 15 Nov', 'na']]
    });
  } else if (state === 'decline') {
    panel = declinePanel({
      ch: 'WhatsApp', ref: '2040', back: 'inbox/noor', guest: 'Noor', reason: 'Other', message: NOOR_DECLINE, sendGo: 'inbox/noor/declined',
      note: 'Every check passed for Room 04. You could approve this request instead.'
    });
  } else if (state === 'suggested') {
    panel = outcomePanel({
      ch: 'WhatsApp', ref: '2040', title: 'Noor has a reply', sub: 'Room 05 suggested on WhatsApp at 14:05',
      steps: [['13:50', 'Request received on WhatsApp'], ['13:50', 'Auto reply sent'], ['13:58', 'Checks run, all clear'], ['14:05', 'Room 05 suggested to Noor'], ['--:--', 'Waiting for Noor to choose', true]],
      footnote: 'Room 04 stays free. Room 05 is held for Noor for 24 hours.'
    });
  } else if (state === 'declined') {
    panel = outcomePanel({
      ch: 'WhatsApp', ref: '2040', title: 'Decline sent to Noor', sub: 'Sent on WhatsApp at 14:05',
      steps: [['13:50', 'Request received on WhatsApp'], ['13:50', 'Auto reply sent'], ['13:58', 'Checks run, all clear'], ['14:05', 'Declined by Nok'], ['14:05', 'Request closed']],
      footnote: 'Room 04 stays free. Nothing is held for Noor.'
    });
  } else {
    const done = (t, trail) => `<div class="done-row">${icon('check', 'c-acc')}<span>${t}</span><span class="spacer"></span>${trail}</div>`;
    panel = `
    <aside class="panel">
      ${requestHead('WhatsApp', '2040')}
      <div class="panel-body">
        ${success('Booking confirmed', 'Noor has a reply on WhatsApp')}
        <span class="t14 w5">Done for you</span>
        <div class="done-list">
          ${done('Room 04 held for 15 to 17 Nov', keyTag('04', 'accent'))}
          ${done('Confirmation sent to Noor on WhatsApp', '<span class="mono t12 c-mut">14:05</span>')}
          ${done('Added to the room board', '<span class="mono t12 c-mut">Ref 2040</span>')}
        </div>
        <span class="t14 w5">Sent message</span>
        <div class="note-box"><span class="t13">${esc(NOOR_CONFIRM)}</span></div>
      </div>
      <div class="panel-foot"><div class="row" style="gap:8px">${btn('Open booking record', 'secondary', { go: 'rooms' })}${btn('Done', 'primary', { cls: 'fill', go: 'today' })}</div></div>
    </aside>`;
  }
  const rowState = { approved: ['Confirmed', 'accent'], suggested: ['Room suggested', ''], declined: ['Declined', ''] }[state];
  return inbox('noor', {
    listOverrides: rowState ? { noor: { time: '14:05', pill: rowState } } : {},
    filters: rowState ? { requests: 1 } : {}, thread, panel
  });
}

/* =====================================================================
   ROOMS
   ===================================================================== */
const DAYS = [['Thu', 12], ['Fri', 13], ['Sat', 14], ['Sun', 15], ['Mon', 16], ['Tue', 17], ['Wed', 18], ['Thu', 19], ['Fri', 20], ['Sat', 21], ['Sun', 22], ['Mon', 23], ['Tue', 24], ['Wed', 25]];
const ROOMS = [['01', 'Standard', 2], ['02', 'Standard', 2], ['03', 'Standard', 2], ['04', 'Deluxe', 2], ['05', 'Deluxe', 2], ['06', 'Deluxe', 2], ['07', 'Deluxe', 2], ['08', 'Garden', 2], ['09', 'Family', 4], ['10', 'Family', 4], ['11', 'Garden', 2], ['12', 'Deluxe', 2]];
/* stays per room. x and w are in px on a 1430 px track (14 days), taken from the Figma frame */
function staysFor(mode) {
  const s = {
    '01': [[0, 153, 'Lena Fischer', 'whatsapp']],
    '02': [[255, 409, 'Marco Rossi', 'booking']],
    '03': [[460, 204, 'Khun Somchai', 'call']],
    '04': [[51, 204, 'Alex Morgan', 'whatsapp'], [358, 204, 'Noor Haddad', 'request']],
    '05': [[664, 409, 'Park family', 'booking']],
    '06': [[153, 204, 'Ms Tanaka', 'line']],
    '07': [[153, 306, 'Kenji Sato', 'booking', 8, 18], [255, 204, 'Khun Pim', 'line', 28, 18], [562, 306, 'J. Hall', 'booking', 8, 38]],
    '08': [[868, 409, 'Ryan Ortiz', 'booking']],
    '09': [[51, 306, 'Chen family', 'booking']],
    '10': [[970, 409, 'Khun Arthit', 'line']],
    '11': [[51, 102, 'Khun Nida', 'line']],
    '12': [[664, 306, 'Olsen', 'whatsapp']]
  };
  if (mode === 'fixed') {
    s['07'] = [[153, 306, 'Kenji Sato', 'booking'], [562, 306, 'J. Hall', 'booking']];
    s['12'] = [[255, 204, 'Khun Pim', 'line', 13, 28, 'moved'], [664, 306, 'Olsen', 'whatsapp']];
  }
  return s;
}

function boardLines(rowsHeight) {
  return `<div class="lines"><div class="lc"></div>${DAYS.map((d, i) => `<div class="dc${i === 0 ? ' today' : ''}"></div>`).join('')}</div>`;
}
function boardHead(label) {
  return `<div class="head"><div class="lab t12 c-mut">${label}</div>${DAYS.map((d, i) => `<div class="day${i === 0 ? ' today' : ''}"><span class="t11 c-mut">${d[0]}</span><span class="mono t13 w5">${d[1]}</span></div>`).join('')}</div>`;
}

function screenRooms(mode) {
  const stays = staysFor(mode);
  const scale = 'calc(100% / 1430)';
  const rows = ROOMS.map(([n, type, sleeps]) => {
    const alert = n === '07' && mode !== 'fixed';
    const bars = stays[n].map(([x, w, name, ch, y = 13, h = 28, extra = '']) =>
      `<div class="bar ${ch} ${extra}" style="left:calc(${x} * ${scale});width:calc(${w} * ${scale});top:${y}px;height:${h}px">${name}</div>`).join('');
    const box = alert ? (mode === 'overlap'
      ? `<div class="overlap-box" style="left:calc(256 * ${scale});width:calc(203 * ${scale});top:9px;height:37px"></div>`
      : `<div class="overlap-box" style="left:calc(259 * ${scale});width:calc(199 * ${scale});top:3px;height:48px"></div>`) : '';
    return `<div class="brow${alert ? ' alert' : ''}"><div class="lab-cell">${keyTag(n, alert ? 'alert' : '')}<div class="col"><span class="t13 w5">${type}</span><span class="t11 c-mut">Sleeps ${sleeps}</span></div></div><div class="track">${bars}${box}</div></div>`;
  }).join('');

  const legend = `
    <div class="row" style="gap:16px;height:32px;flex:none">
      ${channel('LINE')}${channel('WhatsApp')}${channel('Booking platform')}${channel('Call note')}
      <span class="channel"><span style="width:20px;height:10px;border:1px dashed var(--border-strong);border-radius:3px"></span>Request</span>
      <span class="spacer"></span>
      ${mode === 'fixed'
        ? `<span class="ok-banner">${icon('check')}No rooms booked twice</span>`
        : `<button class="alert-banner"${go('rooms/overlap')}>${icon('alert')}Room 07 is booked twice on Sat 14 Nov<span class="chip">Review</span></button>`}
    </div>`;

  let side = '';
  if (mode === 'overlap') {
    side = `
    <aside class="side-panel">
      <div class="panel-head">${icon('alert', 'c-alert')}<span class="t15 w5">Room 07 is booked twice</span><span class="spacer"></span><button class="icon-btn bare"${go('rooms')} aria-label="Close">${icon('x')}</button></div>
      <div class="panel-body g12">
        <span class="t12 c-mut">Both stays hold Room 07 on 14 and 15 Nov</span>
        <div class="stay-card"><div class="row" style="gap:8px;width:100%"><span class="t14 w5">Kenji Sato</span>${channel('Booking platform')}<span class="spacer"></span><span class="mono t12 c-mut">Ref 2031</span></div><div class="row" style="gap:12px"><span class="mono t13 w5">13 to 16 Nov</span><span class="t13 c-sec">2 guests</span></div>${pill('Booked first, keeps Room 07')}</div>
        <div class="stay-card"><div class="row" style="gap:8px;width:100%"><span class="t14 w5">Khun Pim</span>${channel('LINE')}<span class="spacer"></span><span class="mono t12 c-mut">Ref 2038</span></div><div class="row" style="gap:12px"><span class="mono t13 w5">14 to 16 Nov</span><span class="t13 c-sec">2 guests</span></div>${pill('Needs a new room', 'alert')}</div>
        <span class="t14 w5" style="margin-top:0">Suggested fix</span>
        <div class="fix-box">
          <div class="row" style="gap:8px"><span class="t14 w5">Move Khun Pim to</span>${keyTag('12', 'accent')}</div>
          <div class="row t13 c-sec" style="gap:8px">${icon('check', 'c-acc')}Same type, Deluxe for 2</div>
          <div class="row t13 c-sec" style="gap:8px">${icon('check', 'c-acc')}Free 14 to 16 Nov</div>
          <div class="row t13 c-sec" style="gap:8px">${icon('check', 'c-acc')}No extra cost</div>
        </div>
        <button class="alt-box"><span class="t12 c-mut">Or</span>${keyTag('10')}<div class="col"><span class="t13 w5">Family room</span><span class="t12 c-sec">THB 800 more a night</span></div><span class="spacer"></span><span class="t12 w5 c-acc">Choose</span></button>
        <div class="note-box" style="gap:6px">
          <span class="t12 c-mut">Message to Khun Pim on LINE</span>
          <span class="t13">เรียนคุณพิม ห้อง 07 ไม่ว่างในวันที่ 14 ถึง 16 พ.ย. เราย้ายคุณไปห้อง 12 ซึ่งเป็นห้องดีลักซ์แบบเดียวกัน ไม่มีค่าใช้จ่ายเพิ่มค่ะ</span>
          <span class="t12 c-mut">In English. Room 07 is not free 14 to 16 Nov. We moved you to Room 12, the same Deluxe type, at no extra cost.</span>
        </div>
      </div>
      <div class="panel-foot">${btn('Move and tell Khun Pim', 'primary', { cls: 'full', go: 'rooms/fixed' })}${btn('Open both chats', 'secondary', { cls: 'full', go: 'inbox/pim/sent' })}</div>
    </aside>`;
  }

  const page = `
  <div class="page g20">
    <div class="page-head">
      <div><div class="sub">12 to 25 Nov</div><h1>Rooms</h1></div>
      <span class="spacer"></span>
      <div class="row" style="gap:8px"><button class="icon-btn" aria-label="Previous week">${icon('chevron-left')}</button><button class="btn secondary" style="box-shadow:inset 0 0 0 1px var(--border-hairline)">Today</button><button class="icon-btn" aria-label="Next week">${icon('chevron-right')}</button></div>
    </div>
    ${legend}
    <div class="card board">${boardLines()}${boardHead('Room')}${rows}</div>
  </div>`;

  let html = shell('rooms', page, mode === 'fixed' ? { rooms: 0 } : {});
  const tail = side + (mode === 'fixed' ? toast('Khun Pim moved to Room 12 and told on LINE', 'rooms/overlap') : '');
  return html.replace('</main></div>', `</main>${tail}</div>`);
}

/* =====================================================================
   TEAM
   ===================================================================== */
function teamHeader(problems, primaryLabel, primaryGo) {
  const p = problems ? `<button class="problems"${go('team/floors')}>${icon('alert')}${problems} problem${problems > 1 ? 's' : ''} to fix</button>` : '';
  return `
  <div class="page-head">
    <div><div class="sub">5 people · 12 rooms</div><h1>Team</h1></div>
    <span class="spacer"></span>
    <div class="row" style="gap:8px">${p}${btn(primaryLabel, 'primary', { go: primaryGo })}</div>
  </div>`;
}
function teamTabs(active, counts) {
  const t = (key, label, route, n, alert) => {
    const on = active === key;
    return `<button class="tab${on ? ' on' : ''}"${on ? '' : go(route)}>${label}${n ? `<span class="n${alert ? ' alert' : ''}">${n}</span>` : ''}</button>`;
  };
  return `<div class="tabs">${t('schedule', 'Schedule', 'team/schedule', counts[0], true)}${t('floors', 'Rooms by floor', 'team/floors', counts[1], true)}${t('tasks', 'Tasks', 'team/tasks', counts[2], false)}</div>`;
}
function teamShell(page, extra = '') {
  return shell('team', page).replace('</main></div>', `</main>${extra}</div>`);
}

const SHIFTS = { D: ['07–15', 'Desk', 'desk'], R: ['08–16', 'Rooms', 'rooms'], F: ['09–17', 'Fix', 'fix'], O: [null, 'Off', 'off'] };
const PEOPLE = [
  ['N', 'Nok', 'Front desk', 'DDDODDDODDODDD'],
  ['A', 'Arm', 'Housekeeping, floor 3', 'ORRDRROROODRRR'],
  ['D', 'Dao', 'Housekeeping, floor 1', 'RRROORRRRRRORR'],
  ['P', 'Ploy', 'Housekeeping, floor 2', 'RRRRROORRRRROR'],
  ['T', 'Tom', 'Maintenance', 'FFOOFFFFFOOFFF']
];

function screenSchedule(mode) {
  const added = mode === 'added';
  const cover = ['Nok', 'Nok', 'Nok', 'Arm', 'Nok', 'Nok', 'Nok', added ? 'Arm' : 'None', 'Nok', 'Nok', 'Arm', 'Nok', 'Nok', 'Nok'];
  const coverRow = `<div class="brow" style="height:44px"><div class="lab-cell"><span class="t13 w5">Front desk cover</span></div>${cover.map((c, i) => `<div class="slot"><span class="cover-cell${c === 'None' ? ' none' : ''}${added && i === 7 ? ' new' : ''}">${c}</span></div>`).join('')}</div>`;
  const personRows = PEOPLE.map(([ini, name, role, plan]) => {
    let p = plan.split('');
    if (added && name === 'Arm') p[7] = 'D';
    return `<div class="brow" style="height:61px"><div class="lab-cell">${avatar(ini)}<div class="col"><span class="t13 w5">${name}</span><span class="t11 c-mut">${role}</span></div></div>${p.map((k, i) => {
      const [tm, label, cls] = SHIFTS[k];
      const isNew = added && name === 'Arm' && i === 7;
      return `<div class="slot"><span class="shift ${cls}${isNew ? ' new' : ''}">${tm ? `<span class="tm">${tm}</span>` : ''}<span>${label}</span></span></div>`;
    }).join('')}</div>`;
  }).join('');

  const banner = added ? '' : `<div><button class="alert-banner sm"${go('team/schedule/add')}>${icon('alert')}No one is on the front desk on Thu 19 Nov. Mia Laurent may arrive that day.<span class="chip">Add shift on 19 Nov</span></button></div>`;
  const page = `
  <div class="page g20">
    ${teamHeader(added ? 2 : 3, 'Add shift', 'team/schedule/add')}
    ${teamTabs('schedule', [added ? 0 : 1, 2, 6])}
    <div class="card board">${boardLines()}${boardHead('Person')}${coverRow}${personRows}</div>
    ${banner}
  </div>`;

  let extra = '';
  if (mode === 'add') {
    const person = (ini, name, sub, m) => `<button class="option${m === 'sel' ? ' selected' : ''}${m === 'na' ? ' unavailable' : ''}" data-act="${m === 'na' ? '' : 'pick'}" data-group="person"><span class="radio"></span>${avatar(ini)}<div class="col grow"><span class="t13 w5 ${m === 'na' ? 'c-mut' : ''}">${name}</span><span class="t12 ${m === 'na' ? 'c-alert' : 'c-sec'}">${sub}</span></div></button>`;
    const chip = (t, on) => `<button class="choice${on ? ' on' : ''}" data-act="chip" data-group="role">${on ? icon('check') : ''}${t}</button>`;
    const field = (label, value) => `<label class="field"><span class="t12 c-mut">${label}</span><span class="box"><input value="${value}" inputmode="numeric" aria-label="${label}">${icon('clock')}</span></label>`;
    extra = `
    <aside class="side-panel">
      <div class="panel-head">${icon('plus')}<span class="t15 w5">Add shift on Thu 19 Nov</span><span class="spacer"></span><button class="icon-btn bare"${go('team/schedule')} aria-label="Close">${icon('x')}</button></div>
      <div class="panel-body g12">
        ${inlineNote('No one covers the front desk that day. Mia Laurent may arrive.')}
        <span class="t14 w5">Who</span>
        <div class="col" style="gap:8px">
          ${person('A', 'Arm', 'Covered the desk on 15 and 22 Nov', 'sel')}
          ${person('N', 'Nok', 'Day off that day', '')}
          ${person('D', 'Dao', 'Not trained for the desk', 'na')}
          ${person('P', 'Ploy', 'Not trained for the desk', 'na')}
          ${person('T', 'Tom', 'Maintenance only', 'na')}
        </div>
        <span class="t14 w5">Time</span>
        <div class="row" style="gap:12px">${field('Start', '07:00')}${field('End', '15:00')}</div>
        <span class="t14 w5">Role</span>
        <div class="row" style="gap:8px">${chip('Desk', true)}${chip('Rooms')}${chip('Fix')}</div>
        ${inlineNote('Arm leaves floor 3 that day. Dao and Ploy share those rooms.')}
      </div>
      <div class="panel-foot">${btn('Add shift', 'primary', { cls: 'full', go: 'team/schedule/added' })}${btn('Cancel', 'secondary', { cls: 'full', go: 'team/schedule' })}</div>
    </aside>`;
  }
  if (added) extra = toast('Arm covers the front desk on Thu 19 Nov', 'team/schedule');
  return teamShell(page, extra);
}

function screenFloors(mode) {
  const fixed = mode === 'fixed';
  const statusPill = s => ({ Ready: pill('Ready', 'accent'), 'To do': pill('To do'), Cleaning: pill('Cleaning', 'wait') })[s];
  const row = (room, type, today, cleaners, names, status, issue) => {
    const iss = issue && !fixed;
    return `<div class="floor-row${iss ? ' issue' : ''}">
      <div class="row" style="width:150px;gap:10px;flex:none">${keyTag(room, iss ? 'alert' : '')}<span>${type}</span></div>
      <div class="grow c-sec">${today}</div>
      <div class="grow row" style="gap:8px"><span class="avatars">${cleaners.map(c => avatar(c, true)).join('')}</span><span class="${iss && issue[2] ? 'c-alert' : ''}">${names}</span></div>
      <div style="width:100px;flex:none">${statusPill(status)}</div>
      <div class="row" style="width:200px;gap:8px;flex:none">${iss ? `<span class="t12 w5 c-alert">${issue[0]}</span><button class="mini-btn"${go('team/floors/fixed')}>${issue[1]}</button>` : ''}</div>
    </div>`;
  };
  const group = t => `<div class="group-row"><span class="t12 w5 c-sec">${t}</span></div>`;
  const wl = (name, n, note, tone) => `<div class="wl-row"><div class="row"><span class="t13 w5">${name}</span><span class="spacer"></span><span class="mono t13 w5 ${tone === 'alert' ? 'c-alert' : ''}">${n}</span></div><div class="wl-bar"><span style="width:${Math.min(100, n / 8 * 100)}%;background:${tone === 'alert' ? 'var(--alert-base)' : tone === 'wait' ? 'var(--wait-base)' : 'var(--accent-base)'}"></span></div><span class="t12 ${tone === 'alert' ? 'c-alert' : 'c-mut'}">${note}</span></div>`;

  const page = `
  <div class="page g20">
    ${teamHeader(fixed ? 1 : 3, 'Assign by floor', null)}
    ${teamTabs('floors', [1, fixed ? 0 : 2, 6])}
    <div class="row" style="gap:24px;align-items:flex-start;flex:1 1 0;min-height:0">
      <div class="card grow">
        <div class="tbl-head"><span style="width:150px">Room</span><span class="grow">Today</span><span class="grow">Cleaner</span><span style="width:100px">Status</span><span style="width:200px">Check</span></div>
        ${group('Floor 1')}
        ${row('01', 'Standard', 'Checked out 11:00', ['D'], 'Dao', 'Ready')}
        ${row('02', 'Standard', 'Empty', ['D'], 'Dao', 'Ready')}
        ${row('03', 'Standard', 'Empty', ['D'], 'Dao', 'Ready')}
        ${row('04', 'Deluxe', 'Arrival 14:00', ['D'], 'Dao', 'Ready')}
        ${group('Floor 2')}
        ${row('05', 'Deluxe', 'Empty', ['P'], 'Ploy', 'To do')}
        ${row('06', 'Deluxe', 'Arrival tomorrow', ['P'], 'Ploy', 'To do')}
        ${fixed ? row('07', 'Deluxe', 'Arrival tomorrow', ['P'], 'Ploy', 'To do') : row('07', 'Deluxe', 'Arrival tomorrow', ['P', 'D'], 'Ploy and Dao', 'To do', ['Double assigned', 'Keep Ploy'])}
        ${row('08', 'Garden', 'Empty', ['P'], 'Ploy', 'To do')}
        ${group('Floor 3')}
        ${row('09', 'Family', 'Arrival 15:00', ['A', 'P'], 'Arm, Ploy covering', 'Cleaning')}
        ${row('10', 'Family', 'Empty', ['A', 'P'], 'Arm, Ploy covering', 'To do')}
        ${row('11', 'Garden', 'Arrival 18:30', ['A', 'P'], 'Arm, Ploy covering', 'To do')}
        ${fixed ? row('12', 'Deluxe', 'Empty', ['D'], 'Dao', 'To do') : row('12', 'Deluxe', 'Empty', ['A'], 'Arm', 'To do', ['Off shift today', 'Give to Dao', true])}
      </div>
      <div class="col" style="width:380px;flex:none;gap:16px">
        <div class="card col" style="padding:16px 20px;gap:14px">
          <div class="row"><span class="t15 w5">Workload today</span><span class="spacer"></span><span class="mono t12 c-mut">rooms</span></div>
          ${wl('Dao', 5, fixed ? 'Took Room 12 from Arm' : 'Includes 07')}
          ${wl('Ploy', 7, 'Covering 09, 10 and 11', 'wait')}
          ${fixed ? wl('Arm', 0, 'Off today') : wl('Arm', 1, 'Off today', 'alert')}
          ${wl('Nok', 0, 'Front desk')}
          ${wl('Tom', 0, '2 repairs')}
        </div>
        <div class="card col" style="padding:16px 20px;gap:6px">
          ${fixed
            ? `<div class="row" style="gap:8px">${icon('circle-check', 'c-acc')}<span class="t14 w5">Both problems fixed</span></div><p class="t13 c-sec">Ploy keeps Room 07 and Dao takes Room 12 today.</p>`
            : `<span class="t14 w5">Fix both problems</span><p class="t13 c-sec">Room 07 has two cleaners and Room 12 is with Arm, who is off today.</p><div style="padding-top:6px">${btn('Fix both', 'primary', { go: 'team/floors/fixed' })}</div>`}
        </div>
      </div>
    </div>
  </div>`;
  return teamShell(page, fixed ? toast('Room 07 stays with Ploy. Room 12 moved to Dao.', 'team/floors') : '');
}

function screenTasks() {
  const task = (text, room, ini, owner, due, status, done) => `
    <div class="task-row${done ? ' done' : ''}">
      <div style="width:28px;flex:none"><button class="cbox${done ? ' on' : ''}" data-act="task" aria-label="Mark done">${done ? icon('check') : ''}</button></div>
      <div class="grow ${done ? 'c-mut' : ''}" data-task-text>${text}</div>
      <div style="width:100px;flex:none">${keyTag(room)}</div>
      <div class="row" style="width:160px;gap:8px;flex:none">${avatar(ini, true)}<span>${owner}</span></div>
      <div class="mono c-sec" style="width:140px;flex:none">${due}</div>
      <div style="width:120px;flex:none" data-task-status>${status === 'Done' ? pill('Done', 'accent') : status === 'Cleaning' ? pill('Cleaning', 'wait') : pill('To do')}</div>
    </div>`;
  const group = (t, n) => `<div class="group-row"><span class="t12 w5 c-sec">${t}</span><span class="mono t12 c-mut">${n} open</span></div>`;
  const page = `
  <div class="page g20">
    ${teamHeader(3, 'Add task', null)}
    ${teamTabs('tasks', [1, 2, 6])}
    <div class="card">
      <div class="tbl-head"><span style="width:28px"></span><span class="grow">Task</span><span style="width:100px">Room</span><span style="width:160px">Owner</span><span style="width:140px">Due</span><span style="width:120px">Status</span></div>
      ${group('Housekeeping', 3)}
      ${task('Clean Room 07 before Mia Laurent may arrive', '07', 'P', 'Ploy', 'Wed 18 Nov', 'To do')}
      ${task('Deep clean Family room', '09', 'P', 'Ploy', 'Today 14:30', 'Cleaning')}
      ${task('Prepare Room 11 for Khun Nida', '11', 'P', 'Ploy', 'Today 18:00', 'To do')}
      ${task('Turn down Room 04 for Alex Morgan', '04', 'D', 'Dao', 'Today 13:30', 'Done', true)}
      ${group('Maintenance', 2)}
      ${task('Fix shower pressure', '05', 'T', 'Tom', 'Today 16:00', 'To do')}
      ${task('Change AC filter', '11', 'T', 'Tom', 'Today 12:00', 'Done', true)}
      ${task('Check balcony door lock', '08', 'T', 'Tom', 'Fri 13 Nov', 'To do')}
      ${group('Front desk', 1)}
      ${task('Print welcome letter for Chen family', '09', 'N', 'Nok', 'Today 14:30', 'To do')}
      ${task('Book taxi for Lena Fischer', '01', 'N', 'Nok', 'Today 10:00', 'Done', true)}
    </div>
  </div>`;
  return teamShell(page);
}

/* =====================================================================
   ROUTES, in prototype order
   ===================================================================== */
const SCREENS = [
  { route: 'today', group: 'Today', name: 'Today', render: screenToday },
  { route: 'inbox/alex', group: 'Inbox', name: 'Alex Morgan, draft ready', render: () => screenAlex('ready') },
  { route: 'inbox/alex/writing', group: 'Inbox', name: 'Alex Morgan, draft writing', render: () => screenAlex('writing') },
  { route: 'inbox/alex/editing', group: 'Inbox', name: 'Alex Morgan, editing draft', render: () => screenAlex('editing') },
  { route: 'inbox/alex/sent', group: 'Inbox', name: 'Alex Morgan, reply sent', render: () => screenAlex('sent') },
  { route: 'inbox/kenji', group: 'Inbox', name: 'Kenji Sato, draft', render: () => screenKenji('ready') },
  { route: 'inbox/kenji/editing', group: 'Inbox', name: 'Kenji Sato, editing draft', render: () => screenKenji('editing') },
  { route: 'inbox/kenji/sent', group: 'Inbox', name: 'Kenji Sato, reply sent', render: () => screenKenji('sent') },
  { route: 'inbox/pim', group: 'Inbox', name: 'Khun Pim, draft in Thai', render: () => screenPim('th') },
  { route: 'inbox/pim/editing', group: 'Inbox', name: 'Khun Pim, editing draft in Thai', render: () => screenPim('editing') },
  { route: 'inbox/pim/en', group: 'Inbox', name: 'Khun Pim, draft in English', render: () => screenPim('en') },
  { route: 'inbox/pim/en/editing', group: 'Inbox', name: 'Khun Pim, editing draft in English', render: () => screenPim('en-editing') },
  { route: 'inbox/pim/sent', group: 'Inbox', name: 'Khun Pim, offers sent', render: () => screenPim('sent') },
  { route: 'inbox/mia', group: 'Inbox', name: 'Mia Laurent, request review', render: () => screenMia('review') },
  { route: 'inbox/mia/suggest', group: 'Inbox', name: 'Mia Laurent, suggest a room', render: () => screenMia('suggest') },
  { route: 'inbox/mia/suggested', group: 'Inbox', name: 'Mia Laurent, suggestion sent', render: () => screenMia('suggested') },
  { route: 'inbox/mia/decline', group: 'Inbox', name: 'Mia Laurent, decline', render: () => screenMia('decline') },
  { route: 'inbox/mia/declined', group: 'Inbox', name: 'Mia Laurent, decline sent', render: () => screenMia('declined') },
  { route: 'inbox/noor', group: 'Inbox', name: 'Noor Haddad, all clear', render: () => screenNoor('review') },
  { route: 'inbox/noor/approved', group: 'Inbox', name: 'Noor Haddad, approved', render: () => screenNoor('approved') },
  { route: 'inbox/noor/suggest', group: 'Inbox', name: 'Noor Haddad, suggest a room', render: () => screenNoor('suggest') },
  { route: 'inbox/noor/suggested', group: 'Inbox', name: 'Noor Haddad, suggestion sent', render: () => screenNoor('suggested') },
  { route: 'inbox/noor/decline', group: 'Inbox', name: 'Noor Haddad, decline', render: () => screenNoor('decline') },
  { route: 'inbox/noor/declined', group: 'Inbox', name: 'Noor Haddad, decline sent', render: () => screenNoor('declined') },
  { route: 'rooms', group: 'Rooms', name: 'Room board', render: () => screenRooms('board') },
  { route: 'rooms/overlap', group: 'Rooms', name: 'Room 07 booked twice', render: () => screenRooms('overlap') },
  { route: 'rooms/fixed', group: 'Rooms', name: 'Overlap fixed', render: () => screenRooms('fixed') },
  { route: 'team/schedule', group: 'Team', name: 'Schedule', render: () => screenSchedule('view') },
  { route: 'team/schedule/add', group: 'Team', name: 'Add shift on 19 Nov', render: () => screenSchedule('add') },
  { route: 'team/schedule/added', group: 'Team', name: 'Shift added', render: () => screenSchedule('added') },
  { route: 'team/floors', group: 'Team', name: 'Rooms by floor', render: () => screenFloors('view') },
  { route: 'team/floors/fixed', group: 'Team', name: 'Rooms by floor, fixed', render: () => screenFloors('fixed') },
  { route: 'team/tasks', group: 'Team', name: 'Tasks', render: screenTasks }
];

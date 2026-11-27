/* Screens. Each view reads the live data (S) and the screen state (U) and returns HTML. */

/* =====================================================================
   TODAY
   ===================================================================== */
const CLEAN_TONE = { Ready: 'accent', Cleaning: 'wait', 'To do': '' };
function cleanPill(room) {
  const r = roomOf(room);
  return `<button class="pill-btn"${act('cycle-clean', { room })} title="Change cleaning status">${pill(r.clean, CLEAN_TONE[r.clean])}</button>`;
}
function cleanerNames(room) { return listJoin(cleanersOf(room).map(id => personOf(id).name)); }

/* rooms that matter for housekeeping today: arrivals today and tomorrow, and check outs today */
function housekeepingRooms() {
  const out = [];
  S.rooms.forEach(r => {
    const list = staysIn(r.n).filter(s => s.kind === 'booked');
    const arr = list.find(s => s.from === 0) || list.find(s => s.from === 1);
    const out0 = list.find(s => s.to === 0);
    if (arr) out.push({ room: r.n, detail: arr.from === 0 ? (arr.checkedIn ? `${arr.guest}, checked in` : `${arr.guest} at ${arr.eta || '14:00'}`) : `${arr.guest} tomorrow` });
    else if (out0) out.push({ room: r.n, detail: `Checked out ${out0.checkoutTime || 'today'}` });
  });
  const order = { Ready: 0, Cleaning: 1, 'To do': 2 };
  return out.sort((a, b) => order[roomOf(a.room).clean] - order[roomOf(b.room).clean] || a.room.localeCompare(b.room));
}
function arrivalsToday() {
  return S.stays.filter(s => s.kind === 'booked' && s.from === 0).sort((a, b) => (a.eta || '').localeCompare(b.eta || ''));
}

function needsList() {
  const rows = [];
  Object.values(S.requests).filter(q => q.status === 'pending').forEach(q => {
    const b = blocks(q);
    rows.push({ lead: keyTag(q.room, b ? 'alert' : ''), title: `Booking request from ${q.guest}`, detail: `${q.ch} · ${range(q.from, q.to)} · ${q.guests} guests`, pill: b ? pill(`${b} to fix`, 'alert') : pill('All clear', 'accent'), label: 'Review', go: `inbox/${q.id}` });
  });
  overlaps().forEach(o => {
    rows.push({ lead: keyTag(o.room, 'alert'), title: `Room ${o.room} is booked twice`, detail: `${o.keep.guest} and ${o.move.guest} on ${fmtDay(o.from)}`, pill: pill('Overlap', 'alert'), label: 'Fix', go: 'rooms/overlap' });
  });
  S.chats.filter(c => needsYou(c) && !(c.request && reqOf(c.request).status === 'pending'))
    .sort((a, b) => (waitingSince(a) ?? S.clock) - (waitingSince(b) ?? S.clock))
    .forEach(c => {
      const w = waitingSince(c);
      const waited = w == null ? 0 : S.clock - w;
      rows.push({ lead: icon('message'), title: `${c.name} is waiting for a reply`, detail: `${c.ch} · ${c.topic || 'new message'}`, pill: w == null ? pill('Draft ready', 'wait') : pill(dur(waited), waited > 60 ? 'wait' : ''), label: 'Open chat', go: `inbox/${c.id}` });
    });
  floorIssues().forEach(i => {
    const names = i.who.map(id => personOf(id).name);
    rows.push(i.kind === 'off'
      ? { lead: keyTag(i.room), title: `Room ${i.room} is assigned to ${names[0]}`, detail: `${names[0]} is off today`, pill: pill('Off shift', 'alert'), label: 'Reassign', go: 'team/floors' }
      : { lead: keyTag(i.room), title: `Room ${i.room} has two cleaners`, detail: `${listJoin(names)} are both assigned`, pill: pill('Double assigned', 'alert'), label: 'Fix', go: 'team/floors' });
  });
  deskGaps().forEach(d => {
    rows.push({ lead: icon('users'), title: `No one on the front desk on ${fmtDay(d)}`, detail: 'Add a desk shift to cover the day', pill: pill('Cover gap', 'alert'), label: 'Add shift', go: `team/schedule/add/${d}` });
  });
  return rows;
}

function viewToday() {
  const stat = (label, value, detail, alert) => `
    <div class="stat"><span class="t13 c-sec">${label}</span><span class="mono t28 w5 ${alert ? 'c-alert' : ''}" data-stat="${esc(label)}">${value}</span><span class="t12 c-mut">${esc(detail)}</span></div>`;
  const waiting = S.chats.filter(needsYou);
  const over = waiting.filter(c => { const w = waitingSince(c); return w != null && S.clock - w > 60; }).length;
  const arrivals = arrivalsToday();
  const notIn = arrivals.filter(s => !s.checkedIn);
  const ov = overlaps();
  const hk = housekeepingRooms();
  const ready = hk.filter(h => roomOf(h.room).clean === 'Ready').length;
  const needs = needsList();

  const nyRow = r => `
    <div class="ny-row"><div class="lead">${r.lead}</div>
      <div class="col grow" style="gap:2px"><span class="t14 w5">${esc(r.title)}</span><span class="t12 c-mut">${esc(r.detail)}</span></div>
      ${r.pill}${btn(r.label, 'secondary', { cls: 'w96', go: r.go })}</div>`;
  const hkRow = h => `
    <div class="list-row">${keyTag(h.room, roomOf(h.room).clean === 'Ready' ? 'accent' : '')}<div class="col"><span class="t13 w5">${esc(cleanerNames(h.room))}</span><span class="t12 c-mut">${esc(h.detail)}</span></div><span class="spacer"></span>${cleanPill(h.room)}</div>`;
  const arrRow = s => `
    <div class="list-row"><span class="mono t12 w5 c-sec">${s.eta || ''}</span>${keyTag(s.room)}<div class="col"><span class="t13 w5">${esc(s.guest)}</span><span class="t12 c-mut">${s.ch} · ${s.guests} guest${s.guests > 1 ? 's' : ''}</span></div><span class="spacer"></span>${s.checkedIn ? pill('Checked in', 'accent') : `<button class="mini-btn"${act('check-in', { stay: s.id })}>Check in</button>`}</div>`;

  return shell('today', `
  <div class="page">
    <div class="page-head">
      <div><div class="sub">${fmtDay(0)} · ${hm(S.clock)}</div><h1>Today</h1></div>
      <span class="spacer"></span>${btn('Open room board', 'secondary', { go: 'rooms' })}
    </div>
    <div class="card counts">
      ${stat('Waiting on you', waiting.length, over ? `${over} ${over > 1 ? 'have' : 'has'} waited over 1 hour` : waiting.length ? 'No one has waited over 1 hour' : 'All caught up')}
      ${stat('Arrivals today', arrivals.length, notIn.length ? `Next check in at ${notIn[0].eta}` : 'Everyone is checked in')}
      ${stat('Booked twice', ov.length, ov.length ? `Room ${ov[0].room} on ${fmtDay(ov[0].from)}` : 'No rooms booked twice', ov.length > 0)}
      ${stat('Tasks left', openTasks().length, `${ready} of ${hk.length} rooms ready`)}
    </div>
    <div class="today-body">
      <div class="grow" style="height:100%;min-height:0">
        <div class="card col needs-card">
          <div class="section-head"><span class="t15 w5">Needs you</span><span class="spacer"></span><span class="mono t12 c-mut">${needs.length} open</span></div>
          <div class="scroll" data-scroll="needs">${needs.length ? needs.map(nyRow).join('') : `<div class="empty">${icon('circle-check', 'c-acc')}<span class="t14 w5">Nothing needs you right now</span><span class="t13 c-sec">New messages, requests and problems show up here.</span></div>`}</div>
        </div>
      </div>
      <div class="today-right">
        <div class="card">
          <div class="row" style="padding:16px 20px 8px"><span class="t15 w5">Housekeeping</span><span class="spacer"></span><span class="mono t12 c-mut">${ready} of ${hk.length} ready</span></div>
          <div style="padding:4px 20px 12px"><div class="progress"><span style="width:${hk.length ? ready / hk.length * 100 : 0}%"></span></div></div>
          ${hk.map(hkRow).join('')}
        </div>
        <div class="card">
          <div class="row" style="padding:16px 20px 8px"><span class="t15 w5">Arrivals today</span><span class="spacer"></span><span class="mono t12 c-mut">${arrivals.length - notIn.length} of ${arrivals.length} in</span></div>
          ${arrivals.map(arrRow).join('')}
        </div>
      </div>
    </div>
  </div>`);
}

/* =====================================================================
   INBOX
   ===================================================================== */
const TABS = [['open', 'Open'], ['requests', 'Requests'], ['drafts', 'Drafts'], ['done', 'Done']];
function inTab(c, tab) {
  if (tab === 'done') return !!c.done;
  if (c.done) return false;
  if (tab === 'requests') return !!(c.request && reqOf(c.request).status === 'pending');
  if (tab === 'drafts') return !!c.draft;
  return true;
}
function visibleChats() {
  return S.chats.filter(c => inTab(c, U.inboxTab) && (!U.channel || c.ch === U.channel));
}

function chatList(selected) {
  const list = visibleChats();
  const rows = list.map(c => {
    const sel = c.id === selected;
    const [p, tone] = chatPill(c);
    return `<button class="chat-row${sel ? ' selected' : ''}" data-name="${esc(c.name.toLowerCase())}"${go('inbox/' + c.id)}>
      ${avatar(c.ini)}
      <div class="body">
        <div class="row" style="gap:8px"><span class="t14 w5 nowrap">${esc(c.name)}</span><span class="spacer"></span><span class="mono t12 c-mut nowrap">${chatTime(c)}</span></div>
        <div class="preview">${esc(previewOf(c))}</div>
        <div class="row" style="gap:8px">${channel(c.ch)}<span class="spacer"></span>${pill(p, tone)}</div>
      </div>
    </button>`;
  }).join('');
  const n = t => S.chats.filter(c => inTab(c, t) && (!U.channel || c.ch === U.channel)).length;
  const tab = ([key, label]) => `<button class="ftab${U.inboxTab === key ? ' on' : ''}"${act('tab', { tab: key })}>${label}<span class="n">${n(key)}</span></button>`;
  const empty = { open: 'No open chats', requests: 'No booking requests waiting', drafts: 'No drafts waiting', done: 'Nothing marked done yet' }[U.inboxTab];
  return `
  <section class="chat-list">
    <div class="list-head">
      <div class="row"><span class="t18 w5">Inbox</span><span class="spacer"></span><span class="mono t12 c-mut">${n('open')} open</span></div>
      <label class="search">${icon('search')}<input type="search" placeholder="Search guests" data-search aria-label="Search guests" value="${esc(U.search)}"></label>
      <div class="filters">${TABS.map(tab).join('')}</div>
      ${U.channel ? `<div class="row" style="gap:8px"><span class="t12 c-mut">Showing</span><button class="filter-chip"${act('channel', { ch: U.channel })}>${channel(U.channel)}${icon('x')}</button></div>` : ''}
    </div>
    <div class="chat-rows" data-scroll="chats">${rows}<div class="empty sm"${list.length ? ' hidden' : ''} data-empty><span class="t13 c-sec">${empty}</span></div></div>
  </section>`;
}

function threadHead(c) {
  const action = c.done ? btn('Reopen', 'secondary', { act: 'reopen', data: { chat: c.id } }) : btn('Mark done', 'secondary', { act: 'mark-done', data: { chat: c.id }, icon: 'check' });
  return `<div class="thread-head">${avatar(c.ini)}<div class="col"><span class="t15 w5">${esc(c.name)}</span>${channel(c.ch)}</div><span class="spacer"></span>${action}</div>`;
}

function requestPill(q) {
  if (q.status === 'approved') return pill(`Approved, Room ${q.room}`, 'accent');
  if (q.status === 'suggested') return pill(`Room ${q.suggested} suggested`);
  if (q.status === 'declined') return pill('Declined');
  return pill('Being checked in the panel', 'wait');
}

function messageHtml(c, m) {
  const time = `<span class="time">${hm(m.time)}</span>`;
  if (m.t === 'in') return `<div class="msg"><div class="bubble"><p class="text">${esc(m.text)}</p>${m.tr ? `<p class="t12 c-mut">Translated. ${esc(m.tr)}</p>` : ''}${time}</div></div>`;
  if (m.t === 'call') return `<div class="msg"><div class="bubble note"><span class="t12 c-mut">Call note by ${esc(m.by)}</span><p class="text">${esc(m.text)}</p>${time}</div></div>`;
  if (m.t === 'note') return `<div class="msg out"><div class="bubble note"><span class="t12 c-mut">Note by ${esc(m.by)}</span><p class="text">${esc(m.text)}</p>${time}</div></div>`;
  if (m.t === 'out') {
    const label = m.by === 'Auto reply' ? 'Auto reply' : `Sent by ${esc(m.by)}${m.lang === 'TH' && c.lang !== 'TH' ? ' in Thai' : ''}`;
    return `<div class="msg out"><div class="bubble sent"><span class="t12 c-mut">${label}</span><p class="text">${esc(m.text)}</p>${m.tr ? `<p class="t12 c-mut">${m.lang === 'TH' ? 'In English' : 'In Thai'}. ${esc(m.tr)}</p>` : ''}${time}</div></div>`;
  }
  if (m.t === 'request') {
    const q = reqOf(m.req);
    return `<div class="msg"><div class="req-card"><div class="row" style="gap:8px;width:100%">${icon('bed', 'c-sec')}<span class="t13 w5">Booking request</span><span class="spacer"></span><span class="mono t12 c-mut">${q.ref}</span></div><span class="t13 c-sec">${q.type} · ${range(q.from, q.to)} · ${q.guests} guests</span>${requestPill(q)}</div></div>`;
  }
  if (m.t === 'offer') {
    const o = OFFERS[m.offer];
    const lead = m.offer === 'room' ? keyTag(m.room, 'accent') : `<span class="ibox">${icon(o.icon)}</span>`;
    return `<div class="msg out"><div class="offer-card"><div class="row" style="gap:10px">${lead}<div class="col"><span class="t14 w5">${esc(o.title(c, m))}</span><span class="t12 c-mut">${esc(m.sub || o.sub(c, m))}</span></div></div><span class="cta">${o.cta}</span>${pill(`Sent ${hm(m.time)}, not opened`)}</div></div>`;
  }
  return '';
}

function replyBox(c) {
  const call = c.ch === 'Call note';
  const menu = U.offerMenu === c.id ? `<div class="pop-menu offer-menu">${offersFor(c).map(k => `<button class="pop-item"${act('send-offer', { chat: c.id, offer: k })}>${icon(OFFERS[k].icon)}<span>${OFFERS[k].label}</span></button>`).join('')}</div>` : '';
  const draftBtn = DRAFTS[c.id] && !c.draft ? `<button class="offer-btn"${act('redraft', { chat: c.id })}>${icon('pencil')}Draft reply</button>` : '';
  return `<div class="composer"><div class="reply-box">
    <input placeholder="${call ? 'Add a note for the team' : `Write a reply to ${esc(firstName(c.name))} on ${c.ch}`}" aria-label="${call ? 'Add a note' : 'Write a reply'}" data-reply="${c.id}" value="${esc(U.reply[c.id] || '')}">
    ${draftBtn}${call ? '' : `<span class="pop-wrap"><button class="offer-btn"${act('offer-menu', { chat: c.id })} aria-expanded="${U.offerMenu === c.id}">${icon('bed')}Offer</button>${menu}</span>`}
    <button class="send"${act('send-reply', { chat: c.id })} aria-label="${call ? 'Save note' : 'Send'}">${icon(call ? 'check' : 'send')}</button>
  </div></div>`;
}

function draftCard(c) {
  const d = c.draft;
  const texts = DRAFTS[c.id];
  const lang = d.lang;
  const editing = d.state === 'editing';
  const text = editing && d.edit ? d.edit[lang] : texts[lang];
  const pillHtml = d.state === 'writing' ? pill('Writing', 'wait') : editing ? pill('Editing') : pill('Not sent');
  let body;
  if (d.state === 'writing') body = `<div class="skeleton"><span style="width:100%"></span><span style="width:78%"></span><span style="width:45%"></span></div>`;
  else if (editing) body = `<div class="editor" contenteditable="true" spellcheck="false" data-draft="${c.id}">${esc(text)}</div>`;
  else body = `<p class="text">${esc(text)}</p>`;
  const edited = d.edit && d.edit[lang] !== texts[lang];
  let note = '';
  if (d.state !== 'writing') {
    if (lang !== c.lang) note = `${c.name} wrote in ${c.lang === 'TH' ? 'Thai' : 'English'}. Switch to ${c.lang} to send this in ${c.lang === 'TH' ? 'Thai' : 'English'}.`;
    else if (lang === 'TH') note = edited ? 'Edited. The English version below is the original draft.' : `In English. ${texts.EN}`;
  }
  const chips = Object.keys(d.chips).map(k => `<button class="offer-chip${d.chips[k] ? ' on' : ''}"${act('chip', { chat: c.id, offer: k })} aria-pressed="${!!d.chips[k]}">${icon(OFFERS[k].icon)}${OFFERS[k].label}</button>`).join('');
  const ghost = d.state === 'writing' ? btn('Stop', 'ghost', { act: 'stop-draft', data: { chat: c.id } })
    : editing ? btn('Cancel', 'ghost', { act: 'cancel-edit', data: { chat: c.id } })
      : btn('Edit', 'ghost', { act: 'edit-draft', data: { chat: c.id } });
  const approve = d.state === 'writing' ? btn('Approve and send', 'disabled') : btn('Approve and send', 'primary', { act: 'approve-draft', data: { chat: c.id } });
  return `
  <div class="composer"><div class="draft">
    <div class="row" style="gap:8px">${icon('pencil', 'c-acc')}<span class="t13 w5">Draft reply</span>${pillHtml}<span class="spacer"></span>${d.state === 'writing' ? '' : langSwitch(lang, 'draft-lang', { chat: c.id })}</div>
    ${body}
    ${note ? `<p class="t12 c-mut">${esc(note)}</p>` : ''}
    <div class="row${d.state === 'writing' ? ' dim' : ''}" style="gap:8px"><span class="t12 c-mut">Add to message</span>${chips}</div>
    <div class="row" style="gap:8px"><span class="t12 c-mut">Nothing is sent until you approve</span><span class="spacer"></span>${ghost}${approve}</div>
  </div></div>`;
}

/* ---------- side panels for normal chats ---------- */
function detailRow(label, value, opt = {}) {
  let v;
  if (opt.tag) v = `<span class="row" style="gap:8px"><span class="w5">${esc(value)}</span>${keyTag(opt.tag, opt.tone || '')}</span>`;
  else v = `<span class="${opt.mono ? 'mono ' : ''}w5">${esc(value)}</span>`;
  return `<div class="detail-row"><span class="c-sec">${label}</span><span class="spacer"></span>${v}</div>`;
}
function checkItem(text, done) {
  return `<div class="check-item">${done ? icon('circle-check', 'c-acc') : icon('clock', 'c-mut')}<span class="${done ? '' : 'c-sec'}">${esc(text)}</span></div>`;
}
function stayRows(s, tone) {
  const r = roomOf(s.room);
  const n = s.to - s.from;
  return `
    ${detailRow('Room', r.type, { tag: s.room, tone })}
    ${detailRow('Dates', range(s.from, s.to), { mono: true })}
    ${detailRow('Nights', n)}
    ${detailRow('Guests', s.guests)}
    ${detailRow('Booked through', s.ch)}
    ${detailRow('Ref', s.ref, { mono: true })}`;
}
function stayStatus(s) {
  const ov = overlaps().find(o => o.keep.id === s.id || o.move.id === s.id);
  if (ov && ov.move.id === s.id) return { pill: pill('Booked twice', 'alert'), ov };
  if (ov) return { pill: pill('Booked first', 'accent'), ov };
  if (s.to <= 0) return { pill: pill('Checked out') };
  if (s.checkedIn) return { pill: pill('Checked in', 'accent') };
  return { pill: pill('Confirmed', 'accent') };
}

function chatPanel(c) {
  const s = c.stay && stayOf(c.stay);
  if (!s) return `<aside class="panel"><div class="panel-head"><span class="t15 w5">Guest</span></div><div class="panel-body"><span class="t13 c-sec">No booking linked to this chat.</span></div></aside>`;
  const st = stayStatus(s);
  const moved = st.ov && st.ov.move.id === s.id;
  const overlapNote = moved ? `
    <div style="padding:16px 20px 0"><div class="overlap-note">${icon('alert')}<div class="col" style="gap:2px"><span class="t13 w5">Room ${s.room} is also held by ${esc(st.ov.keep.guest)} on ${fmtDate(st.ov.from)}</span><span class="t12">Fix it on the room board before the guest arrives</span></div></div></div>` : '';
  let extra = '';
  if (c.checkin) {
    const done = c.checkin.filter(x => x[1] || s.checkedIn).length;
    extra += `<div class="panel-sec"><div class="row"><span class="t13 w5">Check in</span><span class="spacer"></span><span class="mono t12 c-mut">${s.checkedIn ? 'Checked in' : `${done} of ${c.checkin.length}`}</span></div>${c.checkin.map(([t, d]) => checkItem(t, d || s.checkedIn)).join('')}</div>`;
  }
  if (c.dinner) {
    const d = c.dinner;
    const moved19 = d.time === d.asked;
    extra += `<div class="panel-sec"><span class="t13 w5">Dinner booking</span>
      ${detailRow('Day', fmtDay(d.day))}${detailRow('Time', d.time, { mono: true })}
      ${moved19 ? `<div class="success">${icon('circle-check')}<span class="t13">Moved to ${d.asked} as asked</span></div>` : btn(`Move dinner to ${d.asked}`, 'primary', { cls: 'full', act: 'move-dinner', data: { chat: c.id } })}</div>`;
  }
  const offers = c.messages.filter(m => m.t === 'offer' && m.offer !== 'room');
  const chipKeys = c.draft ? Object.keys(c.draft.chips) : [];
  const offerKeys = [...new Set([...chipKeys, ...offers.map(m => m.offer)])];
  if (offerKeys.length) {
    extra += `<div class="panel-sec"><span class="t13 w5">Offers in this chat</span>${offerKeys.map(k => {
      const sent = offers.filter(m => m.offer === k).pop();
      return `<div class="row" style="height:32px"><span class="t13 c-sec">${OFFERS[k].label}</span><span class="spacer"></span><span class="mono t12 c-mut">${sent ? `Sent ${hm(sent.time)}` : 'Not sent'}</span></div>`;
    }).join('')}</div>`;
  }
  const foot = moved ? `<div style="padding:8px 20px">${btn('Fix on the room board', 'secondary', { cls: 'full', go: 'rooms/overlap' })}</div>`
    : `<div style="padding:8px 20px">${btn('Open room board', 'secondary', { cls: 'full', go: 'rooms' })}</div>`;
  return `
  <aside class="panel">
    <div class="panel-head"><span class="t15 w5">Stay</span><span class="spacer"></span>${st.pill}</div>
    <div class="panel-scroll" data-scroll="panel">
      ${overlapNote}
      <div style="padding:${moved ? 8 : 16}px 20px">${stayRows(s, moved ? 'alert' : '')}</div>
      ${extra}
      <div style="padding:8px 20px"><div class="note-box"><span class="t12 c-mut">Hotel note</span><span class="t13">The front desk is open until midnight.</span></div></div>
      ${foot}
    </div>
  </aside>`;
}

/* ---------- booking request panels ---------- */
function requestHead(q) {
  return `<div class="panel-head"><span class="t15 w5">Booking request</span>${channel(q.ch)}<span class="spacer"></span><span class="mono t12 c-mut">Ref ${q.ref}</span></div>`;
}
function summary(q, tone) {
  const s = (l, v) => `<div class="stat-s"><span class="t12 c-mut">${l}</span>${v}</div>`;
  return `<div class="summary">${s('Dates', `<span class="mono t13 w5">${range(q.from, q.to)}</span>`)}${s('Guests', `<span class="mono t13 w5">${q.guests}</span>`)}${s('Room type', `<span class="t13 w5">${q.type}</span>`)}${s('Room', keyTag(q.room, tone))}</div>`;
}
function checkRow(c, q) {
  const ic = { block: icon('alert', 'c-alert'), warn: icon('clock', 'c-wait'), clear: icon('circle-check', 'c-acc') }[c.kind];
  const res = { block: '<span class="t12 w5 c-alert nowrap">Blocks approval</span>', warn: '<span class="t12 w5 c-wait nowrap">Warning</span>', clear: '<span class="t12 w5 c-acc nowrap">Clear</span>' }[c.kind];
  const clickable = c.go || c.act;
  const attrs = c.go ? go(c.go) : c.act ? act(c.act, { req: q.id }) : '';
  const tag = clickable ? 'button' : 'div';
  return `<${tag} class="check-row" data-check="${c.key}"${attrs}>${ic}<div class="col grow" style="gap:2px"><span class="t13 w5">${c.title}</span><span class="t12 c-sec">${esc(c.desc)}</span>${c.link ? `<span class="link">${c.link}${icon('arrow-right')}</span>` : ''}</div>${res}</${tag}>`;
}
function timeline(rows) {
  return `<div class="col">${rows.map(r => `<div class="timeline-row${r[2] ? ' pending' : ''}"><span class="mono t12 ${r[2] ? 'c-mut' : 'c-sec'}">${r[0] == null ? '--:--' : hm(r[0])}</span><span class="tl-dot"></span><span class="t13 ${r[2] ? 'c-sec' : ''}">${esc(r[1])}</span></div>`).join('')}</div>`;
}
function success(title, sub) {
  return `<div class="success">${icon('circle-check')}<div class="col" style="gap:2px"><span class="t13 w5">${esc(title)}</span><span class="t12">${esc(sub)}</span></div></div>`;
}
function msgField(key, text, forVal) {
  const stale = U.msg[key] != null && U.msgFor[key] !== forVal;
  return `<div class="msg-field" contenteditable="true" spellcheck="false" data-msg="${key}" data-for="${esc(forVal)}">${esc(text)}</div>${stale ? inlineNote('You edited this message before changing your choice, so it was kept as you wrote it. Check that it still fits.') : ''}`;
}
function currentMsg(key, fallback) {
  return U.msg[key] != null ? U.msg[key] : fallback;
}

function requestPanel(q, mode) {
  if (q.status === 'pending' && mode === 'suggest') return suggestPanel(q);
  if (q.status === 'pending' && mode === 'decline') return declinePanel(q);
  if (q.status !== 'pending') return outcomePanel(q);
  const checks = requestChecks(q);
  const b = checks.filter(c => c.kind === 'block').length, w = checks.filter(c => c.kind === 'warn').length;
  const sumPill = b ? pill(`${b} to fix${w ? `, ${w} to look at` : ''}`, 'alert') : w ? pill(`${w} to look at`, 'wait') : pill('All clear', 'accent');
  const footNote = b ? `Fix the ${b} blocking check${b > 1 ? 's' : ''} to approve. Any staff member can resolve this.`
    : `Approving holds Room ${q.room} and sends ${q.first} a confirmation on ${q.ch}.${w ? ' Warnings do not stop approval.' : ''}`;
  return `
    <aside class="panel">
      ${requestHead(q)}
      <div class="panel-body" data-scroll="panel">
        <span class="t12 c-mut">${esc(q.guest)} asked ${dur(S.clock - q.asked)} ago</span>
        ${summary(q, b ? 'alert' : 'accent')}
        <div class="row"><span class="t14 w5">Checks</span><span class="spacer"></span>${sumPill}</div>
        <div class="checks">${checks.map(c => checkRow(c, q)).join('')}</div>
      </div>
      <div class="panel-foot">
        <p class="t12 c-sec">${footNote}</p>
        ${b ? btn('Approve', 'disabled', { cls: 'full' }) : btn('Approve', 'primary', { cls: 'full', act: 'approve', data: { req: q.id } })}
        <div class="row" style="gap:8px">${btn('Suggest another room', 'secondary', { cls: 'fill', go: `inbox/${q.id}/suggest` })}${btn('Decline', 'secondary', { cls: 'fill', go: `inbox/${q.id}/decline` })}</div>
      </div>
    </aside>`;
}

function suggestPanel(q) {
  const { fit, na } = requestOptions(q);
  const pick = fit.find(r => r.n === U.pick[q.id]) ? U.pick[q.id] : (fit[0] && fit[0].n);
  const opt = r => {
    const sel = r.n === pick;
    return `<button class="option${sel ? ' selected' : ''}"${act('pick-room', { req: q.id, room: r.n })} aria-pressed="${sel}">
      <span class="radio"></span>${keyTag(r.n, sel ? 'accent' : '')}
      <div class="col grow"><span class="t13 w5">${r.type} · Sleeps ${r.sleeps}</span><span class="t12 c-sec">${priceText(priceDiff(q.type, r.type))}</span></div></button>`;
  };
  const naHtml = na ? `<div class="option unavailable" aria-disabled="true"><span class="radio"></span>${keyTag(na.room.n)}<div class="col grow"><span class="t13 w5 c-mut">${na.room.type} · Sleeps ${na.room.sleeps}</span><span class="t12 c-alert">${esc(na.why)}</span></div></div>` : '';
  const key = `suggest:${q.id}`;
  const text = pick ? currentMsg(key, suggestText(q, pick)) : '';
  return `
    <aside class="panel">
      ${requestHead(q)}
      <div class="panel-body" data-scroll="panel">
        <button class="back-link"${go('inbox/' + q.id)}>${icon('chevron-left')}Back to checks</button>
        <span class="t14 w5">${fit.length ? `Rooms free ${range(q.from, q.to)} for ${q.guests} guests` : 'No room is free for these dates'}</span>
        <div class="col" style="gap:8px">${fit.map(opt).join('')}${naHtml}</div>
        ${pick ? `<div class="row"><span class="t14 w5">Message to ${esc(q.first)} on ${q.ch}</span></div>
        ${msgField(key, text, pick)}
        <span class="t12 c-mut">You can edit this before sending</span>` : inlineNote('Try declining instead, or ask the guest about other dates.')}
      </div>
      <div class="panel-foot"><div class="row" style="gap:8px">${btn('Cancel', 'ghost', { go: 'inbox/' + q.id })}${pick ? btn('Send suggestion', 'primary', { cls: 'fill', act: 'send-suggest', data: { req: q.id, room: pick } }) : btn('Send suggestion', 'disabled', { cls: 'fill' })}</div></div>
    </aside>`;
}

function declinePanel(q) {
  const reason = U.reason[q.id] || declineDefault(q);
  const key = `decline:${q.id}`;
  const text = currentMsg(key, declineText(q, reason));
  const chip = t => `<button class="choice${t === reason ? ' on' : ''}"${act('reason', { req: q.id, reason: t })} aria-pressed="${t === reason}">${t === reason ? icon('check') : ''}${t}</button>`;
  const b = blocks(q);
  const best = requestOptions(q).fit[0];
  const note = !b ? `Every check passed for Room ${q.room}. You could approve this request instead.`
    : best ? `Room ${best.n} is free and fits ${q.guests}. You could suggest it instead.` : '';
  return `
    <aside class="panel">
      ${requestHead(q)}
      <div class="panel-body" data-scroll="panel">
        <button class="back-link"${go('inbox/' + q.id)}>${icon('chevron-left')}Back to checks</button>
        <span class="t14 w5">Reason</span>
        <div class="row" style="gap:8px;flex-wrap:wrap">${DECLINE_REASONS.map(chip).join('')}</div>
        <div class="row"><span class="t14 w5">Message to ${esc(q.first)} on ${q.ch}</span></div>
        ${msgField(key, text, reason)}
        <span class="t12 c-mut">You can edit this before sending</span>
        ${note ? inlineNote(note) : ''}
      </div>
      <div class="panel-foot"><div class="row" style="gap:8px">${btn('Cancel', 'ghost', { go: 'inbox/' + q.id })}${btn('Send decline', 'danger', { cls: 'fill', act: 'send-decline', data: { req: q.id } })}</div></div>
    </aside>`;
}

function outcomePanel(q) {
  const foot = extra => `<div class="panel-foot">${extra || ''}<div class="row" style="gap:8px">${btn('Open room board', 'secondary', { go: 'rooms' })}${btn('Done', 'primary', { cls: 'fill', act: 'mark-done', data: { chat: q.id, next: 'today' } })}</div></div>`;
  if (q.status === 'approved') {
    const sent = chatOf(q.id).messages.filter(m => m.t === 'out' && m.confirm).pop();
    const done = (t, trail) => `<div class="done-row">${icon('check', 'c-acc')}<span>${esc(t)}</span><span class="spacer"></span>${trail}</div>`;
    return `
    <aside class="panel">
      ${requestHead(q)}
      <div class="panel-body" data-scroll="panel">
        ${success('Booking confirmed', `${q.first} has a reply on ${q.ch}`)}
        <span class="t14 w5">Done for you</span>
        <div class="done-list">
          ${done(`Room ${q.room} held for ${range(q.from, q.to)}`, keyTag(q.room, 'accent'))}
          ${done(`Confirmation sent to ${q.first} on ${q.ch}`, `<span class="mono t12 c-mut">${sent ? hm(sent.time) : ''}</span>`)}
          ${done('Added to the room board', `<span class="mono t12 c-mut">Ref ${q.ref}</span>`)}
        </div>
        <span class="t14 w5">What happened</span>
        ${timeline(q.log)}
        ${sent ? `<span class="t14 w5">Sent message</span><div class="note-box"><span class="t13">${esc(sent.text)}</span></div>` : ''}
      </div>
      ${foot()}
    </aside>`;
  }
  if (q.status === 'suggested') {
    return `
    <aside class="panel">
      ${requestHead(q)}
      <div class="panel-body" data-scroll="panel">
        ${success(`${q.first} has a reply`, `Room ${q.suggested} suggested on ${q.ch} at ${hm(q.log[q.log.length - 1][0])}`)}
        <span class="t14 w5">What happened</span>
        ${timeline(q.log.concat([[null, `Waiting for ${q.first} to choose`, true]]))}
        <p class="t12 c-mut">Room ${q.suggested} is held for ${esc(q.first)} for 24 hours. When ${esc(q.first)} books it, confirm it here.</p>
      </div>
      ${foot(btn(`${q.first} said yes, book Room ${q.suggested}`, 'primary', { cls: 'full', act: 'accept-suggest', data: { req: q.id } }))}
    </aside>`;
  }
  return `
    <aside class="panel">
      ${requestHead(q)}
      <div class="panel-body" data-scroll="panel">
        ${success(`Decline sent to ${q.first}`, `Sent on ${q.ch} at ${hm(q.log[q.log.length - 1][0])}`)}
        <span class="t14 w5">What happened</span>
        ${timeline(q.log)}
        <p class="t12 c-mut">Nothing is held for ${esc(q.first)}.</p>
      </div>
      ${foot()}
    </aside>`;
}

function viewInbox(id, mode) {
  const list = visibleChats();
  const c = chatOf(id);
  let thread, panel = '';
  if (!c) {
    thread = `<div class="empty big">${icon('inbox', 'c-mut')}<span class="t15 w5">${list.length ? 'Pick a chat' : 'All caught up'}</span><span class="t13 c-sec">${list.length ? 'Choose a guest on the left to read and reply.' : 'There is nothing in this list.'}</span></div>`;
  } else {
    const q = c.request && reqOf(c.request);
    const composer = c.draft && !c.done ? draftCard(c) : replyBox(c);
    thread = threadHead(c) + `<div class="messages" data-scroll="messages">${`<div class="day-label">Today</div>`}${c.messages.map(m => messageHtml(c, m)).join('')}</div>${composer}`;
    panel = q ? requestPanel(q, mode) : chatPanel(c);
  }
  return shell('inbox', `
  <div class="inbox">
    ${chatList(c ? c.id : null)}
    <section class="thread">${thread}</section>
    ${panel}
  </div>`);
}

/* =====================================================================
   ROOMS
   ===================================================================== */
function boardDays() {
  const d0 = U.week * 7;
  return Array.from({ length: DAY_COUNT }, (_, i) => d0 + i);
}
function boardLines(days) {
  return `<div class="lines"><div class="lc"></div>${days.map(d => `<div class="dc${d === 0 ? ' today' : ''}"></div>`).join('')}</div>`;
}
function boardHead(label, days) {
  return `<div class="head"><div class="lab t12 c-mut">${label}</div>${days.map(d => `<div class="day${d === 0 ? ' today' : ''}"><span class="t11 c-mut">${dayName(d)}</span><span class="mono t13 w5">${dayNum(d)}</span></div>`).join('')}</div>`;
}
const BAR_CLASS = { LINE: 'line', WhatsApp: 'whatsapp', 'Booking platform': 'booking', 'Call note': 'call' };

function roomRow(r, days, ovs) {
  const h0 = days[0] * 2, H = DAY_COUNT * 2;
  const list = staysIn(r.n).map(s => ({ s, a: 2 * s.from + 1, b: 2 * s.to + 1 })).filter(x => x.b > h0 && x.a < h0 + H).sort((x, y) => x.a - y.a);
  /* stack stays that overlap into lanes */
  const lanes = [];
  list.forEach(x => {
    let l = lanes.findIndex(end => end <= x.a);
    if (l < 0) { l = lanes.length; lanes.push(0); }
    lanes[l] = x.b; x.lane = l;
  });
  list.forEach(x => { x.stack = list.some(y => y !== x && y.a < x.b && x.a < y.b); });
  const n = Math.max(1, lanes.length);
  const alert = ovs.some(o => o.room === r.n);
  const bars = list.map(x => {
    const a = Math.max(x.a, h0), b = Math.min(x.b, h0 + H);
    let top = 13, h = 28;
    if (x.stack) { h = n > 2 ? 12 : 18; top = 8 + x.lane * (h + 2); }
    const cls = x.s.kind === 'booked' ? BAR_CLASS[x.s.ch] : 'request';
    const label = x.s.kind === 'hold' ? `${x.s.guest}, held` : x.s.kind === 'request' ? `${x.s.guest}, request` : x.s.guest;
    const flash = U.flash === x.s.id ? ' moved' : '';
    return `<button class="bar ${cls}${flash}" style="left:${(a - h0) / H * 100}%;width:${(b - a) / H * 100}%;top:${top}px;height:${h}px"${go('rooms/stay/' + x.s.id)} title="${esc(x.s.guest)}, ${range(x.s.from, x.s.to)}">${esc(label)}</button>`;
  }).join('');
  const boxes = ovs.filter(o => o.room === r.n).map(o => {
    const a = Math.max(2 * o.from + 1, h0), b = Math.min(2 * o.to + 1, h0 + H);
    if (b <= a) return '';
    return `<div class="overlap-box" style="left:${(a - h0) / H * 100}%;width:${(b - a) / H * 100}%;top:4px;height:46px"></div>`;
  }).join('');
  return `<div class="brow${alert ? ' alert' : ''}" data-room="${r.n}"><div class="lab-cell">${keyTag(r.n, alert ? 'alert' : '')}<div class="col"><span class="t13 w5">${r.type}</span><span class="t11 c-mut">Sleeps ${r.sleeps}</span></div></div><div class="track">${bars}${boxes}</div></div>`;
}

function overlapPanel(o) {
  const c = o.move.chat && chatOf(o.move.chat);
  const choices = moveChoices(o.move);
  const same = choices.filter(r => r.type === roomOf(o.move.room).type).slice(0, 2);
  const up = choices.find(r => r.type !== roomOf(o.move.room).type && priceDiff(roomOf(o.move.room).type, r.type) >= 0);
  const opts = same.concat(up ? [up] : []);
  const key = 'ov:' + o.move.id;
  const pick = opts.find(r => r.n === U.pick[key]) ? U.pick[key] : (opts[0] && opts[0].n);
  const stayCard = (s, note, tone) => `<div class="stay-card"><div class="row" style="gap:8px;width:100%"><span class="t14 w5">${esc(s.guest)}</span>${channel(s.ch)}<span class="spacer"></span><span class="mono t12 c-mut">Ref ${s.ref}</span></div><div class="row" style="gap:12px"><span class="mono t13 w5">${range(s.from, s.to)}</span><span class="t13 c-sec">${s.guests} guests</span></div>${pill(note, tone)}</div>`;
  let fix = inlineNote(`No free room fits ${o.move.guest} for these dates. Contact the guest to agree on new dates.`);
  let foot = '';
  if (pick) {
    const r = roomOf(pick);
    const isSame = r.type === roomOf(o.move.room).type;
    const lang = c ? c.lang : 'EN';
    const text = moveText(o.move, pick, lang, c && c.thName);
    fix = `
        <div class="fix-box">
          <div class="row" style="gap:8px"><span class="t14 w5">Move ${esc(o.move.guest)} to</span>${keyTag(pick, 'accent')}</div>
          <div class="row t13 c-sec" style="gap:8px">${icon('check', 'c-acc')}${isSame ? `Same type, ${r.type} for ${r.sleeps}` : `Upgrade to ${r.type}, sleeps ${r.sleeps}`}</div>
          <div class="row t13 c-sec" style="gap:8px">${icon('check', 'c-acc')}Free ${range(o.move.from, o.move.to)}</div>
          <div class="row t13 c-sec" style="gap:8px">${icon('check', 'c-acc')}No extra cost</div>
        </div>
        ${opts.filter(x => x.n !== pick).map(x => `<button class="alt-box"${act('pick-room', { key, room: x.n })}><span class="t12 c-mut">Or</span>${keyTag(x.n)}<div class="col"><span class="t13 w5">${x.type} room</span><span class="t12 c-sec">${x.type === roomOf(o.move.room).type ? 'Same type' : 'Free upgrade'}</span></div><span class="spacer"></span><span class="t12 w5 c-acc">Choose</span></button>`).join('')}
        ${c ? `<div class="note-box" style="gap:6px">
          <span class="t12 c-mut">Message to ${esc(c.name)} on ${c.ch}</span>
          <span class="t13">${esc(text)}</span>
          ${lang === 'TH' ? `<span class="t12 c-mut">In English. ${esc(moveText(o.move, pick, 'EN'))}</span>` : ''}
        </div>` : ''}`;
    foot = btn(c ? `Move and tell ${c.name}` : `Move to Room ${pick}`, 'primary', { cls: 'full', act: 'fix-overlap', data: { stay: o.move.id, room: pick } });
  }
  if (c) foot += btn(`Open chat with ${c.name}`, 'secondary', { cls: 'full', go: 'inbox/' + c.id });
  return `
    <aside class="side-panel">
      <div class="panel-head">${icon('alert', 'c-alert')}<span class="t15 w5">Room ${o.room} is booked twice</span><span class="spacer"></span><button class="icon-btn bare"${go('rooms')} aria-label="Close">${icon('x')}</button></div>
      <div class="panel-body g12" data-scroll="panel">
        <span class="t12 c-mut">Both stays hold Room ${o.room} from ${range(o.from, o.to)}</span>
        ${stayCard(o.keep, `Booked first, keeps Room ${o.room}`, '')}
        ${stayCard(o.move, 'Needs a new room', 'alert')}
        <span class="t14 w5">Suggested fix</span>
        ${fix}
      </div>
      <div class="panel-foot">${foot}</div>
    </aside>`;
}

function stayPanel(s) {
  const c = s.chat && chatOf(s.chat);
  const st = s.kind === 'booked' ? stayStatus(s) : { pill: pill(s.kind === 'hold' ? 'Held' : 'Request', 'wait') };
  let body = `<div>${stayRows(s, st.ov && st.ov.move.id === s.id ? 'alert' : '')}</div>`;
  let foot = '';
  if (s.kind === 'hold') body += inlineNote(`Room ${s.room} is held while ${firstName(s.guest)} decides. Confirm it from the chat when the guest books it.`);
  if (s.kind === 'request') body += inlineNote('This is a booking request that has not been approved yet.');
  if (st.ov) body += `<button class="alt-box"${go('rooms/overlap')}>${icon('alert', 'c-alert')}<div class="col"><span class="t13 w5">Room ${s.room} is booked twice</span><span class="t12 c-sec">Review the overlap and fix it</span></div><span class="spacer"></span>${icon('arrow-right', 'c-acc')}</button>`;
  if (s.kind === 'booked' && s.to > 0) {
    const choices = moveChoices(s).slice(0, 4);
    const key = 'mv:' + s.id;
    const pick = choices.find(x => x.n === U.pick[key]) ? U.pick[key] : null;
    body += `<span class="t14 w5">Move to another room</span>`;
    body += choices.length ? `<div class="col" style="gap:8px">${choices.map(x => `<button class="option${x.n === pick ? ' selected' : ''}"${act('pick-room', { key, room: x.n })} aria-pressed="${x.n === pick}"><span class="radio"></span>${keyTag(x.n, x.n === pick ? 'accent' : '')}<div class="col grow"><span class="t13 w5">${x.type} · Sleeps ${x.sleeps}</span><span class="t12 c-sec">Free ${range(s.from, s.to)}</span></div></button>`).join('')}</div>`
      : inlineNote('No other room is free for these dates.');
    foot += pick ? btn(`Move to Room ${pick}`, 'primary', { cls: 'full', act: 'move-stay', data: { stay: s.id, room: pick } }) : btn('Pick a room to move to', 'disabled', { cls: 'full' });
  }
  if (s.kind === 'booked' && s.from === 0 && !s.checkedIn) foot += btn('Check in', 'secondary', { cls: 'full', act: 'check-in', data: { stay: s.id } });
  if (c) foot += btn('Open chat', 'secondary', { cls: 'full', go: 'inbox/' + c.id });
  return `
    <aside class="side-panel">
      <div class="panel-head">${keyTag(s.room)}<span class="t15 w5">${esc(s.guest)}</span>${st.pill}<span class="spacer"></span><button class="icon-btn bare"${go('rooms')} aria-label="Close">${icon('x')}</button></div>
      <div class="panel-body g12" data-scroll="panel">${body}</div>
      ${foot ? `<div class="panel-foot">${foot}</div>` : ''}
    </aside>`;
}

function viewRooms(mode, arg) {
  const days = boardDays();
  const ovs = overlaps();
  const rows = S.rooms.map(r => roomRow(r, days, ovs)).join('');
  const banner = ovs.length
    ? `<button class="alert-banner"${go('rooms/overlap')}>${icon('alert')}${ovs.length > 1 ? `${ovs.length} rooms are booked twice` : `Room ${ovs[0].room} is booked twice on ${fmtDay(ovs[0].from)}`}<span class="chip">Review</span></button>`
    : `<span class="ok-banner">${icon('check')}No rooms booked twice</span>`;
  const legend = `
    <div class="row" style="gap:16px;height:32px;flex:none">
      ${channel('LINE')}${channel('WhatsApp')}${channel('Booking platform')}${channel('Call note')}
      <span class="channel"><span style="width:20px;height:10px;border:1px dashed var(--border-strong);border-radius:3px"></span>Request or hold</span>
      <span class="spacer"></span>${banner}
    </div>`;
  let side = '';
  if (mode === 'overlap' && ovs.length) side = overlapPanel(ovs[0]);
  if (mode === 'stay' && stayOf(arg)) side = stayPanel(stayOf(arg));
  const page = `
  <div class="page g20">
    <div class="page-head">
      <div><div class="sub">${range(days[0], days[days.length - 1])}</div><h1>Rooms</h1></div>
      <span class="spacer"></span>
      <div class="row" style="gap:8px">
        <button class="icon-btn"${U.week > -1 ? act('week', { by: -1 }) : ' disabled'} aria-label="Previous week">${icon('chevron-left')}</button>
        <button class="btn secondary"${act('week', { by: 0 })}>Today</button>
        <button class="icon-btn"${U.week < 3 ? act('week', { by: 1 }) : ' disabled'} aria-label="Next week">${icon('chevron-right')}</button>
      </div>
    </div>
    ${legend}
    <div class="card board">${boardLines(days)}${boardHead('Room', days)}${rows}</div>
  </div>`;
  return shell('rooms', page, side);
}

/* =====================================================================
   TEAM
   ===================================================================== */
function teamHeader(primary) {
  const n = teamProblems();
  const target = deskGaps().length ? 'team/schedule' : 'team/floors';
  const p = n ? `<button class="problems"${go(target)}>${icon('alert')}${n} problem${n > 1 ? 's' : ''} to fix</button>` : `<span class="ok-banner">${icon('check')}No problems</span>`;
  return `
  <div class="page-head">
    <div><div class="sub">${S.people.length} people · ${S.rooms.length} rooms</div><h1>Team</h1></div>
    <span class="spacer"></span>
    <div class="row" style="gap:8px">${p}${primary}</div>
  </div>`;
}
function teamTabs(active) {
  const t = (key, label, route, n, alert) => {
    const on = active === key;
    return `<button class="tab${on ? ' on' : ''}"${go(route)}>${label}${n ? `<span class="n${alert ? ' alert' : ''}">${n}</span>` : ''}</button>`;
  };
  return `<div class="tabs">${t('schedule', 'Schedule', 'team/schedule', deskGaps().length, true)}${t('floors', 'Rooms by floor', 'team/floors', floorIssues().length, true)}${t('tasks', 'Tasks', 'team/tasks', openTasks().length, false)}</div>`;
}

function viewSchedule(adding) {
  const days = Array.from({ length: DAY_COUNT }, (_, i) => i);
  const gaps = deskGaps();
  const coverRow = `<div class="brow" style="height:44px"><div class="lab-cell"><span class="t13 w5">Front desk cover</span></div>${days.map(d => {
    const who = deskOn(d).map(p => p.name);
    const isNew = U.flash && U.flash.endsWith(':' + d) && who.includes(personOf(U.flash.split(':')[0]).name);
    return `<div class="slot"><button class="cover-cell${who.length ? '' : ' none'}${isNew ? ' new' : ''}"${go(`team/schedule/add/${d}`)}>${who.length ? esc(who.join(', ')) : 'None'}</button></div>`;
  }).join('')}</div>`;
  const personRows = S.people.map(p => `<div class="brow" style="height:61px"><div class="lab-cell">${avatar(p.ini)}<div class="col"><span class="t13 w5">${p.name}</span><span class="t11 c-mut">${p.role}</span></div></div>${days.map(d => {
    const s = shiftOf(p, d);
    const isNew = U.flash === `${p.id}:${d}`;
    const cls = s ? SHIFT_ROLES[s.r].cls : 'off';
    return `<div class="slot"><button class="shift ${cls}${isNew ? ' new' : ''}"${go(`team/schedule/add/${d}/${p.id}`)} aria-label="${p.name} on ${fmtDay(d)}">${s ? `<span class="tm">${shiftLabel(s)}</span><span>${s.r}</span>` : '<span>Off</span>'}</button></div>`;
  }).join('')}</div>`).join('');

  let banner = '';
  if (gaps.length) {
    const d = gaps[0];
    const arriving = Object.values(S.requests).filter(q => q.status === 'pending' && q.from === d).map(q => q.guest);
    banner = `<div><button class="alert-banner sm"${go(`team/schedule/add/${d}`)}>${icon('alert')}No one is on the front desk on ${fmtDay(d)}.${arriving.length ? ` ${listJoin(arriving)} may arrive that day.` : ''}<span class="chip">Add shift on ${fmtDate(d)}</span></button></div>`;
  }
  const page = `
  <div class="page g20">
    ${teamHeader(btn('Add shift', 'primary', { go: `team/schedule/add/${gaps.length ? gaps[0] : 0}` }))}
    ${teamTabs('schedule')}
    <div class="card board">${boardLines(days)}${boardHead('Person', days)}${coverRow}${personRows}</div>
    ${banner}
  </div>`;
  return shell('team', page, adding ? shiftPanel() : '');
}

function shiftPanel() {
  const f = U.shift;
  const d = f.day;
  const role = f.role;
  const person = (p) => {
    const trained = p.skills.includes(role);
    const s = shiftOf(p, d);
    let sub;
    if (!trained) sub = p.skills.length === 1 && p.skills[0] === 'Fix' ? 'Maintenance only' : `Not trained for ${SHIFT_ROLES[role].skill}`;
    else if (s) sub = `On ${s.r} ${shiftLabel(s)} that day`;
    else sub = 'Day off that day';
    const sel = f.person === p.id;
    return trained
      ? `<button class="option${sel ? ' selected' : ''}"${act('shift-person', { person: p.id })} aria-pressed="${sel}"><span class="radio"></span>${avatar(p.ini)}<div class="col grow"><span class="t13 w5">${p.name}</span><span class="t12 c-sec">${esc(sub)}</span></div></button>`
      : `<div class="option unavailable" aria-disabled="true"><span class="radio"></span>${avatar(p.ini)}<div class="col grow"><span class="t13 w5 c-mut">${p.name}</span><span class="t12 c-alert">${esc(sub)}</span></div></div>`;
  };
  const chip = t => `<button class="choice${t === role ? ' on' : ''}"${act('shift-role', { role: t })} aria-pressed="${t === role}">${t === role ? icon('check') : ''}${t}</button>`;
  const field = (label, k) => `<label class="field"><span class="t12 c-mut">${label}</span><span class="box"><input value="${esc(f[k])}" data-field="shift.${k}" inputmode="numeric" maxlength="5" aria-label="${label}">${icon('clock')}</span></label>`;
  const daySel = `<label class="field"><span class="t12 c-mut">Day</span><span class="box"><select data-field="shift.day" aria-label="Day">${Array.from({ length: DAY_COUNT }, (_, i) => `<option value="${i}"${i === d ? ' selected' : ''}>${fmtDay(i)}${deskOn(i).length ? '' : ', no desk cover'}</option>`).join('')}</select></span></label>`;
  const p = f.person && personOf(f.person);
  const existing = p && shiftOf(p, d);
  const notes = [];
  if (!deskOn(d).length) {
    const arriving = Object.values(S.requests).filter(q => q.status === 'pending' && q.from === d).map(q => q.guest);
    notes.push(`No one covers the front desk that day.${arriving.length ? ` ${listJoin(arriving)} may arrive.` : ''}`);
  }
  if (p && existing && existing.r !== role) notes.push(`${p.name} moves from ${existing.r} to ${role} that day.${existing.r === 'Rooms' && p.floor ? ` Someone else needs to clean floor ${p.floor}.` : ''}`);
  const title = p && existing && existing.r === role ? `Edit ${p.name}'s shift` : 'Add shift';
  return `
    <aside class="side-panel">
      <div class="panel-head">${icon('plus')}<span class="t15 w5">${title} on ${fmtDay(d)}</span><span class="spacer"></span><button class="icon-btn bare"${go('team/schedule')} aria-label="Close">${icon('x')}</button></div>
      <div class="panel-body g12" data-scroll="panel">
        ${notes.length ? inlineNote(notes[0]) : ''}
        ${daySel}
        <span class="t14 w5">Role</span>
        <div class="row" style="gap:8px">${Object.keys(SHIFT_ROLES).map(chip).join('')}</div>
        <span class="t14 w5">Who</span>
        <div class="col" style="gap:8px">${S.people.map(person).join('')}</div>
        <span class="t14 w5">Time</span>
        <div class="row" style="gap:12px">${field('Start', 's')}${field('End', 'e')}</div>
        ${notes[1] ? inlineNote(notes[1]) : ''}
        ${f.err ? inlineNote(f.err, 'alert') : ''}
      </div>
      <div class="panel-foot">
        ${p ? btn(existing && existing.r === role ? 'Save shift' : 'Add shift', 'primary', { cls: 'full', act: 'save-shift' }) : btn('Pick who works this shift', 'disabled', { cls: 'full' })}
        ${existing && existing.r === role ? btn(`Make it a day off for ${p.name}`, 'secondary', { cls: 'full', act: 'clear-shift' }) : ''}
        ${btn('Cancel', 'secondary', { cls: 'full', go: 'team/schedule' })}
      </div>
    </aside>`;
}

function viewFloors() {
  const issues = floorIssues();
  const row = r => {
    const a = S.assign[r.n];
    const iss = issues.find(i => i.room === r.n);
    const list = staysIn(r.n).filter(s => s.kind === 'booked');
    const arr = list.find(s => s.from === 0);
    const tom = list.find(s => s.from === 1);
    const out0 = list.find(s => s.to === 0);
    const today = arr ? (arr.checkedIn ? `Checked in, ${arr.guest}` : `Arrival ${arr.eta || 'today'}`) : out0 ? `Checked out ${out0.checkoutTime || ''}` : list.find(s => s.from < 0 && s.to > 0) ? 'In house' : tom ? 'Arrival tomorrow' : 'Empty';
    const owners = a.owners.map(personOf);
    const cleaners = cleanersOf(r.n);
    const names = a.cover && cleaners[0] === a.cover ? `${listJoin(owners.map(p => p.name))}, ${personOf(a.cover).name} covering` : listJoin(owners.map(p => p.name));
    const ini = (a.cover && cleaners[0] === a.cover ? a.owners.concat([a.cover]) : a.owners).map(id => avatar(personOf(id).ini, true)).join('');
    let fix = '';
    if (iss && iss.kind === 'double') fix = `<span class="t12 w5 c-alert">Double assigned</span><button class="mini-btn"${act('keep-one', { room: r.n, person: a.owners[0] })}>Keep ${personOf(a.owners[0]).name}</button>`;
    if (iss && iss.kind === 'off') {
      const best = bestCleaner([a.owners[0]]);
      fix = `<span class="t12 w5 c-alert">Off shift today</span>${best ? `<button class="mini-btn"${act('give-room', { room: r.n, person: best.id })}>Give to ${best.name}</button>` : ''}`;
    }
    const menu = U.cleanerMenu === r.n ? `<div class="pop-menu">${S.people.filter(p => p.skills.includes('Rooms')).map(p => {
      const on = onShift(p, 0, 'Rooms');
      return on ? `<button class="pop-item"${act('give-room', { room: r.n, person: p.id })}>${avatar(p.ini, true)}<span>${p.name}</span><span class="spacer"></span><span class="t12 c-mut">${roomsCleanedBy(p.id).length} rooms</span></button>`
        : `<div class="pop-item off">${avatar(p.ini, true)}<span>${p.name}</span><span class="spacer"></span><span class="t12 c-alert">Off today</span></div>`;
    }).join('')}</div>` : '';
    return `<div class="floor-row${iss ? ' issue' : ''}" data-room="${r.n}">
      <div class="row" style="width:150px;gap:10px;flex:none">${keyTag(r.n, iss ? 'alert' : '')}<span>${r.type}</span></div>
      <div class="grow c-sec">${esc(today)}</div>
      <div class="grow"><span class="pop-wrap"><button class="cleaner-btn"${act('cleaner-menu', { room: r.n })} aria-expanded="${U.cleanerMenu === r.n}"><span class="avatars">${ini}</span><span class="${iss && iss.kind === 'off' ? 'c-alert' : ''}">${esc(names)}</span>${icon('chevron-right', 'chev')}</button>${menu}</span></div>
      <div style="width:100px;flex:none">${cleanPill(r.n)}</div>
      <div class="row" style="width:200px;gap:8px;flex:none">${fix}</div>
    </div>`;
  };
  const group = t => `<div class="group-row"><span class="t12 w5 c-sec">${t}</span></div>`;
  const wl = p => {
    const rooms = roomsCleanedBy(p.id);
    const n = p.skills.includes('Rooms') ? rooms.length : 0;
    const off = !onShift(p, 0);
    const shared = rooms.filter(x => S.assign[x].owners.length > 1);
    const covering = rooms.filter(x => S.assign[x].cover === p.id && cleanersOf(x)[0] === p.id);
    let note, tone = '';
    if (off) { note = 'Off today'; if (n) tone = 'alert'; }
    else if (p.skills.includes('Fix')) note = `${openTasks().filter(t => t.owner === p.id).length} repairs`;
    else if (!p.skills.includes('Rooms')) note = 'Front desk';
    else if (covering.length) { note = `Covering ${listJoin(covering)}`; tone = n > 6 ? 'wait' : ''; }
    else if (shared.length) note = `Shares ${listJoin(shared)} with ${listJoin([...new Set(shared.flatMap(x => S.assign[x].owners))].filter(id => id !== p.id).map(id => personOf(id).name))}`;
    else note = p.floor ? `Floor ${p.floor}` : '';
    const color = tone === 'alert' ? 'var(--alert-base)' : tone === 'wait' ? 'var(--wait-base)' : 'var(--accent-base)';
    return `<div class="wl-row" data-person="${p.id}"><div class="row"><span class="t13 w5">${p.name}</span><span class="spacer"></span><span class="mono t13 w5 ${tone === 'alert' ? 'c-alert' : ''}" data-load>${n}</span></div><div class="wl-bar"><span style="width:${Math.min(100, n / 8 * 100)}%;background:${color}"></span></div><span class="t12 ${tone === 'alert' ? 'c-alert' : 'c-mut'}">${esc(note)}</span></div>`;
  };
  const describe = issues.map(i => i.kind === 'double' ? `Room ${i.room} has two cleaners.` : `Room ${i.room} is with ${personOf(i.who[0]).name}, who is off today.`).join(' ');
  const fixCard = issues.length
    ? `<span class="t14 w5">Fix ${issues.length === 1 ? 'the problem' : issues.length === 2 ? 'both problems' : 'all problems'}</span><p class="t13 c-sec">${esc(describe)}</p><div style="padding-top:6px">${btn(issues.length === 1 ? 'Fix it' : issues.length === 2 ? 'Fix both' : 'Fix all', 'primary', { act: 'fix-floors' })}</div>`
    : `<div class="row" style="gap:8px">${icon('circle-check', 'c-acc')}<span class="t14 w5">No cleaning problems</span></div><p class="t13 c-sec">Every room has one cleaner who is on shift today.</p>`;
  const page = `
  <div class="page g20">
    ${teamHeader(btn('Assign by floor', 'primary', { act: 'assign-floors' }))}
    ${teamTabs('floors')}
    <div class="row" style="gap:24px;align-items:flex-start;flex:1 1 0;min-height:0">
      <div class="card grow floor-card">
        <div class="tbl-head"><span style="width:150px">Room</span><span class="grow">Today</span><span class="grow">Cleaner</span><span style="width:100px">Status</span><span style="width:200px">Check</span></div>
        ${[1, 2, 3].map(fl => group(`Floor ${fl}`) + S.rooms.filter(r => r.floor === fl).map(row).join('')).join('')}
      </div>
      <div class="col" style="width:380px;flex:none;gap:16px">
        <div class="card col" style="padding:16px 20px;gap:14px">
          <div class="row"><span class="t15 w5">Workload today</span><span class="spacer"></span><span class="mono t12 c-mut">rooms</span></div>
          ${S.people.slice().sort((a, b) => (a.floor || 9) - (b.floor || 9)).map(wl).join('')}
        </div>
        <div class="card col" style="padding:16px 20px;gap:6px">${fixCard}</div>
      </div>
    </div>
  </div>`;
  return shell('team', page);
}

function viewTasks(adding) {
  const task = t => {
    const done = t.status === 'Done';
    const p = personOf(t.owner);
    return `
    <div class="task-row${done ? ' done' : ''}" data-task="${t.id}">
      <div style="width:28px;flex:none"><button class="cbox${done ? ' on' : ''}"${act('toggle-task', { task: t.id })} aria-label="${done ? 'Mark as not done' : 'Mark done'}" aria-pressed="${done}">${done ? icon('check') : ''}</button></div>
      <div class="grow ${done ? 'c-mut' : ''}">${esc(t.text)}</div>
      <div style="width:100px;flex:none">${t.room ? keyTag(t.room) : '<span class="c-mut">None</span>'}</div>
      <div class="row" style="width:160px;gap:8px;flex:none">${avatar(p.ini, true)}<span>${p.name}</span></div>
      <div class="mono c-sec" style="width:140px;flex:none">${esc(dueText(t.day, t.time))}</div>
      <div style="width:120px;flex:none">${done ? pill('Done', 'accent') : t.status === 'Cleaning' ? pill('Cleaning', 'wait') : pill('To do')}</div>
      <div style="width:32px;flex:none"><button class="icon-btn bare sm"${act('delete-task', { task: t.id })} aria-label="Delete task">${icon('x')}</button></div>
    </div>`;
  };
  const groups = ['Housekeeping', 'Maintenance', 'Front desk'];
  const body = groups.map(g => {
    const list = S.tasks.filter(t => t.group === g);
    if (!list.length) return '';
    return `<div class="group-row"><span class="t12 w5 c-sec">${g}</span><span class="mono t12 c-mut">${list.filter(t => t.status !== 'Done').length} open</span></div>${list.map(task).join('')}`;
  }).join('');
  const page = `
  <div class="page g20">
    ${teamHeader(btn('Add task', 'primary', { go: 'team/tasks/add' }))}
    ${teamTabs('tasks')}
    <div class="card col task-card">
      <div class="tbl-head"><span style="width:28px"></span><span class="grow">Task</span><span style="width:100px">Room</span><span style="width:160px">Owner</span><span style="width:140px">Due</span><span style="width:120px">Status</span><span style="width:32px"></span></div>
      <div class="scroll" data-scroll="tasks">${body || `<div class="empty"><span class="t13 c-sec">No tasks yet</span></div>`}</div>
    </div>
  </div>`;
  return shell('team', page, adding ? taskPanel() : '');
}

function taskPanel() {
  const f = U.task;
  const sel = (k, opts) => `<span class="box"><select data-field="task.${k}" aria-label="${k}">${opts.map(([v, l]) => `<option value="${esc(v)}"${String(f[k]) === String(v) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></span>`;
  const chip = g => `<button class="choice${f.group === g ? ' on' : ''}"${act('task-group', { group: g })} aria-pressed="${f.group === g}">${f.group === g ? icon('check') : ''}${g}</button>`;
  return `
    <aside class="side-panel">
      <div class="panel-head">${icon('plus')}<span class="t15 w5">Add task</span><span class="spacer"></span><button class="icon-btn bare"${go('team/tasks')} aria-label="Close">${icon('x')}</button></div>
      <div class="panel-body g12" data-scroll="panel">
        <label class="field"><span class="t12 c-mut">Task</span><span class="box"><input data-field="task.text" value="${esc(f.text)}" placeholder="For example, refill minibar" aria-label="Task"></span></label>
        <span class="t14 w5">Team</span>
        <div class="row" style="gap:8px">${['Housekeeping', 'Maintenance', 'Front desk'].map(chip).join('')}</div>
        <label class="field"><span class="t12 c-mut">Room</span>${sel('room', [['', 'No room']].concat(S.rooms.map(r => [r.n, `Room ${r.n}, ${r.type}`])))}</label>
        <label class="field"><span class="t12 c-mut">Owner</span>${sel('owner', S.people.map(p => [p.id, `${p.name}, ${p.role}${onShift(p, Number(f.day)) ? '' : ', off that day'}`]))}</label>
        <div class="row" style="gap:12px">
          <label class="field"><span class="t12 c-mut">Due day</span>${sel('day', Array.from({ length: DAY_COUNT }, (_, i) => [i, dueText(i, '')]))}</label>
          <label class="field"><span class="t12 c-mut">Time, optional</span><span class="box"><input data-field="task.time" value="${esc(f.time)}" placeholder="14:00" maxlength="5" inputmode="numeric" aria-label="Time"></span></label>
        </div>
        ${f.err ? inlineNote(f.err, 'alert') : ''}
      </div>
      <div class="panel-foot">${btn('Add task', 'primary', { cls: 'full', act: 'save-task' })}${btn('Cancel', 'secondary', { cls: 'full', go: 'team/tasks' })}</div>
    </aside>`;
}

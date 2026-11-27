/* App state, routing, actions and events. Data is saved in the browser so work carries over a reload. */

const STORE_KEY = 'front-desk-hub-v3';
const U = {
  inboxTab: 'open', channel: null, search: '',
  pick: {}, msg: {}, msgFor: {}, reason: {}, reply: {},
  offerMenu: null, cleanerMenu: null, flash: null, week: 0,
  toast: null, shift: null, shiftKey: null, task: null, taskKey: null, focus: null
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) { const d = JSON.parse(raw); if (d && d.version === seedState().version) return d; }
  } catch (e) { /* storage blocked or broken, start fresh */ }
  return seedState();
}
function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* the app still works, it just will not survive a reload */ }
}
S = loadState();

(function () {
  const stage = document.getElementById('stage');
  const viewport = document.getElementById('viewport');
  let writingTimer = null, toastTimer = null, lastRoute = null;

  /* ---------- scale the 1920 x 1080 stage to the window ---------- */
  function fit() {
    const w = window.innerWidth, h = window.innerHeight;
    const s = Math.min(w / 1920, h / 1080);
    stage.style.transform = `translate(${(w - 1920 * s) / 2}px, ${(h - 1080 * s) / 2}px) scale(${s})`;
  }
  window.addEventListener('resize', fit);

  /* ---------- routing ---------- */
  const parts = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const routeStr = () => parts().join('/');
  function navigate(route) {
    if (routeStr() === route) render(); else location.hash = '#/' + route;
  }
  function replaceRoute(route) {
    history.replaceState(null, '', '#/' + route);
  }
  window.addEventListener('hashchange', () => { U.offerMenu = null; U.cleanerMenu = null; render(); });

  /* make sure the open chat is in the list on the left */
  function showChatInList(c) {
    if (U.channel && c.ch !== U.channel) U.channel = null;
    if (!inTab(c, U.inboxTab)) U.inboxTab = c.done ? 'done' : 'open';
  }

  function initShiftForm(key, dayArg, pid) {
    if (U.shiftKey === key) return;
    const gaps = deskGaps();
    let day = Number.isInteger(Number(dayArg)) && Number(dayArg) >= 0 && Number(dayArg) < DAY_COUNT ? Number(dayArg) : (gaps[0] ?? 0);
    const p = pid && personOf(pid);
    const existing = p && shiftOf(p, day);
    let role = existing ? existing.r : !deskOn(day).length ? 'Desk' : p ? p.skills[0] : 'Desk';
    if (p && !p.skills.includes(role)) role = p.skills[0];
    let person = p ? p.id : null;
    if (!person && role === 'Desk' && !deskOn(day).length) {
      /* suggest the desk trained person who is not already on the desk, off people last */
      const cands = S.people.filter(x => x.skills.includes('Desk'));
      const working = cands.filter(x => shiftOf(x, day));
      person = (working[0] || cands[0] || {}).id || null;
    }
    const pp = person && personOf(person);
    const ex = pp && shiftOf(pp, day);
    const times = ex && ex.r === role ? ex : SHIFT_ROLES[role];
    U.shift = { day, role, person, s: times.s || times.start, e: times.e || times.end, err: null };
    U.shiftKey = key;
  }
  function initTaskForm() {
    if (U.taskKey) return;
    const hk = housekeepersOn(0)[0];
    U.task = { text: '', group: 'Housekeeping', room: '', owner: hk ? hk.id : S.people[0].id, day: 0, time: '', err: null };
    U.taskKey = 'add';
  }

  function view() {
    const p = parts();
    const [a, b, c, d, e] = p;
    if (a !== 'team' || b !== 'schedule' || c !== 'add') U.shiftKey = null;
    if (a !== 'team' || b !== 'tasks' || c !== 'add') U.taskKey = null;
    if (U.flash) {
      const isShift = String(U.flash).includes(':');
      if ((isShift && a !== 'team') || (!isShift && a !== 'rooms')) U.flash = null;
    }

    if (a === 'inbox') {
      let chat = b && chatOf(b);
      if (!chat) {
        const first = visibleChats()[0];
        if (first) { replaceRoute('inbox/' + first.id); chat = first; }
        else { if (b) replaceRoute('inbox'); return { name: 'Inbox', html: viewInbox(null) }; }
      }
      showChatInList(chat);
      return { name: `Inbox, ${chat.name}`, html: viewInbox(chat.id, c), chat };
    }
    if (a === 'rooms') {
      if (b === 'stay' && c && stayOf(c)) return { name: `Rooms, ${stayOf(c).guest}`, html: viewRooms('stay', c) };
      if (b === 'overlap') return { name: 'Rooms, booked twice', html: viewRooms('overlap') };
      if (b) replaceRoute('rooms');
      return { name: 'Rooms', html: viewRooms() };
    }
    if (a === 'team') {
      if (b === 'floors') return { name: 'Team, rooms by floor', html: viewFloors() };
      if (b === 'tasks') {
        if (c === 'add') { initTaskForm(); return { name: 'Team, add task', html: viewTasks(true) }; }
        return { name: 'Team, tasks', html: viewTasks(false) };
      }
      if (b === 'schedule' && c === 'add') {
        initShiftForm(p.join('/'), d, e && personOf(e) ? e : null);
        return { name: 'Team, add shift', html: viewSchedule(true) };
      }
      if (b !== 'schedule') replaceRoute('team/schedule');
      return { name: 'Team, schedule', html: viewSchedule(false) };
    }
    if (a && a !== 'today') replaceRoute('today');
    return { name: 'Today', html: viewToday() };
  }

  function render() {
    clearTimeout(writingTimer);
    const route = routeStr();
    const keep = {};
    if (route === lastRoute) stage.querySelectorAll('[data-scroll]').forEach(el => { keep[el.dataset.scroll] = el.scrollTop; });
    const v = view();
    const now = routeStr();
    stage.innerHTML = v.html;
    lastRoute = now;
    document.title = `${v.name} · Front Desk Hub`;

    stage.querySelectorAll('[data-scroll]').forEach(el => {
      if (el.dataset.scroll === 'messages') el.scrollTop = el.scrollHeight;
      else if (keep[el.dataset.scroll] != null) el.scrollTop = keep[el.dataset.scroll];
    });
    applySearch();
    drawToast();
    buildMenu(now);
    if (U.focus) {
      const el = stage.querySelector(U.focus);
      U.focus = null;
      if (el) { el.focus(); placeCaretAtEnd(el); }
    }
    /* the AI draft finishes writing on its own */
    if (v.chat && v.chat.draft && v.chat.draft.state === 'writing' && !v.chat.done) {
      const id = v.chat.id;
      writingTimer = setTimeout(() => {
        const c = chatOf(id);
        if (c && c.draft && c.draft.state === 'writing') { c.draft.state = 'ready'; saveState(); if (routeStr().startsWith('inbox/' + id)) render(); }
      }, 2600);
    }
  }
  function placeCaretAtEnd(el) {
    if (el.isContentEditable) {
      const r = document.createRange(); r.selectNodeContents(el); r.collapse(false);
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    } else if (typeof el.setSelectionRange === 'function' && el.type !== 'search') {
      const n = el.value.length; try { el.setSelectionRange(n, n); } catch (e) { /* some inputs do not allow it */ }
    }
  }

  /* ---------- toasts and undo ---------- */
  function toast(text, undoSnap) {
    clearTimeout(toastTimer);
    U.toast = { text, undo: undoSnap || null, shown: false };
    toastTimer = setTimeout(() => { U.toast = null; drawToast(); }, 6000);
  }
  function drawToast() {
    const old = stage.querySelector('.toast');
    if (old) old.remove();
    if (!U.toast) return;
    const app = stage.querySelector('.app');
    if (!app) return;
    app.insertAdjacentHTML('beforeend', `<div class="toast${U.toast.shown ? ' shown' : ''}" role="status">${icon('circle-check')}<span>${esc(U.toast.text)}</span>${U.toast.undo ? `<button data-act="undo">Undo</button>` : `<button data-act="close-toast" aria-label="Close">${icon('x')}</button>`}</div>`);
    U.toast.shown = true;
  }
  /* run a change, save it and offer undo */
  function change(fn, text, then) {
    const snap = JSON.stringify(S);
    const res = fn();
    if (res === false) return;
    saveState();
    if (text) toast(typeof text === 'function' ? text(res) : text, snap);
    if (then) navigate(then); else render();
  }
  function note(text) { toast(text, null); drawToast(); }
  const tick = () => { S.clock += 1; return S.clock; };
  const newId = p => `${p}${S.nextId++}`;

  /* ---------- actions ---------- */
  function checksSummary(q) {
    const b = blocks(q), w = warns(q);
    return b ? `Checks run, ${b} to fix` : w ? `Checks run, ${w} to look at` : 'Checks run, all clear';
  }
  function fieldText(sel) {
    const el = stage.querySelector(sel);
    return el ? el.innerText.replace(/ /g, ' ').trim() : '';
  }
  function cleanerFor(roomN, day) {
    const r = roomOf(roomN);
    const on = S.people.filter(p => p.skills.includes('Rooms') && onShift(p, day, 'Rooms'));
    const own = on.find(p => p.floor === r.floor);
    if (own) return own;
    on.sort((a, b) => S.tasks.filter(t => t.owner === a.id && t.day === day).length - S.tasks.filter(t => t.owner === b.id && t.day === day).length);
    return on[0] || S.people.find(p => p.skills.includes('Rooms'));
  }

  const A = {
    undo() {
      if (!U.toast || !U.toast.undo) return;
      S = JSON.parse(U.toast.undo);
      saveState();
      U.toast = null; U.flash = null;
      render();
    },
    'close-toast'() { U.toast = null; drawToast(); },

    /* inbox */
    tab(d) {
      U.inboxTab = d.tab;
      const first = visibleChats()[0];
      navigate(first ? 'inbox/' + first.id : 'inbox');
    },
    channel(d) {
      U.channel = U.channel === d.ch ? null : d.ch;
      U.inboxTab = 'open';
      const first = visibleChats()[0];
      navigate(first ? 'inbox/' + first.id : 'inbox');
    },
    'mark-done'(d) {
      const c = chatOf(d.chat);
      const q = c.request && reqOf(c.request);
      if (q && q.status === 'pending') { note(`Approve, suggest a room or decline ${q.first}'s request first.`); return; }
      const list = visibleChats();
      const i = list.findIndex(x => x.id === c.id);
      const next = i < 0 ? list[0] : (list[i + 1] || list[i - 1]);
      const target = d.next || (next && next.id !== c.id ? 'inbox/' + next.id : 'inbox');
      change(() => { c.done = true; }, `${c.name} marked done`, target);
    },
    reopen(d) { const c = chatOf(d.chat); change(() => { c.done = false; }, `${c.name} is open again`); },
    'offer-menu'(d) { U.offerMenu = U.offerMenu === d.chat ? null : d.chat; render(); },
    'send-offer'(d) {
      const c = chatOf(d.chat);
      U.offerMenu = null;
      change(() => {
        const time = tick();
        c.messages.push({ t: 'offer', offer: d.offer, time, sub: OFFERS[d.offer].sub(c) });
        c.done = false;
      }, `${OFFERS[d.offer].label} sent to ${c.name}`);
    },
    'send-reply'(d) {
      const c = chatOf(d.chat);
      const input = stage.querySelector(`[data-reply="${c.id}"]`);
      const text = (input ? input.value : U.reply[c.id] || '').trim();
      if (!text) { if (input) input.focus(); note(c.ch === 'Call note' ? 'Write a note first' : 'Write a message first'); return; }
      const call = c.ch === 'Call note';
      U.focus = `[data-reply="${c.id}"]`;
      change(() => {
        const time = tick();
        c.messages.push(call ? { t: 'note', by: 'Nok', text, time } : { t: 'out', by: 'Nok', text, time });
        c.done = false;
        delete U.reply[c.id];
      }, call ? `Note saved for ${c.name}` : `Sent to ${c.name} on ${c.ch}`);
    },
    redraft(d) {
      const c = chatOf(d.chat);
      change(() => { c.draft = { state: 'writing', lang: c.lang === 'TH' ? 'TH' : 'EN', chips: Object.assign({}, c.lastChips || {}) }; });
    },
    'stop-draft'(d) {
      const c = chatOf(d.chat);
      change(() => { c.lastChips = c.draft.chips; delete c.draft; }, 'Draft stopped. You can write your own reply.');
    },
    'edit-draft'(d) {
      const c = chatOf(d.chat);
      c.draft.state = 'editing';
      if (!c.draft.edit) c.draft.edit = { EN: DRAFTS[c.id].EN, TH: DRAFTS[c.id].TH };
      saveState();
      U.focus = `[data-draft="${c.id}"]`;
      render();
    },
    'cancel-edit'(d) {
      const c = chatOf(d.chat);
      c.draft.state = 'ready'; delete c.draft.edit;
      saveState(); render();
    },
    'draft-lang'(d) {
      const c = chatOf(d.chat);
      c.draft.lang = d.lang;
      saveState();
      if (c.draft.state === 'editing') U.focus = `[data-draft="${c.id}"]`;
      render();
    },
    chip(d) {
      const c = chatOf(d.chat);
      c.draft.chips[d.offer] = !c.draft.chips[d.offer];
      saveState(); render();
    },
    'approve-draft'(d) {
      const c = chatOf(d.chat);
      const dr = c.draft;
      if (!dr || dr.state === 'writing') return;
      const orig = DRAFTS[c.id][dr.lang];
      const text = (dr.state === 'editing' && dr.edit ? dr.edit[dr.lang] : orig).replace(/ /g, ' ').trim();
      if (!text) { U.focus = `[data-draft="${c.id}"]`; render(); note('The message is empty. Write something first.'); return; }
      const edited = text !== orig.trim();
      change(() => {
        const time = tick();
        const m = { t: 'out', by: 'Nok', text, time, lang: dr.lang };
        if (dr.lang === 'TH' && !edited) m.tr = DRAFTS[c.id].EN;
        c.messages.push(m);
        Object.keys(dr.chips).filter(k => dr.chips[k]).forEach(k => c.messages.push({ t: 'offer', offer: k, time, sub: OFFERS[k].sub(c) }));
        c.lastChips = dr.chips;
        delete c.draft;
      }, `Reply sent to ${firstName(c.name)} on ${c.ch}`);
    },
    'move-dinner'(d) {
      const c = chatOf(d.chat);
      change(() => {
        const time = tick();
        const from = c.dinner.time;
        c.dinner.time = c.dinner.asked;
        c.messages.push({ t: 'note', by: 'Nok', text: `Dinner on ${fmtDay(c.dinner.day)} moved from ${from} to ${c.dinner.asked}.`, time });
      }, `Dinner moved to ${c.dinner.asked} for ${c.name}`);
    },

    /* booking requests */
    'pick-room'(d) {
      const key = d.key || d.req;
      U.pick[key] = d.room;
      render();
    },
    reason(d) { U.reason[d.req] = d.reason; render(); },
    approve(d) {
      const q = reqOf(d.req);
      if (q.status !== 'pending' || blocks(q)) return;
      const c = chatOf(q.id);
      const summaryText = checksSummary(q);
      change(() => {
        const time = tick();
        let st = q.stay && stayOf(q.stay);
        if (st) st.kind = 'booked';
        else {
          st = { id: newId('s'), ref: q.ref, guest: q.guest, room: q.room, from: q.from, to: q.to, guests: q.guests, ch: q.ch, kind: 'booked', checkedIn: false, chat: q.id };
          S.stays.push(st); q.stay = st.id;
        }
        c.stay = st.id;
        q.status = 'approved';
        q.log.push([time, summaryText], [time, `Approved by Nok, Room ${q.room} held`], [time, `Confirmation sent on ${q.ch}`]);
        c.messages.push({ t: 'out', by: 'Nok', text: confirmText(q, q.room), time, confirm: true });
        c.messages.push({ t: 'offer', offer: 'checkin', time, sub: `Booking ${q.ref}, Room ${q.room}` });
      }, `Booking confirmed for ${q.first}, Room ${q.room}`, 'inbox/' + q.id);
    },
    'send-suggest'(d) {
      const q = reqOf(d.req);
      if (q.status !== 'pending') return;
      const { fit } = requestOptions(q);
      const room = fit.find(r => r.n === d.room);
      if (!room) { note('That room is no longer free. Pick another one.'); render(); return; }
      const text = fieldText('[data-msg]');
      if (!text) { U.focus = '[data-msg]'; render(); note('The message is empty. Write something first.'); return; }
      const c = chatOf(q.id);
      const summaryText = checksSummary(q);
      change(() => {
        const time = tick();
        if (q.stay) { S.stays = S.stays.filter(s => s.id !== q.stay); }
        const hold = { id: newId('s'), ref: q.ref, guest: q.guest, room: room.n, from: q.from, to: q.to, guests: q.guests, ch: q.ch, kind: 'hold', req: q.id, chat: q.id, checkedIn: false };
        S.stays.push(hold);
        q.stay = hold.id; q.status = 'suggested'; q.suggested = room.n;
        q.log.push([time, summaryText], [time, `Room ${room.n} suggested to ${q.first}`]);
        c.messages.push({ t: 'out', by: 'Nok', text, time });
        c.messages.push({ t: 'offer', offer: 'room', room: room.n, time, sub: `${range(q.from, q.to)} · ${q.guests} guests` });
        delete U.msg['suggest:' + q.id]; delete U.pick[q.id];
      }, `Room ${room.n} suggested to ${q.first} on ${q.ch}`, 'inbox/' + q.id);
    },
    'accept-suggest'(d) {
      const q = reqOf(d.req);
      if (q.status !== 'suggested') return;
      const c = chatOf(q.id);
      change(() => {
        const time = tick();
        const st = stayOf(q.stay);
        st.kind = 'booked';
        q.room = q.suggested; q.type = roomOf(q.room).type;
        c.stay = st.id;
        q.status = 'approved';
        q.log.push([time, `${q.first} chose Room ${q.room}`], [time, `Booked by Nok, Room ${q.room} held`], [time, `Confirmation sent on ${q.ch}`]);
        c.messages.push({ t: 'out', by: 'Nok', text: confirmText(q, q.room), time, confirm: true });
        c.messages.push({ t: 'offer', offer: 'checkin', time, sub: `Booking ${q.ref}, Room ${q.room}` });
      }, `Booking confirmed for ${q.first}, Room ${q.suggested}`);
    },
    'send-decline'(d) {
      const q = reqOf(d.req);
      if (q.status !== 'pending') return;
      const text = fieldText('[data-msg]');
      if (!text) { U.focus = '[data-msg]'; render(); note('The message is empty. Write something first.'); return; }
      const reason = U.reason[q.id] || declineDefault(q);
      const c = chatOf(q.id);
      const summaryText = checksSummary(q);
      change(() => {
        const time = tick();
        if (q.stay) { S.stays = S.stays.filter(s => s.id !== q.stay); q.stay = null; }
        q.status = 'declined'; q.reason = reason;
        q.log.push([time, summaryText], [time, `Declined by Nok, ${reason.toLowerCase()}`], [time, 'Request closed']);
        c.messages.push({ t: 'out', by: 'Nok', text, time });
        delete U.msg['decline:' + q.id]; delete U.reason[q.id];
      }, `Decline sent to ${q.first} on ${q.ch}`, 'inbox/' + q.id);
    },
    'add-clean'(d) {
      const q = reqOf(d.req);
      const p = cleanerFor(q.room, q.from);
      change(() => {
        S.tasks.push({ id: newId('t'), group: 'Housekeeping', text: `Clean Room ${q.room} before ${q.guest} arrives`, room: q.room, owner: p.id, day: q.from, time: '10:00', status: 'To do', clean: true });
      }, `Cleaning task added for ${p.name} on ${fmtDay(q.from)}`);
    },

    /* rooms */
    week(d) {
      const by = Number(d.by);
      U.week = by === 0 ? 0 : Math.max(-1, Math.min(3, U.week + by));
      render();
    },
    'fix-overlap'(d) {
      const s = stayOf(d.stay);
      if (!isFree(d.room, s.from, s.to, [s.id])) { note(`Room ${d.room} is no longer free.`); render(); return; }
      const c = s.chat && chatOf(s.chat);
      change(() => {
        const time = tick();
        if (c) {
          const lang = c.lang;
          const m = { t: 'out', by: 'Nok', text: moveText(s, d.room, lang, c.thName), time, lang };
          if (lang === 'TH') m.tr = moveText(s, d.room, 'EN');
          c.messages.push(m);
          c.done = false;
        }
        s.room = d.room;
        U.flash = s.id;
        delete U.pick['ov:' + s.id];
      }, `${s.guest} moved to Room ${d.room}${c ? ` and told on ${c.ch}` : ''}`, 'rooms');
    },
    'move-stay'(d) {
      const s = stayOf(d.stay);
      if (!isFree(d.room, s.from, s.to, [s.id])) { note(`Room ${d.room} is no longer free.`); render(); return; }
      const from = s.room;
      change(() => { s.room = d.room; U.flash = s.id; delete U.pick['mv:' + s.id]; }, `${s.guest} moved from Room ${from} to Room ${d.room}`, 'rooms');
    },
    'check-in'(d) {
      const s = stayOf(d.stay);
      if (roomOf(s.room).clean !== 'Ready') { note(`Room ${s.room} is not ready yet. Mark it ready first.`); return; }
      change(() => { s.checkedIn = true; }, `${s.guest} checked in to Room ${s.room}`);
    },
    'cycle-clean'(d) {
      const r = roomOf(d.room);
      const next = { 'To do': 'Cleaning', Cleaning: 'Ready', Ready: 'To do' }[r.clean];
      change(() => { r.clean = next; }, `Room ${r.n} is now ${next.toLowerCase()}`);
    },

    /* team */
    'shift-person'(d) {
      const f = U.shift;
      f.person = d.person;
      const ex = shiftOf(personOf(d.person), f.day);
      if (ex && ex.r === f.role) { f.s = ex.s; f.e = ex.e; }
      f.err = null; render();
    },
    'shift-role'(d) {
      const f = U.shift;
      f.role = d.role;
      const p = f.person && personOf(f.person);
      if (p && !p.skills.includes(d.role)) f.person = null;
      const ex = f.person && shiftOf(personOf(f.person), f.day);
      const t = ex && ex.r === d.role ? { s: ex.s, e: ex.e } : { s: SHIFT_ROLES[d.role].start, e: SHIFT_ROLES[d.role].end };
      f.s = t.s; f.e = t.e; f.err = null; render();
    },
    'save-shift'() {
      const f = U.shift;
      const p = personOf(f.person);
      if (!p) return;
      if (!validTime(f.s) || !validTime(f.e)) { f.err = 'Write the times as HH:MM, for example 07:00.'; render(); return; }
      if (f.e <= f.s) { f.err = 'The shift has to end after it starts.'; render(); return; }
      if (!p.skills.includes(f.role)) { f.err = `${p.name} is not trained for ${SHIFT_ROLES[f.role].skill}.`; render(); return; }
      const day = f.day;
      change(() => { p.plan[day] = { r: f.role, s: f.s, e: f.e }; U.flash = `${p.id}:${day}`; },
        f.role === 'Desk' ? `${p.name} covers the front desk on ${fmtDay(day)}` : `${p.name} is on ${f.role} on ${fmtDay(day)}`, 'team/schedule');
    },
    'clear-shift'() {
      const f = U.shift;
      const p = personOf(f.person);
      if (!p || !shiftOf(p, f.day)) return;
      const day = f.day;
      change(() => { p.plan[day] = null; }, `${p.name} is off on ${fmtDay(day)}`, 'team/schedule');
    },
    'cleaner-menu'(d) { U.cleanerMenu = U.cleanerMenu === d.room ? null : d.room; render(); },
    'keep-one'(d) {
      const p = personOf(d.person);
      change(() => { S.assign[d.room] = { owners: [d.person] }; }, `Room ${d.room} stays with ${p.name}`);
    },
    'give-room'(d) {
      const p = personOf(d.person);
      U.cleanerMenu = null;
      const a = S.assign[d.room];
      if (a.owners.length === 1 && a.owners[0] === d.person && !a.cover) { render(); return; }
      change(() => { S.assign[d.room] = { owners: [d.person] }; }, `Room ${d.room} moved to ${p.name}`);
    },
    'fix-floors'() {
      const parts2 = [];
      change(() => {
        floorIssues().forEach(i => {
          const a = S.assign[i.room];
          if (i.kind === 'double') { S.assign[i.room] = { owners: [a.owners[0]] }; parts2.push(`Room ${i.room} stays with ${personOf(a.owners[0]).name}.`); }
          else {
            const best = bestCleaner([a.owners[0]]);
            if (best) { S.assign[i.room] = { owners: [best.id] }; parts2.push(`Room ${i.room} moved to ${best.name}.`); }
          }
        });
        if (!parts2.length) return false;
      }, () => parts2.join(' '));
    },
    'assign-floors'() {
      change(() => {
        S.rooms.forEach(r => {
          const owner = S.people.find(p => p.floor === r.floor);
          if (!owner) return;
          if (onShift(owner, 0, 'Rooms')) { S.assign[r.n] = { owners: [owner.id] }; return; }
          const a = S.assign[r.n];
          let cover = a.cover && onShift(personOf(a.cover), 0, 'Rooms') ? a.cover : null;
          if (!cover) {
            const other = S.rooms.find(x => x.floor === r.floor && S.assign[x.n].cover && onShift(personOf(S.assign[x.n].cover), 0, 'Rooms'));
            cover = other ? S.assign[other.n].cover : (bestCleaner([owner.id]) || {}).id;
          }
          S.assign[r.n] = cover ? { owners: [owner.id], cover } : { owners: [owner.id] };
        });
      }, 'Every room is assigned to its floor cleaner');
    },
    'toggle-task'(d) {
      const t = S.tasks.find(x => x.id === d.task);
      change(() => { t.status = t.status === 'Done' ? 'To do' : 'Done'; });
    },
    'delete-task'(d) {
      const t = S.tasks.find(x => x.id === d.task);
      change(() => { S.tasks = S.tasks.filter(x => x.id !== d.task); }, `Task deleted, ${t.text}`);
    },
    'task-group'(d) {
      const f = U.task;
      f.group = d.group;
      const day = Number(f.day);
      const pick = d.group === 'Maintenance' ? S.people.find(p => p.skills.includes('Fix'))
        : d.group === 'Front desk' ? (deskOn(day)[0] || S.people.find(p => p.skills.includes('Desk')))
          : (housekeepersOn(day)[0] || S.people.find(p => p.skills.includes('Rooms')));
      if (pick) f.owner = pick.id;
      render();
    },
    'save-task'() {
      const f = U.task;
      const text = f.text.trim();
      if (!text) { f.err = 'Write what needs doing.'; U.focus = '[data-field="task.text"]'; render(); return; }
      if (f.time && !validTime(f.time)) { f.err = 'Write the time as HH:MM, for example 14:00, or leave it empty.'; render(); return; }
      const owner = personOf(f.owner);
      change(() => {
        S.tasks.push({ id: newId('t'), group: f.group, text, room: f.room || '', owner: f.owner, day: Number(f.day), time: f.time, status: 'To do', clean: f.group === 'Housekeeping' && /clean/i.test(text) && !!f.room });
      }, `Task added for ${owner.name}`, 'team/tasks');
    },

    /* presenting */
    reset() {
      const snap = JSON.stringify(S);
      S = seedState();
      saveState();
      Object.assign(U, { inboxTab: 'open', channel: null, search: '', pick: {}, msg: {}, msgFor: {}, reason: {}, reply: {}, flash: null, week: 0 });
      toast('Sample data restored', snap);
      menu.classList.remove('open'); toggle.classList.remove('open');
      navigate('today');
    }
  };

  window.__actions = A; /* lets the test runner confirm every button has an action */

  /* ---------- events ---------- */
  stage.addEventListener('click', e => {
    const el = e.target.closest('[data-act], [data-go]');
    const inPop = e.target.closest('.pop-wrap');
    if (!inPop && (U.offerMenu || U.cleanerMenu)) {
      U.offerMenu = null; U.cleanerMenu = null;
      if (!el) { render(); return; }
    }
    if (!el || el.disabled) return;
    e.preventDefault();
    if (el.dataset.act) {
      const fn = A[el.dataset.act];
      if (fn) fn(Object.assign({}, el.dataset));
    } else {
      navigate(el.dataset.go);
    }
  });

  stage.addEventListener('input', e => {
    const t = e.target;
    if (t.matches('[data-search]')) { U.search = t.value; applySearch(); return; }
    if (t.matches('[data-reply]')) { U.reply[t.dataset.reply] = t.value; return; }
    if (t.matches('[data-draft]')) {
      const c = chatOf(t.dataset.draft);
      if (c && c.draft && c.draft.edit) { c.draft.edit[c.draft.lang] = t.innerText; saveState(); }
      return;
    }
    if (t.matches('[data-msg]')) { U.msg[t.dataset.msg] = t.innerText; U.msgFor[t.dataset.msg] = t.dataset.for; return; }
    if (t.matches('[data-field]') && t.tagName === 'INPUT') {
      const [form, k] = t.dataset.field.split('.');
      if (U[form]) { U[form][k] = t.value; U[form].err = null; }
    }
  });
  /* paste plain text only into editable message boxes */
  stage.addEventListener('paste', e => {
    const t = e.target.closest('[contenteditable="true"]');
    if (!t) return;
    e.preventDefault();
    const txt = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, txt);
  });
  stage.addEventListener('change', e => {
    const t = e.target;
    if (t.matches('select[data-field]')) {
      const [form, k] = t.dataset.field.split('.');
      if (!U[form]) return;
      U[form][k] = k === 'day' ? Number(t.value) : t.value;
      if (form === 'shift' && k === 'day') {
        const f = U.shift;
        const p = f.person && personOf(f.person);
        const ex = p && shiftOf(p, f.day);
        const tm = ex && ex.r === f.role ? { s: ex.s, e: ex.e } : { s: SHIFT_ROLES[f.role].start, e: SHIFT_ROLES[f.role].end };
        f.s = tm.s; f.e = tm.e;
      }
      U[form].err = null;
      render();
    }
  });
  stage.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.matches('[data-reply]')) { e.preventDefault(); A['send-reply']({ chat: e.target.dataset.reply }); }
    if (e.key === 'Enter' && e.target.matches('[data-field^="task."]') && e.target.tagName === 'INPUT') { e.preventDefault(); A['save-task'](); }
    if (e.key === 'Enter' && e.target.matches('[data-field^="shift."]') && e.target.tagName === 'INPUT') { e.preventDefault(); A['save-shift'](); }
  });

  function applySearch() {
    const q = U.search.trim().toLowerCase();
    let shown = 0;
    stage.querySelectorAll('.chat-row').forEach(r => { const on = !q || r.dataset.name.includes(q); r.style.display = on ? '' : 'none'; if (on) shown++; });
    const empty = stage.querySelector('[data-empty]');
    if (empty) {
      empty.hidden = shown > 0;
      if (q && !shown) empty.querySelector('span').textContent = `No guest matches "${U.search.trim()}"`;
    }
  }

  /* ---------- go to menu, for presenting ---------- */
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');
  toggle.innerHTML = icon('grid') + 'Go to';
  toggle.addEventListener('click', () => { menu.classList.toggle('open'); toggle.classList.toggle('open'); });
  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) { menu.classList.remove('open'); toggle.classList.remove('open'); }
  });
  function buildMenu(route) {
    const link = (r, label) => `<a href="#/${r}" class="${route === r || route.startsWith(r + '/') && r !== 'inbox' ? 'on' : ''}">${esc(label)}</a>`;
    let html = '<h3>Pages</h3>' + link('today', 'Today') + link('rooms', 'Rooms') + link('team/schedule', 'Team, schedule') + link('team/floors', 'Team, rooms by floor') + link('team/tasks', 'Team, tasks');
    html += '<h3>Chats</h3>' + S.chats.filter(c => !c.done).map(c => link('inbox/' + c.id, c.name)).join('');
    html += `<h3>Sample data</h3><button class="menu-btn" data-menu-act="reset">${icon('arrow-right')}Start over with the sample data</button>`;
    html += `<p class="hint">Changes are saved in this browser, so they stay after a reload. Press M to open this list.</p>`;
    menu.innerHTML = html;
  }
  menu.addEventListener('click', e => {
    if (e.target.closest('[data-menu-act="reset"]')) { A.reset(); return; }
    if (e.target.closest('a')) { menu.classList.remove('open'); toggle.classList.remove('open'); }
  });

  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (e.key === 'Escape') {
      menu.classList.remove('open'); toggle.classList.remove('open');
      if (U.offerMenu || U.cleanerMenu) { U.offerMenu = null; U.cleanerMenu = null; render(); return; }
      const p = parts();
      if (p[0] === 'rooms' && p[1]) navigate('rooms');
      else if (p[0] === 'team' && p[2] === 'add') navigate(`team/${p[1]}`);
      else if (p[0] === 'inbox' && p[2]) navigate(`inbox/${p[1]}`);
    }
    if (e.key === 'm' || e.key === 'M') { menu.classList.toggle('open'); toggle.classList.toggle('open'); }
  });

  /* keep tabs in sync if the app is open twice */
  window.addEventListener('storage', e => {
    if (e.key !== STORE_KEY) return;
    S = loadState(); render();
  });

  fit();
  render();
  toggle.classList.add('peek');
  setTimeout(() => toggle.classList.remove('peek'), 3500);
  viewport.removeAttribute('hidden');
})();

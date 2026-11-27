/* Everything the screens show is worked out here from the current data (S). */

let S = null; /* the live data, set by main.js */

/* ---------- dates and times ---------- */
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MON_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function dateOf(d) { return new Date(START_DATE.getFullYear(), START_DATE.getMonth(), START_DATE.getDate() + d); }
function dayName(d) { return DOW[dateOf(d).getDay()]; }
function dayNum(d) { return dateOf(d).getDate(); }
function fmtDate(d) { const x = dateOf(d); return `${x.getDate()} ${MON[x.getMonth()]}`; }
function fmtDay(d) { return `${dayName(d)} ${fmtDate(d)}`; }
function range(a, b) {
  const x = dateOf(a), y = dateOf(b);
  return x.getMonth() === y.getMonth() ? `${x.getDate()} to ${y.getDate()} ${MON[y.getMonth()]}` : `${fmtDate(a)} to ${fmtDate(b)}`;
}
function rangeTh(a, b) {
  const x = dateOf(a), y = dateOf(b);
  return x.getMonth() === y.getMonth() ? `${x.getDate()} ถึง ${y.getDate()} ${MON_TH[y.getMonth()]}` : `${x.getDate()} ${MON_TH[x.getMonth()]} ถึง ${y.getDate()} ${MON_TH[y.getMonth()]}`;
}
function dueText(day, time) {
  const base = day === 0 ? 'Today' : day === 1 ? 'Tomorrow' : fmtDay(day);
  return time ? `${base} ${time}` : base;
}
const hm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
function dur(m) {
  if (m < 60) return `${Math.max(1, m)} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h} h ${String(r).padStart(2, '0')} m` : `${h} h`;
}
const validTime = v => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const listJoin = a => a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];

/* ---------- lookups ---------- */
const roomOf = n => S.rooms.find(r => r.n === n);
const stayOf = id => S.stays.find(s => s.id === id);
const chatOf = id => S.chats.find(c => c.id === id);
const personOf = id => S.people.find(p => p.id === id);
const reqOf = id => S.requests[id];
const firstName = name => name.replace(/^(Khun|Ms|Mr)\s+/, '').split(' ')[0];

/* ---------- stays and the room board ---------- */
const HOLDS_ROOM = ['booked', 'hold', 'request'];
const overlapsRange = (s, from, to) => s.from < to && from < s.to;
function staysIn(room) { return S.stays.filter(s => s.room === room); }
function isFree(room, from, to, ignore = []) {
  return !S.stays.some(s => s.room === room && HOLDS_ROOM.includes(s.kind) && !ignore.includes(s.id) && overlapsRange(s, from, to));
}
function blockerOf(room, from, to, ignore = []) {
  return S.stays.find(s => s.room === room && HOLDS_ROOM.includes(s.kind) && !ignore.includes(s.id) && overlapsRange(s, from, to));
}
/* pairs of confirmed stays that hold the same room on the same night */
function overlaps() {
  const out = [];
  S.rooms.forEach(r => {
    const list = staysIn(r.n).filter(s => s.kind === 'booked' || s.kind === 'hold');
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      if (!overlapsRange(a, b.from, b.to)) continue;
      const [keep, move] = Number(a.ref) <= Number(b.ref) ? [a, b] : [b, a];
      out.push({ room: r.n, keep, move, from: Math.max(a.from, b.from), to: Math.min(a.to, b.to) });
    }
  });
  return out;
}
function nightsBooked(room) {
  return staysIn(room).filter(s => s.kind !== 'request').reduce((n, s) => n + Math.max(0, Math.min(s.to, DAY_COUNT) - Math.max(s.from, 0)), 0);
}
function priceDiff(fromType, toType) { return ROOM_TYPES[toType].price - ROOM_TYPES[fromType].price; }
function priceText(diff) {
  if (!diff) return 'Same price';
  return diff > 0 ? `THB ${diff.toLocaleString('en-US')} more a night` : `THB ${(-diff).toLocaleString('en-US')} less a night`;
}
/* free rooms that fit a guest group, best first.
   Same type first, then the smallest upgrade, then the room used least these two weeks. */
function roomChoices(type, from, to, guests, exclude, ignore = []) {
  return S.rooms
    .filter(r => r.n !== exclude && r.sleeps >= guests && isFree(r.n, from, to, ignore))
    .sort((a, b) => {
      const sa = a.type === type ? 0 : 1, sb = b.type === type ? 0 : 1;
      if (sa !== sb) return sa - sb;
      const da = priceDiff(type, a.type), db = priceDiff(type, b.type);
      const ka = da < 0 ? 1e6 - da : da, kb = db < 0 ? 1e6 - db : db;
      if (ka !== kb) return ka - kb;
      const na = nightsBooked(a.n), nb = nightsBooked(b.n);
      return na !== nb ? na - nb : a.n.localeCompare(b.n);
    });
}
function moveChoices(stay) { return roomChoices(roomOf(stay.room).type, stay.from, stay.to, stay.guests, stay.room, [stay.id]); }

/* ---------- team ---------- */
const shiftOf = (p, d) => (p.plan[d] || null);
const onShift = (p, d, role) => { const s = shiftOf(p, d); return !!s && (!role || s.r === role); };
const deskOn = d => S.people.filter(p => onShift(p, d, 'Desk'));
function deskGaps() { const g = []; for (let d = 0; d < DAY_COUNT; d++) if (!deskOn(d).length) g.push(d); return g; }
function shiftLabel(s) {
  const short = t => t.endsWith(':00') ? t.slice(0, 2) : t;
  return `${short(s.s)}–${short(s.e)}`;
}

/* who actually cleans a room today */
function cleanersOf(room) {
  const a = S.assign[room];
  const owners = a.owners.map(personOf);
  if (a.cover && owners.every(p => !onShift(p, 0))) return [a.cover];
  return a.owners.slice();
}
function floorIssues() {
  const out = [];
  S.rooms.forEach(r => {
    const a = S.assign[r.n];
    if (a.owners.length > 1) out.push({ room: r.n, kind: 'double', who: a.owners.slice() });
    else if (!a.cover && !onShift(personOf(a.owners[0]), 0)) out.push({ room: r.n, kind: 'off', who: a.owners.slice() });
  });
  return out;
}
function housekeepersOn(d) { return S.people.filter(p => p.skills.includes('Rooms') && onShift(p, d, 'Rooms')); }
function roomsCleanedBy(pid) { return S.rooms.filter(r => cleanersOf(r.n).includes(pid)).map(r => r.n); }
/* the on-shift housekeeper with the fewest rooms, used to take a room from someone */
function bestCleaner(exclude = []) {
  const list = housekeepersOn(0).filter(p => !exclude.includes(p.id));
  list.sort((a, b) => roomsCleanedBy(a.id).length - roomsCleanedBy(b.id).length);
  return list[0] || null;
}
function teamProblems() { return deskGaps().length + floorIssues().length; }
const openTasks = () => S.tasks.filter(t => t.status !== 'Done');

/* ---------- booking request checks ---------- */
function lastCheckoutBefore(room, day) {
  return staysIn(room).filter(s => s.kind === 'booked' && s.to <= day).reduce((m, s) => Math.max(m, s.to), 0);
}
function cleaningTaskFor(room, from) {
  const after = lastCheckoutBefore(room, from);
  return S.tasks.find(t => t.clean && t.room === room && t.day <= from && t.day >= after);
}
function requestChecks(q) {
  const room = roomOf(q.room);
  const ignore = q.stay ? [q.stay] : [];
  const out = [];
  const blocker = S.stays.find(s => s.room === q.room && (s.kind === 'booked' || s.kind === 'hold') && !ignore.includes(s.id) && overlapsRange(s, q.from, q.to));
  out.push(blocker
    ? { key: 'overlap', kind: 'block', title: 'Overlapping bookings', desc: `${blocker.guest} holds Room ${q.room} until ${fmtDate(blocker.to)}`, link: 'See room board', go: 'rooms' }
    : { key: 'overlap', kind: 'clear', title: 'Overlapping bookings', desc: `Room ${q.room} is free ${range(q.from, q.to)}` });
  if (room.sleeps < q.guests) {
    const best = requestOptions(q).fit[0];
    out.push({ key: 'guests', kind: 'block', title: 'Guest count', desc: `${room.type} sleeps ${room.sleeps}, request is for ${q.guests}`, link: best ? `Suggest Room ${best.n}` : 'Suggest another room', go: `inbox/${q.id}/suggest` });
  } else {
    out.push({ key: 'guests', kind: 'clear', title: 'Guest count', desc: `${room.type} sleeps ${room.sleeps}, request is for ${q.guests}` });
  }
  const task = cleaningTaskFor(q.room, q.from);
  out.push(task
    ? { key: 'clean', kind: 'clear', title: 'Room cleaned', desc: `${task.status === 'Done' ? 'Cleaned' : 'Cleaning booked'} for ${fmtDay(task.day)}, ${personOf(task.owner).name}` }
    : { key: 'clean', kind: 'warn', title: 'Room cleaned', desc: `No cleaning booked for Room ${q.room} before ${fmtDate(q.from)}`, link: 'Add cleaning task', act: 'add-clean' });
  const desk = deskOn(q.from).map(p => p.name);
  out.push(desk.length
    ? { key: 'staff', kind: 'clear', title: 'Staff on duty', desc: `${listJoin(desk)} ${desk.length > 1 ? 'are' : 'is'} on the front desk on ${fmtDate(q.from)}` }
    : { key: 'staff', kind: 'warn', title: 'Staff on duty', desc: `No one is on the front desk on ${fmtDate(q.from)}`, link: 'Add a desk shift', go: `team/schedule/add/${q.from}` });
  return out;
}
const blocks = q => requestChecks(q).filter(c => c.kind === 'block').length;
const warns = q => requestChecks(q).filter(c => c.kind === 'warn').length;

function requestOptions(q) {
  const ignore = q.stay ? [q.stay] : [];
  const fit = roomChoices(q.type, q.from, q.to, q.guests, q.room, ignore).slice(0, 3);
  let na = null;
  const same = S.rooms.find(r => r.type === q.type && r.n !== q.room && !fit.includes(r));
  if (same) {
    const b = blockerOf(same.n, q.from, q.to, ignore);
    na = { room: same, why: same.sleeps < q.guests ? `Too small for ${q.guests}` : b ? `Booked by ${b.guest} until ${fmtDate(b.to)}` : 'Not free' };
  }
  return { fit, na };
}

/* ---------- message templates ---------- */
function suggestText(q, n) {
  const r = roomOf(n), asked = roomOf(q.room);
  const checks = requestChecks(q);
  const busy = checks.find(c => c.key === 'overlap').kind === 'block';
  const small = asked.sleeps < q.guests;
  const why = busy && small ? `Room ${q.room} is not free on those dates and sleeps ${asked.sleeps}.`
    : busy ? `Room ${q.room} is not free on those dates.`
      : small ? `Room ${q.room} sleeps ${asked.sleeps}.`
        : 'thank you for your request.';
  const diff = priceDiff(q.type, r.type);
  const price = diff ? `at ${priceText(diff)}` : 'at the same price';
  return `Hi ${q.first}, ${why} Room ${n} is a ${r.type} room for up to ${r.sleeps} people and is free from ${range(q.from, q.to)}, ${price}. Tap below to book it.`;
}
const DECLINE_REASONS = ['Not available for these dates', 'Over capacity', 'Other'];
function declineDefault(q) {
  const c = requestChecks(q);
  if (c.find(x => x.key === 'overlap').kind === 'block') return DECLINE_REASONS[0];
  if (c.find(x => x.key === 'guests').kind === 'block') return DECLINE_REASONS[1];
  return DECLINE_REASONS[2];
}
function declineText(q, reason) {
  const r = roomOf(q.room);
  const mid = reason === DECLINE_REASONS[0] ? `Room ${q.room} is not available from ${range(q.from, q.to)}.`
    : reason === DECLINE_REASONS[1] ? `our ${r.type} rooms sleep ${r.sleeps}, so we cannot fit ${q.guests} guests from ${range(q.from, q.to)}.`
      : `we cannot take this booking from ${range(q.from, q.to)}.`;
  return `Hi ${q.first}, thank you for asking. We are sorry, ${mid} We hope to welcome you another time.`;
}
function confirmText(q, n) {
  return `Hi ${q.first}, your ${roomOf(n).type} room is confirmed for ${range(q.from, q.to)}, Room ${n}. Check in starts at 14:00. You can check in online now from the link below.`;
}
function moveText(stay, n, lang, thName) {
  const to = roomOf(n);
  const same = roomOf(stay.room).type === to.type;
  if (lang === 'TH') {
    const who = thName || 'คุณ' + firstName(stay.guest);
    return same
      ? `เรียน${who} ห้อง ${stay.room} ไม่ว่างในวันที่ ${rangeTh(stay.from, stay.to)} เราย้ายคุณไปห้อง ${n} ซึ่งเป็นห้อง${ROOM_TYPES[to.type].th}แบบเดียวกัน ไม่มีค่าใช้จ่ายเพิ่มค่ะ`
      : `เรียน${who} ห้อง ${stay.room} ไม่ว่างในวันที่ ${rangeTh(stay.from, stay.to)} เราย้ายคุณไปห้อง ${n} ซึ่งเป็นห้อง${ROOM_TYPES[to.type].th} โดยอัปเกรดให้ไม่มีค่าใช้จ่ายเพิ่มค่ะ`;
  }
  return same
    ? `Room ${stay.room} is not free ${range(stay.from, stay.to)}. We moved you to Room ${n}, the same ${to.type} type, at no extra cost.`
    : `Room ${stay.room} is not free ${range(stay.from, stay.to)}. We moved you to Room ${n}, a ${to.type} room, as a free upgrade.`;
}

/* ---------- chats ---------- */
const INCOMING = ['in', 'call'];
function lastReal(c) { return [...c.messages].reverse().find(m => m.t !== 'request' && m.by !== 'Auto reply'); }
function waitingSince(c) {
  const q = c.request && reqOf(c.request);
  if (q && q.status === 'pending') return q.asked;
  const m = lastReal(c);
  return m && INCOMING.includes(m.t) ? m.time : null;
}
function needsYou(c) {
  if (c.done) return false;
  const q = c.request && reqOf(c.request);
  if (q && q.status === 'pending') return true;
  if (c.draft) return true;
  const m = lastReal(c);
  return !!m && INCOMING.includes(m.t);
}
function chatPill(c) {
  if (c.done) return ['Done', ''];
  const q = c.request && reqOf(c.request);
  if (q) {
    if (q.status === 'pending') return blocks(q) ? ['Request', 'alert'] : ['Request', 'accent'];
    return { approved: ['Confirmed', 'accent'], suggested: ['Room suggested', ''], declined: ['Declined', ''] }[q.status];
  }
  if (c.draft) return c.draft.state === 'writing' ? ['Writing', 'wait'] : ['Draft ready', 'wait'];
  return needsYou(c) ? ['Needs reply', ''] : ['Replied', ''];
}
function previewOf(c) {
  const m = lastReal(c);
  if (!m) return '';
  if (m.t === 'offer') return `Offer sent, ${OFFERS[m.offer].title(c, m)}`;
  if (m.t === 'note') return `Note, ${m.text}`;
  if (m.t === 'call') return m.text;
  return (m.t === 'out' ? 'You replied, ' : '') + m.text;
}
function chatTime(c) {
  const w = needsYou(c) ? waitingSince(c) : null;
  if (w != null) return dur(S.clock - w);
  const m = lastReal(c);
  return m ? hm(m.time) : '';
}

/* offer cards staff can add to a message */
const OFFERS = {
  book: { label: 'Book another room', icon: 'bed', title: () => 'Book another room', sub: (c) => { const s = c.stay && stayOf(c.stay); return s ? `Rooms free ${range(s.from, s.to)}` : 'Pick dates and a room'; }, cta: 'Choose a room' },
  checkin: { label: 'Check in online', icon: 'key', title: () => 'Check in online', sub: (c) => { const s = stayOf(c.stay); return `Booking ${s.ref}, Room ${s.room}`; }, cta: 'Start check in', needsStay: true },
  taxi: { label: 'Taxi from airport', icon: 'arrow-right', title: () => 'Taxi from airport', sub: () => 'Our address in Thai for the driver', cta: 'Show address' },
  room: { label: 'Room', icon: 'bed', title: (c, m) => `${roomOf(m.room).type} room`, sub: (c, m) => m.sub, cta: 'Book this room' }
};
function offersFor(c) { return ['book', 'checkin', 'taxi'].filter(k => !OFFERS[k].needsStay || c.stay); }

/* ---------- counts shown in the sidebar and on Today ---------- */
function counts() {
  return {
    inbox: S.chats.filter(needsYou).length,
    rooms: overlaps().length,
    team: teamProblems()
  };
}

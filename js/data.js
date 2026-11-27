/* Starting data for Front Desk Hub. Everything the app shows is worked out from this.
   Day 0 is Thu 12 Nov 2026. A stay from day a to day b checks in on day a and checks out on day b.
   Times are minutes after midnight. */

const START_DATE = new Date(2026, 10, 12);
const DAY_COUNT = 14;

const ROOM_TYPES = {
  Standard: { price: 1800, th: 'สแตนดาร์ด' },
  Deluxe: { price: 2400, th: 'ดีลักซ์' },
  Garden: { price: 2600, th: 'การ์เดน' },
  Family: { price: 3200, th: 'แฟมิลี่' }
};

const SHIFT_ROLES = {
  Desk: { start: '07:00', end: '15:00', cls: 'desk', skill: 'the desk' },
  Rooms: { start: '08:00', end: '16:00', cls: 'rooms', skill: 'room cleaning' },
  Fix: { start: '09:00', end: '17:00', cls: 'fix', skill: 'repairs' }
};

const DRAFTS = {
  alex: {
    EN: 'Hi Alex, check in starts at 14:00. If you arrive earlier you can leave your bags with us and we will message you as soon as Room 04 is ready. You can also check in online now to save time at the desk.',
    TH: 'สวัสดีค่ะคุณอเล็กซ์ เช็คอินได้ตั้งแต่ 14:00 น. ถ้ามาถึงก่อนสามารถฝากกระเป๋าไว้กับเราได้ และเราจะส่งข้อความแจ้งทันทีที่ห้อง 04 พร้อมค่ะ คุณเช็คอินออนไลน์ได้เลยตอนนี้เพื่อประหยัดเวลาที่เคาน์เตอร์ค่ะ'
  },
  kenji: {
    EN: 'Hi Kenji, thank you for asking. We are sorry, but the hotel does not offer airport pickup. A taxi from Suvarnabhumi is the easiest way to reach us, and we can write our address in Thai for your driver. We look forward to welcoming you on Friday 13 Nov.',
    TH: 'สวัสดีค่ะคุณเคนจิ ขอบคุณที่สอบถามนะคะ ขออภัยค่ะ ทางโรงแรมไม่มีบริการรับส่งสนามบิน การนั่งแท็กซี่จากสุวรรณภูมิเป็นวิธีที่สะดวกที่สุดในการมาถึงเรา และเราเขียนที่อยู่เป็นภาษาไทยให้คนขับได้ค่ะ เราหวังว่าจะได้ต้อนรับคุณในวันศุกร์ที่ 13 พ.ย. ค่ะ'
  },
  pim: {
    TH: 'ได้ค่ะคุณพิม เลือกห้องจากลิงก์ด้านล่างได้เลยค่ะ และเช็คอินออนไลน์ล่วงหน้าได้ค่ะ',
    EN: 'Yes, Khun Pim. You can pick a room from the link below and check in online ahead.'
  }
};

function seedState() {
  const t = (h, m) => h * 60 + m;
  const plan = s => s.split('').map(k => k === 'O' ? null : { r: { D: 'Desk', R: 'Rooms', F: 'Fix' }[k] }).map(x => x && Object.assign(x, { s: SHIFT_ROLES[x.r].start, e: SHIFT_ROLES[x.r].end }));
  const stay = (id, ref, guest, room, from, to, guests, ch, extra = {}) => Object.assign({ id, ref, guest, room, from, to, guests, ch, kind: 'booked', checkedIn: false }, extra);

  return {
    version: 3,
    clock: t(14, 1),
    rooms: [
      ['01', 'Standard', 2, 1, 'Ready'], ['02', 'Standard', 2, 1, 'Ready'], ['03', 'Standard', 2, 1, 'Ready'], ['04', 'Deluxe', 2, 1, 'Ready'],
      ['05', 'Deluxe', 2, 2, 'To do'], ['06', 'Deluxe', 2, 2, 'To do'], ['07', 'Deluxe', 2, 2, 'To do'], ['08', 'Garden', 2, 2, 'To do'],
      ['09', 'Family', 4, 3, 'Cleaning'], ['10', 'Family', 4, 3, 'To do'], ['11', 'Garden', 2, 3, 'To do'], ['12', 'Deluxe', 2, 3, 'To do']
    ].map(([n, type, sleeps, floor, clean]) => ({ n, type, sleeps, floor, clean })),

    stays: [
      stay('lena', '2024', 'Lena Fischer', '01', -2, 0, 1, 'WhatsApp', { checkedIn: true, checkoutTime: '11:00', chat: 'lena' }),
      stay('marco', '2030', 'Marco Rossi', '02', 2, 6, 2, 'Booking platform'),
      stay('somchai', '2035', 'Khun Somchai', '03', 4, 6, 2, 'Call note', { chat: 'somchai' }),
      stay('alex', '2036', 'Alex Morgan', '04', 0, 2, 2, 'WhatsApp', { eta: '14:00', chat: 'alex' }),
      stay('noor-req', '2040', 'Noor Haddad', '04', 3, 5, 2, 'WhatsApp', { kind: 'request', req: 'noor', chat: 'noor' }),
      stay('park', '2037', 'Park family', '05', 6, 10, 2, 'Booking platform'),
      stay('tanaka', '2032', 'Ms Tanaka', '06', 1, 3, 2, 'LINE', { chat: 'tanaka' }),
      stay('kenji', '2031', 'Kenji Sato', '07', 1, 4, 2, 'Booking platform', { chat: 'kenji' }),
      stay('pim', '2038', 'Khun Pim', '07', 2, 4, 2, 'LINE', { chat: 'pim' }),
      stay('hall', '2033', 'J. Hall', '07', 5, 8, 2, 'Booking platform'),
      stay('ryan', '2039', 'Ryan Ortiz', '08', 8, 12, 2, 'Booking platform'),
      stay('chen', '2028', 'Chen family', '09', 0, 3, 4, 'Booking platform', { eta: '15:00', chat: 'chen' }),
      stay('arthit', '2042', 'Khun Arthit', '10', 9, 13, 3, 'LINE'),
      stay('nida', '2034', 'Khun Nida', '11', 0, 1, 1, 'LINE', { eta: '18:30', chat: 'nida' }),
      stay('olsen', '2026', 'Olsen', '12', 6, 9, 2, 'WhatsApp')
    ],

    requests: {
      mia: { id: 'mia', ref: '2041', guest: 'Mia Laurent', first: 'Mia', ch: 'LINE', room: '07', type: 'Deluxe', from: 7, to: 9, guests: 3, asked: t(13, 59), status: 'pending', stay: null, log: [[t(13, 59), 'Request received on LINE'], [t(13, 59), 'Auto reply sent']] },
      noor: { id: 'noor', ref: '2040', guest: 'Noor Haddad', first: 'Noor', ch: 'WhatsApp', room: '04', type: 'Deluxe', from: 3, to: 5, guests: 2, asked: t(13, 53), status: 'pending', stay: 'noor-req', log: [[t(13, 53), 'Request received on WhatsApp'], [t(13, 53), 'Auto reply sent']] }
    },

    chats: [
      {
        id: 'mia', name: 'Mia Laurent', ini: 'ML', ch: 'LINE', lang: 'EN', request: 'mia', topic: 'booking request',
        messages: [
          { t: 'in', text: 'Hi, do you have a room for 3 people from 19 to 21 Nov? We would like the Deluxe room if possible.', time: t(13, 59) },
          { t: 'request', req: 'mia', time: t(13, 59) },
          { t: 'out', by: 'Auto reply', text: 'Thanks Mia, we have your request and will reply within 15 minutes.', time: t(13, 59) }
        ]
      },
      {
        id: 'noor', name: 'Noor Haddad', ini: 'NH', ch: 'WhatsApp', lang: 'EN', request: 'noor', topic: 'booking request',
        messages: [
          { t: 'in', text: 'Hello, I would like to book a Deluxe room for 2 people from 15 to 17 Nov.', time: t(13, 53) },
          { t: 'request', req: 'noor', time: t(13, 53) },
          { t: 'out', by: 'Auto reply', text: 'Thanks Noor, we have your request and will reply within 15 minutes.', time: t(13, 53) }
        ]
      },
      {
        id: 'alex', name: 'Alex Morgan', ini: 'AM', ch: 'WhatsApp', lang: 'EN', stay: 'alex', topic: 'asked about check in time',
        checkin: [['Passport details', true], ['Arrival time, 14:00', true], ['Payment at desk', false]],
        draft: { state: 'writing', lang: 'EN', chips: { book: false, checkin: true } },
        messages: [
          { t: 'in', text: 'Hi, we are booked from today. Our flight lands at 11:00.', time: t(12, 38) },
          { t: 'in', text: 'We land at 11 today. Can we check in early?', time: t(12, 41) }
        ]
      },
      {
        id: 'pim', name: 'Khun Pim', thName: 'คุณพิม', ini: 'KP', ch: 'LINE', lang: 'TH', stay: 'pim', topic: 'wants a second room',
        checkin: [['Check in link opened', false], ['Passport details', false], ['Arrival time', false]],
        draft: { state: 'ready', lang: 'TH', chips: { book: true, checkin: true } },
        messages: [
          { t: 'in', text: 'ขอจองเพิ่มอีกห้องได้ไหมคะ วันที่ 14 ถึง 16 พ.ย. สำหรับเพื่อน 2 คน', tr: 'Can I book one more room, 14 to 16 Nov, for 2 friends?', time: t(12, 56) }
        ]
      },
      {
        id: 'kenji', name: 'Kenji Sato', ini: 'KS', ch: 'Booking platform', lang: 'EN', stay: 'kenji', topic: 'asked about airport pickup',
        checkin: [['Passport details', false], ['Arrival time, Fri 11:00', false], ['Paid on booking platform', true]],
        draft: { state: 'ready', lang: 'EN', chips: { taxi: true, checkin: false } },
        messages: [
          { t: 'in', text: 'Hello, we land at Suvarnabhumi on Friday 13 Nov at 09:40.', time: t(13, 17) },
          { t: 'in', text: 'Is there an airport pickup on Friday?', time: t(13, 19) }
        ]
      },
      {
        id: 'somchai', name: 'Khun Somchai', ini: 'KS', ch: 'Call note', lang: 'TH', stay: 'somchai', topic: 'wants dinner moved to 19:00',
        dinner: { day: 4, time: '18:30', asked: '19:00' },
        messages: [
          { t: 'call', by: 'Nok', text: 'Khun Somchai called. He arrives on Mon 16 Nov and wants his dinner booking moved from 18:30 to 19:00.', time: t(13, 36) }
        ]
      },
      {
        id: 'lena', name: 'Lena Fischer', ini: 'LF', ch: 'WhatsApp', lang: 'EN', stay: 'lena', done: true,
        messages: [
          { t: 'in', text: 'Could you book a taxi to the airport for 10:00?', time: t(8, 40) },
          { t: 'out', by: 'Nok', text: 'Done, your taxi is booked for 10:00. Safe travels, Lena.', time: t(8, 46) },
          { t: 'in', text: 'Thank you so much!', time: t(8, 47) }
        ]
      },
      {
        id: 'tanaka', name: 'Ms Tanaka', ini: 'MT', ch: 'LINE', lang: 'EN', stay: 'tanaka', done: true,
        messages: [
          { t: 'in', text: 'Can we check in late tomorrow, around 21:00?', time: t(9, 12) },
          { t: 'out', by: 'Nok', text: 'Of course. The front desk is open until midnight. See you tomorrow.', time: t(9, 20) }
        ]
      },
      {
        id: 'chen', name: 'Chen family', ini: 'CF', ch: 'Booking platform', lang: 'EN', stay: 'chen', done: true,
        messages: [
          { t: 'in', text: 'Do you have a baby cot for Room 09?', time: t(10, 5) },
          { t: 'out', by: 'Nok', text: 'Yes, we will place a baby cot in Room 09 before you arrive at 15:00.', time: t(10, 14) }
        ]
      },
      {
        id: 'nida', name: 'Khun Nida', ini: 'KN', ch: 'LINE', lang: 'TH', stay: 'nida', done: true,
        messages: [
          { t: 'in', text: 'จะถึงประมาณ 18:30 นะคะ', tr: 'I will arrive around 18:30.', time: t(11, 2) },
          { t: 'out', by: 'Nok', text: 'รับทราบค่ะ แล้วพบกันค่ะ', tr: 'Noted, see you then.', time: t(11, 6) }
        ]
      }
    ],

    people: [
      { id: 'nok', ini: 'N', name: 'Nok', role: 'Front desk', skills: ['Desk'], floor: null, plan: plan('DDDODDDODDODDD') },
      { id: 'arm', ini: 'A', name: 'Arm', role: 'Housekeeping, floor 3', skills: ['Desk', 'Rooms'], floor: 3, plan: plan('ORRDRROROODRRR') },
      { id: 'dao', ini: 'D', name: 'Dao', role: 'Housekeeping, floor 1', skills: ['Rooms'], floor: 1, plan: plan('RRROORRRRRRORR') },
      { id: 'ploy', ini: 'P', name: 'Ploy', role: 'Housekeeping, floor 2', skills: ['Rooms'], floor: 2, plan: plan('RRRRROORRRRROR') },
      { id: 'tom', ini: 'T', name: 'Tom', role: 'Maintenance', skills: ['Fix'], floor: null, plan: plan('FFOOFFFFFOOFFF') }
    ],

    /* who cleans each room today. cover is the person standing in when the owner is off */
    assign: {
      '01': { owners: ['dao'] }, '02': { owners: ['dao'] }, '03': { owners: ['dao'] }, '04': { owners: ['dao'] },
      '05': { owners: ['ploy'] }, '06': { owners: ['ploy'] }, '07': { owners: ['ploy', 'dao'] }, '08': { owners: ['ploy'] },
      '09': { owners: ['arm'], cover: 'ploy' }, '10': { owners: ['arm'], cover: 'ploy' }, '11': { owners: ['arm'], cover: 'ploy' }, '12': { owners: ['arm'] }
    },

    tasks: [
      { id: 't1', group: 'Housekeeping', text: 'Deep clean Family room', room: '09', owner: 'ploy', day: 0, time: '14:30', status: 'Cleaning' },
      { id: 't2', group: 'Housekeeping', text: 'Prepare Room 11 for Khun Nida', room: '11', owner: 'ploy', day: 0, time: '18:00', status: 'To do' },
      { id: 't3', group: 'Housekeeping', text: 'Turn down Room 04 for Alex Morgan', room: '04', owner: 'dao', day: 0, time: '13:30', status: 'Done' },
      { id: 't4', group: 'Housekeeping', text: 'Clean Room 04 for Noor Haddad', room: '04', owner: 'ploy', day: 3, time: '10:00', status: 'To do', clean: true },
      { id: 't5', group: 'Maintenance', text: 'Fix shower pressure', room: '05', owner: 'tom', day: 0, time: '16:00', status: 'To do' },
      { id: 't6', group: 'Maintenance', text: 'Change AC filter', room: '11', owner: 'tom', day: 0, time: '12:00', status: 'Done' },
      { id: 't7', group: 'Maintenance', text: 'Check balcony door lock', room: '08', owner: 'tom', day: 1, time: '', status: 'To do' },
      { id: 't8', group: 'Front desk', text: 'Print welcome letter for Chen family', room: '09', owner: 'nok', day: 0, time: '14:30', status: 'To do' },
      { id: 't9', group: 'Front desk', text: 'Book taxi for Lena Fischer', room: '01', owner: 'nok', day: 0, time: '10:00', status: 'Done' }
    ],
    nextId: 100
  };
}

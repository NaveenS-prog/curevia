/*
 * CUREVIA — Nearby Healthcare Service Finder (CA-2 prototype)
 * Single-page app, no build step. Screens follow the report's proposed
 * structure: Home → Results (+ Filters) → Facility details → Compare → Action.
 * Includes a facilitator "Test mode" implementing the Section 10 validation plan.
 */
(function () {
  'use strict';

  const D = window.CUREVIA_DATA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtN = (n) => Number(n).toLocaleString('en-IN');
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAYS_S = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /* ------------------------------------------------------------------ */
  /* Icons (Lucide-style, inline SVG)                                    */
  /* ------------------------------------------------------------------ */
  const ICONS = {
    crosshair: '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    stethoscope: '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>',
    flask: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>',
    tooth: '<path d="M7 3C4.5 3 3 5 3 7.5c0 2 .8 3.3 1.5 4.5.6 1.1.9 2.5 1.2 4.3.3 2 .8 4.7 2.3 4.7 1.6 0 1.7-3 2.2-4.8.3-1 .9-1.7 1.8-1.7s1.5.7 1.8 1.7c.5 1.8.6 4.8 2.2 4.8 1.5 0 2-2.7 2.3-4.7.3-1.8.6-3.2 1.2-4.3.7-1.2 1.5-2.5 1.5-4.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3Z"/>',
    siren: '<path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><path d="M21 12h1"/><path d="M18.5 4.5 18 5"/><path d="M2 12h1"/><path d="M12 2v1"/><path d="m4.929 4.929.707.707"/><path d="M12 12v6"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    syringe: '<path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    rupee: '<path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/>',
    hourglass: '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
    access: '<circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    nav: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>',
    chevD: '<path d="m6 9 6 6 6-6"/>',
    sliders: '<path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/>',
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    columns: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
    building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    stop: '<rect width="14" height="14" x="5" y="5" rx="2"/>',
    textSize: '<path d="M21 14h-5"/><path d="M16 16v-3.5a2.5 2.5 0 0 1 5 0V16"/><path d="M4.5 13h6"/><path d="m3 16 4.5-9 4.5 9"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    arrowR: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    arrowL: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
    car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    walk: '<circle cx="13" cy="4" r="2"/><path d="m9 21 2-6 3 3v3"/><path d="m7 12 2-4 4 1 2 3 3 1"/><path d="m11 15-1-5"/>',
    sparkle: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
    heartPulse: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
    sort: '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
    parking: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>',
    lift: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 10 3-3 3 3"/><path d="m9 14 3 3 3-3"/>',
    ramp: '<path d="M3 20h18L3 9z"/>',
    home: '<path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M10 21v-5h4v5"/>',
    toilet: '<circle cx="12" cy="4.5" r="2"/><path d="M8 22v-6H6l2.5-7h7L18 16h-2v6"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
    list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
    minimize: '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>'
  };
  const icon = (name, cls = '') =>
    `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  const CAT_COLOR = {
    consult: ['#0f766e', '#dcf5f0'], lab: ['#7c3aed', '#efe9fe'], imaging: ['#1d4ed8', '#e6eeff'],
    dental: ['#0e7490', '#dff4f9'], urgent: ['#b91c1c', '#fde8e8'], physio: ['#c2410c', '#ffeddc'],
    vacc: ['#15803d', '#e3f6e9'], eye: ['#4338ca', '#e8e9fd']
  };
  const catStyle = (id) => `--h:${CAT_COLOR[id][0]};--hb:${CAT_COLOR[id][1]}`;

  const TYPE_LABEL = {
    hospital: 'Multispeciality hospital', government: 'Government hospital', clinic: 'Clinic',
    diagnostic: 'Diagnostic centre', dental: 'Dental clinic', physio: 'Physiotherapy centre',
    community: 'Community health centre', eye: 'Eye hospital', urgent: 'Urgent care centre',
    general: 'General hospital', private: 'Private hospital', maternity: 'Maternity hospital'
  };
  const typeLabel = (t) => TYPE_LABEL[t] || (t ? t.charAt(0).toUpperCase() + t.slice(1) + ' hospital' : 'Healthcare facility');
  const TYPE_GROUPS = [
    ['hosp', 'Hospitals', ['hospital', 'government', 'eye', 'general', 'private', 'maternity']],
    ['clinic', 'Clinics', ['clinic', 'dental', 'physio', 'community', 'urgent']],
    ['diag', 'Diagnostic centres', ['diagnostic']],
    ['public', 'Government / subsidised', ['government', 'community']]
  ];
  const SOURCE = {
    facility: { label: 'Confirmed by facility', short: 'by facility' },
    community: { label: 'Reported by visitors', short: 'by visitors' },
    listed: { label: 'From public listing', short: 'from listing' },
    registry: { label: 'Bangalore Health Registry (Open Data)', short: 'registry' },
    'Bangalore Health Registry (Open Data)': { label: 'Bangalore Health Registry (Open Data)', short: 'registry' },
    'Karnataka Health & Family Welfare Department': { label: 'Karnataka Health Dept', short: 'gov health' },
    'NABH Accredited Tertiary Center': { label: 'NABH Accredited Center', short: 'accredited' }
  };
  const ACCESS = [
    ['wheelchair', 'Wheelchair accessible', 'access'],
    ['ramp', 'Ramp at entrance', 'ramp'],
    ['lift', 'Lift available', 'lift'],
    ['ground', 'Service on ground floor', 'home'],
    ['toilet', 'Accessible toilet', 'toilet'],
    ['parking', 'Parking nearby', 'parking'],
    ['assist', 'Staff assistance on request', 'users']
  ];
  const ACCESS_FILTERS = [
    ['wheelchair', 'Wheelchair accessible', (a) => a.wheelchair === true],
    ['stepfree', 'Lift or ground floor', (a) => a.lift === true || a.ground === true],
    ['toilet', 'Accessible toilet', (a) => a.toilet === true],
    ['parking', 'Parking nearby', (a) => a.parking === true]
  ];

  /* ------------------------------------------------------------------ */
  /* State                                                               */
  /* ------------------------------------------------------------------ */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('curevia:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('curevia:' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  const defaultFilters = () => ({ maxDist: 40, maxPrice: 0, availableOnly: false, maxWait: 0, access: [], types: [], insurance: false, fresh: false });

  function applyCustomUpdates() {
    const updates = store.get('custom_updates', {});
    Object.keys(updates).forEach((fid) => {
      const f = D.facilityMap[fid];
      if (f) {
        const u = updates[fid];
        if (u.wait != null) {
          Object.keys(f.services).forEach((sid) => { if (f.services[sid]) f.services[sid].wait = Number(u.wait); });
        }
        if (u.price != null) {
          ['gp', 'paed', 'gyn', 'ortho', 'derm', 'ent'].forEach((sid) => {
            if (f.services[sid]) f.services[sid].price = Number(u.price);
          });
        }
        if (u.doctor && f.services.gp) f.services.gp.doctor = u.doctor;
        if (u.wheelchair != null) f.access.wheelchair = Boolean(u.wheelchair);
        f.updated = 2;
        f.source = 'facility';
      }
    });
  }
  applyCustomUpdates();

  let initialLoc = store.get('loc', 'jain_campus');
  if (initialLoc === 'campus') initialLoc = 'jain_campus';

  const state = {
    service: store.get('service', null),
    loc: initialLoc,
    when: store.get('when', 'now'),
    sort: store.get('sort', 'best'),
    filters: Object.assign(defaultFilters(), store.get('filters', {})),
    compare: store.get('compare', []).filter((id) => D.facilityMap[id]),
    textLg: store.get('textLg', false),
    test: store.get('test', null)
  };
  if (state.service && !D.serviceMap[state.service]) state.service = null;

  const ui = {
    testOpen: false,
    diffOnly: false,
    form: { participant: '', ptype: 'Student / young adult', device: 'Laptop', facilitator: '', reset: true }
  };

  function saveState() {
    ['service', 'loc', 'when', 'sort', 'filters', 'compare', 'textLg', 'test'].forEach((k) => store.set(k, state[k]));
  }

  /* ------------------------------------------------------------------ */
  /* Time, availability & formatting                                     */
  /* ------------------------------------------------------------------ */
  const WHEN_KEYS = ['now', 'plus2', 'evening', 'tmrw'];
  function visitDate(key = state.when) {
    const n = new Date();
    const d = new Date(n);
    if (key === 'plus2') d.setTime(n.getTime() + 2 * 3600e3);
    if (key === 'evening') { d.setHours(18, 0, 0, 0); if (n.getHours() >= 18) d.setDate(d.getDate() + 1); }
    if (key === 'tmrw') { d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); }
    return d;
  }
  function whenLabel(key) {
    const n = new Date();
    if (key === 'now') return 'Now';
    if (key === 'plus2') return 'In 2 hours (' + fmtTime(visitDate('plus2').getHours() * 60 + visitDate('plus2').getMinutes()) + ')';
    if (key === 'evening') return n.getHours() >= 18 ? 'Tomorrow evening, 6 PM' : 'This evening, 6 PM';
    return 'Tomorrow morning, 10 AM';
  }
  const isNow = () => state.when === 'now';

  function fmtTime(m) {
    if (m === 0 || m >= 1440) return 'midnight';
    const h = Math.floor(m / 60), mi = m % 60;
    const ap = h >= 12 ? 'PM' : 'AM';
    const h12 = ((h + 11) % 12) + 1;
    return mi ? `${h12}:${String(mi).padStart(2, '0')} ${ap}` : `${h12} ${ap}`;
  }
  function fmtRange(r) {
    if (!r) return 'Closed';
    if (r[0] === 0 && r[1] >= 1440) return 'Open 24 hours';
    return `${fmtTime(r[0])} – ${fmtTime(r[1])}`;
  }
  function fmtAgo(min) {
    if (min < 60) return `${min} min ago`;
    if (min < 1440) { const h = Math.round(min / 60); return `${h} hr${h > 1 ? 's' : ''} ago`; }
    const d = Math.round(min / 1440); return `${d} day${d > 1 ? 's' : ''} ago`;
  }
  function relDay(date) {
    const a = new Date(); a.setHours(0, 0, 0, 0);
    const b = new Date(date); b.setHours(0, 0, 0, 0);
    const diff = Math.round((b - a) / 864e5);
    return diff === 0 ? 'today' : diff === 1 ? 'tomorrow' : DAYS[b.getDay()];
  }

  function svcSchedule(f, sid, day) {
    if (!f || !f.services || !f.hours) return null;
    const s = f.services[sid];
    const fh = f.hours[day];
    if (!fh || !s) return null;
    if (s.days && !s.days.includes(day)) return null;
    const timeRange = s.time || (s.slots && s.slots.length ? [s.slots[0][0], s.slots[s.slots.length - 1][1]] : null);
    if (timeRange) {
      const o = Math.max(fh[0], timeRange[0]), c = Math.min(fh[1], timeRange[1]);
      return c > o ? [o, c] : null;
    }
    return fh;
  }

  function availability(f, sid, date = visitDate(), now = isNow()) {
    const s = f && f.services ? f.services[sid] : null;
    if (!s) return { code: 'na', ok: false, tone: 'bad', title: 'Not offered', sub: 'Service not listed at this location' };
    if (s.byAppt) return { code: 'appt', ok: false, tone: 'info', title: 'By appointment', sub: 'Call to book a slot' };
    const day = date.getDay();
    const mins = date.getHours() * 60 + date.getMinutes();
    const sch = svcSchedule(f, sid, day);
    if (sch && mins >= sch[0] && mins < sch[1]) {
      const left = sch[1] - mins;
      if (sch[0] === 0 && sch[1] >= 1440) return { code: 'open', ok: true, tone: 'good', title: now ? 'Available now' : 'Available then', sub: 'Open 24 hours' };
      if (left <= 60) return { code: 'closing', ok: true, tone: 'warn', title: 'Closing soon', sub: `Last service by ${fmtTime(sch[1])}` };
      return { code: 'open', ok: true, tone: 'good', title: now ? 'Available now' : 'Available then', sub: `Until ${fmtTime(sch[1])}` };
    }
    if (sch && mins < sch[0]) {
      return { code: 'later', ok: false, tone: 'warn', title: now ? 'Opens later today' : 'Opens later that day', sub: `From ${fmtTime(sch[0])}` };
    }
    for (let i = 1; i <= 7; i++) {
      const nd = new Date(date.getTime() + i * 864e5);
      const sc = svcSchedule(f, sid, nd.getDay());
      if (sc) {
        return { code: 'closed', ok: false, tone: 'bad', title: now ? 'Not available now' : 'Not available then', sub: `Next: ${relDay(nd)}, ${fmtTime(sc[0])}` };
      }
    }
    return { code: 'closed', ok: false, tone: 'bad', title: 'Not currently offered', sub: 'Call to check' };
  }

  const priceMin = (p) => (p == null ? null : Array.isArray(p) ? p[0] : p);
  function priceText(p) {
    if (p == null) return 'Ask facility';
    if (Array.isArray(p)) return `₹${fmtN(p[0])}–${fmtN(p[1])}`;
    if (p === 0) return 'Free';
    return `₹${fmtN(p)}`;
  }
  function priceSub(r) {
    if (r.s.priceNote) return r.s.priceNote;
    if (r.price == null) return 'Price not listed';
    if (Array.isArray(r.price)) return 'Estimated range';
    return D.serviceMap[r.sid].unit;
  }
  const waitText = (w) => (w == null ? 'Not reported' : `~${w} min`);
  const waitTone = (w) => (w == null ? 'muted' : w <= 20 ? 'good' : w <= 45 ? 'warn' : 'bad');

  function freshness(f) {
    let tone = 'good', title = 'Recently updated';
    if (!f) return { tone: 'muted', title: 'Status unknown', ago: 'Recently', source: 'Registry', short: 'verified' };
    if (f.updated > 1440) { tone = 'bad'; title = 'May be outdated'; }
    else if (f.updated > 240 || f.source !== 'facility') { tone = 'warn'; title = 'Confirm before travelling'; }
    const srcObj = (f.source && SOURCE[f.source]) ? SOURCE[f.source] : {
      label: f.source || 'Public health registry',
      short: 'registry'
    };
    return {
      tone,
      title,
      ago: fmtAgo(f.updated != null ? f.updated : 10),
      source: srcObj.label,
      short: srcObj.short
    };
  }

  function accessSummary(a) {
    if (!a) return { tone: 'muted', title: 'Not confirmed', sub: 'Call to check access' };
    if (a.wheelchair === true) {
      const extras = [a.lift && 'Lift', a.toilet && 'Accessible toilet', a.parking && 'Parking'].filter(Boolean);
      return { tone: 'good', title: 'Wheelchair accessible', sub: extras.length ? extras.slice(0, 2).join(' · ') : 'Step-free entry' };
    }
    if (a.wheelchair === false) {
      return { tone: 'bad', title: 'Not step-free', sub: a.ground === false ? (a.lift ? 'Upper floor, lift available' : 'Upper floor, stairs only') : 'Check before visiting' };
    }
    return { tone: 'muted', title: 'Not confirmed', sub: 'Call to check access' };
  }

  function haversineDistKm(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 5.0;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 1.28 * 10) / 10;
  }

  const locObj = () => D.localities.find((l) => l.id === state.loc) || D.localities[0];

  function enrich(f, sid, date = visitDate()) {
    const loc = locObj();
    const s = (f && f.services && f.services[sid]) ? f.services[sid] : {};
    let dist;
    if (f.lat != null && loc.lat != null) {
      dist = haversineDistKm(loc.lat, loc.lon, f.lat, f.lon);
    } else {
      dist = Math.round(Math.hypot((f.x || 0) - (loc.x || 0), (f.y || 0) - (loc.y || 0)) * 1.25 * 10) / 10;
    }
    const waitVal = s.wait != null ? s.wait : (s.waitMin != null ? s.waitMin : null);
    return {
      f, s, sid, dist,
      drive: Math.max(3, Math.round(dist / 22 * 60 + 3)),
      walk: Math.max(2, Math.round(dist / 4.5 * 60)),
      price: s.price === undefined ? null : s.price,
      priceMin: priceMin(s.price === undefined ? null : s.price),
      wait: waitVal,
      avail: availability(f, sid, date)
    };
  }

  function serviceStats(sid) {
    const date = visitDate();
    const fs = D.facilities.filter((f) => f.services && f.services[sid]);
    const prices = fs.map((f) => priceMin(f.services[sid].price)).filter((p) => p != null);
    return {
      count: fs.length,
      min: prices.length ? Math.min(...prices) : null,
      avail: fs.filter((f) => availability(f, sid, date).ok).length
    };
  }
  const fromPrice = (min) => (min == null ? '' : min === 0 ? 'some free' : `from ₹${fmtN(min)}`);

  /* ------------------------------------------------------------------ */
  /* Results: filtering, ranking, highlights                             */
  /* ------------------------------------------------------------------ */
  function activeFilterCount() {
    const F = state.filters;
    return (F.maxDist < 40) + (F.maxPrice > 0) + F.availableOnly + (F.maxWait > 0) + F.access.length + F.types.length + F.insurance + F.fresh;
  }

  function getResults() {
    const sid = state.service;
    const date = visitDate();
    const all = D.facilities.filter((f) => f.services && f.services[sid]).map((f) => enrich(f, sid, date));
    const F = state.filters;
    const res = all.filter((r) =>
      (F.maxDist >= 40 || r.dist <= F.maxDist) &&
      (!F.maxPrice || (r.priceMin != null && r.priceMin <= F.maxPrice)) &&
      (!F.availableOnly || r.avail.ok) &&
      (!F.maxWait || (r.wait != null && r.wait <= F.maxWait)) &&
      F.access.every((k) => { const af = ACCESS_FILTERS.find((a) => a[0] === k); return af ? af[2](r.f.access) : true; }) &&
      (!F.types.length || F.types.some((g) => { const tg = TYPE_GROUPS.find((t) => t[0] === g); return tg && tg[2].includes(r.f.type); })) &&
      (!F.insurance || (r.f.payment && r.f.payment.some((p) => /insurance|tpa|ayushman/i.test(p)))) &&
      (!F.fresh || r.f.updated <= 1440)
    );
    return { res: rank(res), total: all.length };
  }

  function rank(list) {
    if (!list.length) return list;
    const maxD = Math.max(...list.map((r) => r.dist), 1);
    const ps = list.map((r) => r.priceMin).filter((p) => p != null);
    const minP = ps.length ? Math.min(...ps) : 0, maxP = ps.length ? Math.max(...ps) : 0;
    const ws = list.map((r) => r.wait).filter((w) => w != null);
    const maxW = ws.length ? Math.max(...ws) : 1;
    list.forEach((r) => {
      const a = r.avail.ok ? 1 : (r.avail.code === 'later' || r.avail.code === 'appt') ? 0.45 : 0;
      const d = 1 - (r.dist / maxD) * 0.999;
      const p = r.priceMin == null ? 0.35 : maxP === minP ? 1 : 1 - (r.priceMin - minP) / (maxP - minP);
      const w = r.wait == null ? 0.4 : maxW === 0 ? 1 : 1 - r.wait / maxW;
      const fr = r.f.updated <= 240 ? 0.05 : r.f.updated > 1440 ? -0.05 : 0;
      r.score = 0.34 * a + 0.22 * d + 0.22 * p + 0.22 * w + fr;
    });
    const BIG = 1e9;
    const by = {
      best: (a, b) => b.score - a.score,
      distance: (a, b) => a.dist - b.dist,
      price: (a, b) => (a.priceMin == null ? BIG : a.priceMin) - (b.priceMin == null ? BIG : b.priceMin) || a.dist - b.dist,
      wait: (a, b) => (a.wait == null ? BIG : a.wait) - (b.wait == null ? BIG : b.wait) || a.dist - b.dist
    };
    return list.sort(by[state.sort] || by.best);
  }

  function computeTags(list) {
    const tags = new Map(list.map((r) => [r.f.id, []]));
    if (list.length < 2) return tags;
    const add = (fn, tag) => {
      const vals = list.map(fn).filter((v) => v != null);
      if (!vals.length) return;
      const m = Math.min(...vals);
      const winners = list.filter((r) => fn(r) === m);
      if (winners.length === list.length) return;
      winners.forEach((r) => tags.get(r.f.id).push(tag));
    };
    add((r) => r.priceMin, { k: 'price', icon: 'rupee', label: 'Lowest cost' });
    add((r) => r.wait, { k: 'wait', icon: 'hourglass', label: 'Shortest wait' });
    add((r) => r.dist, { k: 'dist', icon: 'pin', label: 'Closest' });
    if (state.sort === 'best') tags.get(list[0].f.id).unshift({ k: 'top', icon: 'sparkle', label: 'Best overall match' });
    return tags;
  }

  /* ------------------------------------------------------------------ */
  /* Shared UI pieces                                                    */
  /* ------------------------------------------------------------------ */
  function searchBox(id, compact) {
    return `<div class="search ${compact ? 'search--compact' : ''}" data-search>
      <label class="sr-only" for="${id}">What healthcare service do you need?</label>
      ${icon('search', 'search__ic')}
      <input id="${id}" class="search__input" type="text" autocomplete="off" spellcheck="false" role="combobox"
        aria-expanded="false" aria-controls="${id}-list" aria-autocomplete="list"
        placeholder="${compact ? 'Search another service…' : 'e.g. blood test, child doctor, X-ray, tooth pain'}">
      <div class="search__list" id="${id}-list" role="listbox" hidden></div>
    </div>`;
  }

  function selectField(kind, opts = {}) {
    let inner = '', ic = '', label = '';
    if (kind === 'loc') {
      ic = 'pin'; label = 'Area';
      inner = D.localities.map((l) => `<option value="${l.id}" ${l.id === state.loc ? 'selected' : ''}>${opts.prefix ? 'Near ' : ''}${esc(l.name)}</option>`).join('');
      return `<div style="display:inline-flex; gap:6px; align-items:center; flex-wrap:wrap;">
        <label class="selectw">${icon(ic)}<span class="sr-only">${label}</span><select class="select" data-state="${kind}">${inner}</select></label>
        <button type="button" class="btn--gps" data-act="use-gps" title="Calculate exact distances using your real device GPS coordinates">
          ${icon('crosshair')} My GPS
        </button>
      </div>`;
    } else if (kind === 'when') {
      ic = 'clock'; label = 'Visit time';
      inner = WHEN_KEYS.map((k) => `<option value="${k}" ${k === state.when ? 'selected' : ''}>${esc(whenLabel(k))}</option>`).join('');
    } else {
      ic = 'sort'; label = 'Sort by';
      inner = [['best', 'Best match'], ['distance', 'Closest first'], ['price', 'Lowest cost'], ['wait', 'Shortest wait']]
        .map(([v, l]) => `<option value="${v}" ${v === state.sort ? 'selected' : ''}>${opts.prefix ? 'Sort: ' : ''}${l}</option>`).join('');
    }
    return `<label class="selectw">${icon(ic)}<span class="sr-only">${label}</span><select class="select" data-state="${kind}">${inner}</select></label>`;
  }

  const metric = (ic, label, value, sub, tone = '', dot = false) => `
    <div class="metric metric--${tone || 'plain'}">
      <div class="metric__label">${icon(ic)}${label}</div>
      <div class="metric__value">${dot ? '<span class="dot"></span>' : ''}${value}</div>
      <div class="metric__sub">${sub}</div>
    </div>`;

  function freshPill(f, long) {
    const fr = freshness(f);
    return `<span class="fresh fresh--${fr.tone}" title="${esc(fr.title)}">${icon(fr.tone === 'good' ? 'shield' : fr.tone === 'bad' ? 'alert' : 'refresh')}Updated ${fr.ago} ${long ? '· ' + fr.source : fr.short}</span>`;
  }

  const ratingText = (f) => `<span class="rating" title="Visitor rating — shown as secondary information">${icon('star')}${f.rating.toFixed(1)} <span>(${fmtN(f.reviews)})</span></span>`;

  function yn(v, label) {
    const k = v === true ? 'yes' : v === false ? 'no' : 'unk';
    const txt = v === true ? 'Yes' : v === false ? 'No' : 'Not confirmed';
    return `<span class="yn yn--${k}" ${label ? `aria-label="${esc(label)}: ${txt}"` : ''}>${icon(v === true ? 'check' : v === false ? 'x' : 'help')}</span>${label ? '' : `<span class="yn__txt">${txt}</span>`}`;
  }

  /* Schematic map (sample geography) */
  function mapSVG(list, opts = {}) {
    const loc = locObj();
    const W = 400, H = opts.h || 400;
    const S = 200 / 7;
    const P = (x, y) => [W / 2 + (x - loc.x) * S, H / 2 - (y - loc.y) * S];
    const line = (a, b) => { const p = P(a[0], a[1]), q = P(b[0], b[1]); return `M${p[0].toFixed(1)} ${p[1].toFixed(1)} L${q[0].toFixed(1)} ${q[1].toFixed(1)}`; };
    const roads = [line([-14, 0.3], [14, 0.3]), line([1.2, -14], [1.2, 14]), line([-10, -7.5], [10, 7.5]), line([-14, -3.6], [14, -3.4])];
    const rc = P(0.5, 0.8);
    const riverPts = [[-14, 5.6], [-6, 4.9], [-1, 6.2], [4, 6.6], [14, 5.8]].map((p) => P(p[0], p[1]));
    const river = `M${riverPts[0].join(' ')} Q${riverPts[1].join(' ')} ${riverPts[2].join(' ')} T${riverPts[4].join(' ')}`;
    const me = P(loc.x, loc.y);
    const labels = D.localities.filter((l) => l.id !== loc.id).map((l) => { const p = P(l.x, l.y); return `<text class="map-loclabel" x="${p[0]}" y="${p[1] + 22}" text-anchor="middle">${esc(l.name)}</text>`; }).join('');
    let route = '';
    if (opts.route && list[0]) {
      const fp = P(list[0].f.x, list[0].f.y);
      route = `<path class="map-route-bg" d="M${me[0]} ${me[1]} L${fp[0]} ${me[1]} L${fp[0]} ${fp[1]}"/><path class="map-route" d="M${me[0]} ${me[1]} L${fp[0]} ${me[1]} L${fp[0]} ${fp[1]}"/>`;
    }
    const pins = list.map((r, i) => {
      const p = P(r.f.x, r.f.y);
      const tone = opts.route ? 'brand' : r.avail.tone;
      return `<a href="#/facility/${r.f.id}" class="mpin-link" aria-label="${esc(r.f.name)}"><g transform="translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})"><g class="mpin mpin--${tone}" data-fid="${r.f.id}">
        <path d="M0 0C-2-6-11-10-11-19A11 11 0 1 1 11-19C11-10 2-6 0 0Z"/><text y="-15">${opts.route ? '✓' : i + 1}</text></g></g></a>`;
    }).join('');
    return `<svg class="map-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Schematic map of nearby options">
      <defs><pattern id="grid" width="28.57" height="28.57" patternUnits="userSpaceOnUse"><path d="M28.57 0H0V28.57" fill="none" stroke="#dde9e5" stroke-width="1"/></pattern></defs>
      <rect width="${W}" height="${H}" fill="#eef5f2"/><rect width="${W}" height="${H}" fill="url(#grid)"/>
      <path class="map-river" d="${river}"/>
      <circle class="map-road-o" cx="${rc[0]}" cy="${rc[1]}" r="${4.6 * S}"/>
      ${roads.map((d) => `<path class="map-road-o" d="${d}"/>`).join('')}
      <circle class="map-road" cx="${rc[0]}" cy="${rc[1]}" r="${4.6 * S}"/>
      ${roads.map((d) => `<path class="map-road" d="${d}"/>`).join('')}
      ${opts.route ? '' : `<circle class="map-ring" cx="${me[0]}" cy="${me[1]}" r="${2 * S}"/><circle class="map-ring" cx="${me[0]}" cy="${me[1]}" r="${5 * S}"/>
      <text class="map-ringlabel" x="${me[0] + 2 * S * 0.71 + 3}" y="${me[1] - 2 * S * 0.71 - 3}">2 km</text>
      <text class="map-ringlabel" x="${me[0] + 5 * S * 0.71 + 3}" y="${me[1] - 5 * S * 0.71 - 3}">5 km</text>`}
      ${labels}
      ${route}
      <circle class="me-pulse" cx="${me[0]}" cy="${me[1]}" r="16"/>
      <circle cx="${me[0]}" cy="${me[1]}" r="8" fill="#2563eb" stroke="#fff" stroke-width="3"/>
      ${pins}
    </svg>`;
  }

  let activeLeafletMap = null;
  function mountLeafletMap(list, opts = {}) {
    const el = document.getElementById('curevia-map');
    if (!el) return;
    if (typeof L === 'undefined') {
      const fb = el.querySelector('.map-fallback');
      if (fb) fb.style.display = 'block';
      return;
    }
    try {
      if (activeLeafletMap) {
        activeLeafletMap.remove();
        activeLeafletMap = null;
      }
      el.innerHTML = '';
      const loc = locObj();
      const centerLat = (opts.focusFacility && opts.focusFacility.lat) ? opts.focusFacility.lat : (loc.lat || 12.6518);
      const centerLon = (opts.focusFacility && opts.focusFacility.lon) ? opts.focusFacility.lon : (loc.lon || 77.4422);

      const map = L.map(el, {
        scrollWheelZoom: true,
        touchZoom: true,
        doubleClickZoom: true
      }).setView([centerLat, centerLon], 11);
      activeLeafletMap = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      const bounds = [];
      if (loc.lat && loc.lon) {
        bounds.push([loc.lat, loc.lon]);
        const userIcon = L.divIcon({
          className: 'leaflet-user-marker',
          html: '<div style="background:#2563eb; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 0 5px rgba(37,99,235,0.35);"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        L.marker([loc.lat, loc.lon], { icon: userIcon })
          .addTo(map)
          .bindPopup(`<strong>Your Location</strong><br>${esc(loc.name)}`);
      }

      list.slice(0, 20).forEach((r, idx) => {
        if (!r.f.lat || !r.f.lon) return;
        bounds.push([r.f.lat, r.f.lon]);
        const isFocus = opts.focusFacility && opts.focusFacility.id === r.f.id;
        const color = isFocus ? '#0f766e' : (r.avail && r.avail.ok ? '#15803d' : '#b45309');
        const pinIcon = L.divIcon({
          className: 'leaflet-fac-marker',
          html: `<div style="background:${color}; color:#fff; font-size:11px; font-weight:700; border-radius:12px; padding:3px 8px; border:2px solid #fff; box-shadow:0 2px 5px rgba(0,0,0,0.3); white-space:nowrap;">${isFocus ? '★ ' : (idx + 1) + '. '}${esc(r.f.name.split(' ')[0])}</div>`,
          iconAnchor: [15, 14]
        });

        const pop = `
          <div style="font-family:'Plus Jakarta Sans',sans-serif; min-width:180px;">
            <strong style="font-size:13px; color:#0f172a; display:block; margin-bottom:4px;">${esc(r.f.name)}</strong>
            <div style="font-size:11px; color:#64748b; margin-bottom:6px;">${esc(r.f.area)} · ${r.dist} km (~${r.drive} min)</div>
            <div style="font-size:12px; margin-bottom:6px;"><strong>Fee:</strong> ${priceText(r.price)} · <strong>Wait:</strong> ${waitText(r.wait)}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
              <a href="#/facility/${r.f.id}" style="color:#0f766e; font-weight:700; text-decoration:none; font-size:12px;">View details &rarr;</a>
              <a href="#/plan/${r.f.id}" style="background:#0f766e; color:#fff; font-size:11px; padding:3px 8px; border-radius:6px; text-decoration:none; font-weight:600;">Plan visit</a>
            </div>
          </div>
        `;
        L.marker([r.f.lat, r.f.lon], { icon: pinIcon }).addTo(map).bindPopup(pop);
      });

      if (opts.route && list[0] && list[0].f.lat && loc.lat) {
        const latlngs = [[loc.lat, loc.lon], [list[0].f.lat, list[0].f.lon]];
        L.polyline(latlngs, { color: '#0f766e', weight: 4, dashArray: '6, 6' }).addTo(map);
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 14 });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 13);
      }
      setTimeout(() => { if (activeLeafletMap) activeLeafletMap.invalidateSize(); }, 150);
      setTimeout(() => { if (activeLeafletMap) activeLeafletMap.invalidateSize(); }, 600);
    } catch (e) {
      console.warn('Map init fallback:', e);
      try {
        el.innerHTML = `<div class="map-fallback" style="height:100%; display:block;">${mapSVG(list, opts)}</div>`;
      } catch (err) {}
    }
  }

  function mapCard(list, opts = {}) {
    return `<div class="map-card">
      <div class="map-card__head">
        <strong>${icon('map')} Live OpenStreetMap</strong>
        <span class="badge badge--brand" style="font-size:.72rem; padding:2px 8px;">Real OSM GPS Data</span>
      </div>
      <div id="curevia-map" class="curevia-map-container" style="height:${opts.h || 320}px;">
        <div class="map-fallback" style="height:100%; display:none;">
          ${mapSVG(list, opts)}
        </div>
      </div>
      ${opts.route ? '' : `<div class="map-legend">
        <span><i class="lg lg--me"></i>You (${esc(locObj().name.split('(')[0])})</span>
        <span><i class="lg lg--good"></i>Open now</span>
        <span><i class="lg lg--warn"></i>Later / closing</span>
        <span><i class="lg lg--bad"></i>Closed</span>
      </div>`}
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Views                                                               */
  /* ------------------------------------------------------------------ */
  function viewHome() {
    const stats = Object.fromEntries(D.categories.map((c) => {
      const ids = D.services.filter((s) => s.cat === c.id).map((s) => s.id);
      const places = D.facilities.filter((f) => ids.some((id) => f.services[id])).length;
      return [c.id, { services: ids.length, places }];
    }));
    return `
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__copy">
          <span class="eyebrow">${icon('heartPulse')} Service-first healthcare discovery</span>
          <h1>Know where to go for care, <em>before you travel.</em></h1>
          <p class="hero__lead">Search for the service you need. CUREVIA puts cost, availability, waiting time and accessibility side by side, so you don’t have to call around.</p>
          <form class="finder" data-form="home-search" autocomplete="off">
            <div class="finder__label">What do you need?</div>
            ${searchBox('q-home', false)}
            <div class="finder__row">
              <div class="field"><span class="field__label">Near</span>${selectField('loc')}</div>
              <div class="field"><span class="field__label">When</span>${selectField('when')}</div>
              <button class="btn btn--primary btn--lg finder__go" type="submit">Find care ${icon('arrowR')}</button>
            </div>
          </form>
          <div class="popular"><span>Popular:</span>
            ${D.popular.map((id) => `<button class="chip" data-act="pick-service" data-sid="${id}">${esc(shortName(D.serviceMap[id].name))}</button>`).join('')}
          </div>
        </div>
        <div class="hero__visual" aria-hidden="true">${heroPreview()}</div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section__head">
          <div><h2>Start with what you need</h2><p>Browse by type of care. Every option shows the facts that matter for your decision.</p></div>
        </div>
        <div class="cat-grid">
          ${D.categories.map((c) => `
            <a class="cat" href="#/category/${c.id}" style="${catStyle(c.id)}">
              <span class="cat__ic">${icon(c.icon)}</span>
              <span class="cat__name">${esc(c.name)}</span>
              <span class="cat__blurb">${esc(c.blurb)}</span>
              <span class="cat__meta">${stats[c.id].places} places nearby ${icon('arrowR')}</span>
            </a>`).join('')}
        </div>
      </div>
    </section>

    <section class="section section--tint">
      <div class="container">
        <div class="section__head section__head--center">
          <div><h2>From “I need this” to “I know where to go”</h2><p>CUREVIA does the comparison work, so you don’t have to collect it from search results, maps, reviews and phone calls.</p></div>
        </div>
        <ol class="steps">
          <li class="step"><span class="step__no">1</span>${icon('search', 'step__ic')}<h3>Tell us the service</h3><p>Search in plain words, like “child doctor” or “blood test”, and pick your area and time.</p></li>
          <li class="step"><span class="step__no">2</span>${icon('columns', 'step__ic')}<h3>Compare nearby options</h3><p>See cost, availability, waiting time and access together, then put up to three side by side.</p></li>
          <li class="step"><span class="step__no">3</span>${icon('nav', 'step__ic')}<h3>Decide and go</h3><p>Call, get directions, or share the plan with family. All from one screen.</p></li>
        </ol>
        <div class="facts">
          <h3>Every option answers the same six questions</h3>
          <div class="facts__grid">
            ${[
              ['stethoscope', 'Do they offer my service?', 'Results start from the exact service, not just the facility name.'],
              ['pin', 'How far is it?', 'Distance and travel time from your area.'],
              ['rupee', 'What will it cost?', 'A price, or a clearly labelled price range.'],
              ['clock', 'Is it available when I go?', 'Timings and doctor availability for your visit time.'],
              ['hourglass', 'How long will I wait?', 'Estimated waiting time, shown only where reported.'],
              ['access', 'Can everyone get in?', 'Wheelchair, lift, toilet and parking details.']
            ].map(([ic, t, d]) => `<div class="fact">${icon(ic)}<div><strong>${t}</strong><span>${d}</span></div></div>`).join('')}
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container trust">
        <div class="trust__item">${icon('shield')}<div><strong>Trust through transparency</strong><span>Each listing shows when it was last updated and who confirmed it.</span></div></div>
        <div class="trust__item">${icon('info')}<div><strong>Estimates are labelled</strong><span>Price ranges and waiting times are marked as estimates. Missing data says “Not reported”.</span></div></div>
        <div class="trust__item">${icon('users')}<div><strong>Built for caregivers too</strong><span>Accessibility and contact details sit right next to the decision.</span></div></div>
      </div>
    </section>`;
  }

  function shortName(n) { return n.replace(/\s*\(.*?\)\s*/g, ' ').replace(' consultation', '').trim(); }

  function heroPreview() {
    // Illustrative example using real OSM data at a fixed weekday time.
    const demo = new Date(); demo.setDate(demo.getDate() + ((9 - demo.getDay()) % 7 || 7)); demo.setHours(11, 0, 0, 0);
    const savedLoc = state.loc; state.loc = 'jain_campus';
    const xrayFacilities = D.facilities.filter((f) => f.services && f.services.xray);
    const rows = xrayFacilities.slice(0, 3).map((f) => {
      const r = enrich(f, 'xray', demo);
      r.avail = availability(r.f, 'xray', demo, true);
      return r;
    });
    state.loc = savedLoc;
    return `
      <div class="pv">
        <div class="pv__head"><span class="pv__dot"></span><div><div class="pv__k">Example comparison (Real OSM Data)</div><strong>Chest X-ray · near Jain Global Campus</strong></div></div>
        <div class="pv__table">
          <div class="pv__row pv__row--h"><span>Facility</span><span>Cost</span><span>Wait</span><span>Status</span></div>
          ${rows.map((r, i) => `
            <div class="pv__row ${i === 0 ? 'is-best' : ''}">
              <span class="pv__name">${esc(r.f.name.split(' ').slice(0, 2).join(' '))}<small>${r.dist} km</small></span>
              <span class="${r.priceMin === 100 ? 'pv__good' : ''}">${priceText(r.price)}</span>
              <span class="pv__w pv__w--${waitTone(r.wait)}">${waitText(r.wait)}</span>
              <span class="pv__st pv__st--${r.avail.tone}"><i></i>${r.avail.ok ? 'Open' : 'Later'}</span>
            </div>`).join('')}
        </div>
        <div class="pv__foot">${icon('sparkle')} Best balance of wait, cost &amp; distance</div>
      </div>
      <div class="pv-float pv-float--a">${icon('access')}<div><strong>Wheelchair accessible</strong><span>Lift · Accessible toilet</span></div></div>
      <div class="pv-float pv-float--b">${icon('shield')}<div><strong>Updated 45 min ago</strong><span>Confirmed by facility</span></div></div>`;
  }

  function viewCategory(id) {
    const c = D.catMap[id];
    if (!c) return viewNotFound();
    const list = D.services.filter((s) => s.cat === id);
    return `
    <section class="page-head">
      <div class="container">
        <a class="back" href="#/">${icon('arrowL')} Home</a>
        <div class="page-head__row">
          <span class="cat__ic cat__ic--lg" style="${catStyle(id)}">${icon(c.icon)}</span>
          <div><h1>${esc(c.name)}</h1><p>${esc(c.blurb)}. Choose a service to see and compare nearby options.</p></div>
        </div>
        <div class="page-head__controls">${selectField('loc', { prefix: true })}${selectField('when')}</div>
      </div>
    </section>
    <div class="container section--tight">
      <ul class="svc-list">
        ${list.map((s) => {
          const st = serviceStats(s.id);
          return `<li><button class="svc-row" data-act="pick-service" data-sid="${s.id}">
            <div class="svc-row__main"><strong>${esc(s.name)}</strong><span>Priced ${esc(s.unit)}</span></div>
            <div class="svc-row__stats">
              <span>${icon('building')}${st.count} place${st.count === 1 ? '' : 's'}</span>
              ${st.min != null ? `<span>${icon('rupee')}${fromPrice(st.min)}</span>` : ''}
              <span class="${st.avail ? 'is-good' : 'is-muted'}">${icon('clock')}${st.avail} available ${isNow() ? 'now' : 'then'}</span>
            </div>
            <span class="svc-row__go">${icon('chevR')}</span>
          </button></li>`;
        }).join('')}
      </ul>
    </div>`;
  }

  function viewResults() {
    const svc = D.serviceMap[state.service];
    const cat = D.catMap[svc.cat];
    return `
    <section class="res-top">
      <div class="container res-top__inner">
        <div class="res-top__search">${searchBox('q-res', true)}</div>
        <div class="res-top__controls">
          ${selectField('loc', { prefix: true })}
          ${selectField('when')}
          ${selectField('sort', { prefix: true })}
          <button class="btn btn--ghost filters-btn" data-act="open-filters">${icon('sliders')}Filters<span class="badge" id="fcount"></span></button>
        </div>
      </div>
    </section>
    <div class="container res-layout">
      <aside class="filters" id="filters" aria-label="Filters">${filtersPanel()}</aside>
      <div class="filters-backdrop" data-act="close-filters"></div>
      <div class="res-main">
        <div class="res-head">
          <div>
            <a class="crumb" href="#/category/${cat.id}" style="${catStyle(cat.id)}">${icon(cat.icon)}${esc(cat.name)}</a>
            <h1 class="res-title">${esc(svc.name)}</h1>
            <p class="res-sub" id="res-count"></p>
          </div>
          <button class="btn btn--ghost btn--sm map-toggle" data-act="toggle-map">${icon('map')}<span>Show map</span></button>
        </div>
        ${state.service === 'emerg' ? `<div class="callout callout--bad">${icon('siren')}<div><strong>In a medical emergency, don’t wait to compare.</strong> Call <a href="tel:112">112</a> or <a href="tel:108">108</a> for an ambulance, or go to the nearest casualty.</div></div>` : ''}
        <div id="res-chips"></div>
        <div id="res-body"></div>
      </div>
      <aside class="res-map" id="res-map"></aside>
    </div>`;
  }

  function filtersPanel() {
    const F = state.filters;
    const seg = (k, opts) => `<div class="seg">${opts.map(([v, l]) => `<button type="button" class="seg__btn ${F[k] === v ? 'is-on' : ''}" data-act="set-f" data-k="${k}" data-v="${v}" aria-pressed="${F[k] === v}">${l}</button>`).join('')}</div>`;
    const check = (arr, v, l) => `<label class="check"><input type="checkbox" data-farr="${arr}" value="${v}" ${F[arr].includes(v) ? 'checked' : ''}><span class="check__box">${icon('check')}</span><span>${l}</span></label>`;
    const sw = (k, l, hint) => `<label class="switch"><input type="checkbox" data-f="${k}" ${F[k] ? 'checked' : ''}><span class="switch__track"></span><span class="switch__label">${l}${hint ? `<small>${hint}</small>` : ''}</span></label>`;
    return `
      <div class="filters__head">
        <h2>${icon('sliders')}Filters</h2>
        <button type="button" class="link" data-act="clear-filters">Clear all</button>
        <button type="button" class="icon-btn filters__close" data-act="close-filters" aria-label="Close filters">${icon('x')}</button>
      </div>
      <div class="fgroup">
        ${sw('availableOnly', 'Available at my visit time', esc(whenLabel(state.when)))}
      </div>
      <div class="fgroup">
        <div class="fgroup__label">Distance <output id="o-dist">${F.maxDist >= 40 ? 'Any distance' : 'Within ' + F.maxDist + ' km'}</output></div>
        <input type="range" class="range" min="2" max="40" step="2" value="${F.maxDist}" data-f="maxDist" aria-label="Maximum distance">
        <div class="range__scale"><span>2 km</span><span>15 km</span><span>Any</span></div>
      </div>
      <div class="fgroup">
        <div class="fgroup__label">Maximum cost</div>
        ${seg('maxPrice', [[0, 'Any'], [500, '₹500'], [1000, '₹1k'], [2000, '₹2k'], [5000, '₹5k']])}
        <p class="fhint">Uses the lowest listed price. Options without a price are hidden when a limit is set.</p>
      </div>
      <div class="fgroup">
        <div class="fgroup__label">Waiting time (up to)</div>
        ${seg('maxWait', [[0, 'Any'], [15, '15 min'], [30, '30 min'], [60, '1 hr']])}
      </div>
      <div class="fgroup">
        <div class="fgroup__label">${icon('access')}Accessibility</div>
        ${ACCESS_FILTERS.map(([v, l]) => check('access', v, l)).join('')}
      </div>
      <div class="fgroup">
        <div class="fgroup__label">Type of facility</div>
        ${TYPE_GROUPS.map(([v, l]) => check('types', v, l)).join('')}
      </div>
      <div class="fgroup">
        <div class="fgroup__label">More</div>
        ${sw('insurance', 'Accepts health insurance')}
        ${sw('fresh', 'Updated in the last 24 hours')}
      </div>
      <div class="filters__foot"><button type="button" class="btn btn--primary btn--block" data-act="close-filters">Show <span id="fshow">results</span></button></div>`;
  }

  function updateResults() {
    if (!$('#res-body')) return;
    const svc = D.serviceMap[state.service];
    const { res, total } = getResults();
    const tags = computeTags(res);
    const loc = locObj();
    $('#res-count').innerHTML = res.length
      ? `<strong>${res.length}</strong> of ${total} nearby places offering this service near <strong>${esc(loc.name)}</strong> · ${esc(whenLabel(state.when))}`
      : `No places match your filters near <strong>${esc(loc.name)}</strong>`;
    const fc = activeFilterCount();
    const fcount = $('#fcount'); if (fcount) fcount.textContent = fc || '';
    const fshow = $('#fshow'); if (fshow) fshow.textContent = `${res.length} result${res.length === 1 ? '' : 's'}`;

    // Active filter chips
    const F = state.filters, chips = [];
    if (F.availableOnly) chips.push(['availableOnly', '', 'Available at my time']);
    if (F.maxDist < 40) chips.push(['maxDist', '', `Within ${F.maxDist} km`]);
    if (F.maxPrice) chips.push(['maxPrice', '', `Up to ₹${fmtN(F.maxPrice)}`]);
    if (F.maxWait) chips.push(['maxWait', '', `Wait up to ${F.maxWait} min`]);
    F.access.forEach((k) => chips.push(['access', k, ACCESS_FILTERS.find((a) => a[0] === k)[1]]));
    F.types.forEach((k) => chips.push(['types', k, TYPE_GROUPS.find((a) => a[0] === k)[1]]));
    if (F.insurance) chips.push(['insurance', '', 'Accepts insurance']);
    if (F.fresh) chips.push(['fresh', '', 'Updated in 24 h']);
    $('#res-chips').innerHTML = chips.length ? `<div class="fchips">${chips.map(([k, v, l]) => `<button class="fchip" data-act="rm-f" data-k="${k}" data-v="${v}">${esc(l)}${icon('x')}</button>`).join('')}<button class="link" data-act="clear-filters">Clear all</button></div>` : '';

    if (!res.length) {
      $('#res-body').innerHTML = `<div class="empty">
        <span class="empty__ic">${icon('search')}</span>
        <h3>No options match all of your filters</h3>
        <p>${total} place${total === 1 ? '' : 's'} nearby offer ${esc(svc.name.toLowerCase())}. Try removing a filter, or choose a different visit time.</p>
        <div class="empty__actions"><button class="btn btn--primary" data-act="clear-filters">Clear all filters</button>
        ${!isNow() ? '' : `<button class="btn btn--ghost" data-act="set-when" data-v="tmrw">Try tomorrow morning</button>`}</div>
      </div>`;
    } else {
      $('#res-body').innerHTML = `
        <details class="explain">
          <summary>${icon('info')}How is this list ordered?<span>${icon('chevD')}</span></summary>
          <p><strong>Best match</strong> ranks options available at your visit time first. It then weighs distance, cost and estimated waiting time equally, and gives recently updated information a small boost. You can change the order with “Sort”. Sourced from OpenStreetMap with real spherical GPS coordinates.</p>
        </details>
        <ol class="cards">${res.map((r, i) => `<li>${resultCard(r, i, tags.get(r.f.id))}</li>`).join('')}</ol>
        ${total > res.length ? `<p class="res-foot">${total - res.length} more place${total - res.length === 1 ? '' : 's'} offer this service but don’t match your filters. <button class="link" data-act="clear-filters">Show all</button></p>` : ''}
        <p class="res-foot res-foot--muted">${icon('info')}Healthcare facility locations &amp; details sourced from OpenStreetMap. Always confirm critical emergency details directly with the facility.</p>`;
    }
    $('#res-map').innerHTML = mapCard(res);
    mountLeafletMap(res);
  }

  function resultCard(r, i, tags) {
    const f = r.f;
    const ac = accessSummary(f.access);
    const inCmp = state.compare.includes(f.id);
    return `<article class="card rcard ${inCmp ? 'is-selected' : ''}" data-fid="${f.id}">
      <div class="rcard__head">
        <span class="pin-no pin-no--${r.avail.tone}">${i + 1}</span>
        <div class="rcard__title">
          <div class="rcard__type">${typeLabel(f.type)}</div>
          <h3><a href="#/facility/${f.id}" class="stretched">${esc(f.name)}</a></h3>
          <div class="rcard__meta"><span>${icon('pin')}${esc(f.area)}</span><span class="sep"></span><strong>${r.dist} km</strong><span>~${r.drive} min by road</span><span class="sep"></span>${ratingText(f)}</div>
        </div>
        <button type="button" class="cmp-toggle ${inCmp ? 'is-on' : ''}" data-act="toggle-compare" data-id="${f.id}" aria-pressed="${inCmp}">${icon(inCmp ? 'check' : 'plus')}<span>${inCmp ? 'Added' : 'Compare'}</span></button>
      </div>
      ${tags && tags.length ? `<div class="tags">${tags.map((t) => `<span class="tag tag--${t.k}">${icon(t.icon)}${t.label}</span>`).join('')}</div>` : ''}
      <div class="metrics">
        ${metric('rupee', 'Cost', priceText(r.price), esc(priceSub(r)), r.price == null ? 'muted' : '')}
        ${metric('clock', 'Availability', r.avail.title, r.avail.sub, r.avail.tone, true)}
        ${metric('hourglass', 'Est. wait', waitText(r.wait), r.wait == null ? 'No reliable data' : 'Typical estimate', waitTone(r.wait))}
        ${metric('access', 'Access', ac.title, ac.sub, ac.tone)}
      </div>
      <div class="rcard__foot">
        ${freshPill(f)}
        <button type="button" class="btn btn--xs btn--subtle" data-act="edit-facility" data-fid="${f.id}" title="Simulate field verification / change live wait time or fee">
          ${icon('edit')} Field Verify
        </button>
        ${r.s.doctor ? `<span class="rcard__by">${icon('stethoscope')}${esc(r.s.doctor)}</span>` : ''}
        <a class="rcard__more" href="#/facility/${f.id}">View details${icon('chevR')}</a>
      </div>
    </article>`;
  }

  function viewFacility(id) {
    const f = D.facilityMap[id];
    if (!f) return viewNotFound();
    const sid = state.service && f.services[state.service] ? state.service : null;
    const date = visitDate();
    const day = date.getDay();
    const r = sid ? enrich(f, sid, date) : null;
    const anyR = r || enrich(f, Object.keys(f.services)[0], date);
    const fr = freshness(f);
    const inCmp = state.compare.includes(f.id);
    const ac = accessSummary(f.access);
    const svcIds = D.services.map((s) => s.id).filter((s) => f.services[s]);

    return `
    <section class="fac-hero">
      <div class="container">
        <a class="back" href="${sid ? '#/results?s=' + sid : '#/'}">${icon('arrowL')}${sid ? 'Back to results' : 'Home'}</a>
        <div class="fac-hero__top">
          <div class="fac-hero__id">
            <div class="rcard__type">${typeLabel(f.type)}</div>
            <h1>${esc(f.name)}</h1>
            <div class="rcard__meta"><span>${icon('pin')}${esc(f.address)}</span><span class="sep"></span><strong>${anyR.dist} km</strong><span>~${anyR.drive} min by road</span><span class="sep"></span>${ratingText(f)}</div>
            <div class="fac-hero__badges">${freshPill(f, true)}${f.open24 ? `<span class="fresh fresh--info">${icon('clock')}Open 24 × 7</span>` : ''}</div>
          </div>
          <div class="fac-actions">
            <a class="btn btn--ghost" href="tel:${f.phone.replace(/\s/g, '')}">${icon('phone')}Call</a>
            <button type="button" class="btn btn--ghost" data-act="edit-facility" data-fid="${f.id}">${icon('edit')} Field Verify</button>
            ${sid ? `<button class="btn btn--ghost ${inCmp ? 'is-on' : ''}" data-act="toggle-compare" data-id="${f.id}">${icon(inCmp ? 'check' : 'columns')}${inCmp ? 'In comparison' : 'Add to compare'}</button>` : ''}
            <a class="btn btn--primary" href="#/plan/${f.id}">Choose this option${icon('arrowR')}</a>
          </div>
        </div>
        ${r ? `
        <div class="focus-panel">
          <div class="focus-panel__head"><span>For your search</span><strong>${esc(D.serviceMap[sid].name)}</strong><span class="focus-panel__when">${icon('clock')}${esc(whenLabel(state.when))}</span></div>
          <div class="metrics metrics--lg">
            ${metric('rupee', 'Cost', priceText(r.price), esc(priceSub(r)), r.price == null ? 'muted' : '')}
            ${metric('clock', 'Availability', r.avail.title, r.avail.sub, r.avail.tone, true)}
            ${metric('hourglass', 'Est. wait', waitText(r.wait), r.wait == null ? 'No reliable data' : 'Typical estimate', waitTone(r.wait))}
            ${metric('access', 'Access', ac.title, ac.sub, ac.tone)}
          </div>
          ${r.s.doctor ? `<div class="focus-panel__doc">${icon('stethoscope')}<span><strong>${esc(r.s.doctor)}</strong> · ${esc(serviceDaysText(f, sid))}</span></div>` : `<div class="focus-panel__doc">${icon('calendar')}<span>${esc(serviceDaysText(f, sid))}</span></div>`}
        </div>` : ''}
        ${f.note ? `<div class="callout callout--warn">${icon('info')}<div>${esc(f.note)}</div></div>` : ''}
      </div>
    </section>

    <div class="container fac-grid">
      <div class="fac-col">
        <section class="panel">
          <h2>${icon('stethoscope')}Services &amp; prices</h2>
          <div class="table-wrap"><table class="tbl">
            <thead><tr><th>Service</th><th>Cost</th><th>${isNow() ? 'Now' : 'At your time'}</th></tr></thead>
            <tbody>
              ${svcIds.map((s) => {
                const rr = enrich(f, s, date);
                return `<tr class="${s === sid ? 'is-current' : ''}">
                  <td><strong>${esc(D.serviceMap[s].name)}</strong>${rr.s.doctor ? `<small>${esc(rr.s.doctor)}</small>` : ''}</td>
                  <td><strong>${priceText(rr.price)}</strong><small>${esc(priceSub(rr))}</small></td>
                  <td><span class="status status--${rr.avail.tone}"><i></i>${rr.avail.title}</span><small>${rr.avail.sub}</small></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table></div>
        </section>
        <section class="panel">
          <h2>${icon('calendar')}Timings</h2>
          <table class="tbl tbl--hours">
            <thead><tr><th>Day</th><th>Facility open</th>${sid ? `<th>${esc(shortName(D.serviceMap[sid].name))}</th>` : ''}</tr></thead>
            <tbody>
              ${[1, 2, 3, 4, 5, 6, 0].map((d) => `<tr class="${d === day ? 'is-current' : ''}"><td>${DAYS[d]}${d === day ? ' <span class="pill-sm">Visit day</span>' : ''}</td><td>${fmtRange(f.hours[d])}</td>${sid ? `<td>${f.services[sid].byAppt ? 'By appointment' : fmtRange(svcSchedule(f, sid, d))}</td>` : ''}</tr>`).join('')}
            </tbody>
          </table>
        </section>
      </div>
      <div class="fac-col">
        <section class="panel">
          <h2>${icon('access')}Accessibility &amp; assistance</h2>
          <ul class="alist">
            ${ACCESS.map(([k, l, ic]) => `<li>${yn(f.access[k], l)}<span class="alist__l">${icon(ic)}${l}</span><span class="alist__v alist__v--${f.access[k] === true ? 'yes' : f.access[k] === false ? 'no' : 'unk'}">${f.access[k] === true ? 'Yes' : f.access[k] === false ? 'No' : 'Not confirmed'}</span></li>`).join('')}
          </ul>
          <p class="fhint">“Not confirmed” means the facility hasn’t provided this detail. Please call to check before visiting.</p>
        </section>
        <section class="panel">
          <h2>${icon('phone')}Contact &amp; payment</h2>
          <dl class="dl">
            <dt>Phone</dt><dd><a class="link" href="tel:${f.phone.replace(/\s/g, '')}">${esc(f.phone)}</a></dd>
            <dt>Address</dt><dd>${esc(f.address)}, ${esc(f.area)}</dd>
            <dt>Payment</dt><dd>${f.payment.map((p) => `<span class="pill-sm">${esc(p)}</span>`).join(' ')}</dd>
            <dt>Languages</dt><dd>${esc(f.languages.join(', '))}</dd>
          </dl>
          <div class="panel__actions">
            <a class="btn btn--ghost btn--sm" href="#/plan/${f.id}">${icon('nav')}Directions</a>
            <a class="btn btn--ghost btn--sm" href="tel:${f.phone.replace(/\s/g, '')}">${icon('phone')}Call now</a>
          </div>
        </section>
        <section class="panel panel--muted">
          <h2>${icon('shield')}About this information</h2>
          <p class="fresh-line fresh-line--${fr.tone}"><strong>${fr.title}.</strong> Last updated ${fr.ago} · ${fr.source}.</p>
          <p class="fhint">CUREVIA shows where each piece of information came from, so you can judge how much to rely on it.</p>
          <button class="btn btn--ghost btn--sm" data-act="report-info">${icon('flag')}Report incorrect information</button>
        </section>
      </div>
    </div>`;
  }

  function serviceDaysText(f, sid) {
    const s = f.services[sid];
    if (s.byAppt) return 'Available by appointment only';
    const days = [1, 2, 3, 4, 5, 6, 0].filter((d) => svcSchedule(f, sid, d));
    const dayTxt = days.length === 7 ? 'Every day' : days.length === 6 && !days.includes(0) ? 'Mon – Sat' : days.map((d) => DAYS_S[d]).join(', ');
    const ranges = days.map((d) => fmtRange(svcSchedule(f, sid, d)));
    const same = ranges.every((x) => x === ranges[0]);
    return `${dayTxt}${same && ranges[0] ? ' · ' + ranges[0] : ' · timings vary by day'}`;
  }

  function viewCompare() {
    const svc = state.service && D.serviceMap[state.service];
    const ids = state.compare.filter((id) => svc && D.facilityMap[id] && D.facilityMap[id].services && D.facilityMap[id].services[state.service]);
    if (!svc || ids.length < 2) {
      return `<section class="page-head"><div class="container">
        <a class="back" href="${svc ? '#/results?s=' + svc.id : '#/'}">${icon('arrowL')}${svc ? 'Back to results' : 'Home'}</a>
        <h1>Compare options</h1></div></section>
        <div class="container section--tight"><div class="empty">
          <span class="empty__ic">${icon('columns')}</span>
          <h3>${ids.length === 1 ? 'Add one more option to compare' : 'Nothing to compare yet'}</h3>
          <p>${svc ? `Choose “Compare” on two or three results for <strong>${esc(svc.name)}</strong> to see them side by side.` : 'Search for a healthcare service, then choose “Compare” on two or three options to see them side by side.'}</p>
          <div class="empty__actions"><a class="btn btn--primary" href="${svc ? '#/results?s=' + svc.id : '#/'}">${svc ? 'Back to results' : 'Find a service'}</a></div>
        </div></div>`;
    }
    const date = visitDate(), day = date.getDay();
    const rows = ids.map((id) => enrich(D.facilityMap[id], state.service, date));
    const n = rows.length;

    const bestMin = (vals) => {
      const nums = vals.map((v, i) => [v, i]).filter(([v]) => v != null);
      if (nums.length < 2) return new Set();
      const m = Math.min(...nums.map((x) => x[0]));
      const s = new Set(nums.filter((x) => x[0] === m).map((x) => x[1]));
      return s.size === n ? new Set() : s;
    };
    const bestBool = (vals) => { const s = new Set(vals.map((v, i) => (v ? i : -1)).filter((i) => i >= 0)); return s.size === n || s.size === 0 ? new Set() : s; };
    const cell = (v, sub, tone, dot) => ({ v, sub, tone, dot });

    const groups = [
      { title: 'Decision essentials', rows: [
        { label: 'Cost', ic: 'rupee', cells: rows.map((r) => cell(priceText(r.price), esc(priceSub(r)), r.price == null ? 'muted' : '')), best: bestMin(rows.map((r) => r.priceMin)), bestLabel: 'Lowest' },
        { label: isNow() ? 'Availability now' : 'Availability at your time', ic: 'clock', cells: rows.map((r) => cell(r.avail.title, r.avail.sub, r.avail.tone, true)), best: bestBool(rows.map((r) => r.avail.ok)), bestLabel: 'Available' },
        { label: 'Estimated wait', ic: 'hourglass', cells: rows.map((r) => cell(waitText(r.wait), r.wait == null ? 'No reliable data' : 'Typical estimate', waitTone(r.wait))), best: bestMin(rows.map((r) => r.wait)), bestLabel: 'Shortest' },
        { label: 'Distance', ic: 'pin', cells: rows.map((r) => cell(`${r.dist} km`, `~${r.drive} min by road · ${esc(r.f.area)}`)), best: bestMin(rows.map((r) => r.dist)), bestLabel: 'Closest' },
        { label: 'Doctor / service', ic: 'stethoscope', cells: rows.map((r) => cell(esc(r.s.doctor || (r.s.byAppt ? 'Appointment needed' : 'Walk-in service')), esc(serviceDaysText(r.f, r.sid)))) }
      ] },
      { title: 'Timing', rows: [
        { label: `Facility hours (${DAYS[day]})`, ic: 'calendar', cells: rows.map((r) => cell(fmtRange(r.f.hours[day]))) },
        { label: 'Service timing that day', ic: 'clock', cells: rows.map((r) => cell(r.s.byAppt ? 'By appointment' : fmtRange(svcSchedule(r.f, r.sid, day)))) }
      ] },
      { title: 'Accessibility', rows: ACCESS.map(([k, l, ic]) => ({
        label: l, ic, cells: rows.map((r) => cell(yn(r.f.access[k]), '', '', false, true)), raw: rows.map((r) => String(r.f.access[k])),
        best: bestBool(rows.map((r) => r.f.access[k] === true)), bestLabel: ''
      })) },
      { title: 'Practical', rows: [
        { label: 'Payment', ic: 'card', cells: rows.map((r) => cell(esc(r.f.payment.filter((p) => !/insurance|tpa|ayushman/i.test(p)).join(', ')))) },
        { label: 'Health insurance', ic: 'shield', cells: rows.map((r) => { const ins = r.f.payment.find((p) => /insurance|tpa|ayushman/i.test(p)); return cell(ins ? esc(ins) : 'Not accepted / Check', '', ins ? 'good' : 'muted'); }), best: bestBool(rows.map((r) => r.f.payment.some((p) => /insurance|tpa|ayushman/i.test(p)))), bestLabel: '' },
        { label: 'Languages', ic: 'globe', cells: rows.map((r) => cell(esc(r.f.languages.join(', ')))) },
        { label: 'Phone', ic: 'phone', cells: rows.map((r) => cell(`<a class="link" href="tel:${r.f.phone.replace(/\s/g, '')}">${esc(r.f.phone)}</a>`)) }
      ] },
      { title: 'Information quality', rows: [
        { label: 'Last updated', ic: 'refresh', cells: rows.map((r) => { const fr = freshness(r.f); return cell(fr.ago, fr.source, fr.tone); }), best: bestMin(rows.map((r) => r.f.updated)), bestLabel: 'Freshest' },
        { label: 'Visitor rating', ic: 'star', cells: rows.map((r) => cell(`★ ${r.f.rating.toFixed(1)}`, `${fmtN(r.f.reviews)} reviews · secondary`)) }
      ] }
    ];

    // Verdict
    const pick = (set) => [...set].map((i) => rows[i].f.name);
    const verdict = [
      ['rupee', 'Lowest cost', pick(groups[0].rows[0].best), 'price'],
      ['clock', isNow() ? 'Available now' : 'Available at your time', pick(groups[0].rows[1].best), 'good'],
      ['hourglass', 'Shortest wait', pick(groups[0].rows[2].best), 'wait'],
      ['pin', 'Closest', pick(groups[0].rows[3].best), 'dist']
    ];
    const allAvail = rows.every((r) => r.avail.ok), noneAvail = rows.every((r) => !r.avail.ok);

    const isSame = (row) => { const vals = row.raw || row.cells.map((c) => c.v + '|' + (c.sub || '')); return vals.every((v) => v === vals[0]); };

    return `
    <section class="page-head">
      <div class="container">
        <a class="back" href="#/results?s=${svc.id}">${icon('arrowL')}Back to results</a>
        <div class="page-head__row page-head__row--split">
          <div><h1>Comparing ${n} options</h1><p><strong>${esc(svc.name)}</strong> · near ${esc(locObj().name)} · ${esc(whenLabel(state.when))}</p></div>
          <div class="page-head__controls">${selectField('when')}${n < 3 ? `<a class="btn btn--ghost" href="#/results?s=${svc.id}">${icon('plus')}Add an option</a>` : ''}</div>
        </div>
        <div class="verdicts">
          ${verdict.map(([ic, label, names, k]) => `<div class="verdict verdict--${k}">
            <span class="verdict__ic">${icon(ic)}</span>
            <div><span class="verdict__label">${label}</span><strong>${names.length ? esc(names.length > 1 ? names.map((x) => x.split(' ')[0]).join(' & ') + (names.length === n ? '' : '') : names[0]) : label === 'Lowest cost' || label === 'Shortest wait' || label === 'Closest' ? 'About the same' : allAvail ? 'All of them' : noneAvail ? 'None at this time' : 'About the same'}</strong></div>
          </div>`).join('')}
        </div>
      </div>
    </section>
    <div class="container section--tight cmp-section">
      <div class="cmp-toolbar">
        <label class="switch switch--sm"><input type="checkbox" id="diff-only" ${ui.diffOnly ? 'checked' : ''}><span class="switch__track"></span><span class="switch__label">Show differences only</span></label>
        <span class="cmp-hint">${icon('sparkle')}Highlighted cells are the best value in that row</span>
      </div>
      <div class="cmp-wrap">
        <table class="cmp" style="--n:${n}">
          <thead><tr><th class="cmp__corner"><span>${esc(shortName(svc.name))}</span></th>
            ${rows.map((r) => `<th class="cmp__fac">
              <button class="icon-btn cmp__rm" data-act="toggle-compare" data-id="${r.f.id}" aria-label="Remove ${esc(r.f.name)}">${icon('x')}</button>
              <div class="rcard__type">${typeLabel(r.f.type)}</div>
              <a href="#/facility/${r.f.id}" class="cmp__name">${esc(r.f.name)}</a>
              <a class="btn btn--primary btn--sm btn--block" href="#/plan/${r.f.id}">Choose${icon('arrowR')}</a>
            </th>`).join('')}
          </tr></thead>
          <tbody>
            ${groups.map((g) => {
              const visible = g.rows.filter((row) => !ui.diffOnly || !isSame(row));
              if (!visible.length) return '';
              return `<tr class="cmp__group"><th colspan="${n + 1}">${g.title}</th></tr>` + visible.map((row) => `<tr>
                <th scope="row">${icon(row.ic)}${row.label}</th>
                ${row.cells.map((c, i) => `<td class="${row.best && row.best.has(i) ? 'is-best' : ''} ${c.tone ? 'tone--' + c.tone : ''}">
                  <div class="cmp__v">${c.dot ? '<span class="dot"></span>' : ''}${c.v}${row.best && row.best.has(i) && row.bestLabel ? `<span class="best-tag">${row.bestLabel}</span>` : ''}</div>
                  ${c.sub ? `<div class="cmp__sub">${c.sub}</div>` : ''}
                </td>`).join('')}
              </tr>`).join('');
            }).join('')}
          </tbody>
        </table>
      </div>
      <p class="res-foot res-foot--muted">${icon('info')}Costs and waits are estimates from sample data. The choice is yours. CUREVIA lays out the trade-offs and does not make medical recommendations.</p>
    </div>`;
  }

  function viewPlan(id) {
    const f = D.facilityMap[id];
    if (!f) return viewNotFound();
    const sid = state.service && f.services[state.service] ? state.service : null;
    const date = visitDate();
    const r = enrich(f, sid || Object.keys(f.services)[0], date);
    const fr = freshness(f);
    const ac = accessSummary(f.access);
    const tel = f.phone.replace(/\s/g, '');
    const unknownAccess = ACCESS.filter(([k]) => f.access[k] == null).map(([, l]) => l.toLowerCase());
    const checklist = [
      fr.tone !== 'good'
        ? ['phone', `<strong>Call to confirm before leaving.</strong> This information was updated ${fr.ago} (${fr.source.toLowerCase()}).`]
        : ['phone', `Optional: call ahead to confirm timings. Information was updated ${fr.ago}.`],
      sid && !r.avail.ok && r.avail.code !== 'appt' ? ['clock', `<strong>Not available at your chosen time.</strong> ${r.avail.sub}.`] : null,
      sid && r.avail.code === 'appt' ? ['calendar', '<strong>Book a slot by phone.</strong> This service is by appointment only.'] : null,
      ['clipboard', 'Carry an ID and any previous prescriptions or test reports.'],
      ['card', `Payment accepted: ${esc(f.payment.join(', '))}.`],
      sid && r.wait != null && r.wait > 45 ? ['hourglass', `Expect a long wait (about ${r.wait} min). Consider arriving early.`] : null,
      unknownAccess.length ? ['access', `Accessibility not confirmed: ${esc(unknownAccess.join(', '))}. Ask when you call.`] : null
    ].filter(Boolean);

    return `
    <section class="plan-hero">
      <div class="container">
        <a class="back" href="${sid ? '#/compare' : '#/facility/' + f.id}" data-act="plan-back">${icon('arrowL')}Back</a>
        <div class="plan-hero__row">
          <span class="plan-hero__ic">${icon('check')}</span>
          <div><span class="plan-hero__k">Your selected option</span><h1>${esc(f.name)}</h1>
          <p>${sid ? `<strong>${esc(D.serviceMap[sid].name)}</strong> · ` : ''}${esc(f.address)}, ${esc(f.area)}</p></div>
        </div>
      </div>
    </section>
    <div class="container plan-grid">
      <div class="plan-col">
        <section class="panel">
          <h2>${icon('clipboard')}Visit summary</h2>
          ${sid ? `<div class="metrics metrics--lg">
            ${metric('rupee', 'Cost', priceText(r.price), esc(priceSub(r)), r.price == null ? 'muted' : '')}
            ${metric('clock', esc(whenLabel(state.when)), r.avail.title, r.avail.sub, r.avail.tone, true)}
            ${metric('hourglass', 'Est. wait', waitText(r.wait), r.wait == null ? 'No reliable data' : 'Typical estimate', waitTone(r.wait))}
            ${metric('access', 'Access', ac.title, ac.sub, ac.tone)}
          </div>` : `<p class="fhint">No service selected. Showing general facility details.</p>`}
          ${sid && !r.avail.ok ? `<div class="callout callout--warn">${icon('alert')}<div><strong>Heads up:</strong> ${r.avail.title.toLowerCase()} at your chosen time. ${r.avail.sub}. <button class="link" data-act="go-back-compare">Compare other options</button></div></div>` : ''}
        </section>
        <section class="panel">
          <h2>${icon('nav')}Next steps</h2>
          <div class="actions-grid">
            <a class="action" href="tel:${tel}">
              <span class="action__ic action__ic--brand">${icon('phone')}</span>
              <span><strong>Call the facility</strong><small>${esc(f.phone)}</small></span>${icon('chevR', 'action__go')}
            </a>
            <button class="action" data-act="open-maps">
              <span class="action__ic action__ic--blue">${icon('nav')}</span>
              <span><strong>Get directions</strong><small>${r.dist} km · ~${r.drive} min by road</small></span>${icon('chevR', 'action__go')}
            </button>
            <button class="action" data-act="share-plan" data-id="${f.id}">
              <span class="action__ic action__ic--violet">${icon('share')}</span>
              <span><strong>Share with family</strong><small>Send this plan to someone</small></span>${icon('chevR', 'action__go')}
            </button>
            <div class="action action--soon" aria-disabled="true">
              <span class="action__ic">${icon('calendar')}</span>
              <span><strong>Book an appointment</strong><small>Planned for a future version</small></span><span class="soon">Coming later</span>
            </div>
          </div>
        </section>
        <section class="panel">
          <h2>${icon('check')}Before you go</h2>
          <ul class="checklist">
            ${checklist.map(([ic, t], i) => `<li><label><input type="checkbox"><span class="check__box">${icon('check')}</span><span class="checklist__t">${t}</span></label></li>`).join('')}
          </ul>
        </section>
      </div>
      <div class="plan-col">
        <section class="panel panel--flush">
          <div class="panel__pad"><h2>${icon('map')}Getting there</h2></div>
          ${mapCard([r], { route: true, h: 300, focusFacility: f })}
          <div class="travel">
            <div>${icon('car')}<strong>~${r.drive} min</strong><span>By road · ${r.dist} km</span></div>
            <div>${icon('walk')}<strong>~${r.walk} min</strong><span>Walking</span></div>
          </div>
          <p class="fhint panel__pad">Live OpenStreetMap route from ${esc(locObj().name)}. Click "Open in maps" to launch real-time directions in Google Maps.</p>
        </section>
        <section class="panel panel--muted">
          <h2>${icon('shield')}Information status</h2>
          <p class="fresh-line fresh-line--${fr.tone}"><strong>${fr.title}.</strong> Updated ${fr.ago} · ${fr.source}.</p>
          <a class="btn btn--ghost btn--sm" href="#/facility/${f.id}">${icon('building')}Full facility details</a>
        </section>
      </div>
    </div>`;
  }

  function planText(id) {
    const f = D.facilityMap[id];
    const sid = state.service && f.services[state.service] ? state.service : null;
    const r = sid ? enrich(f, sid) : null;
    const fr = freshness(f);
    return [
      'CUREVIA visit plan',
      sid ? `Service: ${D.serviceMap[sid].name}` : null,
      `Where: ${f.name}, ${f.address}, ${f.area}`,
      r ? `When: ${whenLabel(state.when)} (${r.avail.title}; ${r.avail.sub})` : null,
      r ? `Cost: ${priceText(r.price)} (${priceSub(r)})  ·  Est. wait: ${waitText(r.wait)}` : null,
      `Phone: ${f.phone}`,
      `Info updated ${fr.ago} (${fr.source}). Please call to confirm before travelling.`,
      '(Prototype: sample data)'
    ].filter(Boolean).join('\n');
  }

  function viewNotFound() {
    return `<div class="container section"><div class="empty"><span class="empty__ic">${icon('help')}</span><h3>Page not found</h3><p>That page doesn’t exist in this prototype.</p><div class="empty__actions"><a class="btn btn--primary" href="#/">Go home</a></div></div></div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Search suggestions                                                  */
  /* ------------------------------------------------------------------ */
  function matchServices(q) {
    q = q.toLowerCase().trim();
    const words = q.split(/\s+/).filter((w) => w.length >= 3);
    return D.services.map((s) => {
      const name = s.name.toLowerCase();
      let sc = 0;
      if (name.startsWith(q)) sc += 10; else if (name.includes(q)) sc += 7;
      s.keywords.forEach((k) => {
        if (k === q) sc += 9;
        else if (k.startsWith(q) || (q.length >= 3 && k.includes(q))) sc += 5;
        else if (k.length >= 3 && q.includes(k)) sc += 4;
      });
      words.forEach((w) => {
        if (name.includes(w)) sc += 2;
        if (s.keywords.some((k) => k.split(' ').some((kw) => kw.startsWith(w)))) sc += 2;
      });
      if (D.catMap[s.cat].name.toLowerCase().includes(q)) sc += 3;
      return { s, sc };
    }).filter((x) => x.sc > 0).sort((a, b) => b.sc - a.sc).slice(0, 7).map((x) => x.s);
  }

  function hl(name, q) {
    const e = esc(name);
    if (!q) return e;
    const i = name.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return e;
    return esc(name.slice(0, i)) + '<mark>' + esc(name.slice(i, i + q.length)) + '</mark>' + esc(name.slice(i + q.length));
  }

  function updateSuggest(input) {
    const wrap = input.closest('[data-search]');
    const list = wrap.querySelector('.search__list');
    const q = input.value.trim();
    const items = q ? matchServices(q) : D.popular.map((id) => D.serviceMap[id]);
    let html = q ? '' : '<div class="opt-head">Popular searches</div>';
    if (q && !items.length) {
      html = `<div class="opt-empty">${icon('help')}<div><strong>No exact match for “${esc(q)}”.</strong><span>Try simpler words, or browse a type of care:</span></div></div>
        <div class="opt-cats">${D.categories.map((c) => `<a class="chip chip--sm" href="#/category/${c.id}">${esc(c.name)}</a>`).join('')}</div>`;
    }
    html += items.map((s, i) => {
      const st = serviceStats(s.id);
      return `<div class="opt" role="option" id="${input.id}-o${i}" data-act="pick-service" data-sid="${s.id}" style="${catStyle(s.cat)}">
        <span class="opt__ic">${icon(D.catMap[s.cat].icon)}</span>
        <span class="opt__txt"><span class="opt__name">${hl(s.name, q)}</span>
        <span class="opt__meta">${esc(D.catMap[s.cat].name)} · ${st.count} places nearby${st.min != null ? ' · ' + fromPrice(st.min) : ''}</span></span>
        ${icon('arrowR', 'opt__go')}
      </div>`;
    }).join('');
    list.innerHTML = html;
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    wrap._items = items;
    wrap._active = -1;
  }

  function hideSuggest(wrap) {
    const list = wrap && wrap.querySelector('.search__list');
    if (!list) return;
    list.hidden = true;
    const input = wrap.querySelector('input');
    if (input) { input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); }
  }

  function moveActive(wrap, delta) {
    const opts = $$('.opt', wrap);
    if (!opts.length) return;
    wrap._active = ((wrap._active == null ? -1 : wrap._active) + delta + opts.length) % opts.length;
    opts.forEach((o, i) => o.classList.toggle('is-active', i === wrap._active));
    const a = opts[wrap._active];
    wrap.querySelector('input').setAttribute('aria-activedescendant', a.id);
    a.scrollIntoView({ block: 'nearest' });
  }

  function pickService(sid) {
    setService(sid);
    $$('[data-search]').forEach(hideSuggest);
    go('#/results?s=' + sid);
  }

  function setService(sid) {
    if (sid === state.service) return;
    if (state.compare.length) { state.compare = []; toast('Comparison cleared for the new service'); }
    state.service = sid;
    saveState();
  }

  /* ------------------------------------------------------------------ */
  /* Header, footer, tray, toasts                                        */
  /* ------------------------------------------------------------------ */
  function renderHeader() {
    $('#header').innerHTML = `
      <div class="proto-bar">${icon('info')}<span><strong>Live Prototype</strong> · Real OpenStreetMap healthcare facilities &amp; GPS coordinates (South Bengaluru &amp; Kanakapura Road Corridor). In an emergency, call <a href="tel:112">112</a>.</span></div>
      <header class="site-header"><div class="container site-header__inner">
        <a href="#/" class="brand" aria-label="CUREVIA home"><span class="brand__mark">${icon('heartPulse')}</span>
          <span class="brand__text"><span class="brand__name">CUREVIA</span><span class="brand__tag">Nearby healthcare service finder</span></span></a>
        <nav class="nav" aria-label="Main">
          <a href="#/" class="nav__link" data-nav="home">${icon('search')}<span class="hide-xs">Find care</span></a>
          <a href="#/compare" class="nav__link" data-nav="compare">${icon('columns')}<span class="hide-xs">Compare</span><span class="badge" id="nav-cmp"></span></a>
          <button type="button" class="nav__link" data-act="toggle-text" id="text-btn" title="Larger text" aria-pressed="${state.textLg}">${icon('textSize')}<span class="hide-sm">Text size</span></button>
          <button type="button" class="nav__link nav__link--test" data-act="open-test" title="Usability test mode (for facilitators)">${icon('clipboard')}<span class="hide-sm">Test mode</span></button>
        </nav>
      </div></header>`;
  }

  function updateHeader(r0) {
    $$('.nav__link[data-nav]').forEach((a) => a.classList.toggle('is-active', (a.dataset.nav === 'compare' && r0 === 'compare') || (a.dataset.nav === 'home' && ['', 'category', 'results'].includes(r0))));
    $('#nav-cmp').textContent = state.compare.length || '';
    const tb = $('#text-btn'); if (tb) { tb.setAttribute('aria-pressed', state.textLg); tb.classList.toggle('is-active', state.textLg); }
  }

  function renderFooter() {
    $('#footer').innerHTML = `<div class="container footer__inner">
      <div class="footer__brand"><a href="#/" class="brand"><span class="brand__mark">${icon('heartPulse')}</span><span class="brand__text"><span class="brand__name">CUREVIA</span><span class="brand__tag">Cure + Via: a path towards care</span></span></a>
        <p>A Design Thinking prototype (CA-2). CUREVIA helps people compare practical information about nearby healthcare services. It does not give medical advice.</p></div>
      <div class="footer__note">${icon('alert')}<div><strong>Sample data only</strong><span>Facilities, doctors, prices, timings and phone numbers are fictional. They are shown only to demonstrate the user flow.</span></div></div>
      <div class="footer__em">${icon('siren')}<div><strong>Emergency?</strong><span>Call <a href="tel:112">112</a> · Ambulance <a href="tel:108">108</a></span></div></div>
    </div>`;
  }

  function renderTray(r0) {
    const el = $('#tray');
    const svc = state.service && D.serviceMap[state.service];
    const show = svc && state.compare.length > 0 && ['', 'results', 'facility', 'category'].includes(r0);
    document.body.classList.toggle('has-tray', !!show);
    if (!show) { el.hidden = true; el.innerHTML = ''; return; }
    const n = state.compare.length;
    el.hidden = false;
    el.innerHTML = `<div class="tray__inner">
      <div class="tray__label">${icon('columns')}<div><strong>Compare ${n}/3</strong><span>${esc(shortName(svc.name))}</span></div></div>
      <div class="tray__slots">${[0, 1, 2].map((i) => {
        const id = state.compare[i];
        if (!id) return `<div class="tray__slot tray__slot--empty">${icon('plus')}Add option</div>`;
        const f = D.facilityMap[id];
        return `<div class="tray__slot"><span>${esc(f.name)}</span><button type="button" data-act="toggle-compare" data-id="${id}" aria-label="Remove ${esc(f.name)}">${icon('x')}</button></div>`;
      }).join('')}</div>
      <button type="button" class="link tray__clear" data-act="clear-compare">Clear</button>
      <button type="button" class="btn btn--primary" data-act="go-compare" ${n < 2 ? 'disabled' : ''}>${n < 2 ? 'Add 1 more' : 'Compare now'}${icon('arrowR')}</button>
    </div>`;
  }

  let toastTimer;
  function toast(msg, tone) {
    const root = $('#toasts');
    const t = document.createElement('div');
    t.className = 'toast' + (tone ? ' toast--' + tone : '');
    t.innerHTML = `${icon(tone === 'good' ? 'check' : 'info')}<span>${msg}</span>`;
    root.appendChild(t);
    clearTimeout(toastTimer);
    setTimeout(() => { t.classList.add('is-out'); setTimeout(() => t.remove(), 300); }, 3200);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(() => true, () => fallbackCopy(text));
    return Promise.resolve(fallbackCopy(text));
  }
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove(); return ok;
  }

  /* ------------------------------------------------------------------ */
  /* Router                                                              */
  /* ------------------------------------------------------------------ */
  function parseHash() {
    const h = location.hash.replace(/^#/, '') || '/';
    const [path, qs] = h.split('?');
    return { parts: path.split('/').filter(Boolean), q: new URLSearchParams(qs || '') };
  }
  function go(h) { if (location.hash === h) render(); else location.hash = h; }

  let lastKey = null;
  function render() {
    const { parts, q } = parseHash();
    const r0 = parts[0] || '';
    document.body.classList.remove('filters-open');
    let html, title = 'CUREVIA: Nearby Healthcare Service Finder';
    if (r0 === '') html = viewHome();
    else if (r0 === 'category') { html = viewCategory(parts[1]); title = (D.catMap[parts[1]] || {}).name + ' · CUREVIA'; }
    else if (r0 === 'results') {
      const s = q.get('s');
      if (s && D.serviceMap[s]) setService(s);
      if (state.service) { html = viewResults(); title = D.serviceMap[state.service].name + ' near you · CUREVIA'; } else html = viewHome();
    }
    else if (r0 === 'facility') { html = viewFacility(parts[1]); title = ((D.facilityMap[parts[1]] || {}).name || 'Facility') + ' · CUREVIA'; }
    else if (r0 === 'compare') { html = viewCompare(); title = 'Compare · CUREVIA'; }
    else if (r0 === 'plan') { html = viewPlan(parts[1]); title = 'Your plan · CUREVIA'; }
    else if (r0 === 'test') { html = viewHome(); ui.testOpen = true; }
    else html = viewNotFound();
    app.innerHTML = `<div class="view view--${r0 || 'home'}">${html}</div>`;
    document.title = title;
    const key = location.hash || '#/';
    if (key !== lastKey) {
      window.scrollTo(0, 0);
      if (lastKey !== null) countScreen();
      lastKey = key;
    }
    if (r0 === 'results') {
      updateResults();
    } else if (r0 === 'plan') {
      const pfac = D.facilityMap[parts[1]];
      if (pfac) {
        const psid = (state.service && pfac.services[state.service]) ? state.service : Object.keys(pfac.services)[0];
        mountLeafletMap([enrich(pfac, psid)], { route: true, focusFacility: pfac, h: 300 });
      }
    }
    updateHeader(r0);
    renderTray(r0);
  }

  /* ------------------------------------------------------------------ */
  /* Test mode (Report Section 10: Prototype Validation Plan)            */
  /* ------------------------------------------------------------------ */
  const TASKS = [
    { name: 'Find a specific service', scenario: 'You’ve had a fever for two days. Find a general doctor you could visit near the University Campus.', observe: 'Can the user understand the search starting point?', success: 'User finds the service without explanation.' },
    { name: 'Compare two facilities', scenario: 'Compare two places that offer a chest X-ray. Which one suits you better, and why?', observe: 'Can the user identify meaningful differences?', success: 'User can explain why one option suits them better.' },
    { name: 'Check cost and availability', scenario: 'You need a thyroid test this evening. How much will it cost, and is it available at that time?', observe: 'Are these details easy to locate?', success: 'User finds them without unrelated navigation.' },
    { name: 'Check accessibility', scenario: 'You’re taking an elderly relative who uses a wheelchair for an ultrasound. Find a place you could take them.', observe: 'Can a caregiver find the information?', success: 'User locates accessibility details quickly.' },
    { name: 'Complete the decision flow', scenario: 'Pick one option and show how you would contact it or get there.', observe: 'Does the user know what to do next?', success: 'User reaches contact/direction action confidently.' }
  ];
  const OUTCOMES = [['independent', 'Completed independently', '✓'], ['help', 'Completed with help', '◐'], ['failed', 'Not completed', '✗']];
  const sessions = () => store.get('sessions', []);
  const fmtDur = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const runningIdx = () => (state.test ? state.test.tasks.findIndex((t) => t.status === 'running') : -1);

  function countScreen() {
    const i = runningIdx();
    if (i < 0) return;
    state.test.tasks[i].screens++;
    saveState();
    $$('[data-screens]').forEach((el) => { el.textContent = state.test.tasks[i].screens; });
  }

  function resetApp() {
    state.service = null; state.filters = defaultFilters(); state.compare = []; state.sort = 'best'; state.loc = 'campus'; state.when = 'now';
    saveState();
    $$('[data-search]').forEach(hideSuggest);
  }

  function renderTest() {
    const root = $('#test-root');
    const s = state.test;
    if (!ui.testOpen) {
      if (!s) { root.innerHTML = ''; return; }
      const i = runningIdx();
      root.innerHTML = `<div class="tpill" role="region" aria-label="Test session">
        <span class="tpill__rec ${i >= 0 ? 'is-on' : ''}"></span>
        <span class="tpill__txt"><strong>${esc(s.participant)}</strong>${i >= 0 ? ` · Task ${i + 1} · <span data-timer>${fmtDur(Date.now() - s.tasks[i].start)}</span>` : ' · Test session'}</span>
        ${i >= 0 ? `<button type="button" class="tpill__btn tpill__btn--stop" data-act="t-finish" data-i="${i}">${icon('stop')}Finish</button>` : ''}
        <button type="button" class="tpill__btn" data-act="open-test" aria-label="Open test panel">${icon('clipboard')}</button>
      </div>`;
      return;
    }
    root.innerHTML = `<aside class="drawer" role="dialog" aria-label="Usability test mode">
      <div class="drawer__head">
        <div><span class="drawer__k">${icon('clipboard')}Facilitator tool</span><h2>Usability test mode</h2></div>
        ${s ? `<button type="button" class="icon-btn" data-act="close-test" title="Minimise" aria-label="Minimise">${icon('minimize')}</button>` : ''}
        <button type="button" class="icon-btn" data-act="close-test" aria-label="Close">${icon('x')}</button>
      </div>
      <div class="drawer__body">${s ? testSessionView(s) : testStartView()}</div>
    </aside>`;
  }

  function testStartView() {
    const list = sessions();
    const F = ui.form;
    return `
      <div class="callout callout--info">${icon('info')}<div>This runs the <strong>Prototype Validation Plan</strong> (Report §10) with 3–4 real users. Record only what participants actually do and say.</div></div>
      <div class="tform">
        <label class="tfield"><span>Participant code</span><input class="tinput" data-tf="participant" placeholder="e.g. P${list.length + 1}" value="${esc(F.participant)}"></label>
        <label class="tfield"><span>Participant type</span><select class="tinput" data-tf="ptype">${['Student / young adult', 'Working professional', 'Parent / family member', 'Caregiver / elderly user', 'Other'].map((o) => `<option ${o === F.ptype ? 'selected' : ''}>${o}</option>`).join('')}</select></label>
        <div class="tform__row">
          <label class="tfield"><span>Device</span><select class="tinput" data-tf="device">${['Laptop', 'Phone', 'Tablet'].map((o) => `<option ${o === F.device ? 'selected' : ''}>${o}</option>`).join('')}</select></label>
          <label class="tfield"><span>Facilitator</span><input class="tinput" data-tf="facilitator" placeholder="Your name" value="${esc(F.facilitator)}"></label>
        </div>
        <label class="check"><input type="checkbox" data-tf="reset" ${F.reset ? 'checked' : ''}><span class="check__box">${icon('check')}</span><span>Reset the prototype to the home screen when each task starts</span></label>
        <button type="button" class="btn btn--primary btn--block" data-act="t-start">${icon('play')}Start session</button>
      </div>
      <div class="tsaved">
        <div class="tsaved__head"><h3>Recorded sessions <span class="badge badge--muted">${list.length}</span></h3></div>
        ${list.length ? `<ul class="tsaved__list">${list.map((x) => {
          const done = x.tasks.filter((t) => t.outcome).length;
          return `<li><div><strong>${esc(x.participant)}</strong> · ${esc(x.ptype)}<small>${new Date(x.started).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} · ${done}/5 tasks · ease ${x.ease || '–'}/5</small></div>
            <button type="button" class="icon-btn" data-act="t-delete" data-id="${x.id}" aria-label="Delete session">${icon('trash')}</button></li>`;
        }).join('')}</ul>
        <div class="tsaved__actions">
          <button type="button" class="btn btn--ghost btn--sm" data-act="t-csv">${icon('download')}Download CSV</button>
          <button type="button" class="btn btn--ghost btn--sm" data-act="t-md">${icon('copy')}Copy table for report</button>
        </div>` : `<p class="fhint">No sessions recorded yet. Results appear here after you save a session.</p>`}
      </div>`;
  }

  function testSessionView(s) {
    const running = runningIdx();
    return `
      <div class="tsess">
        <div class="tsess__who"><span class="avatar">${esc(s.participant.slice(0, 3))}</span><div><strong>${esc(s.participant)}</strong><small>${esc(s.ptype)} · ${esc(s.device)}${s.facilitator ? ' · with ' + esc(s.facilitator) : ''}</small></div></div>
        <p class="fhint">Read each scenario aloud, then press <strong>Start</strong>. The panel minimises so the participant can use the app. Only help if they’re stuck, and if you do, mark it.</p>
      </div>
      <ol class="tasks">
        ${s.tasks.map((t, i) => {
          const T = TASKS[i];
          return `<li class="task task--${t.status}">
            <div class="task__head"><span class="task__no">${t.status === 'done' && t.outcome ? OUTCOMES.find((o) => o[0] === t.outcome)[2] : i + 1}</span>
              <div class="task__title"><strong>${T.name}</strong>
              <small>${t.status === 'running' ? `<span class="rec"></span>Running · <span data-timer>${fmtDur(Date.now() - t.start)}</span> · <span data-screens>${t.screens}</span> screens` : t.status === 'done' ? `${fmtDur(t.ms)} · ${t.screens} screen change${t.screens === 1 ? '' : 's'}` : 'Not started'}</small></div>
            </div>
            <blockquote class="task__scenario">“${T.scenario}”</blockquote>
            <dl class="task__dl"><dt>Observe</dt><dd>${T.observe}</dd><dt>Success</dt><dd>${T.success}</dd></dl>
            ${t.status === 'idle' ? `<button type="button" class="btn btn--primary btn--sm" data-act="t-task-start" data-i="${i}" ${running >= 0 ? 'disabled' : ''}>${icon('play')}Start task</button>` : ''}
            ${t.status === 'running' ? `<button type="button" class="btn btn--dark btn--sm" data-act="t-finish" data-i="${i}">${icon('stop')}Finish task</button>` : ''}
            ${t.status === 'done' ? `
              <div class="seg seg--outcome">${OUTCOMES.map(([v, l]) => `<button type="button" class="seg__btn ${t.outcome === v ? 'is-on is-' + v : ''}" data-act="t-outcome" data-i="${i}" data-v="${v}">${l}</button>`).join('')}</div>
              <textarea class="tinput" rows="2" data-tnote="${i}" placeholder="What did they do or say? (observed only)">${esc(t.notes)}</textarea>
              <button type="button" class="link link--sm" data-act="t-redo" data-i="${i}">${icon('refresh')}Redo task</button>` : ''}
          </li>`;
        }).join('')}
      </ol>
      <section class="tpost">
        <h3>After the tasks</h3>
        <div class="tpost__q"><span>How easy was it to use? <small>1 = very hard · 5 = very easy</small></span>${rateRow('ease', s.ease)}</div>
        <div class="tpost__q"><span>How confident are you in the option you chose?</span>${rateRow('confidence', s.confidence)}</div>
        <div class="tpost__q"><span>Would you use CUREVIA?</span><div class="seg">${['Yes', 'Maybe', 'No'].map((v) => `<button type="button" class="seg__btn ${s.wouldUse === v ? 'is-on' : ''}" data-act="t-rate" data-k="wouldUse" data-v="${v}">${v}</button>`).join('')}</div></div>
        <label class="tfield"><span>Participant quote or suggestion</span><textarea class="tinput" rows="3" data-tq placeholder="Write their words exactly">${esc(s.quote)}</textarea></label>
      </section>
      <div class="drawer__foot">
        <button type="button" class="btn btn--ghost" data-act="t-discard">${icon('trash')}Discard</button>
        <button type="button" class="btn btn--primary" data-act="t-save" ${running >= 0 ? 'disabled' : ''}>${icon('check')}Save &amp; end session</button>
      </div>`;
  }

  const rateRow = (k, v) => `<div class="rate">${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="rate__btn ${v === n ? 'is-on' : ''}" data-act="t-rate" data-k="${k}" data-v="${n}" aria-label="${n} of 5">${n}</button>`).join('')}</div>`;

  function sessionsCSV(list) {
    const head = ['Session', 'Date', 'Participant', 'Participant type', 'Device', 'Facilitator', 'Task no', 'Task', 'Duration (s)', 'Screen changes', 'Outcome', 'Task notes', 'Ease (1-5)', 'Confidence (1-5)', 'Would use', 'Quote'];
    const q = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const rows = [];
    list.forEach((s) => s.tasks.forEach((t, i) => rows.push([
      s.id, new Date(s.started).toISOString(), s.participant, s.ptype, s.device, s.facilitator, i + 1, TASKS[i].name,
      t.status === 'done' ? Math.round(t.ms / 1000) : '', t.status === 'done' ? t.screens : '',
      (OUTCOMES.find((o) => o[0] === t.outcome) || [, ''])[1], t.notes, s.ease || '', s.confidence || '', s.wouldUse, s.quote
    ])));
    return [head, ...rows].map((r) => r.map(q).join(',')).join('\r\n');
  }

  function sessionsMD(list) {
    const cellFor = (t) => (t.outcome ? `${OUTCOMES.find((o) => o[0] === t.outcome)[2]} ${fmtDur(t.ms)}` : '—');
    const lines = [
      '| Participant | Type | ' + TASKS.map((_, i) => `T${i + 1}`).join(' | ') + ' | Ease | Confidence | Would use |',
      '|' + ' --- |'.repeat(TASKS.length + 5),
      ...list.map((s) => `| ${s.participant} | ${s.ptype} | ${s.tasks.map(cellFor).join(' | ')} | ${s.ease || '—'}/5 | ${s.confidence || '—'}/5 | ${s.wouldUse || '—'} |`),
      '',
      'Key: ✓ completed independently · ◐ completed with help · ✗ not completed · time in m:ss',
      'Tasks: ' + TASKS.map((t, i) => `T${i + 1} ${t.name}`).join('; ')
    ];
    const quotes = list.filter((s) => s.quote.trim()).map((s) => `- ${s.participant} (${s.ptype}): “${s.quote.trim()}”`);
    if (quotes.length) lines.push('', 'Participant quotes:', ...quotes);
    return lines.join('\n');
  }

  function download(name, text, type) {
    const blob = new Blob(['\ufeff' + text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  setInterval(() => {
    const i = runningIdx();
    if (i < 0) return;
    const txt = fmtDur(Date.now() - state.test.tasks[i].start);
    $$('[data-timer]').forEach((el) => { el.textContent = txt; });
  }, 1000);

  /* ------------------------------------------------------------------ */
  /* Real GPS and Field Verification Modals                              */
  /* ------------------------------------------------------------------ */
  function requestUserGps() {
    if (!navigator.geolocation) {
      toast('Geolocation is not supported by your browser', 'bad');
      return;
    }
    toast('Acquiring live GPS coordinates from your device…', 'info');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const gpsId = 'my_live_gps';
        let gpsLoc = D.localities.find((l) => l.id === gpsId);
        if (!gpsLoc) {
          gpsLoc = { id: gpsId, name: `📍 My Current GPS (${lat.toFixed(3)}, ${lon.toFixed(3)})`, lat, lon, x: 0, y: 0 };
          D.localities.unshift(gpsLoc);
        } else {
          gpsLoc.lat = lat;
          gpsLoc.lon = lon;
          gpsLoc.name = `📍 My Current GPS (${lat.toFixed(3)}, ${lon.toFixed(3)})`;
        }
        state.loc = gpsId;
        saveState();
        toast('Location updated to your live GPS coordinates!', 'good');
        render();
      },
      (err) => {
        toast('Could not detect GPS: ' + (err.message || 'Permission denied') + '. Selected default area.', 'warn');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function openFacilityEditor(fid) {
    const f = D.facilityMap[fid];
    if (!f) return;
    const currentPrice = f.services.gp ? f.services.gp.price : (Object.values(f.services)[0]?.price || 500);
    const currentWait = f.services.gp ? f.services.gp.wait : (Object.values(f.services)[0]?.wait || 20);
    const currentDoc = f.services.gp?.doctor || '';

    const modalHtml = `
      <div class="vmodal-backdrop" id="vmodal-wrap">
        <div class="vmodal" role="dialog" aria-modal="true" aria-labelledby="vmodal-title">
          <div class="vmodal__head">
            <h3 id="vmodal-title">${icon('shield')} Field Verification: ${esc(f.name)}</h3>
            <button type="button" class="vmodal__close" data-act="close-vmodal" aria-label="Close">${icon('x')}</button>
          </div>
          <form class="vmodal__body" id="vmodal-form">
            <div class="vmodal__notice">
              <strong>Reception &amp; Community Verification:</strong> Update live queue wait time, consultation fee, or on-duty doctors. Changes are saved locally and immediately update CUREVIA rankings.
            </div>
            <label>
              <span>Consultation Fee (₹):</span>
              <input type="number" id="v-price" name="price" value="${typeof currentPrice === 'number' ? currentPrice : (Array.isArray(currentPrice) ? currentPrice[0] : 500)}" min="0" max="5000" step="20" required>
            </label>
            <label>
              <span>Estimated Queue Wait Time (minutes):</span>
              <input type="number" id="v-wait" name="wait" value="${currentWait != null ? currentWait : 20}" min="0" max="240" step="5" required>
            </label>
            <label>
              <span>Attending Doctor / On-duty Officer:</span>
              <input type="text" id="v-doc" name="doctor" value="${esc(currentDoc)}" placeholder="e.g. Dr. K. Sharma">
            </label>
            <label>
              <span>Accessibility:</span>
              <select id="v-wheelchair" name="wheelchair">
                <option value="true" ${f.access.wheelchair ? 'selected' : ''}>Confirmed Accessible (Wheelchair + Ramp)</option>
                <option value="false" ${!f.access.wheelchair ? 'selected' : ''}>Not Accessible (Stairs only / Upper floor)</option>
              </select>
            </label>
          </form>
          <div class="vmodal__foot">
            <button type="button" class="btn btn--ghost btn--sm" data-act="reset-facility-default" data-fid="${f.id}">Reset to Default</button>
            <button type="button" class="btn btn--primary btn--sm" data-act="save-facility-edit" data-fid="${f.id}">${icon('check')} Save &amp; Recalculate</button>
          </div>
        </div>
      </div>
    `;
    const old = document.getElementById('vmodal-wrap');
    if (old) old.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  function closeFacilityEditor() {
    const el = document.getElementById('vmodal-wrap');
    if (el) el.remove();
  }

  function saveFacilityEdit(fid) {
    const f = D.facilityMap[fid];
    if (!f) return;
    const pInput = document.getElementById('v-price');
    const wInput = document.getElementById('v-wait');
    const dInput = document.getElementById('v-doc');
    const acInput = document.getElementById('v-wheelchair');
    if (!pInput || !wInput) return;

    const updates = store.get('custom_updates', {});
    updates[fid] = {
      price: Number(pInput.value),
      wait: Number(wInput.value),
      doctor: dInput ? dInput.value.trim() : '',
      wheelchair: acInput ? acInput.value === 'true' : true
    };
    store.set('custom_updates', updates);
    applyCustomUpdates();
    closeFacilityEditor();
    toast(`Verified details for ${f.name} updated!`, 'good');
    render();
  }

  function resetFacilityDefault(fid) {
    const updates = store.get('custom_updates', {});
    delete updates[fid];
    store.set('custom_updates', updates);
    closeFacilityEditor();
    toast('Reset facility to OSM default values.', 'info');
    location.reload();
  }

  /* ------------------------------------------------------------------ */
  /* Events                                                              */
  /* ------------------------------------------------------------------ */
  function closeFilters() { document.body.classList.remove('filters-open'); }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    // Hide suggestion lists when clicking elsewhere
    $$('[data-search]').forEach((w) => { if (!w.contains(e.target)) hideSuggest(w); });
    if (!el) return;
    const act = el.dataset.act;
    const F = state.filters;
    switch (act) {
      case 'use-gps': requestUserGps(); break;
      case 'edit-facility': openFacilityEditor(el.dataset.fid); break;
      case 'close-vmodal': closeFacilityEditor(); break;
      case 'save-facility-edit': saveFacilityEdit(el.dataset.fid); break;
      case 'reset-facility-default': resetFacilityDefault(el.dataset.fid); break;
      case 'pick-service': e.preventDefault(); pickService(el.dataset.sid); break;
      case 'toggle-compare': {
        e.preventDefault(); e.stopPropagation();
        const id = el.dataset.id;
        const i = state.compare.indexOf(id);
        if (i >= 0) state.compare.splice(i, 1);
        else if (state.compare.length >= 3) { toast('You can compare up to 3 options. Remove one first.'); return; }
        else { state.compare.push(id); if (state.compare.length === 1) toast('Added. Pick one or two more to compare.'); }
        saveState();
        const r0 = parseHash().parts[0] || '';
        if (r0 === 'results') { updateResults(); renderTray(r0); updateHeader(r0); } else render();
        break;
      }
      case 'clear-compare': state.compare = []; saveState(); render(); break;
      case 'go-compare': go('#/compare'); break;
      case 'open-filters': document.body.classList.add('filters-open'); break;
      case 'close-filters': closeFilters(); break;
      case 'clear-filters': state.filters = defaultFilters(); saveState(); $('#filters') && ($('#filters').innerHTML = filtersPanel()); updateResults(); break;
      case 'set-f': F[el.dataset.k] = Number(el.dataset.v); saveState(); $('#filters').innerHTML = filtersPanel(); updateResults(); break;
      case 'rm-f': {
        const k = el.dataset.k, v = el.dataset.v;
        if (k === 'access' || k === 'types') F[k] = F[k].filter((x) => x !== v);
        else F[k] = defaultFilters()[k];
        saveState(); $('#filters').innerHTML = filtersPanel(); updateResults(); break;
      }
      case 'set-when': state.when = el.dataset.v; saveState(); render(); toast('Showing availability for ' + whenLabel(state.when).toLowerCase()); break;
      case 'toggle-map': {
        const on = document.body.classList.toggle('show-map');
        el.querySelector('span').textContent = on ? 'Hide map' : 'Show map';
        break;
      }
      case 'toggle-text':
        state.textLg = !state.textLg; saveState();
        document.documentElement.classList.toggle('lg', state.textLg);
        updateHeader(parseHash().parts[0] || '');
        toast(state.textLg ? 'Larger text on' : 'Standard text size');
        break;
      case 'report-info': toast('Thanks. In the full version, this report would go to the facility for verification.'); break;
      case 'open-maps': {
        const fid = el.dataset.id;
        const fac = fid ? D.facilityMap[fid] : null;
        if (fac && fac.lat && fac.lon) {
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lon}`, '_blank');
        } else {
          toast('Opening route on Google Maps…');
        }
        break;
      }
      case 'share-plan': {
        const text = planText(el.dataset.id);
        if (navigator.share) navigator.share({ title: 'CUREVIA visit plan', text }).catch(() => {});
        else copyText(text).then((ok) => toast(ok ? 'Plan copied. Paste it into WhatsApp or SMS.' : 'Copy not available in this browser', ok ? 'good' : ''));
        break;
      }
      case 'go-back-compare': go(state.compare.length >= 2 ? '#/compare' : '#/results?s=' + state.service); break;
      case 'plan-back': e.preventDefault(); history.length > 1 ? history.back() : go('#/'); break;

      /* Test mode */
      case 'open-test': ui.testOpen = true; renderTest(); break;
      case 'close-test': ui.testOpen = false; renderTest(); break;
      case 't-start':
        state.test = {
          id: 'S' + Date.now().toString(36), started: new Date().toISOString(),
          participant: ui.form.participant.trim() || 'P' + (sessions().length + 1), ptype: ui.form.ptype, device: ui.form.device,
          facilitator: ui.form.facilitator.trim(), reset: ui.form.reset,
          tasks: TASKS.map(() => ({ status: 'idle', start: 0, ms: 0, screens: 0, outcome: '', notes: '' })),
          ease: 0, confidence: 0, wouldUse: '', quote: ''
        };
        ui.form.participant = '';
        resetApp(); saveState(); go('#/'); renderTest();
        break;
      case 't-task-start': {
        const t = state.test.tasks[+el.dataset.i];
        if (state.test.reset) { resetApp(); }
        Object.assign(t, { status: 'running', start: Date.now(), ms: 0, screens: 0 });
        saveState(); ui.testOpen = false;
        lastKey = null; go('#/'); lastKey = location.hash || '#/';
        renderTest();
        toast(`Task ${+el.dataset.i + 1} started. Hand over to the participant.`);
        break;
      }
      case 't-finish': {
        const t = state.test.tasks[+el.dataset.i];
        t.status = 'done'; t.ms = Date.now() - t.start;
        saveState(); ui.testOpen = true; renderTest();
        break;
      }
      case 't-outcome': state.test.tasks[+el.dataset.i].outcome = el.dataset.v; saveState(); renderTest(); break;
      case 't-redo': Object.assign(state.test.tasks[+el.dataset.i], { status: 'idle', ms: 0, screens: 0, outcome: '' }); saveState(); renderTest(); break;
      case 't-rate': state.test[el.dataset.k] = el.dataset.k === 'wouldUse' ? el.dataset.v : Number(el.dataset.v); saveState(); renderTest(); break;
      case 't-save': {
        const list = sessions(); list.push(state.test); store.set('sessions', list);
        toast(`Session ${esc(state.test.participant)} saved`, 'good');
        state.test = null; saveState(); renderTest();
        break;
      }
      case 't-discard':
        if (confirm('Discard this session? Its recorded data will be lost.')) { state.test = null; saveState(); renderTest(); }
        break;
      case 't-delete':
        if (confirm('Delete this recorded session?')) { store.set('sessions', sessions().filter((x) => x.id !== el.dataset.id)); renderTest(); }
        break;
      case 't-csv': download(`curevia-usability-${new Date().toISOString().slice(0, 10)}.csv`, sessionsCSV(sessions()), 'text/csv;charset=utf-8'); break;
      case 't-md': copyText(sessionsMD(sessions())).then((ok) => toast(ok ? 'Summary table copied (Markdown)' : 'Copy not available in this browser', ok ? 'good' : '')); break;
      default: break;
    }
  });

  // Prevent search inputs from blurring when choosing an option
  document.addEventListener('mousedown', (e) => { if (e.target.closest('.search__list')) e.preventDefault(); });

  document.addEventListener('focusin', (e) => {
    if (e.target.matches('.search__input')) updateSuggest(e.target);
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.matches('.search__input')) { updateSuggest(t); return; }
    if (t.matches('[data-f="maxDist"]')) {
      state.filters.maxDist = Number(t.value);
      $('#o-dist').textContent = state.filters.maxDist >= 40 ? 'Any distance' : 'Within ' + state.filters.maxDist + ' km';
      saveState(); updateResults(); return;
    }
    if (t.matches('[data-tf]') && t.type !== 'checkbox') { ui.form[t.dataset.tf] = t.value; return; }
    if (t.matches('[data-tnote]')) { state.test.tasks[+t.dataset.tnote].notes = t.value; saveState(); return; }
    if (t.matches('[data-tq]')) { state.test.quote = t.value; saveState(); }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('select[data-state]')) {
      state[t.dataset.state] = t.value; saveState();
      const r0 = parseHash().parts[0] || '';
      if (r0 === 'results') {
        if (t.dataset.state === 'when') $('#filters').innerHTML = filtersPanel();
        updateResults();
      } else if (r0 !== '') render();
      return;
    }
    if (t.matches('input[data-f]') && t.type === 'checkbox') { state.filters[t.dataset.f] = t.checked; saveState(); updateResults(); return; }
    if (t.matches('input[data-farr]')) {
      const arr = state.filters[t.dataset.farr];
      if (t.checked && !arr.includes(t.value)) arr.push(t.value);
      if (!t.checked) state.filters[t.dataset.farr] = arr.filter((x) => x !== t.value);
      saveState(); updateResults(); return;
    }
    if (t.id === 'diff-only') { ui.diffOnly = t.checked; render(); return; }
    if (t.matches('[data-tf]')) { ui.form[t.dataset.tf] = t.type === 'checkbox' ? t.checked : t.value; }
  });

  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t.matches && t.matches('.search__input')) {
      const wrap = t.closest('[data-search]');
      if (e.key === 'ArrowDown') { e.preventDefault(); if ($('.search__list', wrap).hidden) updateSuggest(t); moveActive(wrap, 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(wrap, -1); }
      else if (e.key === 'Escape') { hideSuggest(wrap); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        submitSearch(wrap);
      }
      return;
    }
    if (e.key === 'Escape') {
      if (document.body.classList.contains('filters-open')) closeFilters();
      else if (ui.testOpen) { ui.testOpen = false; renderTest(); }
    }
  });

  function submitSearch(wrap) {
    const input = wrap.querySelector('input');
    const q = input.value.trim();
    const items = q ? matchServices(q) : [];
    const opts = $$('.opt', wrap);
    if (wrap._active != null && wrap._active >= 0 && opts[wrap._active]) { pickService(opts[wrap._active].dataset.sid); return; }
    if (items.length) { pickService(items[0].id); return; }
    updateSuggest(input);
    input.focus();
    wrap.classList.remove('shake'); void wrap.offsetWidth; wrap.classList.add('shake');
  }

  document.addEventListener('submit', (e) => {
    if (e.target.matches('[data-form="home-search"]')) { e.preventDefault(); submitSearch($('[data-search]', e.target)); }
  });

  // Hover sync between result cards and map pins
  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('[data-fid]');
    $$('.is-hover').forEach((x) => { if (!el || x.dataset.fid !== el.dataset.fid) x.classList.remove('is-hover'); });
    if (el) $$(`[data-fid="${el.dataset.fid}"]`).forEach((x) => x.classList.add('is-hover'));
  });

  /* ------------------------------------------------------------------ */
  /* Init                                                                */
  /* ------------------------------------------------------------------ */
  const app = $('#app');
  document.documentElement.classList.toggle('lg', state.textLg);
  renderHeader();
  renderFooter();
  window.addEventListener('hashchange', render);
  render();
  renderTest();
})();

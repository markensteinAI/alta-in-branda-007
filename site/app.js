/* App della pagina: generata da part3, non modificare qui */
window.IVL_SITE = true;
(() => {
'use strict';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2, '0');
const store = {
  get(k, d) { try { const v = localStorage.getItem('ivl26.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('ivl26.' + k, JSON.stringify(v)); } catch (e) {} }
};
const DAY = 864e5;
const CHECK = typeof window.IVL_CHECK === 'string' ? window.IVL_CHECK : null;
const GEN = new Date(CHECK && CHECK > IVL.gen ? CHECK : IVL.gen);
const HOSTED = !!window.IVL_SITE;
const NOW = new Date();
const DEFAULT_TEAM = 599;

/* ---------- testo ---------- */
function titleCase(s) {
  return s.toLowerCase()
    .replace(/(^|[\s\-\/(.'’"])([a-zà-ù])/g, (m, p, c) => p + c.toUpperCase())
    .replace(/\s(Di|Del|Della|Dello|Dei|Degli|Sul|Sulla|Da|D)\s/g, m => m.toLowerCase());
}
function tidy(s) {
  s = (s || '').replace(/\s+/g, ' ').trim().replace(/([A-Za-zÀ-ù]{4,})\.(?=\s|$)/g, '$1').replace(/[,\s]+$/, '');
  const letters = s.replace(/[^A-Za-zÀ-ù]/g, ''), upper = s.replace(/[^A-ZÀ-Ý]/g, '');
  if (s.length > 3 && letters.length && upper.length / letters.length >= 0.6) s = titleCase(s);
  return s;
}
const comune = s => titleCase((s || '').trim());
const num1 = x => x.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const num2 = x => x.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '—';
const ratio = (a, b) => b ? num2(a / b) : (a ? '∞' : '—');

/* ---------- date ---------- */
const fDay = new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric' });
const fMon = new Intl.DateTimeFormat('it-IT', { month: 'short' });
const fD = new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
const fDL = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
const fDM = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' });
const fFull = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const fT = d => pad(d.getHours()) + ':' + pad(d.getMinutes());
const fWd = new Intl.DateTimeFormat('it-IT', { weekday: 'short' });
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const shortWhen = d => `<span class="dd">${esc(fDM.format(d))}</span><span class="tt">${esc(fWd.format(d))} ${fT(d)}</span>`;
const pd = s => new Date(2000 + +s.slice(0, 2), +s.slice(2, 4) - 1, +s.slice(4, 6), +s.slice(6, 8), +s.slice(8, 10));
const dayKey = d => d.getFullYear() * 1e4 + (d.getMonth() + 1) * 100 + d.getDate();
function rel(d) {
  const a = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const n = Math.round((b - a) / DAY);
  if (n === 0) return 'oggi';
  if (n === 1) return 'domani';
  if (n === -1) return 'ieri';
  if (n > 1) return n < 14 ? `tra ${n} giorni` : `tra ${Math.round(n / 7)} settimane`;
  return -n < 14 ? `${-n} giorni fa` : `${Math.round(-n / 7)} settimane fa`;
}
const byDate = (a, b) => a.date - b.date;

/* ---------- modello dati ---------- */
const CAMP = {}, CAMPL = [];
IVL.camp.forEach(([id, name, tipo]) => {
  const c = { id, name, tipo, short: name.replace(/\s*(misto|invernale)\s*/gi, ' ').replace(/FEMMINILE/i, 'F').replace(/\s+/g, ' ').trim(), gir: [] };
  CAMP[id] = c; CAMPL.push(c);
});
const TEAM = {};
for (const [id, [name, soc]] of Object.entries(IVL.teams)) {
  const n = name.replace(/\s+/g, ' ').trim();
  TEAM[id] = { id: +id, name: n, short: n.replace(/\s+(Basic|Superbasic|Top|Elite|Open M)$/i, ''), soc: (soc || '').trim() };
}
const PAL = {};
IVL.pal.split(';').forEach(r => {
  const [id, name, addr, com, lat, lng, note] = r.split('|');
  PAL[id] = { id: +id, name: tidy(name), addr: tidy(addr), com: comune(com), lat: lat ? +lat : null, lng: lng ? +lng : null, note: note && note !== '0' ? note : '' };
});
function tipPretty(t) {
  if (/SET FISSI/i.test(t)) return 'Set fissi (da 3 a 5), 1 punto per set' + (/ARBITRATO/i.test(t) ? ', arbitrato' : '');
  return 'Andata e ritorno, al meglio dei 5 set' + (/autoarbitrato/i.test(t) ? ', autoarbitrato' : (/arbitrato/i.test(t) ? ', arbitrato' : ''));
}
const GIR = {}, MATCH = {}, ALLM = [];
IVL.gir.forEach(([id, cid, name, tip, tids, order]) => {
  const g = { id, cid, name, tip, tids, order, fixed: /SET FISSI/i.test(tip), matches: [] };
  GIR[id] = g; CAMP[cid].gir.push(g);
  tids.forEach(t => { if (TEAM[t]) TEAM[t].gid = id; });
});
IVL.ms.split('#').forEach(block => {
  const [gid, body] = block.split(':');
  const g = GIR[gid];
  body.split(';').forEach((row, i) => {
    const f = row.split(',');
    const m = { id: gid + '-' + i, g, giornata: +f[0], date: pd(f[1]), pal: +f[2], h: g.tids[+f[3]], a: g.tids[+f[4]], res: null, orig: null, rinv: false, origPal: null, venueChanged: false, by: null, swap: false };
    if (f[5]) {
      const [s, pts] = f[5].split('/');
      const [sh, sa] = s.split('-').map(Number);
      m.res = { sh, sa, sets: pts ? pts.split(' ').map(x => x.split('-').map(Number)) : [] };
    }
    if (f[6]) {
      const e = f[6];
      const r = e.match(/r(\d{10})/), p = e.match(/p(\d+)/), s = e.match(/s(\d+)/);
      if (r) { const nd = pd(r[1]); if (nd.getTime() !== m.date.getTime()) { m.orig = m.date; m.date = nd; m.rinv = true; } }
      if (p && +p[1] !== m.pal) { m.origPal = m.pal; m.pal = +p[1]; m.venueChanged = true; }
      if (s) m.by = g.tids[+s[1]];
      if (e.includes('x')) { m.swap = true; [m.h, m.a] = [m.a, m.h]; }
    }
    g.matches.push(m); MATCH[m.id] = m; ALLM.push(m);
  });
});
ALLM.sort(byDate);
CAMPL.forEach(c => c.gir.sort((a, b) => a.name.localeCompare(b.name)));

const gShort = g => g.name === 'Girone unico' ? '' : g.name.replace('Girone ', 'Gir. ');
const ctxName = g => CAMP[g.cid].name + (g.name === 'Girone unico' ? '' : ' · ' + g.name);
const ctxShort = g => CAMP[g.cid].short + (g.name === 'Girone unico' ? '' : ' · ' + g.name.replace('Girone ', 'Gir. '));
const winner = m => !m.res ? null : m.res.sh > m.res.sa ? m.h : m.res.sa > m.res.sh ? m.a : null;
const involves = (m, t) => m.h === t || m.a === t;
function pts(m) {
  const { sh, sa } = m.res;
  if (m.g.fixed) return [sh, sa];
  if (sh === 3 && sa <= 1) return [3, 0];
  if (sa === 3 && sh <= 1) return [0, 3];
  if (sh === 3 && sa === 2) return [2, 1];
  if (sa === 3 && sh === 2) return [1, 2];
  return [0, 0];
}
function official(g) {
  const cl = IVL.cls[g.id] || [];
  if (!g.order || g.order.length !== g.tids.length || cl.length !== g.tids.length) {
    return rankComputed(compute(g)).map((r, k) => ({ t: r.t, pos: k + 1, pts: r.pts, g: r.g, v: r.v, p: r.p, sv: r.sv, sp: r.sp, pv: r.pv, pp: r.pp }));
  }
  return g.order.map((ti, k) => {
    const r = cl[k] || [0, 0, 0, 0, 0, 0, 0];
    return { t: g.tids[ti], pos: k + 1, pts: r[0], g: r[1], v: r[2], p: r[1] - r[2], sv: r[3], sp: r[4], pv: r[5], pp: r[6] };
  });
}
const OFF = {};
const offOf = g => OFF[g.id] || (OFF[g.id] = official(g));
const posOf = t => { const g = GIR[TEAM[t].gid]; return offOf(g).find(r => r.t === t); };
const q = (a, b) => b ? a / b : (a ? 99 : 0);
function compute(g, until) {
  const S = {};
  g.tids.forEach(t => S[t] = { t, pts: 0, g: 0, v: 0, p: 0, sv: 0, sp: 0, pv: 0, pp: 0, res: [], setN: [0, 0, 0, 0, 0], setW: [0, 0, 0, 0, 0], hg: 0, hv: 0, ag: 0, av: 0, adv: 0, advW: 0, sets: 0 });
  const ms = g.matches.filter(m => m.res && (!until || m.date <= until)).sort(byDate);
  for (const m of ms) {
    const H = S[m.h], A = S[m.a];
    if (!H || !A) continue;
    const [ph, pa] = pts(m);
    const { sh, sa, sets } = m.res;
    const w = sh > sa ? 1 : sa > sh ? -1 : 0;
    H.pts += ph; A.pts += pa; H.g++; A.g++;
    H.sv += sh; H.sp += sa; A.sv += sa; A.sp += sh;
    if (w > 0) { H.v++; A.p++; } else if (w < 0) { A.v++; H.p++; } else { H.p++; A.p++; }
    H.res.push({ m, r: w > 0 ? 'w' : w < 0 ? 'l' : 'd' });
    A.res.push({ m, r: w < 0 ? 'w' : w > 0 ? 'l' : 'd' });
    H.hg++; if (w > 0) H.hv++;
    A.ag++; if (w < 0) A.av++;
    sets.forEach(([x, y], i) => {
      H.pv += x; H.pp += y; A.pv += y; A.pp += x; H.sets++; A.sets++;
      if (i < 5) { H.setN[i]++; A.setN[i]++; if (x > y) H.setW[i]++; else if (y > x) A.setW[i]++; }
      const lim = m.g.fixed ? 21 : (i === 4 ? 15 : 25);
      if (Math.max(x, y) > lim) { H.adv++; A.adv++; if (x > y) H.advW++; else A.advW++; }
    });
  }
  return S;
}
const CMP = {};
const compOf = g => CMP[g.id] || (CMP[g.id] = compute(g));
function rankComputed(S) {
  return Object.values(S).sort((a, b) => b.pts - a.pts || b.v - a.v || q(b.sv, b.sp) - q(a.sv, a.sp) || q(b.pv, b.pp) - q(a.pv, a.pp) || TEAM[a.t].short.localeCompare(TEAM[b.t].short));
}
const HOMEV = {};
function homeVenue(t) {
  if (t in HOMEV) return HOMEV[t];
  const g = GIR[TEAM[t].gid]; const cnt = {};
  g.matches.forEach(m => { if (m.h === t && !m.venueChanged && !m.swap) cnt[m.pal] = (cnt[m.pal] || 0) + 1; });
  const best = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
  return HOMEV[t] = best ? +best[0] : null;
}
function km(p1, p2) {
  if (!p1 || !p2 || p1.lat == null || p2.lat == null) return null;
  const R = 6371, toR = x => x * Math.PI / 180;
  const dLat = toR(p2.lat - p1.lat), dLng = toR(p2.lng - p1.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toR(p1.lat)) * Math.cos(toR(p2.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/* ---------- stato ---------- */
let MY = TEAM[store.get('team', DEFAULT_TEAM)] ? store.get('team', DEFAULT_TEAM) : DEFAULT_TEAM;
let SEL = GIR[store.get('gir', 0)] ? store.get('gir', 0) : TEAM[MY].gid;
let mFilter = store.get('mfilter', 'all');
let mTeam = 0;
let vScope = 'girone', vSel = null;
let lCamp = 0;
let tFull = store.get('tfull', false);
let DL = null;
const myHome = () => PAL[homeVenue(MY)] || null;

/* ---------- link utili ---------- */
const mapsUrl = p => p.lat != null
  ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`
  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ', ' + p.addr + ', ' + p.com)}`;
const gDate = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
function gcalUrl(m) {
  const p = PAL[m.pal];
  const title = `${TEAM[m.h].short} – ${TEAM[m.a].short} · volley`;
  const end = new Date(m.date.getTime() + 2 * 3600e3);
  const loc = p ? `${p.name}, ${p.addr}, ${p.com}` : '';
  const det = `${ctxName(m.g)}, giornata ${m.giornata}.`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${gDate(m.date)}/${gDate(end)}&ctz=Europe/Rome&location=${encodeURIComponent(loc)}&details=${encodeURIComponent(det)}`;
}
const ICON = {
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v4M10 15h4"/></svg>',
  route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19l14-14M11 5h8v8"/></svg>',
  dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>'
};

/* ---------- pezzi comuni ---------- */
function setsHTML(m, lg) {
  if (!m.res || !m.res.sets.length) return '';
  return `<span class="sets${lg ? ' lg' : ''}" aria-label="Parziali ${m.res.sets.map(s => s.join('-')).join(', ')}">${m.res.sets.map(([x, y]) =>
    `<span class="set"><span class="${x > y ? 'w' : ''}">${x}</span><span class="${y > x ? 'w' : ''}">${y}</span></span>`).join('')}</span>`;
}
function formHTML(res, n = 5) {
  const last = res.slice(-n);
  const cells = last.map(x => `<span class="fchip ${x.r}" title="${esc(TEAM[x.m.h].short)} ${x.m.res.sh}-${x.m.res.sa} ${esc(TEAM[x.m.a].short)}">${x.r === 'w' ? 'V' : x.r === 'l' ? 'P' : '='}</span>`);
  while (cells.length < n) cells.push('<span class="fchip e" aria-hidden="true"></span>');
  return `<span class="form" aria-label="Ultimi risultati">${cells.join('')}</span>`;
}
function matchRow(m, o = {}) {
  const me = MY, r = m.res, w = winner(m), p = PAL[m.pal];
  const row = (t, s) => {
    const cls = r ? (w === t ? 'won' : (w ? 'lost' : '')) : '';
    return `<span class="m-row ${cls}">${t === me ? '<span class="me-dot" title="La tua squadra"></span>' : ''}<span class="nm">${esc(TEAM[t].short)}</span>${r ? `<span class="sc">${s}</span>` : ''}</span>`;
  };
  const tags = [];
  if (o.comp) tags.push(`<span class="tag">${esc(CAMP[m.g.cid].short)}${gShort(m.g) ? ' · ' + esc(gShort(m.g).replace('Gir. ', '')) : ''}</span>`);
  if (o.giornata) tags.push(`<span class="tag">G${m.giornata}</span>`);
  if (o.ha && involves(m, me)) tags.push(m.h === me ? '<span class="tag home">Casa</span>' : '<span class="tag">Trasferta</span>');
  if (m.rinv) tags.push(`<span class="tag warn" title="Data originale ${esc(fD.format(m.orig))}">Spostata</span>`);
  if (m.venueChanged) tags.push('<span class="tag warn">Cambio palestra</span>');
  if (!r && m.date <= NOW) tags.push(`<span class="tag warn">${m.date < GEN ? 'Risultato non pubblicato' : 'Risultato da aggiornare'}</span>`);
  if (r && w === null) tags.push('<span class="tag warn">Incompleta</span>');
  const mine = o.hl && involves(m, me);
  return `<button type="button" class="match${mine ? ' mine' : ''}" data-m="${m.id}">
<span class="m-when">${shortWhen(m.date)}</span>
<span class="m-body">${row(m.h, r?.sh)}${row(m.a, r?.sa)}<span class="m-sub">${tags.join('')}<span class="vn">${p ? esc(p.name) + ' · ' + esc(p.com) : 'Palestra da definire'}</span></span></span>
<span class="m-side">${setsHTML(m)}</span></button>`;
}
function teamLine(t) {
  const o = posOf(t), g = GIR[TEAM[t].gid];
  return `${o ? o.pos + '° su ' + g.tids.length + ' · ' + o.pts + ' pt' : ''}`;
}
function venueBlock(m, withDist = true) {
  const p = PAL[m.pal];
  if (!p) return '<div class="venue-line">' + ICON.pin + '<span>Palestra da definire</span></div>';
  const home = myHome();
  const d = withDist && involves(m, MY) && m.h !== MY ? km(home, p) : null;
  return `<div class="venue-line">${ICON.pin}<span><b>${esc(p.name)}</b><span class="addr">${esc(p.addr)}, ${esc(p.com)}</span>${d != null ? `<span class="addr"><span class="dist">${num1(d)} km</span> in linea d’aria dalla vostra palestra</span>` : ''}${p.note ? `<span class="addr">${esc(p.note)}</span>` : ''}</span></div>`;
}
function emptyNote(txt) { return `<p class="empty">${txt}</p>`; }

/* ---------- calendario in abbonamento (solo sito pubblicato) ---------- */
function calUrl(t, scheme) {
  const base = location.host + location.pathname.replace(/[^/]*$/, '');
  return (scheme || location.protocol.replace(':', '')) + '://' + base + 'cal/' + t + '.ics';
}
function subscribeHTML(t) {
  const web = calUrl(t, 'webcal');
  return `<div class="note" style="display:flex;flex-direction:column;gap:10px">
  <span>Con l’iscrizione le partite di <b>${esc(TEAM[t].short)}</b> entrano nel calendario del telefono e si aggiornano da sole quando cambiano data, orario o palestra.</span>
  <div class="btns">
    <a class="btn primary" href="${esc(web)}">${ICON.cal}iPhone, Mac, Outlook</a>
    <a class="btn" href="https://calendar.google.com/calendar/render?cid=${encodeURIComponent(web)}" target="_blank" rel="noopener">${ICON.cal}Google Calendar</a>
    <a class="btn" href="cal/${t}.ics" download="calendario-${t}.ics">${ICON.dl}File .ics</a>
  </div>
  <span class="small">Su Android l’iscrizione si fa da Google Calendar sul computer, oppure copiando l’indirizzo <button type="button" class="link-btn" style="color:var(--accent);word-break:break-all;text-align:left" data-act="copy-cal" data-id="${t}">${esc(calUrl(t, 'https'))}</button></span>
</div>`;
}

/* ---------- vista: la mia squadra ---------- */
function whenTag(d) {
  const r = rel(d);
  return `<span class="tag when${r === 'oggi' ? ' today' : r === 'domani' ? ' soon' : ''}">${esc(cap(r))}</span>`;
}
function teamRow(m, nextId) {
  const home = m.h === MY, opp = home ? m.a : m.h, p = PAL[m.pal], r = m.res;
  let right = '';
  if (r) {
    const my = home ? r.sh : r.sa, op = home ? r.sa : r.sh;
    right = `<span class="tag res ${my > op ? 'win' : my < op ? 'loss' : 'warn'}">${my > op ? 'V' : my < op ? 'P' : '='} ${my}–${op}</span>`;
  } else if (m.date <= NOW) right = '<span class="tag warn">Da aggiornare</span>';
  else if (m.id === nextId) right = whenTag(m.date);
  return `<button type="button" class="trow${m.id === nextId ? ' nxt' : ''}" data-m="${m.id}">
<span class="m-when">${shortWhen(m.date)}</span>
<span class="tr-body"><span class="tr-opp">${esc(TEAM[opp].short)}</span><span class="tr-sub"><b class="ha${home ? ' home' : ''}">${home ? 'Casa' : 'Trasferta'}</b>${m.rinv ? ' · <b class="mv">spostata</b>' : ''} · G${m.giornata} · ${p ? esc(p.name) + ', ' + esc(p.com) : 'palestra da definire'}</span></span>
<span class="tr-res">${right}</span></button>`;
}
function calButton(t, m) {
  if (HOSTED) return `<button type="button" class="btn" data-act="cal-sheet" data-id="${t}"${m ? ` data-mm="${m.id}"` : ''}>${ICON.cal}${m ? 'Calendario' : 'Aggiungi tutte al calendario'}</button>`;
  if (m) return `<a class="btn" href="${gcalUrl(m)}" target="_blank" rel="noopener">${ICON.cal}Google Calendar</a>`;
  return `<button type="button" class="btn dl-only" data-act="csv"${DL ? '' : ' hidden'}>${ICON.dl}Scarica il calendario (CSV)</button>`;
}
function viewTeam() {
  const t = TEAM[MY], g = GIR[t.gid], c = CAMP[g.cid];
  const off = offOf(g), me = off.find(r => r.t === MY), S = compOf(g), s = S[MY];
  const ms = g.matches.filter(m => involves(m, MY)).sort(byDate);
  const next = ms.find(m => !m.res && m.date > NOW);
  const last = [...ms].reverse().find(m => m.res);
  const n = g.tids.length;
  let gap = '';
  if (me.g > 0 || off[0].pts > 0) {
    if (me.pos === 1) { const d = me.pts - (off[1]?.pts ?? 0); gap = d > 0 ? `+${d} sulla seconda` : 'Prima a pari punti'; }
    else { const d = off[0].pts - me.pts; gap = d === 0 ? 'A pari punti con la prima' : `−${d} dalla vetta`; }
  }

  let h = `<section class="hero">
  <div class="hero-top"><span class="eyebrow">${esc(t.soc)}</span><span class="hero-acts">${HOSTED ? '<button type="button" class="hero-btn" data-act="share">Condividi</button>' : ''}<button type="button" class="hero-btn" data-act="pick-team">Cambia squadra</button></span></div>
  <h1 class="hero-name">${esc(t.short)}</h1>
  <p class="hero-sub">${esc(c.name)}${g.name !== 'Girone unico' ? ' · ' + esc(g.name) : ''}</p>
  <div class="hero-main">
    <div class="pos-big" aria-label="Posizione ${me.pos} su ${n}"><span class="n">${me.pos}°</span><span class="o">su ${n}</span></div>
    <div class="hero-pts"><span class="v">${me.pts}</span><span class="l">${me.pts === 1 ? 'punto' : 'punti'}</span></div>
    ${gap ? `<span class="hero-gap">${gap}</span>` : ''}
  </div>
  <dl class="hero-strip">
    <div><dt>Vinte–perse</dt><dd>${me.v}–${me.p}</dd></div>
    <div><dt>Set</dt><dd>${me.sv}–${me.sp}</dd></div>
    <div><dt>Punti fatti–subiti</dt><dd>${me.pv}–${me.pp}</dd></div>
    <div><dt>Forma</dt><dd>${formHTML(s.res)}</dd></div>
  </dl>
</section>`;

  h += '<div class="grid">';
  if (next) {
    const side = tt => { const o = posOf(tt); return `<button type="button" class="nx-team${tt === MY ? ' me' : ''}" data-t="${tt}"><span class="nm">${esc(TEAM[tt].short)}</span><span class="meta">${o.pos}° · ${o.pts} pt</span>${tt === next.h ? '<span class="tag home">Casa</span>' : ''}</button>`; };
    const p = PAL[next.pal];
    h += `<section class="card span-7 next-card" aria-label="Prossima partita">
  <div class="card-h"><span class="eyebrow">Prossima partita · giornata ${next.giornata}</span>${whenTag(next.date)}</div>
  <div class="when-big"><span class="d">${esc(cap(fDL.format(next.date)))}</span><span class="t">ore ${fT(next.date)}</span></div>
  <div class="nx-teams">${side(next.h)}${side(next.a)}</div>
  ${next.rinv ? `<p class="note">Partita spostata: data originale ${esc(fD.format(next.orig))}${next.by ? ', rinvio chiesto da ' + esc(TEAM[next.by].short) : ''}.</p>` : ''}
  ${venueBlock(next)}
  <div class="btns">${p ? `<a class="btn primary" href="${mapsUrl(p)}" target="_blank" rel="noopener">${ICON.route}Indicazioni</a>` : ''}${calButton(MY, next)}</div>
</section>`;
  } else {
    h += `<section class="card span-7"><div class="card-h"><span class="eyebrow">Prossima partita</span></div>${emptyNote('Nessuna partita in programma nel calendario attuale.')}</section>`;
  }
  if (last) {
    const w = winner(last), won = w === MY;
    h += `<section class="card span-5" aria-label="Ultimo risultato">
  <div class="card-h"><span class="eyebrow">Ultimo risultato · ${esc(fD.format(last.date))}</span>${w ? `<span class="tag ${won ? 'win' : 'loss'}">${won ? 'Vittoria' : 'Sconfitta'}</span>` : ''}</div>
  <button type="button" class="last" data-m="${last.id}">
    <span class="m-row${w === last.h ? ' won' : w ? ' lost' : ''}"><span class="nm">${esc(TEAM[last.h].short)}</span><span class="sc">${last.res.sh}</span></span>
    <span class="m-row${w === last.a ? ' won' : w ? ' lost' : ''}"><span class="nm">${esc(TEAM[last.a].short)}</span><span class="sc">${last.res.sa}</span></span>
    <span style="margin-top:8px">${setsHTML(last, true)}</span>
  </button>
</section>`;
  } else {
    h += `<section class="card span-5"><div class="card-h"><span class="eyebrow">Ultimo risultato</span></div>${emptyNote('Nessuna partita giocata finora.')}</section>`;
  }

  const played = ms.filter(m => m.res).length;
  h += `<section class="card span-12" aria-label="Calendario della squadra">
  <div class="card-h"><h3>Il nostro calendario</h3><span class="eyebrow">${played} di ${ms.length} giocate</span></div>
  <div class="mlist">${ms.map(m => teamRow(m, next && next.id)).join('')}</div>
  <div class="btns" style="margin-top:12px">${calButton(MY)}</div>
</section>`;

  const setsPlayed = s.sv + s.sp;
  const sgrid = [0, 1, 2, 3, 4].filter(i => s.setN[i] > 0).map(i => {
    const pc = 100 * s.setW[i] / s.setN[i];
    return `<div class="sg" style="background:color-mix(in srgb, var(--accent) ${Math.round(pc * 0.5)}%, var(--surface-2))" title="${i + 1}° set: vinti ${s.setW[i]} su ${s.setN[i]}"><span class="k">${i + 1}° set</span><span class="v">${s.setW[i]}/${s.setN[i]}</span></div>`;
  }).join('');
  h += `<section class="card span-6" aria-label="Rendimento">
  <div class="card-h"><h3>Rendimento</h3><span class="eyebrow">dai parziali</span></div>
  ${s.g ? `<div class="kv"><span>Set vinti</span><b>${s.sv} su ${setsPlayed} · ${pct(s.sv, setsPlayed)}</b></div>
  <div class="kv"><span>Punti per set, fatti · subiti</span><b>${s.sets ? num1(s.pv / s.sets) + ' · ' + num1(s.pp / s.sets) : '—'}</b></div>
  <div class="kv"><span>Scarto medio per set</span><b>${s.sets ? (s.pv >= s.pp ? '+' : '−') + num1(Math.abs(s.pv - s.pp) / s.sets) : '—'}</b></div>
  <div class="kv"><span>Set ai vantaggi vinti</span><b>${s.adv ? s.advW + ' su ' + s.adv : 'nessuno'}</b></div>
  <div class="kv"><span>In casa · in trasferta</span><b>${s.hv}–${s.hg - s.hv} · ${s.av}–${s.ag - s.av}</b></div>
  <div style="margin-top:12px"><span class="eyebrow">Set vinti per numero di set</span><div class="setgrid">${sgrid}</div></div>`
    : emptyNote('Le statistiche compaiono dopo la prima partita giocata.')}
</section>`;

  const opps = g.tids.filter(x => x !== MY).sort((a, b) => posOf(a).pos - posOf(b).pos);
  const chip = m => {
    if (!m) return '<span class="h2c muted">—</span>';
    const home = m.h === MY;
    if (m.res) { const my = home ? m.res.sh : m.res.sa, op = home ? m.res.sa : m.res.sh; return `<span class="h2c"><span class="tag res ${my > op ? 'win' : my < op ? 'loss' : 'warn'}">${my}–${op}</span><small>${home ? 'casa' : 'fuori'}</small></span>`; }
    return `<span class="h2c"><span class="d">${esc(fDM.format(m.date))}</span><small>${home ? 'casa' : 'fuori'}</small></span>`;
  };
  h += `<section class="card span-6" aria-label="Testa a testa"><div class="card-h"><h3>Testa a testa</h3><span class="eyebrow">andata · ritorno</span></div>
  <div class="h2h">${opps.map(o => { const mm = ms.filter(m => involves(m, o)).sort(byDate); return `<button type="button" class="h2h-row" data-t="${o}"><span class="pos">${posOf(o).pos}°</span><span class="nm">${esc(TEAM[o].short)}</span>${chip(mm[0])}${chip(mm[1])}</button>`; }).join('')}</div></section>`;

  if (played >= 2) h += `<section class="card span-12" aria-label="Andamento in classifica"><div class="card-h"><h3>Andamento</h3><span class="eyebrow">posizione dopo ogni partita</span></div>${trendChart(g, ms.filter(m => m.res))}</section>`;

  const sib = Object.values(TEAM).filter(x => x.soc === t.soc && x.id !== MY && x.gid);
  if (sib.length) {
    h += `<section class="card span-12" aria-label="Altre squadre della società"><div class="card-h"><h3>Altre squadre di ${esc(t.soc)}</h3></div><div class="mlist">
    ${sib.map(x => { const gg = GIR[x.gid], o = posOf(x.id); const nx = gg.matches.filter(m => involves(m, x.id) && !m.res && m.date > NOW).sort(byDate)[0];
      return `<button type="button" class="gir-row" data-t="${x.id}"><span><span class="gn">${esc(x.short)}</span><span class="ld">${esc(ctxName(gg))} · ${o.pos}° con ${o.pts} pt${nx ? ' · prossima ' + esc(fD.format(nx.date)) + ' con ' + esc(TEAM[nx.h === x.id ? nx.a : nx.h].short) : ''}</span></span><span class="tag">Apri</span></button>`; }).join('')}
    </div></section>`;
  }
  h += '</div>';
  return h;
}

function trendChart(g, played) {
  if (!played.length) return emptyNote('Il grafico compare dopo la prima partita giocata.');
  const n = g.tids.length;
  const pts_ = played.map(m => {
    const r = rankComputed(compute(g, m.date));
    return { m, pos: r.findIndex(x => x.t === MY) + 1 };
  });
  const W = 340, H = 170, L = 30, R = 12, T = 12, B = 26;
  const x = i => pts_.length === 1 ? (L + (W - R)) / 2 : L + i * (W - L - R) / (pts_.length - 1);
  const y = p => T + (p - 1) * (H - T - B) / Math.max(1, n - 1);
  let svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Posizione in classifica dopo ogni partita">`;
  for (let p = 1; p <= n; p++) {
    svg += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(p)}" y2="${y(p)}"/>`;
    if (p === 1 || p === n || n <= 8) svg += `<text x="${L - 8}" y="${y(p) + 4}" text-anchor="end">${p}°</text>`;
  }
  if (pts_.length > 1) svg += `<polyline class="ln" points="${pts_.map((d, i) => x(i) + ',' + y(d.pos)).join(' ')}"/>`;
  pts_.forEach((d, i) => {
    svg += `<circle class="pt" cx="${x(i)}" cy="${y(d.pos)}" r="5"><title>Dopo la giornata ${d.m.giornata} (${fD.format(d.m.date)}): ${d.pos}°</title></circle>`;
    svg += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">G${d.m.giornata}</text>`;
  });
  svg += '</svg>';
  return svg + '<p class="legend">Ricalcolata dai risultati con gli stessi criteri della classifica (punti, vittorie, quoziente set, quoziente punti).</p>';
}

/* ---------- vista: classifica ---------- */
function viewTable() {
  const g = GIR[SEL], off = offOf(g), S = compOf(g);
  const tot = g.matches.length, pl = g.matches.filter(m => m.res).length;
  let h = `<div class="view-head"><div><span class="eyebrow">${esc(ctxName(g))}</span><h2>Classifica</h2><p class="sub">${pl} di ${tot} partite giocate</p></div><button type="button" class="btn only-narrow" data-act="tfull">${tFull ? 'Meno colonne' : 'Tutte le colonne'}</button></div>`;
  h += `<section class="card"><div class="tscroll"><table class="std cls${tFull ? ' full' : ''}"><thead><tr>
<th class="pos sticky">#</th><th class="l sticky2">Squadra</th><th>Pt</th><th>G</th><th>V</th><th>P</th><th class="x">Set V</th><th class="x">Set P</th><th class="x">Q. set</th><th class="x">Punti F</th><th class="x">Punti S</th><th class="x">Q. punti</th><th class="l x">Forma</th></tr></thead><tbody>
${off.map(r => `<tr class="clk${r.t === MY ? ' mine' : ''}" data-t="${r.t}"><td class="pos sticky">${r.pos}</td><td class="l team sticky2"><span class="tn">${esc(TEAM[r.t].short)}</span><span class="tform">${formHTML(S[r.t]?.res || [])}</span></td><td class="pts">${r.pts}</td><td>${r.g}</td><td>${r.v}</td><td>${r.p}</td><td class="x">${r.sv}</td><td class="x">${r.sp}</td><td class="x">${ratio(r.sv, r.sp)}</td><td class="x">${r.pv}</td><td class="x">${r.pp}</td><td class="x">${ratio(r.pv, r.pp)}</td><td class="l x">${formHTML(S[r.t]?.res || [])}</td></tr>`).join('')}
</tbody></table></div>
<p class="legend">${esc(tipPretty(g.tip))}. ${g.fixed ? 'Formula a set fissi: si giocano da 3 a 5 set e ogni set vinto vale 1 punto in classifica.' : 'Al meglio dei 5 set: 3 punti per il 3-0 e il 3-1, 2 punti per il 3-2, 1 punto a chi perde 2-3.'} Q. set = set vinti diviso set persi; Q. punti = punti fatti diviso punti subiti. Ordine come da classifica ufficiale. Tocca una squadra per la sua scheda.</p></section>`;
  // prossime e ultime
  const up = g.matches.filter(m => !m.res && m.date > NOW).sort(byDate).slice(0, 6);
  const rec = g.matches.filter(m => m.res).sort((a, b) => b.date - a.date).slice(0, 6);
  h += `<div class="grid"><section class="card span-6"><div class="card-h"><h3>Prossime partite</h3><a class="small" href="#partite">Tutto il calendario</a></div>${up.length ? '<div class="mlist">' + up.map(m => matchRow(m, { giornata: true, hl: true })).join('') + '</div>' : emptyNote('Nessuna partita in programma.')}</section>
<section class="card span-6"><div class="card-h"><h3>Ultimi risultati</h3></div>${rec.length ? '<div class="mlist">' + rec.map(m => matchRow(m, { giornata: true, hl: true })).join('') + '</div>' : emptyNote('Ancora nessun risultato.')}</section></div>`;
  return h;
}

/* ---------- vista: partite ---------- */
function currentGiornata(g) {
  const up = g.matches.filter(m => !m.res && m.date > NOW).sort(byDate)[0];
  return up ? up.giornata : null;
}
function viewMatches() {
  const g = GIR[SEL];
  if (mTeam && !g.tids.includes(mTeam)) mTeam = 0;
  const cur = currentGiornata(g);
  const list = g.matches.filter(m => (mFilter === 'all' || (mFilter === 'played' ? !!m.res : !m.res)) && (!mTeam || involves(m, mTeam)));
  const byG = {};
  list.forEach(m => (byG[m.giornata] = byG[m.giornata] || []).push(m));
  const gs = Object.keys(byG).map(Number).sort((a, b) => a - b);
  const teams = [...g.tids].sort((a, b) => TEAM[a].short.localeCompare(TEAM[b].short));
  let h = `<div class="view-head"><div><span class="eyebrow">${esc(ctxName(g))}</span><h2>Calendario e risultati</h2><p class="sub">${g.matches.length} partite in ${Math.max(...g.matches.map(m => m.giornata))} giornate · tocca una partita per i dettagli</p></div></div>
<div class="toolbar">
  <div class="seg" role="group" aria-label="Filtra partite">${[['all', 'Tutte'], ['played', 'Giocate'], ['next', 'Da giocare']].map(([k, l]) => `<button type="button" data-mf="${k}" aria-pressed="${mFilter === k}">${l}</button>`).join('')}</div>
  <select class="select" id="teamFilter" aria-label="Filtra per squadra"><option value="0">Tutte le squadre</option>${teams.map(t => `<option value="${t}"${t === mTeam ? ' selected' : ''}>${esc(TEAM[t].short)}${t === MY ? ' (la tua)' : ''}</option>`).join('')}</select>
  ${cur && mFilter !== 'played' ? `<button type="button" class="btn" data-act="goto-cur">Vai alla giornata ${cur}</button>` : ''}
</div>`;
  if (!gs.length) h += `<section class="card">${emptyNote('Nessuna partita con questi filtri.')}</section>`;
  gs.forEach(n => {
    const ms = byG[n].sort(byDate);
    const all = g.matches.filter(m => m.giornata === n);
    const d0 = all.reduce((a, m) => m.date < a ? m.date : a, all[0].date), d1 = all.reduce((a, m) => m.date > a ? m.date : a, all[0].date);
    const range = dayKey(d0) === dayKey(d1) ? fDM.format(d0) : `${fDM.format(d0)} – ${fDM.format(d1)}`;
    h += `<section class="giornata card" id="g-${n}"><div class="g-head${n === cur ? ' cur' : ''}"><h3>Giornata ${n}${n === cur ? ' <span class="tag mine">in corso</span>' : ''}</h3><span class="r">${range} · ${all.filter(m => m.res).length}/${all.length} giocate</span></div>
<div class="mlist">${ms.map(m => matchRow(m, { hl: true })).join('')}</div></section>`;
  });
  return h;
}

/* ---------- vista: statistiche ---------- */
function viewStats() {
  const g = GIR[SEL], S = compOf(g);
  const played = g.matches.filter(m => m.res);
  const allSets = played.flatMap(m => m.res.sets.map(s => ({ m, s })));
  const advSets = allSets.filter(({ m, s }) => Math.max(...s) > (m.g.fixed ? 21 : 25));
  const margin = allSets.length ? allSets.reduce((a, { s }) => a + Math.abs(s[0] - s[1]), 0) / allSets.length : 0;
  let h = `<div class="view-head"><div><span class="eyebrow">${esc(ctxName(g))}</span><h2>Statistiche</h2><p class="sub">Calcolate dai parziali di ${played.length} ${played.length === 1 ? 'partita giocata' : 'partite giocate'}</p></div></div>
<div class="tiles">
  <div class="tile"><span class="eyebrow">Partite giocate</span><div class="v">${played.length}<span class="small muted"> / ${g.matches.length}</span></div></div>
  <div class="tile"><span class="eyebrow">Set giocati</span><div class="v">${allSets.length}</div></div>
  <div class="tile"><span class="eyebrow">Scarto medio per set</span><div class="v">${allSets.length ? num1(margin) : '—'}</div><div class="h">punti</div></div>
  <div class="tile"><span class="eyebrow">Set ai vantaggi</span><div class="v">${advSets.length}</div><div class="h">oltre ${g.fixed ? 21 : 25} punti</div></div>
</div>`;
  if (!played.length) return h + `<section class="card">${emptyNote('Nessuna partita giocata in questo girone: le statistiche arrivano con i primi risultati.')}</section>`;
  const rows = g.tids.map(t => S[t]).filter(Boolean);
  const bySet = [...rows].sort((a, b) => q(b.sv, b.sv + b.sp) - q(a.sv, a.sv + a.sp) || b.sv - a.sv);
  h += `<div class="grid"><section class="card span-6"><div class="card-h"><h3>Set vinti</h3><span class="eyebrow">% sul totale giocati</span></div><div class="bars">
${bySet.map(r => { const tot = r.sv + r.sp; return `<div class="bar-row${r.t === MY ? ' mine' : ''}" title="${esc(TEAM[r.t].short)}: ${r.sv} set vinti su ${tot}"><span class="lbl">${esc(TEAM[r.t].short)}</span><span class="trk"><span class="fill" style="width:${tot ? 100 * r.sv / tot : 0}%"></span></span><span class="val">${tot ? pct(r.sv, tot) + ' · ' + r.sv + '/' + tot : 'non ha giocato'}</span></div>`; }).join('')}
</div></section>`;
  // distribuzione scarti
  const buckets = [['1–2', 1, 2], ['3–4', 3, 4], ['5–7', 5, 7], ['8–11', 8, 11], ['12 o più', 12, 99]];
  const bc = buckets.map(([l, a, b]) => ({ l, n: allSets.filter(({ s }) => { const d = Math.abs(s[0] - s[1]); return d >= a && d <= b; }).length }));
  const bmax = Math.max(1, ...bc.map(b => b.n));
  h += `<section class="card span-6"><div class="card-h"><h3>Come finiscono i set</h3><span class="eyebrow">scarto tra le squadre</span></div><div class="bars">
${bc.map(b => `<div class="bar-row" title="${b.n} set chiusi con ${b.l} punti di scarto"><span class="lbl">${b.l} punti</span><span class="trk"><span class="fill" style="width:${100 * b.n / bmax}%"></span></span><span class="val">${b.n} set · ${pct(b.n, allSets.length)}</span></div>`).join('')}
</div><p class="legend">Set combattuti (scarto 1–2) contro set a senso unico (12 o più).</p></section>`;
  // tabella rendimento
  const perf = [...rows].sort((a, b) => q(b.pv, b.pp) - q(a.pv, a.pp));
  h += `<section class="card span-12"><div class="card-h"><h3>Rendimento per squadra</h3><span class="eyebrow">medie per set</span></div><div class="tscroll"><table class="std"><thead><tr><th class="l sticky">Squadra</th><th>Set</th><th>Fatti/set</th><th>Subiti/set</th><th>Scarto/set</th><th>Vantaggi V/G</th><th>Casa V–P</th><th>Fuori V–P</th></tr></thead><tbody>
${perf.map(r => `<tr class="clk${r.t === MY ? ' mine' : ''}" data-t="${r.t}"><td class="l team sticky">${esc(TEAM[r.t].short)}</td><td>${r.sets}</td><td>${r.sets ? num1(r.pv / r.sets) : '—'}</td><td>${r.sets ? num1(r.pp / r.sets) : '—'}</td><td>${r.sets ? (r.pv >= r.pp ? '+' : '−') + num1(Math.abs(r.pv - r.pp) / r.sets) : '—'}</td><td>${r.advW}/${r.adv}</td><td>${r.hv}–${r.hg - r.hv}</td><td>${r.av}–${r.ag - r.av}</td></tr>`).join('')}
</tbody></table></div></section>`;
  // record
  const diff = m => m.res.sets.reduce((a, s) => a + s[0] - s[1], 0);
  const withSets = played.filter(m => m.res.sets.length);
  const recs = [];
  if (withSets.length) {
    const big = [...withSets].sort((a, b) => Math.abs(diff(b)) - Math.abs(diff(a)))[0];
    recs.push(['Vittoria più larga', big, `${Math.abs(diff(big))} punti di scarto complessivo`]);
    const close = [...withSets].sort((a, b) => Math.abs(diff(a)) - Math.abs(diff(b)))[0];
    if (close !== big) recs.push(['Partita più equilibrata', close, `${Math.abs(diff(close))} punti di scarto complessivo`]);
    const sb = [...allSets].sort((a, b) => Math.abs(b.s[0] - b.s[1]) - Math.abs(a.s[0] - a.s[1]))[0];
    recs.push(['Set più netto', sb.m, `${sb.s[0]}-${sb.s[1]}`]);
    const sl = [...allSets].sort((a, b) => (b.s[0] + b.s[1]) - (a.s[0] + a.s[1]))[0];
    recs.push(['Set più lungo', sl.m, `${sl.s[0]}-${sl.s[1]} (${sl.s[0] + sl.s[1]} punti giocati)`]);
  }
  if (recs.length) h += `<section class="card span-12"><div class="card-h"><h3>Record del girone</h3></div><div class="recs">${recs.map(([l, m, d]) => `<button type="button" class="rec" data-m="${m.id}"><span class="eyebrow">${l}</span><div class="what">${esc(TEAM[m.h].short)} ${m.res.sh}–${m.res.sa} ${esc(TEAM[m.a].short)}</div><div class="det">${esc(d)} · ${esc(fD.format(m.date))}</div></button>`).join('')}</div></section>`;
  h += '</div>';
  return h;
}

/* ---------- vista: palestre ---------- */
function venuesFor(scope) {
  const ms = scope === 'all' ? ALLM : GIR[SEL].matches;
  const V = {};
  ms.forEach(m => {
    const p = PAL[m.pal]; if (!p) return;
    const v = V[p.id] || (V[p.id] = { p, n: 0, hosts: new Set(), next: null, gids: new Set() });
    v.n++; v.hosts.add(m.h); v.gids.add(m.g.id);
    if (!m.res && m.date > NOW && (!v.next || m.date < v.next.date)) v.next = m;
  });
  return Object.values(V);
}
function mapSVG(vs) {
  const home = myHome();
  const geo = vs.filter(v => v.p.lat != null);
  const pts_ = geo.map(v => v.p).concat(home && home.lat != null ? [home] : []);
  if (!pts_.length) return '';
  const lat0 = pts_.reduce((a, p) => a + p.lat, 0) / pts_.length;
  const kx = 111.32 * Math.cos(lat0 * Math.PI / 180), ky = 110.57;
  const xs = pts_.map(p => p.lng * kx), ys = pts_.map(p => -p.lat * ky);
  let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const spanX = Math.max(8, x1 - x0), spanY = Math.max(6, y1 - y0);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  x0 = cx - spanX / 2 - spanX * .08; x1 = cx + spanX / 2 + spanX * .08; y0 = cy - spanY / 2 - spanY * .1; y1 = cy + spanY / 2 + spanY * .1;
  const W = 640, H = Math.round(Math.min(520, Math.max(280, W * (y1 - y0) / (x1 - x0))));
  const s = Math.min(W / (x1 - x0), H / (y1 - y0));
  const ox = (W - s * (x1 - x0)) / 2, oy = (H - s * (y1 - y0)) / 2;
  const X = p => ox + (p.lng * kx - x0) * s, Y = p => oy + (-p.lat * ky - y0) * s;
  let svg = `<svg class="map" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mappa schematica delle palestre">`;
  if (home && home.lat != null) {
    [5, 10, 20].forEach(r => { svg += `<circle class="ring" cx="${X(home)}" cy="${Y(home)}" r="${r * s}"/><text x="${X(home) + r * s * .707 + 3}" y="${Y(home) - r * s * .707 - 3}">${r} km</text>`; });
  }
  const duomo = { lat: 45.4642, lng: 9.1900 };
  svg += `<path class="ref" d="M${X(duomo) - 6} ${Y(duomo)}h12M${X(duomo)} ${Y(duomo) - 6}v12"/><text x="${X(duomo) + 8}" y="${Y(duomo) + 14}">Duomo</text>`;
  const gset = new Set(GIR[SEL].matches.map(m => m.pal));
  geo.forEach(v => {
    const cls = 'v' + (gset.has(v.p.id) ? ' g' : '') + (vSel === v.p.id ? ' sel' : '');
    svg += `<circle class="${cls}" data-v="${v.p.id}" cx="${X(v.p).toFixed(1)}" cy="${Y(v.p).toFixed(1)}" r="${vSel === v.p.id ? 9 : 6.5}"><title>${esc(v.p.name)} · ${esc(v.p.com)}</title></circle>`;
  });
  if (home && home.lat != null) svg += `<circle class="home" cx="${X(home)}" cy="${Y(home)}" r="11"><title>La vostra palestra: ${esc(home.name)}</title></circle>`;
  // scala 5 km
  svg += `<path class="ref" d="M16 ${H - 16}h${5 * s}M16 ${H - 20}v8M${16 + 5 * s} ${H - 20}v8"/><text x="16" y="${H - 24}">5 km</text>`;
  svg += '</svg>';
  return svg;
}
function viewVenues() {
  const g = GIR[SEL];
  const home = myHome();
  const vs = venuesFor(vScope).map(v => ({ ...v, d: km(home, v.p) }));
  vs.sort((a, b) => (a.d ?? 1e9) - (b.d ?? 1e9) || a.p.name.localeCompare(b.p.name));
  const nogeo = vs.filter(v => v.p.lat == null).length;
  VLIST = vs;
  let h = `<div class="view-head"><div><span class="eyebrow">${vScope === 'all' ? 'Tutta la lega' : esc(ctxName(g))}</span><h2>Palestre</h2><p class="sub">${vs.length} palestre · ordinate per distanza dalla palestra di ${esc(TEAM[MY].short)}${home ? ' (' + esc(home.name) + ')' : ''}</p></div>
<div class="seg" role="group" aria-label="Quali palestre">${[['girone', 'Questo girone'], ['all', 'Tutta la lega']].map(([k, l]) => `<button type="button" data-vs="${k}" aria-pressed="${vScope === k}">${l}</button>`).join('')}</div></div>
${HOSTED ? `<section class="map-wrap real"><div id="vmap" class="vmap" role="region" aria-label="Mappa delle palestre"><p class="empty" style="padding:16px">Caricamento della mappa…</p></div></section>
<p class="legend" style="margin-top:-8px">In giallo la vostra palestra${vScope === 'all' ? ', in blu quelle del girone selezionato, in grigio le altre' : ', in blu le altre del girone'}. Tocca un punto per indirizzo, distanza e indicazioni.${nogeo ? ` ${nogeo} ${nogeo === 1 ? 'palestra non ha' : 'palestre non hanno'} coordinate sul sito della lega e non ${nogeo === 1 ? 'compare' : 'compaiono'} sulla mappa.` : ''}</p>` : `<section class="map-wrap">${mapSVG(vs)}</section>
<p class="legend" style="margin-top:-8px">Mappa schematica in scala: anello giallo = la vostra palestra, cerchi a 5, 10 e 20 km, croce = Duomo. ${vScope === 'all' ? 'In blu le palestre del girone selezionato. ' : ''}Tocca un punto per trovare la palestra.${nogeo ? ` ${nogeo} ${nogeo === 1 ? 'palestra non ha' : 'palestre non hanno'} coordinate sul sito e non ${nogeo === 1 ? 'compare' : 'compaiono'} sulla mappa.` : ''}</p>`}
<div class="vlist">${vs.map(v => {
    const hosts = [...v.hosts].filter(t => homeVenue(t) === v.p.id);
    return `<article class="card venue${vSel === v.p.id ? ' sel' : ''}" id="v-${v.p.id}">
  <div class="card-h" style="margin-bottom:0"><span class="vn">${esc(v.p.name)}</span>${home && v.p.id === home.id ? '<span class="tag mine">La vostra palestra</span>' : v.d != null ? `<span class="dist">${num1(v.d)} km</span>` : ''}</div>
  <span class="muted small">${esc(v.p.addr)}, ${esc(v.p.com)}</span>
  ${hosts.length ? `<span class="small">Campo di casa di <b>${hosts.map(t => esc(TEAM[t].short)).join(', ')}</b></span>` : ''}
  <span class="small muted">${v.n} ${v.n === 1 ? 'partita' : 'partite'} in calendario${vScope === 'all' && v.gids.size > 1 ? ' in ' + v.gids.size + ' gironi' : ''}${v.next ? ` · prossima ${esc(fD.format(v.next.date))} ${fT(v.next.date)}, ${esc(TEAM[v.next.h].short)} – ${esc(TEAM[v.next.a].short)}` : ''}</span>
  <div class="btns" style="margin-top:4px"><a class="btn" href="${mapsUrl(v.p)}" target="_blank" rel="noopener">${ICON.route}Indicazioni</a>${HOSTED && v.p.lat != null ? `<button type="button" class="btn" data-act="map-focus" data-id="${v.p.id}">${ICON.pin}Sulla mappa</button>` : ''}${v.next ? `<button type="button" class="btn" data-m="${v.next.id}">Prossima partita</button>` : ''}</div>
</article>`; }).join('')}</div>`;
  return h;
}

/* ---------- mappa vera (solo sito pubblicato: Leaflet in locale + riquadri OpenStreetMap) ---------- */
let LEAF = null, MAP = null, VLIST = [], MARK = {};
function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (LEAF) return LEAF;
  LEAF = new Promise((res, rej) => {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'vendor/leaflet/leaflet.css'; document.head.appendChild(css);
    const s = document.createElement('script'); s.src = 'vendor/leaflet/leaflet.js';
    s.onload = () => res(window.L); s.onerror = () => { LEAF = null; rej(new Error('leaflet')); };
    document.head.appendChild(s);
  });
  return LEAF;
}
const isDark = () => { const t = document.documentElement.getAttribute('data-theme'); return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; };
const smooth = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
function venuePopup(v) {
  const home = myHome(), hosts = [...v.hosts].filter(t => homeVenue(t) === v.p.id);
  return `<div class="pop"><b>${esc(v.p.name)}</b><span>${esc(v.p.addr)}, ${esc(v.p.com)}</span>`
    + (home && v.p.id === home.id ? '<span class="pop-k">La vostra palestra</span>' : v.d != null ? `<span class="pop-k">${num1(v.d)} km dalla vostra palestra</span>` : '')
    + (hosts.length ? `<span>Campo di casa di ${hosts.map(t => esc(TEAM[t].short)).join(', ')}</span>` : '')
    + (v.next ? `<span>Prossima: ${esc(fD.format(v.next.date))} ${fT(v.next.date)}, ${esc(TEAM[v.next.h].short)} – ${esc(TEAM[v.next.a].short)}</span>` : '')
    + `<span class="pop-btns"><a href="${mapsUrl(v.p)}" target="_blank" rel="noopener">Indicazioni</a><button type="button" data-card="${v.p.id}">Scheda</button></span></div>`;
}
function focusCard(id) {
  vSel = id;
  $$('.venue.sel').forEach(x => x.classList.remove('sel'));
  const c = document.getElementById('v-' + id);
  if (c) { c.classList.add('sel'); c.scrollIntoView({ block: 'center', behavior: smooth() }); }
}
function focusMarker(id) {
  vSel = id;
  const el = document.getElementById('vmap');
  if (el) el.scrollIntoView({ block: 'center', behavior: smooth() });
  const m = MARK[id];
  if (m && MAP) { MAP.setView(m.getLatLng(), Math.max(MAP.getZoom(), 14)); m.openPopup(); }
}
async function initRealMap() {
  const el = document.getElementById('vmap');
  if (!el) return;
  let L;
  try { L = await loadLeaflet(); } catch (e) { el.innerHTML = '<p class="empty" style="padding:16px">La mappa non si è caricata: controlla la connessione e riapri la sezione.</p>'; return; }
  if (!el.isConnected) return;
  if (MAP) { try { MAP.remove(); } catch (e) {} MAP = null; }
  el.innerHTML = '';
  MARK = {};
  MAP = L.map(el, { scrollWheelZoom: false, tapTolerance: 20 });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, className: 'osm-tiles',
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
  }).addTo(MAP);
  const home = myHome(), gset = new Set(GIR[SEL].matches.map(m => m.pal)), pts = [];
  let homeMk = null;
  VLIST.filter(v => v.p.lat != null).forEach(v => {
    const isHome = home && v.p.id === home.id;
    const fill = isHome ? '#F2B705' : (vScope === 'all' && !gset.has(v.p.id) ? '#8A96AC' : '#1D4FA6');
    const mk = L.circleMarker([v.p.lat, v.p.lng], { radius: isHome ? 11 : 8, weight: 2.5, color: '#FFFFFF', fillColor: fill, fillOpacity: 1 }).addTo(MAP);
    mk.bindPopup(venuePopup(v), { maxWidth: 270 });
    MARK[v.p.id] = mk; pts.push([v.p.lat, v.p.lng]);
    if (isHome) homeMk = mk;
  });
  if (pts.length) MAP.fitBounds(pts, { padding: [28, 28], maxZoom: 14 }); else MAP.setView([45.4642, 9.19], 11);
  if (homeMk) homeMk.bringToFront();
  MAP.on('popupopen', e => { const b = e.popup.getElement().querySelector('[data-card]'); if (b) b.addEventListener('click', () => focusCard(+b.dataset.card)); });
  if (vSel && MARK[vSel]) MARK[vSel].openPopup();
}

/* ---------- vista: lega ---------- */
function viewLeague() {
  const teams = Object.values(TEAM).filter(t => t.gid).length;
  const played = ALLM.filter(m => m.res).length;
  const inCamp = m => !lCamp || m.g.cid === lCamp;
  const end = new Date(NOW.getTime() + 7 * DAY);
  const up = ALLM.filter(m => !m.res && m.date > NOW && m.date <= end && inCamp(m));
  const rec = ALLM.filter(m => m.res && inCamp(m)).sort((a, b) => b.date - a.date).slice(0, 12);
  let h = `<div class="view-head"><div><span class="eyebrow">Stagione 2026/27 · US Acli Italian Volley League</span><h2>Tutta la lega</h2></div></div>
<p class="statline"><span><b>${CAMPL.length}</b> campionati</span><span><b>${IVL.gir.length}</b> gironi</span><span><b>${teams}</b> squadre</span><span><b>${played}</b>/${ALLM.length} partite giocate</span><span><b>${new Set(ALLM.map(m => m.pal)).size}</b> palestre</span></p>
<div class="chips" role="group" aria-label="Filtra per campionato"><button type="button" class="chip" data-lc="0" aria-pressed="${!lCamp}">Tutti</button>${CAMPL.map(c => `<button type="button" class="chip" data-lc="${c.id}" aria-pressed="${lCamp === c.id}">${esc(c.short)}</button>`).join('')}</div>
${campGrid()}
<div class="grid">
<section class="card span-7"><div class="card-h"><h3>Prossimi 7 giorni</h3><span class="eyebrow">${up.length} partite</span></div>`;
  if (!up.length) h += emptyNote('Nessuna partita nei prossimi 7 giorni.');
  else {
    let lastDay = null;
    up.forEach(m => {
      const k = dayKey(m.date);
      if (k !== lastDay) { h += `<div class="day-head">${esc(fDL.format(m.date))}</div>`; lastDay = k; }
      h += matchRow(m, { comp: true, hl: true });
    });
  }
  h += `</section><section class="card span-5"><div class="card-h"><h3>Ultimi risultati</h3></div>${rec.length ? '<div class="mlist">' + rec.map(m => matchRow(m, { comp: true, hl: true })).join('') + '</div>' : emptyNote('Ancora nessun risultato.')}</section></div>`;
  return h;
}
function campGrid() {
  return `<div class="camp-grid">${CAMPL.filter(c => !lCamp || c.id === lCamp).map(c => `<section class="card"><div class="card-h" style="margin-bottom:6px"><h3>${esc(c.name)}</h3></div><p class="small muted" style="margin-bottom:6px">${esc(c.tipo)} · ${esc(tipPretty(c.gir[0].tip))}</p>
${c.gir.map(g => { const o = offOf(g)[0]; const pl = g.matches.filter(m => m.res).length; return `<button type="button" class="gir-row${g.id === SEL ? ' cur' : ''}" data-gir="${g.id}"><span style="min-width:0"><span class="gn">${esc(g.name)}</span><span class="ld">${g.tids.length} squadre · ${pl}/${g.matches.length} giocate${o && o.pts ? ' · in testa ' + esc(TEAM[o.t].short) + ' (' + o.pts + ' pt)' : ''}</span></span>${g.tids.includes(MY) ? '<span class="tag mine">la tua</span>' : '<span class="tag">Apri</span>'}</button>`; }).join('')}
</section>`).join('')}</div>`;
}

/* ---------- schede (sheet) ---------- */
const sheet = $('#sheet'), sheetBody = $('#sheetBody');
let lastFocus = null;
let sheetHist = false;
function openSheet(html, label) {
  if (sheet.hidden) lastFocus = document.activeElement;
  if (HOSTED && !sheetHist) { try { history.pushState({ ivlSheet: true }, ''); sheetHist = true; } catch (e) {} }
  sheetBody.innerHTML = html;
  sheet.setAttribute('aria-label', label || 'Dettaglio');
  sheet.hidden = false;
  document.body.style.overflow = 'hidden';
  $('#sheetPanel').scrollTop = 0;
  setTimeout(() => $('.sheet-x', sheet).focus(), 30);
}
/* mode: nessuno = chiusura normale (toglie anche il passo aggiunto alla cronologia);
   'pop' = chiusa dal tasto Indietro; 'nav' = si sta per cambiare sezione (il passo verrà sostituito) */
function closeSheet(mode) {
  const had = sheetHist;
  sheetHist = false;
  if (!sheet.hidden) {
    sheet.hidden = true;
    document.body.style.overflow = '';
    if (!mode && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (had && !mode) { try { history.back(); } catch (e) {} }
  return had;
}
function navTo(route, replaced) {
  if (replaced) location.replace('#' + route); else location.hash = route;
}
function goHome() {
  SEL = TEAM[MY].gid; store.set('gir', SEL);
  const replaced = closeSheet('nav');
  if (location.hash && location.hash !== '#squadra') { navTo('squadra', replaced); return; }
  if (replaced) { try { history.back(); } catch (e) {} }
  render(false);
  window.scrollTo({ top: 0, behavior: smooth() });
}
function openMatch(id) {
  const m = MATCH[id]; if (!m) return;
  const g = m.g, r = m.res, w = winner(m), p = PAL[m.pal];
  const other = g.matches.filter(x => x !== m && ((x.h === m.h && x.a === m.a) || (x.h === m.a && x.a === m.h)));
  const side = (t, sc) => { const o = posOf(t); const st = r ? (w === t ? ' won' : w ? ' lost' : '') : ''; return `<button type="button" class="nx-team${t === MY ? ' me' : ''}${st}" data-t="${t}"><span class="nm">${esc(TEAM[t].short)}</span><span class="meta">${o.pos}° · ${o.pts} pt</span>${t === m.h ? '<span class="tag home">Casa</span>' : ''}${r ? `<span class="sc">${sc}</span>` : ''}</button>`; };
  let h = `<div style="padding-right:44px"><span class="eyebrow">${esc(ctxName(g))} · giornata ${m.giornata}</span></div>
<div class="nx-teams">${side(m.h, r?.sh)}${side(m.a, r?.sa)}</div>`;
  if (r && r.sets.length) {
    h += `<div class="card"><div class="tscroll"><table class="std"><thead><tr><th class="l">Set</th><th class="l">${esc(TEAM[m.h].short)}</th><th class="l">${esc(TEAM[m.a].short)}</th><th>Scarto</th></tr></thead><tbody>
${r.sets.map(([x, y], i) => `<tr><td class="l">${i + 1}°</td><td class="l${x > y ? ' pts' : ''}">${x}</td><td class="l${y > x ? ' pts' : ''}">${y}</td><td>${Math.abs(x - y)}</td></tr>`).join('')}
<tr><td class="l"><b>Totale</b></td><td class="l"><b>${r.sets.reduce((a, s) => a + s[0], 0)}</b></td><td class="l"><b>${r.sets.reduce((a, s) => a + s[1], 0)}</b></td><td></td></tr>
</tbody></table></div>${w === null ? '<p class="legend">Partita registrata come incompleta sul sito.</p>' : ''}</div>`;
  } else if (!r && m.date <= NOW) {
    h += `<p class="note">${m.date < GEN ? 'Partita già giocata ma il risultato non era ancora pubblicato al momento dell’estrazione dei dati.' : 'Partita giocata dopo l’ultimo aggiornamento di questa pagina: il risultato arriva con il prossimo aggiornamento.'}</p>`;
  }
  h += `<div class="card" style="display:flex;flex-direction:column;gap:10px">
<div class="when-big"><span class="d">${esc(cap(fDL.format(m.date)))}</span><span class="t">ore ${fT(m.date)}</span>${!r ? whenTag(m.date) : ''}</div>
${m.rinv ? `<p class="note">Data originale ${esc(fD.format(m.orig))} ore ${fT(m.orig)}${m.by ? ' · rinvio chiesto da ' + esc(TEAM[m.by].short) : ''}${m.swap ? ' · campo invertito' : ''}.</p>` : ''}
${m.venueChanged && PAL[m.origPal] ? `<p class="note">Palestra cambiata rispetto al calendario: prevista ${esc(PAL[m.origPal].name)}, ${esc(PAL[m.origPal].com)}.</p>` : ''}
${venueBlock(m)}
<div class="btns">${p ? `<a class="btn primary" href="${mapsUrl(p)}" target="_blank" rel="noopener">${ICON.route}Indicazioni</a>` : ''}${!r && m.date > NOW ? `<a class="btn" href="${gcalUrl(m)}" target="_blank" rel="noopener">${ICON.cal}Google Calendar</a>` : ''}</div></div>`;
  if (other.length) h += `<div class="card"><div class="card-h"><h3>${m.giornata < other[0].giornata ? 'Ritorno' : 'Andata'}</h3></div><div class="mlist">${other.map(x => matchRow(x, { giornata: true })).join('')}</div></div>`;
  openSheet(h, 'Partita ' + TEAM[m.h].short + ' – ' + TEAM[m.a].short);
}
function openTeam(t) {
  const T = TEAM[t]; if (!T || !T.gid) return;
  const g = GIR[T.gid], o = posOf(t), S = compOf(g)[t];
  const ms = g.matches.filter(m => involves(m, t)).sort(byDate);
  const nx = ms.find(m => !m.res && m.date > NOW);
  const hv = PAL[homeVenue(t)];
  let h = `<div><span class="eyebrow">${esc(T.soc)}</span><h2 style="font-size:30px;margin-top:4px">${esc(T.short)}</h2><p class="muted small" style="margin-top:4px">${esc(ctxName(g))}</p></div>
<div class="tiles"><div class="tile"><span class="eyebrow">Posizione</span><div class="v">${o.pos}°</div><div class="h">su ${g.tids.length}</div></div><div class="tile"><span class="eyebrow">Punti</span><div class="v">${o.pts}</div><div class="h">${o.g} giocate</div></div><div class="tile"><span class="eyebrow">V–P</span><div class="v">${o.v}–${o.p}</div><div class="h">set ${o.sv}–${o.sp}</div></div><div class="tile"><span class="eyebrow">Forma</span><div style="margin-top:8px">${formHTML(S.res)}</div></div></div>
${hv ? `<div class="card">${'<span class="eyebrow">Campo di casa</span>'}<div style="margin-top:8px">${venueBlock({ pal: hv.id, h: t, a: 0 }, false)}</div>${t !== MY && km(myHome(), hv) != null ? `<p class="small muted" style="margin-top:6px">${num1(km(myHome(), hv))} km in linea d'aria dalla palestra di ${esc(TEAM[MY].short)}</p>` : ''}<div class="btns" style="margin-top:10px"><a class="btn" href="${mapsUrl(hv)}" target="_blank" rel="noopener">${ICON.route}Indicazioni</a></div></div>` : ''}
<div class="card"><div class="card-h"><h3>Calendario</h3><span class="eyebrow">${ms.filter(m => m.res).length}/${ms.length} giocate</span></div><div class="mlist">${ms.map(m => matchRow(m, { giornata: true })).join('')}</div></div>
${HOSTED ? `<div class="btns">${calButton(t)}</div>` : ''}
<div class="btns">${t !== MY ? `<button type="button" class="btn primary" data-act="set-my" data-id="${t}">Imposta come la mia squadra</button>` : '<span class="tag mine">È la tua squadra</span>'}<button type="button" class="btn" data-gir="${g.id}" data-go="classifica">Classifica del girone</button></div>`;
  void nx;
  openSheet(h, 'Squadra ' + T.short);
}
function openCalSheet(t, mid) {
  const m = mid && MATCH[mid];
  openSheet(`<div><span class="eyebrow">${esc(TEAM[t].short)}</span><h2 style="margin-top:4px">Partite nel calendario</h2></div>
${subscribeHTML(t)}
${m ? `<div class="card"><span class="eyebrow">Solo questa partita</span><p class="small muted" style="margin:6px 0 10px">${esc(TEAM[m.h].short)} – ${esc(TEAM[m.a].short)}, ${esc(fD.format(m.date))} ore ${fT(m.date)}</p><a class="btn" href="${gcalUrl(m)}" target="_blank" rel="noopener">${ICON.cal}Aggiungi a Google Calendar</a></div>` : ''}`, 'Partite nel calendario');
}
function openGirPicker() {
  const h = `<div><span class="eyebrow">Scegli il girone</span><h2 style="margin-top:4px">Campionati 2026/27</h2></div>
<div class="pick-list">${CAMPL.map(c => `<div class="pick-camp"><h3>${esc(c.name)}</h3><div class="pick-gir">${c.gir.map(g => `<button type="button" class="chip" data-gir="${g.id}" aria-pressed="${g.id === SEL}">${esc(g.name)}${g.tids.includes(MY) ? ' ●' : ''}</button>`).join('')}</div></div>`).join('')}</div>`;
  openSheet(h, 'Scegli il girone');
}
function openTeamPicker() {
  const list = Object.values(TEAM).filter(t => t.gid).sort((a, b) => a.short.localeCompare(b.short));
  const h = `<div><span class="eyebrow">La mia squadra</span><h2 style="margin-top:4px">Scegli la squadra da seguire</h2><p class="small muted" style="margin-top:4px">La scelta resta salvata su questo dispositivo.</p></div>
<input class="search" id="teamSearch" type="search" placeholder="Cerca squadra o società" aria-label="Cerca squadra" autocomplete="off">
<div class="team-pick" id="teamPickList">${list.map(t => `<button type="button" data-act="set-my" data-id="${t.id}" data-s="${esc((t.short + ' ' + t.soc).toLowerCase())}"><span><span class="nm">${esc(t.short)}</span><br><span class="small muted">${esc(t.soc)}</span></span><span class="tag">${esc(CAMP[GIR[t.gid].cid].short)}${gShort(GIR[t.gid]) ? ' ' + esc(GIR[t.gid].name.replace('Girone ', '')) : ''}</span></button>`).join('')}</div>`;
  openSheet(h, 'Scegli la squadra');
  const inp = $('#teamSearch');
  inp.addEventListener('input', () => { const v = inp.value.trim().toLowerCase(); $$('#teamPickList button').forEach(b => b.hidden = !!v && !b.dataset.s.includes(v)); });
}

/* ---------- export CSV ---------- */
function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); t.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--tabh) + 20px + env(safe-area-inset-bottom,0px));background:var(--ink);color:var(--bg);padding:10px 14px;border-radius:10px;font-size:14px;z-index:60;max-width:calc(100% - 32px)'; document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false;
  clearTimeout(t._h); t._h = setTimeout(() => t.hidden = true, 3200);
}
function copyText(text, ok) {
  const done = () => toast(ok);
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => toast(text));
  else toast(text);
}
async function exportCSV() {
  if (!DL) return;
  const g = GIR[TEAM[MY].gid];
  const ms = g.matches.filter(m => involves(m, MY)).sort(byDate);
  const ampm = d => { let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${pad(h)}:${pad(d.getMinutes())} ${ap}`; };
  const us = d => `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
  const cq = s => '"' + String(s).replace(/"/g, '""') + '"';
  const rows = [['Subject', 'Start Date', 'Start Time', 'End Date', 'End Time', 'Location', 'Description']];
  ms.forEach(m => {
    const p = PAL[m.pal], e = new Date(m.date.getTime() + 2 * 3600e3);
    const res = m.res ? ` Risultato ${m.res.sh}-${m.res.sa}.` : '';
    rows.push([`${TEAM[m.h].short} – ${TEAM[m.a].short}`, us(m.date), ampm(m.date), us(e), ampm(e), p ? `${p.name}, ${p.addr}, ${p.com}` : '', `${ctxName(g)}, giornata ${m.giornata}.${res}`]);
  });
  const csv = '﻿' + rows.map(r => r.map(cq).join(',')).join('\r\n');
  try {
    await DL.save({ filename: 'calendario-' + TEAM[MY].short.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.csv', data: csv });
    toast('Calendario scaricato');
  } catch (e) {
    if (e && e.code === 'declined') return;
    if (e && e.code === 'rate_limited') { toast('C’è già una richiesta di download aperta'); return; }
    toast('Il download non è disponibile qui');
  }
}

/* ---------- routing e render ---------- */
const VIEWS = { squadra: viewTeam, classifica: viewTable, partite: viewMatches, statistiche: viewStats, palestre: viewVenues, lega: viewLeague };
let ROUTE = null;
function header() {
  const g = GIR[SEL];
  $('#ctxLabel').textContent = ctxShort(g);
  $('#ctxBtn').setAttribute('aria-label', 'Girone mostrato: ' + ctxName(g) + '. Cambia campionato o girone');
  $('#brandTeam').textContent = TEAM[MY].short;
}
function footer() {
  const age = Math.floor((NOW - GEN) / DAY);
  if (CHECK) {
    $('#foot').innerHTML = `<p>Dati presi in automatico dal sito ufficiale <a href="${esc(IVL.src)}" target="_blank" rel="noopener">ivl.usacli.it</a> più volte al giorno. Ultimo controllo: ${esc(fFull.format(new Date(CHECK)))}; ultima novità nei dati: ${esc(fFull.format(new Date(IVL.gen)))}. In caso di dubbio fa fede il sito della lega.</p><p>Classifiche nell’ordine ufficiale; statistiche, andamento e distanze calcolati dai dati della pagina. Pagina non ufficiale, fatta per la squadra.</p>`;
    return;
  }
  $('#foot').innerHTML = `<p>Dati estratti dal sito ufficiale <a href="${esc(IVL.src)}" target="_blank" rel="noopener">ivl.usacli.it</a> il ${esc(fFull.format(GEN))}${age >= 1 ? ` (${age === 1 ? 'ieri' : age + ' giorni fa'})` : ''}. Date, palestre e risultati possono cambiare: in caso di dubbio fa fede il sito.</p><p>Classifiche nell’ordine ufficiale; statistiche, andamento e distanze calcolati dai dati della pagina.</p>${HOSTED ? '' : '<p><b>Versione pubblica per la squadra</b>, aperta a tutti e aggiornata in automatico più volte al giorno: <a href="https://markensteinai.github.io/alta-in-branda-007/" target="_blank" rel="noopener">markensteinai.github.io/alta-in-branda-007</a></p>'}`;
}
function render(fromRoute) {
  const r = (location.hash || '').replace('#', '');
  const route = VIEWS[r] ? r : 'squadra';
  const changed = route !== ROUTE;
  ROUTE = route;
  $$('#tabs .tab').forEach(a => { if (a.dataset.r === route) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  header();
  const age = Math.floor((NOW - GEN) / DAY);
  const stale = CHECK
    ? (age >= 2 ? `<p class="note">L’aggiornamento automatico è fermo da ${age} giorni: risultati e classifiche recenti potrebbero mancare.</p>` : '')
    : (age >= 7 ? `<p class="note">Questi dati sono di ${age} giorni fa: risultati e classifiche recenti potrebbero mancare.</p>` : '');
  if (MAP && !(route === 'palestre' && HOSTED)) { try { MAP.remove(); } catch (e) {} MAP = null; }
  const myG = TEAM[MY].gid;
  const banner = route !== 'squadra' && route !== 'lega' && SEL !== myG
    ? `<div class="ctx-banner" role="status"><span>Stai guardando <b>${esc(ctxName(GIR[SEL]))}</b></span><button type="button" data-act="my-gir"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>Torna al girone di ${esc(TEAM[MY].short)}</button></div>`
    : '';
  $('#app').innerHTML = stale + banner + VIEWS[route]();
  if (route === 'palestre' && HOSTED) initRealMap();
  if (fromRoute && changed) {
    window.scrollTo(0, 0);
    if (route === 'partite' && mFilter !== 'played') {
      const cur = currentGiornata(GIR[SEL]);
      const el = cur && document.getElementById('g-' + cur);
      if (el && cur > 1) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
    }
  }
}
function setGir(id, go) {
  SEL = +id; store.set('gir', SEL);
  if (go && location.hash !== '#' + go) { navTo(go, closeSheet('nav')); return; }
  closeSheet();
  render(false);
  window.scrollTo(0, 0);
}
function setMy(id) {
  MY = +id; store.set('team', MY);
  goHome();
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-close],[data-act],[data-m],[data-t],[data-gir],[data-mf],[data-vs],[data-v],[data-lc]');
  if (!el) return;
  if (el.hasAttribute('data-close')) { closeSheet(); return; }
  const act = el.dataset.act;
  if (act === 'home') { e.preventDefault(); return goHome(); }
  if (act === 'my-gir') { SEL = TEAM[MY].gid; store.set('gir', SEL); render(false); window.scrollTo({ top: 0, behavior: smooth() }); return; }
  if (act === 'pick-gir') return openGirPicker();
  if (act === 'pick-team') return openTeamPicker();
  if (act === 'set-my') return setMy(el.dataset.id);
  if (act === 'csv') return exportCSV();
  if (act === 'map-focus') return focusMarker(+el.dataset.id);
  if (act === 'tfull') { tFull = !tFull; store.set('tfull', tFull); render(false); return; }
  if (act === 'cal-sheet') return openCalSheet(+el.dataset.id, el.dataset.mm);
  if (act === 'copy-cal') { const u = calUrl(el.dataset.id, 'https'); copyText(u, 'Indirizzo del calendario copiato'); return; }
  if (act === 'share') {
    const u = location.href.split('#')[0];
    if (navigator.share) { navigator.share({ title: document.title, text: TEAM[MY].short + ': classifica, calendario e risultati', url: u }).catch(() => {}); }
    else copyText(u, 'Link della pagina copiato');
    return;
  }
  if (act === 'goto-cur') { const c = currentGiornata(GIR[SEL]); const t = c && document.getElementById('g-' + c); if (t) t.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); return; }
  if (el.dataset.m) return openMatch(el.dataset.m);
  if (el.dataset.t) return openTeam(+el.dataset.t);
  if (el.dataset.gir) return setGir(el.dataset.gir, el.dataset.go || (ROUTE === 'squadra' || ROUTE === 'lega' ? 'classifica' : null));
  if (el.dataset.mf) { mFilter = el.dataset.mf; store.set('mfilter', mFilter); render(false); return; }
  if (el.dataset.vs) { vScope = el.dataset.vs; render(false); return; }
  if (el.dataset.v) {
    vSel = +el.dataset.v; render(false);
    const c = document.getElementById('v-' + vSel); if (c) c.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    return;
  }
  if (el.dataset.lc != null) { lCamp = +el.dataset.lc; render(false); return; }
});
document.addEventListener('change', e => {
  if (e.target.id === 'teamFilter') { mTeam = +e.target.value; render(false); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });
$$('#tabs .tab').forEach(a => a.addEventListener('click', e => {
  if (a.dataset.act === 'home') return;
  if (location.hash === '#' + a.dataset.r && sheet.hidden) { e.preventDefault(); window.scrollTo({ top: 0, behavior: smooth() }); }
}));
window.addEventListener('popstate', () => { if (!sheet.hidden && sheetHist) closeSheet('pop'); });
$('#ctxBtn').addEventListener('click', openGirPicker);
window.addEventListener('hashchange', () => { if (!sheet.hidden) closeSheet('pop'); render(true); });
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (ROUTE === 'palestre' && HOSTED) initRealMap(); }); } catch (e) {}

footer();
render(true);

/* download del calendario: attivo solo dove il visualizzatore lo consente */
(async () => {
  try { DL = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('downloads') : null; } catch (e) { DL = null; }
  if (DL) $$('.dl-only').forEach(x => x.hidden = false);
})();
})();

// Rigenera site/data.js e i calendari site/cal/<squadra>.ics dai dati pubblici di ivl.usacli.it.
// Uso: node scripts/update-data.mjs   (Node 20+, nessuna dipendenza)
// Se qualcosa non torna esce con errore e non tocca i file: il sito resta all'ultima versione buona.
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const BASE = 'https://ivl.usacli.it';
const TERR = +(process.env.IVL_TERRITORIO || 3);          // Lombardia (MI+MB)
const START = process.env.IVL_INIZIO || '2026-09-01';     // stagione 2026/27
const END = process.env.IVL_FINE || '2027-08-31';
const SRC_GIRONE = +(process.env.IVL_GIRONE || 1078);     // girone citato nel piè di pagina
const ORDER = [389, 390, 387, 388, 385, 386, 392, 393, 394, 395];
const OUT = new URL('../site/', import.meta.url);

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(path, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(BASE + path, { headers: { Accept: 'application/json, text/javascript, */*; q=0.01', 'X-Requested-With': 'XMLHttpRequest', 'User-Agent': 'Mozilla/5.0 (compatible; ivl-squadra-pages/1.0)' } });
      if (!r.ok) throw new Error(`HTTP ${r.status} su ${path}`);
      const text = await r.text();
      try { return JSON.parse(text); } catch { throw new Error(`Risposta non JSON su ${path}: ${text.slice(0, 80)}`); }
    } catch (e) {
      if (i >= tries) throw e;
      await sleep(2000 * i);
    }
  }
}
const dmy = s => { const [d, m, y] = String(s).split('-'); return `${y}-${m}-${d}`; };
const compact = s => String(s).replace(/^\d\d(\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d).*/, '$1$2$3$4$5');
const clean = s => String(s ?? '').replace(/[|;]/g, ' ').trim();
const girName = n => /^girone\s+unico$/i.test(String(n).trim()) ? 'Girone unico' : String(n).trim().replace(/^girone\s+/i, 'Girone ');
const fix5 = x => x == null || x === '' ? null : +(+x).toFixed(5);

async function build() {
  const allCamp = await get(`/CampionatiData?territorio_id=${TERR}`);
  const camps = allCamp.filter(c => { const s = c.data_inizio_campionato && dmy(c.data_inizio_campionato); return s && s >= START && s <= END && !c.deleted_at; })
    .sort((a, b) => ((ORDER.indexOf(a.id) + 1) || 99) - ((ORDER.indexOf(b.id) + 1) || 99) || a.name.localeCompare(b.name));
  if (!camps.length) throw new Error('Nessun campionato trovato per la stagione');
  const D = { camp: [], gir: [], cls: {}, teams: {}, pal: {}, ms: [] };
  const season = `inizio_stagione=${START}T00:00:00.000Z&fine_stagione=${END}T00:00:00.000Z`;
  for (const c of camps) {
    D.camp.push([c.id, c.name, c.TipoCampionato]);
    const gironi = (await get(`/GironiData?campionato_id=${c.id}`)).filter(g => +g.pubblicato === 1 && !g.deleted_at);
    for (const g of gironi) {
      const sq = await get(`/SquadreIscritteAGirone/${g.id}`);
      const tids = sq.map(s => s.id);
      sq.forEach(s => { D.teams[s.id] = [String(s.name).replace(/\s+/g, ' ').trim(), String(s.Societa || '').trim()]; });
      const pj = await get(`/PartiteData?girone_id=${g.id}&territorio_id=${TERR}&campionato_id=${c.id}&${season}&societa_id=null&squadra_id=null&pubblicato=1&search=&sort=&order=&offset=0&limit=2000`);
      const rows = pj.rows || [];
      const ms = [];
      for (const r of rows) {
        for (const [t, n] of [[r.squadra_casa_id, r.squadra_casa_name], [r.squadra_ospite_id, r.squadra_ospite_name]]) {
          if (!tids.includes(t)) { tids.push(t); D.teams[t] = D.teams[t] || [String(n || '').replace(/\s+/g, ' ').trim(), '']; }
        }
        for (const k of ['palestra1', 'palestrarinvio']) {
          const id = r[k + '_id'];
          if (id && !D.pal[id]) D.pal[id] = [id, r[k + '_name'], r[k + '_indirizzo'], r[k + '_comune'], fix5(r[k + '_latitude']), fix5(r[k + '_longitude']), r[k + '_note'] || ''].map(x => clean(x)).join('|');
        }
        const row = [+r.giornata, compact(r.data_orario), r.palestra1_id || 0, tids.indexOf(r.squadra_casa_id), tids.indexOf(r.squadra_ospite_id)];
        let res = '';
        if (r.ris_set_casa != null) {
          const ps = [1, 2, 3, 4, 5].filter(i => r[`ris_punti${i}set_casa`] != null).map(i => r[`ris_punti${i}set_casa`] + '-' + r[`ris_punti${i}set_ospite`]).join(' ');
          res = r.ris_set_casa + '-' + r.ris_set_ospite + (ps ? '/' + ps : '');
        }
        let extra = '';
        if (r.data_orario_rinvio) extra += 'r' + compact(r.data_orario_rinvio);
        if (r.palestra_rinvio_id) extra += 'p' + r.palestra_rinvio_id;
        if (r.squadra_rinviante_id) extra += 's' + tids.indexOf(r.squadra_rinviante_id);
        if (r.scambio_casa_rinvio) extra += 'x';
        let s = row.join(',');
        if (res) s += ',' + res; else if (extra) s += ',';
        if (extra) s += ',' + extra;
        ms.push({ g: +r.giornata, dt: row[1], s });
      }
      ms.sort((a, b) => a.g - b.g || a.dt.localeCompare(b.dt));
      const cl = await get(`/Classifica/${g.id}`);
      if (!Array.isArray(cl)) throw new Error(`Classifica non disponibile per il girone ${g.id}`);
      const order = cl.map(x => tids.findIndex(t => D.teams[t] && D.teams[t][0] === String(x.name).replace(/\s+/g, ' ').trim()));
      if (order.includes(-1) || order.length !== tids.length) throw new Error(`Classifica del girone ${g.id} non allineata alle squadre`);
      D.cls[g.id] = cl.map(x => [x.Punteggio, x.PartiteGiocate, x.PartiteVinte, x.SetVinti, x.SetPersi, x.PuntiVinti, x.PuntiPersi].map(Number));
      D.gir.push([g.id, c.id, girName(g.name), g.TipoCompetizione, tids, order]);
      D.ms.push(g.id + ':' + ms.map(m => m.s).join(';'));
      await sleep(150);
    }
  }
  return D;
}

/* ---------- calendari .ics ---------- */
const titleCase = s => s.toLowerCase().replace(/(^|[\s\-\/(.'’"])([a-zà-ù])/g, (m, p, c) => p + c.toUpperCase()).replace(/\s(Di|Del|Della|Dello|Dei|Degli|Sul|Sulla|Da|D)\s/g, m => m.toLowerCase());
const tidy = s => { s = (s || '').replace(/\s+/g, ' ').trim().replace(/([A-Za-zÀ-ù]{4,})\.(?=\s|$)/g, '$1').replace(/[,\s]+$/, ''); const letters = s.replace(/[^A-Za-zÀ-ù]/g, ''), upper = s.replace(/[^A-ZÀ-Ý]/g, ''); return s.length > 3 && letters.length && upper.length / letters.length >= 0.6 ? titleCase(s) : s; };
const short = n => n.replace(/\s+(Basic|Superbasic|Top|Elite|Open M)$/i, '');
const icsText = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
function fold(line) {
  const b = Buffer.from(line, 'utf8');
  if (b.length <= 74) return line;
  const out = []; let cur = '';
  for (const ch of line) {
    if (Buffer.byteLength(cur + ch, 'utf8') > (out.length ? 73 : 74)) { out.push(cur); cur = ''; }
    cur += ch;
  }
  out.push(cur);
  return out.join('\r\n ');
}
const icsDate = dt => { const y = 2000 + +dt.slice(0, 2), mo = +dt.slice(2, 4), d = +dt.slice(4, 6), h = +dt.slice(6, 8), mi = +dt.slice(8, 10); return { y, mo, d, h, mi }; };
const fmtLocal = ({ y, mo, d, h, mi }) => `${y}${String(mo).padStart(2, '0')}${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}${String(mi).padStart(2, '0')}00`;
const plus2h = t => { const x = new Date(Date.UTC(t.y, t.mo - 1, t.d, t.h + 2, t.mi)); return { y: x.getUTCFullYear(), mo: x.getUTCMonth() + 1, d: x.getUTCDate(), h: x.getUTCHours(), mi: x.getUTCMinutes() }; };
const VTZ = ['BEGIN:VTIMEZONE', 'TZID:Europe/Rome', 'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST', 'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT', 'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET', 'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD', 'END:VTIMEZONE'];
function parseEvents(data) {
  const gir = {};
  data.gir.forEach(([id, cid, name, , tids]) => { gir[id] = { name, tids, camp: (data.camp.find(c => c[0] === cid) || [])[1] || '' }; });
  const out = [];
  data.ms.split('#').forEach(block => {
    const i = block.indexOf(':'), gid = +block.slice(0, i), g = gir[gid];
    block.slice(i + 1).split(';').filter(Boolean).forEach(row => {
      const f = row.split(',');
      let dt = f[1], pal = +f[2], home = g.tids[+f[3]], away = g.tids[+f[4]];
      const uid = `ivl-${gid}-${f[0]}-${home}-${away}`;
      const e = f[6] || '', r = e.match(/r(\d{10})/), p = e.match(/p(\d+)/);
      if (r) dt = r[1];
      if (p) pal = +p[1];
      if (e.includes('x')) [home, away] = [away, home];
      out.push({ uid, camp: g.camp, gir: g.name, giornata: +f[0], dt, pal, home, away, res: f[5] ? f[5].split('/')[0] : '' });
    });
  });
  return out;
}
function teamCalendar(tid, data, events, stamp) {
  const name = short(data.teams[tid][0]);
  const pal = {}; data.pal.split(';').forEach(r => { const [id, n, a, c] = r.split('|'); pal[id] = { n: tidy(n), a: tidy(a), c: titleCase(c || '') }; });
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ivl-squadra-pages//IT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', `X-WR-CALNAME:${icsText(name + ' · volley')}`, 'X-WR-TIMEZONE:Europe/Rome', 'REFRESH-INTERVAL;VALUE=DURATION:PT6H', 'X-PUBLISHED-TTL:PT6H', ...VTZ];
  events.filter(e => e.home === tid || e.away === tid).sort((a, b) => a.dt.localeCompare(b.dt)).forEach(e => {
    const t = icsDate(e.dt), p = pal[e.pal];
    const h = short(data.teams[e.home][0]), a = short(data.teams[e.away][0]);
    const sum = e.res ? `${h} ${e.res.replace('-', '–')} ${a}` : `${h} – ${a}`;
    L.push('BEGIN:VEVENT', `UID:${e.uid}@ivl-squadra-pages`, `DTSTAMP:${stamp}`, `DTSTART;TZID=Europe/Rome:${fmtLocal(t)}`, `DTEND;TZID=Europe/Rome:${fmtLocal(plus2h(t))}`,
      `SUMMARY:${icsText(sum)}`, ...(p ? [`LOCATION:${icsText(`${p.n}, ${p.a}, ${p.c}`)}`] : []), `DESCRIPTION:${icsText(`${e.camp} · ${e.gir === 'Girone unico' ? '' : e.gir + ' · '}giornata ${e.giornata}${e.home === tid ? ' · in casa' : ' · in trasferta'}`)}`, 'END:VEVENT');
  });
  L.push('END:VCALENDAR');
  return L.map(fold).join('\r\n') + '\r\n';
}

/* ---------- main ---------- */
async function readPrev() {
  try { const t = await readFile(new URL('data.js', OUT), 'utf8'); return JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1)); } catch { return null; }
}
const countMatches = d => d.ms.split('#').reduce((a, b) => a + b.slice(b.indexOf(':') + 1).split(';').filter(Boolean).length, 0);
async function writeCalendars(data) {
  await mkdir(new URL('cal/', OUT), { recursive: true });
  const stamp = data.gen.replace(/[-:]/g, '').replace(/\.\d+/, '');
  const events = parseEvents(data);
  for (const tid of Object.keys(data.teams)) await writeFile(new URL(`cal/${tid}.ics`, OUT), teamCalendar(+tid, data, events, stamp));
}

if (process.argv.includes('--solo-calendari')) {
  const data = await readPrev();
  if (!data) throw new Error('site/data.js mancante');
  await writeCalendars(data);
  console.log(`Calendari rigenerati per ${Object.keys(data.teams).length} squadre.`);
} else {
  const D = await build();
  const payload = {
    src: `${BASE}/CalendarioView?girone_id=${SRC_GIRONE}&territorio_id=${TERR}&campionato_id=${(D.gir.find(g => g[0] === SRC_GIRONE) || D.gir[0])[1]}&inizio_stagione=${START}T00:00:00.000Z&fine_stagione=${END}T00:00:00.000Z&societa_id=null&squadra_id=null`,
    camp: D.camp, gir: D.gir, cls: D.cls, teams: D.teams, pal: Object.values(D.pal).join(';'), ms: D.ms.join('#')
  };
  const nMatches = countMatches(payload);
  const prev = await readPrev();
  if (prev && nMatches < countMatches(prev) * 0.5) throw new Error(`Partite scese da ${countMatches(prev)} a ${nMatches}: dati sospetti, non aggiorno`);
  const { gen: prevGen, ...prevPayload } = prev || {};
  const same = !!prev && JSON.stringify(prevPayload) === JSON.stringify(payload);
  const data = { gen: same ? prevGen : new Date().toISOString().replace(/\.\d+Z$/, 'Z'), ...payload };
  await writeFile(new URL('data.js', OUT), '/* Generato da scripts/update-data.mjs, non modificare a mano */\nwindow.IVL = ' + JSON.stringify(data) + ';\n');
  await writeCalendars(data);
  await writeFile(new URL('stato.js', OUT), `window.IVL_CHECK = ${JSON.stringify(new Date().toISOString().replace(/\.\d+Z$/, 'Z'))};\n`);
  console.log(`${same ? 'Nessuna novità' : 'Dati aggiornati'}: ${D.camp.length} campionati, ${D.gir.length} gironi, ${Object.keys(D.teams).length} squadre, ${nMatches} partite, ${Object.keys(D.pal).length} palestre.`);
}

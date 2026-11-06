// Storico delle stagioni passate dall'archivio pubblico di ivl.usacli.it, collegato alle squadre di quest'anno.
// Funzioni pure (niente fs/rete diretti): `get` è la stessa funzione di update-data.mjs, così il modulo si prova anche nel browser.
//
// Fonti:
//   /ClassificheArchivioData/?anno=AA&territorio_id=T   classifiche finali di ogni fase (anno 25 = stagione 2025/26)
//   /PartiteArchivioData/?...                             tutte le partite archiviate (il parametro anno non filtra)
// L'archivio non ha codici squadra: il collegamento è per nome, senza il suffisso di categoria (Basic, Superbasic, Top…).
// Se più squadre condividono il nome base (oggi o in quella stagione) serve lo stesso suffisso, altrimenti il dato si scarta.
// Delle partite si tengono solo data, squadre e risultato (niente arbitri o altri dati personali).

// gerarchia Volley Cup (dalla più alta): Elite, Elite B, Top, Top B, Basic, Superbasic (Superbasic è sotto Basic)
export const CATS = [
  [/SUPER\s*BASIC/i, 'Superbasic', 1],
  [/PRE\s*BASIC/i, 'Pre Basic', null],
  [/GHELA\s*BASIC/i, 'Ghela Basic', null],
  [/TOP\s*B\b/i, 'Top B', 4],
  [/ELITE\s*B\b/i, 'Elite B', 6],
  [/ELITE/i, 'Elite', 7],
  [/TOP/i, 'Top', 5],
  [/BASIC/i, 'Basic', 2],
  [/OPEN\s*M|MASCHILE/i, 'Open maschile', null]
];
export function catOf(camp) {
  for (const [re, lab, lvl] of CATS) if (re.test(camp)) return { lab, lvl };
  const t = String(camp).replace(/\s+/g, ' ').trim().toLowerCase();
  return { lab: t.charAt(0).toUpperCase() + t.slice(1), lvl: null };
}
const YOUTH = /UNDER|FEMMINILE|\bU\s?1\d|\bU\s?2\d|TEST|JUNIOR/i;
const SUF = /\s+(SUPER\s*BASIC|PRE\s*BASIC|BASIC|TOP\s*B|TOP|ELITE\s*B|ELITE|OPEN\s*M)\s*$/i;
const up = s => String(s || '').replace(/\s+/g, ' ').trim().toUpperCase();
export const base = s => up(s).replace(SUF, '').replace(/[^A-Z0-9]/g, '');
export const suffix = s => { const m = up(s).match(SUF); return m ? m[1].replace(/\s+/g, '') : ''; };

export function fase(camp, gir) {
  const s = up(camp), g = up(gir);
  if (/SPAREGGIO/.test(s + ' ' + g)) return 'spareggio';
  if (/POOL PROMOZIONE/.test(s)) return 'pool promozione';
  if (/POOL RETROCESSIONE/.test(s)) return 'pool retrocessione';
  if (/PLAY ?OFF/.test(s)) return 'play off';
  if (/PLAY ?OUT/.test(s)) return 'play out';
  if (/FINALE PROMOZIONE/.test(s)) return 'finale promozione';
  if (/SEMIFINAL/.test(s)) return 'semifinale';
  if (/QUARTI/.test(s)) return 'quarti di finale';
  if (/FINALE/.test(s)) { const p = g.match(/(\d+)\s*°\s*POSTO/); return p ? `finale ${p[1]}° posto` : 'finale'; }
  if (/\bII\s*\^|2\s*\^\s*FASE|\bII FASE/.test(s)) return '2ª fase';
  if (/\bI\s*\^|1\s*\^\s*FASE|\bI FASE/.test(s)) return '1ª fase';
  if (/PRIMAVERILE/.test(s)) return 'primaverile';
  if (/INVERNALE/.test(s)) return 'invernale';
  return '';
}
export function gironeLab(gir) {
  const m = up(gir).match(/GIRONE\s+([A-Z0-9]{1,2})\s*$/);
  return m && m[1] !== 'UNICO' ? m[1] : '';
}
// ordine delle fasi dentro una stagione: girone/1ª fase, poi 2ª fase/pool/play off/out, poi quarti, semifinali, finali
const faseRank = p => !p || /^1ª|invernale/.test(p) ? 1 : /quarti/.test(p) ? 3 : /semifinal|spareggio/.test(p) ? 4 : /^finale/.test(p) ? 5 : 2;
const ymd = s => +String(s).slice(2, 10).replace(/-/g, '');            // "2026-03-01 21:00" -> 260301
const annoOf = s => { const y = +String(s).slice(2, 4), m = +String(s).slice(5, 7); return m >= 9 ? y : y - 1; };

/**
 * D: dati di quest'anno (come in update-data: teams {id:[nome,soc]}, gir [[id,cid,nome,tip,tids,...]])
 * get: funzione che scarica un percorso JSON del sito della lega
 * anni: es. [25, 24, 23, 22]
 */
export async function buildStorico(D, get, { terr = 3, anni }) {
  // squadre di quest'anno per nome base
  const byBase = {};
  for (const [id, [name]] of Object.entries(D.teams)) (byBase[base(name)] = byBase[base(name)] || []).push(+id);
  const curName = id => D.teams[id][0];
  const girOf = {}; D.gir.forEach(g => g[4].forEach(t => { girOf[t] = g[0]; }));

  // 1) classifiche archiviate
  const cls = [];
  for (const anno of anni) {
    const rows = await get(`/ClassificheArchivioData/?anno=${anno}&territorio_id=${terr}`);
    if (!Array.isArray(rows)) throw new Error(`Archivio classifiche ${anno} non valido`);
    for (const x of rows) {
      if (!x || !x.classifica || YOUTH.test(x.campionato || '')) continue;
      let cl; try { cl = JSON.parse(x.classifica); } catch { continue; }
      if (!Array.isArray(cl) || !cl.length) continue;
      cls.push({ anno, camp: x.campionato || '', gir: x.girone || '', end: x.data_orario || '', rows: cl.filter(r => r && r.name) });
    }
  }
  // 2) partite archiviate
  const pj = await get(`/PartiteArchivioData/?anno=${anni[0]}&territorio_id=${terr}&girone=null&campionato=null&inizio_stagione=null&fine_stagione=null&societa=null&squadra=null`);
  const ms = (Array.isArray(pj) ? pj : (pj && pj.rows) || []).filter(r => r && r.ris_set_casa != null && r.squadra_casa && r.squadra_ospite && !YOUTH.test(r.campionato || ''));

  // nomi presenti in ogni stagione per nome base (per capire quando due squadre condividono il nome)
  const seen = {};
  const note = (anno, n) => { const b = base(n); ((seen[anno] = seen[anno] || {})[b] = seen[anno][b] || new Set()).add(up(n)); };
  cls.forEach(c => c.rows.forEach(r => note(c.anno, r.name)));
  ms.forEach(r => { const a = annoOf(r.data_orario); note(a, r.squadra_casa); note(a, r.squadra_ospite); });
  function resolve(name, anno) {
    const b = base(name), cands = byBase[b];
    if (!cands) return null;
    const shared = ((seen[anno] || {})[b] || new Set()).size > 1;
    if (cands.length === 1 && !shared) return cands[0];
    const hit = cands.filter(t => suffix(curName(t)) === suffix(name));
    return hit.length === 1 ? hit[0] : null;
  }

  const SI = {}; anni.forEach((a, i) => { SI[a] = i; });
  const t = {};
  for (const c of cls) {
    const k = catOf(c.camp), ph = fase(c.camp, c.gir), gl = gironeLab(c.gir);
    c.rows.forEach((r, i) => {
      const tid = resolve(r.name, c.anno);
      if (tid == null) return;
      (t[tid] = t[tid] || []).push([SI[c.anno], k.lab, k.lvl, ph, gl, i + 1, c.rows.length, +r.Punteggio || 0, +r.PartiteVinte || 0, +r.PartiteGiocate || 0, ymd(c.end)]);
    });
  }
  for (const k of Object.keys(t)) t[k].sort((a, b) => a[0] - b[0] || faseRank(a[3]) - faseRank(b[3]) || a[10] - b[10]);

  // precedenti tra squadre che quest'anno sono nello stesso girone
  const p = {};
  for (const r of ms) {
    const anno = annoOf(r.data_orario);
    if (!(anno in SI)) continue;
    const h = resolve(r.squadra_casa, anno), a = resolve(r.squadra_ospite, anno);
    if (h == null || a == null || h === a || girOf[h] == null || girOf[h] !== girOf[a]) continue;
    const sets = [1, 2, 3, 4, 5].filter(i => r[`ris_punti${i}set_casa`] != null).map(i => `${r[`ris_punti${i}set_casa`]}-${r[`ris_punti${i}set_ospite`]}`).join(' ');
    const k = catOf(r.campionato || ''), ph = fase(r.campionato || '', r.girone || '');
    (p[girOf[h]] = p[girOf[h]] || []).push([ymd(r.data_orario), h, a, +r.ris_set_casa, +r.ris_set_ospite, SI[anno], k.lab + (ph ? ' · ' + ph : ''), sets]);
  }
  for (const k of Object.keys(p)) p[k].sort((x, y) => y[0] - x[0]);

  return { anni: anni.map(a => `20${a}/${a + 1}`), t, p, nCls: cls.length, nMatch: ms.length };
}

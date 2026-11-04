# ALTA IN BRANDA 007 · IVL 2026/27

Pagina non ufficiale con classifica, calendario, risultati set per set, statistiche e palestre della squadra ALTA IN BRANDA 007 (BASIC misto, Girone D) e di tutta l'IVL Lombardia (MI+MB), stagione 2026/27.

Sito: https://markensteinai.github.io/alta-in-branda-007/

## Come si aggiorna

Il workflow `.github/workflows/pages.yml` gira tre volte al giorno (e a ogni modifica del repository):

1. `scripts/update-data.mjs` legge i dati pubblici di [ivl.usacli.it](https://ivl.usacli.it) (campionati, gironi, squadre, partite, classifiche ufficiali);
2. riscrive `site/data.js` e i calendari `site/cal/<id squadra>.ics` solo se qualcosa è cambiato;
3. pubblica la cartella `site/` su GitHub Pages.

Se il sito della lega non risponde o restituisce dati sospetti, lo script si ferma senza toccare i file: la pagina resta all'ultima versione buona e il workflow risulta in errore.

Per forzare un aggiornamento: scheda **Actions** → *Aggiorna dati e pubblica il sito* → **Run workflow**.

## Calendari

Ogni squadra ha un calendario in abbonamento, per esempio quello di ALTA IN BRANDA 007:
`webcal://markensteinai.github.io/alta-in-branda-007/cal/599.ics`

## Sicurezza e privacy

- Sito statico in sola lettura: nessun login, nessun modulo, nessun cookie, nessun dato inviato a server.
- Content Security Policy nella pagina: script solo da questo sito (nessuno script inline o esterno), immagini esterne solo dai riquadri della mappa CARTO.
- Font e libreria della mappa (Leaflet 1.9.4) sono copiati nel repository: nessuna dipendenza da CDN. Unica richiesta esterna: i riquadri della mappa (CARTO/OpenStreetMap), solo nella sezione Palestre.
- I testi che arrivano dal sito della lega vengono sempre inseriti come testo (escape HTML); `data.js` è JSON generato, mai eseguito come codice dallo script.
- Workflow: permessi minimi dichiarati, azioni GitHub fissate per hash di commit, nessun segreto nel repository, nessun trigger da pull request.

## Crediti

Dati: US Acli Italian Volley League (ivl.usacli.it). Mappa: [Leaflet](https://leafletjs.com) (BSD-2), riquadri © [OpenStreetMap](https://www.openstreetmap.org/copyright) e © [CARTO](https://carto.com/attributions). Font: Barlow, Barlow Condensed e IBM Plex Mono (SIL Open Font License, licenze in `site/fonts`).

## Stagione successiva

Cambiare le variabili `IVL_INIZIO`, `IVL_FINE` e `IVL_GIRONE` in testa allo script (o come variabili d'ambiente nel workflow).

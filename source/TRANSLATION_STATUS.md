# Stato traduzione — primo capitolo

## Completato nella base ZIL
- Vocabolario iniziale: direzioni cardinali, `SU`, `GIU`, `GUARDA`,
  `ESAMINA`, `APRI`, `CHIUDI`, `PRENDI`, `LEGGI`, `INVENTARIO`.
- Nomi italiani iniziali: casa, bosco, finestra, cassetta delle lettere,
  volantino.
- Prime descrizioni e messaggi: lato ovest/est, titoli delle aree, stanze
  principali della casa, cucina, soggiorno e messaggi della casa bianca.
- Tradotti ulteriori messaggi delle azioni iniziali, della botola e del
  parser comune, oltre ai nomi descrittivi degli oggetti principali.
- Esecuzione Z-machine verificata nel terminale: l'avvio e i comandi italiani
  base funzionano; restano messaggi inglesi da tradurre.

## Verifica del primo capitolo
- Tradotti i testi giocabili del perimetro esterno/casa/cucina/soggiorno/cantina,
  inclusi messaggi dinamici e descrittori degli oggetti principali.
- Vocabolario italiano base esteso per osservare, esaminare, aprire, chiudere,
  prendere, leggere, entrare, spostare e aiuto.
- Audit automatico del perimetro in `translation-audit.test.js`: nessun
  messaggio inglese rilevato nelle sezioni del primo capitolo.
- La logica delle aree successive e i relativi testi restano invariati e fuori
  perimetro.

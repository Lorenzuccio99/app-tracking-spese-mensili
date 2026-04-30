Spese 27 - versione 27

Istruzioni rapide:
1. Prima di sostituire i file, apri la tua app attuale ed esporta un backup JSON.
2. Copia questi file dentro la cartella spese27, sostituendo quelli esistenti.
3. Riavvia il server: python -m http.server 8000
4. Apri http://localhost:8000
5. Fai CTRL + F5.
6. Se il browser mostra ancora la vecchia versione, premi F12 > Console e incolla:
   navigator.serviceWorker.getRegistrations().then(r=>{r.forEach(x=>x.unregister());location.reload();});

Novità:
- Dashboard migliorata.
- Budget con barra di avanzamento.
- Budget non allocato.
- Spese per categoria.
- Statistiche del periodo.
- Ricerca e filtri movimenti.
- Ordinamento movimenti.
- Modifica/elimina movimenti.
- Export JSON, CSV completo e CSV del periodo.
- Icone PWA incluse.

Aggiornamento v11:
- Aggiungi movimento e Dashboard affiancati su schermi larghi.
- Su iPhone restano uno sotto l'altro per non comprimere il form.

Aggiornamento v12:
- Descrizione movimento non più obbligatoria.
- Entrate verdi, uscite rosse e saldo verde nella Dashboard.
- Categorie definite nascoste in una tendina apribile.
- Sezione Movimenti spostata prima del Budget.

Aggiornamento v13:
- Budget ridisegnato con riepilogo superiore e card più leggibili.
- Sezione Backup resa compatta e meno invadente.
- Nel Budget tutti gli importi Speso sono rossi e tutti i Residuo sono verdi.

Aggiornamento v14:
- Aggiunto grafico "Uscite mensili" in stile diagramma lineare.
- Il grafico confronta i periodi finanziari e si aggiorna automaticamente in base ai movimenti.
- Il periodo selezionato viene evidenziato nel grafico.

Aggiornamento v15:
- Aggiunto il grafico "Spesa per categoria" accanto a "Uscite mensili".
- Il grafico categorie mostra barre verticali basate sulle spese del periodo selezionato.
- I due grafici stanno affiancati su schermi larghi e uno sotto l'altro su mobile.

Aggiornamento v16:
- Grafici contenuti dentro la stessa larghezza della griglia superiore.
- Rimosso overflow orizzontale dei grafici.
- Uscite mensili e Spesa per categoria ora rispettano le proporzioni di Aggiungi movimento e Dashboard.

Aggiornamento v17:
- I 4 quadranti principali hanno la stessa altezza su desktop.
- Allineate le card di Aggiungi movimento, Dashboard, Uscite mensili e Spesa per categoria.

Aggiornamento v18:
- Rimossa l'altezza uguale forzata dei 4 quadranti.
- Le card tornano adattabili al contenuto, anche con altezze diverse.

Aggiornamento v19:
- Dashboard: sostituita media giornaliera con Media settimanale uscite basata su settimane lunedì-domenica.
- Mesi con iniziale maiuscola nei periodi finanziari.
- Movimenti nascosti di default, con pulsante Mostra/Nascondi e filtri sempre visibili.
- Budget: rinominate le card principali, rimosso Budget allocato.
- Budget: categorie rese più sintetiche e compatte.

Aggiornamento v20:
- Dashboard: "Entrate" rinominato in "Entrate Totali".
- Dashboard: "Uscite" rinominato in "Uscite Totali".
- Dashboard: aggiunto riquadro "Entrate Extra", visibile solo quando nel periodo ci sono entrate diverse da Stipendio.
- Le Entrate Extra sono incluse nelle Entrate Totali e quindi nel Saldo.

Aggiornamento v21:
- Titolo pagina aggiornato in "APP Tracking Spese Mensili" e centrato.
- Rimosso badge "27 → 26" in alto a destra.
- Nel Budget il dettaglio categorie è nascosto in una tendina apribile.
- Nella sezione Spese per categoria il dettaglio è nascosto in una tendina apribile.

Aggiornamento v22:
- Rinominati i pulsanti backup con testi più chiari.
- Aggiunte icone ai pulsanti: backup completo, backup mese finanziario, backup mesi e import backup precedente.

Aggiornamento v23:
- Allineato il pulsante/label "Importa Backup precedente" alla stessa altezza degli altri pulsanti backup.
- La sezione "Categorie" è stata rinominata in "Crea Categorie".
- Aggiunto il sottotitolo: "permette di creare le categorie per ogni entrata/uscita".

Aggiornamento v24:
- Aggiunto uno sfondo abstract leggero all'app.
- Card e barra backup rese leggermente traslucide per integrarsi con lo sfondo.

Aggiornamento v25:
- Le categorie vengono ordinate automaticamente in ordine alfabetico.
- L'ordine alfabetico vale nella tendina dei movimenti, nei filtri e nella sezione Crea Categorie.
- Anche dopo import backup le categorie vengono riordinate.

Aggiornamento v26:
- Le categorie restano ordinate alfabeticamente quando vengono create, mostrate nella tendina, nei filtri e in Crea Categorie.
- Nel Budget le categorie sono ordinate dalla più fuori budget alla meno fuori budget.
- In Spese per categoria il dettaglio e il grafico seguono lo stesso criterio: prima le categorie più fuori budget.

Aggiornamento v27:
- Nel grafico "Spesa per categoria" le barre diventano rosse se la categoria è fuori budget.
- Le barre restano verdi se la categoria è dentro budget.
- Il colore si aggiorna automaticamente in base a spese, entrate e percentuale budget della categoria.
- Aggiunta una piccola legenda nel grafico.

Rigenerato file v29 con icona moderna PWA/iPhone.

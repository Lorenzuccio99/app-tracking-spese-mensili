let movimenti = JSON.parse(localStorage.getItem("movimenti")) || [];

const categorieDefault = [
  { id: "cat_casa", nome: "Casa", tipo: "uscita", budgetPercent: 30 },
  { id: "cat_spesa", nome: "Spesa", tipo: "uscita", budgetPercent: 20 },
  { id: "cat_auto", nome: "Auto", tipo: "uscita", budgetPercent: 10 },
  { id: "cat_svago", nome: "Svago", tipo: "uscita", budgetPercent: 8 },
  { id: "cat_regalo", nome: "Regalo", tipo: "entrata", budgetPercent: 0 },
  { id: "cat_stipendio", nome: "Stipendio", tipo: "entrata", budgetPercent: 0 },
  { id: "cat_entrata", nome: "Entrata", tipo: "entrata", budgetPercent: 0 }
];

let categorie = JSON.parse(localStorage.getItem("categorie")) || categorieDefault;
let movimentoInModificaId = null;

categorie = categorie.map((categoria, index) => ({
  id: categoria.id || `cat_${Date.now()}_${index}`,
  nome: categoria.nome,
  tipo: categoria.tipo,
  budgetPercent: categoria.budgetPercent ?? 0
}));

movimenti = movimenti.map((movimento, index) => ({
  id: movimento.id || Date.now() + index,
  data: movimento.data,
  descrizione: movimento.descrizione,
  importo: Number(movimento.importo),
  tipo: movimento.tipo,
  categoria: movimento.categoria
}));


function ordinaCategorie() {
  categorie.sort((a, b) => {
    return a.nome.localeCompare(b.nome, "it", { sensitivity: "base" });
  });
}

ordinaCategorie();

const dataInput = document.getElementById("data");
const descrizioneInput = document.getElementById("descrizione");
const importoInput = document.getElementById("importo");
const tipoInput = document.getElementById("tipo");
const categoriaInput = document.getElementById("categoria");
const salvaBtn = document.getElementById("salva");
const annullaModificaBtn = document.getElementById("annullaModifica");

const nuovaCategoriaInput = document.getElementById("nuovaCategoria");
const tipoCategoriaInput = document.getElementById("tipoCategoria");
const aggiungiCategoriaBtn = document.getElementById("aggiungiCategoria");
const listaCategorie = document.getElementById("listaCategorie");

const periodoSelect = document.getElementById("periodo");
const rangePeriodo = document.getElementById("rangePeriodo");

const totEntrate = document.getElementById("totEntrate");
const totEntrateExtra = document.getElementById("totEntrateExtra");
const boxEntrateExtra = document.getElementById("boxEntrateExtra");
const totUscite = document.getElementById("totUscite");
const saldo = document.getElementById("saldo");
const giorniRimanenti = document.getElementById("giorniRimanenti");
const mediaGiornaliera = document.getElementById("mediaGiornaliera");
const proiezioneFinePeriodo = document.getElementById("proiezioneFinePeriodo");

const totPercentBudget = document.getElementById("totPercentBudget");
const budgetNonAllocato = document.getElementById("budgetNonAllocato");
const budgetEntrateBase = document.getElementById("budgetEntrateBase");
const budgetSpesoTotale = document.getElementById("budgetSpesoTotale");
const budgetResiduoTotale = document.getElementById("budgetResiduoTotale");
const listaBudget = document.getElementById("listaBudget");

const listaSpeseCategoria = document.getElementById("listaSpeseCategoria");
const graficoMensile = document.getElementById("graficoMensile");
const graficoCategorie = document.getElementById("graficoCategorie");

const cercaMovimentiInput = document.getElementById("cercaMovimenti");
const filtroTipoInput = document.getElementById("filtroTipo");
const filtroCategoriaInput = document.getElementById("filtroCategoria");
const ordinamentoMovimentiInput = document.getElementById("ordinamentoMovimenti");
const resetFiltriBtn = document.getElementById("resetFiltri");
const toggleMovimentiBtn = document.getElementById("toggleMovimenti");
const contenitoreMovimenti = document.getElementById("contenitoreMovimenti");
const listaMovimenti = document.getElementById("listaMovimenti");

const esportaJsonBtn = document.getElementById("esportaJson");
const esportaCsvBtn = document.getElementById("esportaCsv");
const esportaCsvPeriodoBtn = document.getElementById("esportaCsvPeriodo");
const importaJsonInput = document.getElementById("importaJson");

dataInput.valueAsDate = new Date();

function salvaMovimenti() {
  localStorage.setItem("movimenti", JSON.stringify(movimenti));
}

function salvaCategorie() {
  ordinaCategorie();
  localStorage.setItem("categorie", JSON.stringify(categorie));
}

function salvaTutto() {
  salvaMovimenti();
  salvaCategorie();
}

function formatEuro(valore) {
  return valore.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR"
  });
}

function formatDataIt(data) {
  return data.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function nomeMese(data) {
  const testo = data.toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric"
  });

  return testo.charAt(0).toUpperCase() + testo.slice(1);
}

function dateFromInput(dataString) {
  return new Date(dataString + "T12:00:00");
}

function getPeriodoFinanziario(dataString) {
  const data = dateFromInput(dataString);

  let start;
  let end;

  if (data.getDate() >= 27) {
    start = new Date(data.getFullYear(), data.getMonth(), 27, 12, 0, 0);
    end = new Date(data.getFullYear(), data.getMonth() + 1, 26, 12, 0, 0);
  } else {
    start = new Date(data.getFullYear(), data.getMonth() - 1, 27, 12, 0, 0);
    end = new Date(data.getFullYear(), data.getMonth(), 26, 12, 0, 0);
  }

  const keyYear = end.getFullYear();
  const keyMonth = String(end.getMonth() + 1).padStart(2, "0");
  const key = `${keyYear}-${keyMonth}`;

  const label = `${nomeMese(end)} (${formatDataIt(start)} - ${formatDataIt(end)})`;

  return {
    key,
    label,
    start,
    end
  };
}

function getPeriodoCorrente() {
  const oggi = new Date();
  const yyyy = oggi.getFullYear();
  const mm = String(oggi.getMonth() + 1).padStart(2, "0");
  const dd = String(oggi.getDate()).padStart(2, "0");

  return getPeriodoFinanziario(`${yyyy}-${mm}-${dd}`);
}


function getLunediSettimana(data) {
  const d = new Date(data.getFullYear(), data.getMonth(), data.getDate(), 12, 0, 0);
  const giorno = d.getDay();
  const diff = giorno === 0 ? -6 : 1 - giorno;
  d.setDate(d.getDate() + diff);
  return d;
}

function contaSettimaneLunDom(dataInizio, dataFine) {
  const msSettimana = 7 * 24 * 60 * 60 * 1000;
  const lunediInizio = getLunediSettimana(dataInizio);
  const lunediFine = getLunediSettimana(dataFine);
  return Math.max(Math.floor((lunediFine - lunediInizio) / msSettimana) + 1, 1);
}

function getPeriodiDisponibili() {
  const periodoCorrente = getPeriodoCorrente();
  const periodiMap = new Map();

  periodiMap.set(periodoCorrente.key, periodoCorrente);

  movimenti.forEach(m => {
    const periodo = getPeriodoFinanziario(m.data);
    periodiMap.set(periodo.key, periodo);
  });

  return Array.from(periodiMap.values()).sort((a, b) => b.key.localeCompare(a.key));
}

function aggiornaSelectPeriodi() {
  const periodi = getPeriodiDisponibili();
  const periodoCorrente = getPeriodoCorrente();
  const selectedBefore = periodoSelect.value;

  periodoSelect.innerHTML = "";

  periodi.forEach(periodo => {
    const option = document.createElement("option");
    option.value = periodo.key;
    option.textContent = periodo.label;
    periodoSelect.appendChild(option);
  });

  const keys = periodi.map(p => p.key);
  periodoSelect.value = keys.includes(selectedBefore) ? selectedBefore : periodoCorrente.key;
}

function getPeriodoSelezionatoInfo() {
  const periodi = getPeriodiDisponibili();
  return periodi.find(p => p.key === periodoSelect.value) || getPeriodoCorrente();
}

function getMovimentiPeriodo() {
  const periodoScelto = periodoSelect.value;

  return movimenti.filter(m => {
    return getPeriodoFinanziario(m.data).key === periodoScelto;
  });
}


function isEntrataExtra(movimento) {
  if (movimento.tipo !== "entrata") {
    return false;
  }

  return movimento.categoria.toLowerCase() !== "stipendio";
}

function aggiornaCategorieSelect() {
  const tipoScelto = tipoInput.value;
  const valoreAttuale = categoriaInput.value;

  const categorieFiltrate = categorie
    .filter(c => c.tipo === tipoScelto)
    .sort((a, b) => a.nome.localeCompare(b.nome, "it", { sensitivity: "base" }));

  categoriaInput.innerHTML = "";

  categorieFiltrate.forEach(categoria => {
    const option = document.createElement("option");
    option.value = categoria.nome;
    option.textContent = categoria.nome;
    categoriaInput.appendChild(option);
  });

  if (categorieFiltrate.some(c => c.nome === valoreAttuale)) {
    categoriaInput.value = valoreAttuale;
  }
}

function aggiornaFiltroCategorie() {
  const valoreAttuale = filtroCategoriaInput.value || "tutte";

  filtroCategoriaInput.innerHTML = "";

  const opzioneTutte = document.createElement("option");
  opzioneTutte.value = "tutte";
  opzioneTutte.textContent = "Tutte le categorie";
  filtroCategoriaInput.appendChild(opzioneTutte);

  categorie
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome, "it", { sensitivity: "base" }))
    .forEach(categoria => {
    const option = document.createElement("option");
    option.value = categoria.nome;
    option.textContent = categoria.nome;
    filtroCategoriaInput.appendChild(option);
  });

  filtroCategoriaInput.value = categorie.some(c => c.nome === valoreAttuale) ? valoreAttuale : "tutte";
}

function aggiornaListaCategorie() {
  listaCategorie.innerHTML = "";

  categorie
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome, "it", { sensitivity: "base" }))
    .forEach(categoria => {
    const li = document.createElement("li");
    li.className = "categoria-item";

    const info = document.createElement("div");

    if (categoria.tipo === "uscita") {
      info.innerHTML = `
        <strong>${categoria.nome}</strong><br>
        <span>${categoria.tipo}</span><br>
        <label>Budget max %</label>
        <input 
          type="number" 
          min="0" 
          max="100" 
          step="1" 
          value="${categoria.budgetPercent}" 
          class="input-budget"
          data-id="${categoria.id}"
        />
      `;
    } else {
      info.innerHTML = `
        <strong>${categoria.nome}</strong><br>
        <span>${categoria.tipo}</span>
      `;
    }

    const btnElimina = document.createElement("button");
    btnElimina.textContent = "Elimina";
    btnElimina.className = "btn-elimina";
    btnElimina.addEventListener("click", () => eliminaCategoria(categoria.id));

    li.appendChild(info);
    li.appendChild(btnElimina);
    listaCategorie.appendChild(li);
  });

  document.querySelectorAll(".input-budget").forEach(input => {
    input.addEventListener("change", event => {
      aggiornaBudgetCategoria(event.target.dataset.id, event.target.value);
    });
  });
}

function aggiornaBudgetCategoria(id, valore) {
  const percentuale = Number(valore);

  if (Number.isNaN(percentuale) || percentuale < 0 || percentuale > 100) {
    alert("Inserisci una percentuale tra 0 e 100.");
    aggiornaListaCategorie();
    return;
  }

  categorie = categorie.map(categoria => {
    if (categoria.id === id) {
      return {
        ...categoria,
        budgetPercent: percentuale
      };
    }

    return categoria;
  });

  salvaCategorie();
  aggiornaDashboard();
}

function aggiungiCategoria() {
  const nome = nuovaCategoriaInput.value.trim();
  const tipo = tipoCategoriaInput.value;

  if (!nome) {
    alert("Inserisci il nome della categoria.");
    return;
  }

  const esisteGia = categorie.some(c => {
    return c.nome.toLowerCase() === nome.toLowerCase() && c.tipo === tipo;
  });

  if (esisteGia) {
    alert("Questa categoria esiste già.");
    return;
  }

  const nuovaCategoria = {
    id: Date.now().toString(),
    nome,
    tipo,
    budgetPercent: 0
  };

  categorie.push(nuovaCategoria);
  salvaCategorie();

  nuovaCategoriaInput.value = "";

  aggiornaCategorieSelect();
  aggiornaFiltroCategorie();
  aggiornaListaCategorie();
  aggiornaDashboard();
}

function eliminaCategoria(id) {
  const categoria = categorie.find(c => c.id === id);

  if (!categoria) {
    return;
  }

  const categoriaUsata = movimenti.some(m => m.categoria === categoria.nome);

  if (categoriaUsata) {
    alert("Non puoi eliminare questa categoria perché è già stata usata in un movimento.");
    return;
  }

  const conferma = confirm(`Vuoi eliminare la categoria "${categoria.nome}"?`);

  if (!conferma) {
    return;
  }

  categorie = categorie.filter(c => c.id !== id);
  salvaCategorie();

  aggiornaCategorieSelect();
  aggiornaFiltroCategorie();
  aggiornaListaCategorie();
  aggiornaDashboard();
}

function aggiornaStatistichePeriodo(movimentiPeriodo, uscitePeriodo) {
  const periodo = getPeriodoSelezionatoInfo();
  const oggi = new Date();
  const oggiNoon = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate(), 12, 0, 0);
  const msGiorno = 24 * 60 * 60 * 1000;

  const giorniTotali = Math.round((periodo.end - periodo.start) / msGiorno) + 1;

  let giorniPassati;

  if (oggiNoon < periodo.start) {
    giorniPassati = 0;
  } else if (oggiNoon > periodo.end) {
    giorniPassati = giorniTotali;
  } else {
    giorniPassati = Math.round((oggiNoon - periodo.start) / msGiorno) + 1;
  }

  const rimanenti = Math.max(giorniTotali - giorniPassati, 0);
  const fineCalcolo = oggiNoon < periodo.start
    ? periodo.start
    : oggiNoon > periodo.end
      ? periodo.end
      : oggiNoon;

  const settimaneCalcolo = contaSettimaneLunDom(periodo.start, fineCalcolo);
  const mediaSettimanale = uscitePeriodo / settimaneCalcolo;

  const baseMediaGiornaliera = Math.max(giorniPassati, 1);
  const proiezione = (uscitePeriodo / baseMediaGiornaliera) * giorniTotali;

  giorniRimanenti.textContent = rimanenti;
  mediaGiornaliera.textContent = formatEuro(mediaSettimanale);
  proiezioneFinePeriodo.textContent = formatEuro(proiezione);
}
function aggiornaBudget(movimentiPeriodo, entratePeriodo) {
  listaBudget.innerHTML = "";

  const categorieUscita = categorie.filter(c => c.tipo === "uscita");

  const totalePercentuali = categorieUscita.reduce((tot, categoria) => {
    return tot + Number(categoria.budgetPercent || 0);
  }, 0);

  const nonAllocato = 100 - totalePercentuali;
  const budgetAllocato = entratePeriodo * totalePercentuali / 100;

  const spesoTotaleBudget = movimentiPeriodo
    .filter(m => m.tipo === "uscita")
    .reduce((tot, m) => tot + m.importo, 0);

  const residuoTotale = budgetAllocato - spesoTotaleBudget;

  budgetEntrateBase.textContent = formatEuro(entratePeriodo);
  budgetSpesoTotale.textContent = formatEuro(spesoTotaleBudget);
  budgetResiduoTotale.textContent = formatEuro(residuoTotale);

  budgetResiduoTotale.className = residuoTotale < 0 ? "numero-negativo" : "numero-positivo";

  totPercentBudget.textContent = `${totalePercentuali}%`;
  budgetNonAllocato.textContent = `${nonAllocato}%`;

  totPercentBudget.className = totalePercentuali > 100 ? "budget-warning" : "budget-ok";
  budgetNonAllocato.className = nonAllocato < 0 ? "budget-warning" : "budget-ok";

  if (categorieUscita.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "Nessuna categoria di uscita.";
    listaBudget.appendChild(li);
    return;
  }

  const categorieConBudget = categorieUscita
    .map(categoria => {
      const spesoCategoria = movimentiPeriodo
        .filter(m => m.tipo === "uscita" && m.categoria === categoria.nome)
        .reduce((tot, m) => tot + m.importo, 0);

      const budgetMassimo = entratePeriodo * Number(categoria.budgetPercent || 0) / 100;
      const residuo = budgetMassimo - spesoCategoria;
      const percentualeUso = budgetMassimo > 0
        ? Math.min(Math.round((spesoCategoria / budgetMassimo) * 100), 100)
        : spesoCategoria > 0 ? 100 : 0;

      return {
        nome: categoria.nome,
        budgetPercent: categoria.budgetPercent,
        spesoCategoria,
        budgetMassimo,
        residuo,
        percentualeUso
      };
    })
    .sort((a, b) => {
      // Ordine: prima le categorie più fuori budget.
      // Residuo più basso = situazione peggiore.
      if (a.residuo !== b.residuo) {
        return a.residuo - b.residuo;
      }

      // A parità di residuo, mostra prima quella con più spesa.
      return b.spesoCategoria - a.spesoCategoria;
    });

  categorieConBudget.forEach(voce => {
    const li = document.createElement("li");
    li.className = "budget-item budget-item-compatto";

    const stato = voce.residuo < 0 ? "Fuori budget" : "Ok";
    const statoClasse = voce.residuo < 0 ? "pill-danger" : "pill-ok";
    const barraClasse = voce.residuo < 0 ? "warning" : "";

    li.innerHTML = `
      <div class="budget-compact-head">
        <div>
          <strong>${voce.nome}</strong>
          <span>${voce.budgetPercent}% · max ${formatEuro(voce.budgetMassimo)}</span>
        </div>
        <span class="budget-pill ${statoClasse}">${stato}</span>
      </div>

      <div class="budget-compact-values">
        <span>Speso <strong class="budget-speso">${formatEuro(voce.spesoCategoria)}</strong></span>
        <span>Residuo <strong class="budget-residuo">${formatEuro(voce.residuo)}</strong></span>
      </div>

      <div class="barra budget-barra">
        <div class="barra-riempimento ${barraClasse}" style="width: ${voce.percentualeUso}%"></div>
      </div>
    `;

    if (voce.residuo < 0) {
      li.classList.add("budget-negativo");
    }

    listaBudget.appendChild(li);
  });
}
function aggiornaSpeseCategoria(movimentiPeriodo, uscitePeriodo) {
  listaSpeseCategoria.innerHTML = "";

  const categorieUscita = categorie.filter(c => c.tipo === "uscita");

  const entratePeriodo = movimentiPeriodo
    .filter(m => m.tipo === "entrata")
    .reduce((tot, m) => tot + m.importo, 0);

  const riepilogo = categorieUscita
    .map(categoria => {
      const totale = movimentiPeriodo
        .filter(m => m.tipo === "uscita" && m.categoria === categoria.nome)
        .reduce((tot, m) => tot + m.importo, 0);

      const budgetMassimo = entratePeriodo * Number(categoria.budgetPercent || 0) / 100;
      const residuo = budgetMassimo - totale;

      const percentualeUscite = uscitePeriodo > 0
        ? Math.round((totale / uscitePeriodo) * 100)
        : 0;

      const percentualeBudget = budgetMassimo > 0
        ? Math.min(Math.round((totale / budgetMassimo) * 100), 100)
        : totale > 0 ? 100 : 0;

      return {
        nome: categoria.nome,
        totale,
        budgetMassimo,
        residuo,
        percentualeUscite,
        percentualeBudget
      };
    })
    .filter(voce => voce.totale > 0)
    .sort((a, b) => {
      // Ordine: prima la categoria più fuori budget.
      // Se una categoria non è fuori budget, resta comunque ordinata
      // dalla più vicina al limite alla più tranquilla.
      if (a.residuo !== b.residuo) {
        return a.residuo - b.residuo;
      }

      return b.totale - a.totale;
    });

  if (riepilogo.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "Nessuna uscita nel periodo selezionato.";
    listaSpeseCategoria.appendChild(li);
    return;
  }

  riepilogo.forEach(voce => {
    const li = document.createElement("li");
    li.className = "spesa-categoria-item";

    const stato = voce.residuo < 0 ? "Fuori budget" : "Ok";
    const statoClasse = voce.residuo < 0 ? "pill-danger" : "pill-ok";

    li.innerHTML = `
      <div class="spesa-categoria-header">
        <div>
          <strong>${voce.nome}</strong><br>
          <span>${stato} · Residuo: ${formatEuro(voce.residuo)}</span>
        </div>
        <strong>${formatEuro(voce.totale)}</strong>
      </div>

      <div class="barra">
        <div class="barra-riempimento ${voce.residuo < 0 ? "warning" : ""}" style="width: ${voce.percentualeBudget}%"></div>
      </div>

      <span>${voce.percentualeUscite}% delle uscite · Budget max ${formatEuro(voce.budgetMassimo)}</span>
    `;

    listaSpeseCategoria.appendChild(li);
  });
}
function getMovimentiFiltrati(movimentiPeriodo) {
  const testo = cercaMovimentiInput.value.trim().toLowerCase();
  const tipo = filtroTipoInput.value;
  const categoria = filtroCategoriaInput.value;
  const ordinamento = ordinamentoMovimentiInput.value;

  let risultati = movimentiPeriodo.filter(m => {
    const matchTesto = !testo
      || m.descrizione.toLowerCase().includes(testo)
      || m.categoria.toLowerCase().includes(testo);

    const matchTipo = tipo === "tutti" || m.tipo === tipo;
    const matchCategoria = categoria === "tutte" || m.categoria === categoria;

    return matchTesto && matchTipo && matchCategoria;
  });

  risultati = risultati.slice().sort((a, b) => {
    if (ordinamento === "vecchi") {
      return a.data.localeCompare(b.data) || a.id - b.id;
    }

    if (ordinamento === "importo_desc") {
      return b.importo - a.importo;
    }

    if (ordinamento === "importo_asc") {
      return a.importo - b.importo;
    }

    return b.data.localeCompare(a.data) || b.id - a.id;
  });

  return risultati;
}


function aggiornaStatoListaMovimenti() {
  if (!contenitoreMovimenti || !toggleMovimentiBtn) {
    return;
  }

  const nascosta = contenitoreMovimenti.classList.contains("movimenti-collassati");
  toggleMovimentiBtn.textContent = nascosta ? "Mostra movimenti" : "Nascondi movimenti";
}

function aggiornaListaMovimenti(movimentiPeriodo) {
  listaMovimenti.innerHTML = "";

  const movimentiFiltrati = getMovimentiFiltrati(movimentiPeriodo);

  if (movimentiFiltrati.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "Nessun movimento trovato.";
    listaMovimenti.appendChild(li);
    return;
  }

  movimentiFiltrati.forEach(m => {
    const li = document.createElement("li");
    li.className = "movimento-item";

    const info = document.createElement("div");
    info.innerHTML = `
      <strong>${m.descrizione}</strong><br>
      <span>${m.data} · ${m.categoria} · ${m.tipo}</span><br>
      <strong>${formatEuro(m.importo)}</strong>
    `;

    const azioni = document.createElement("div");
    azioni.className = "azioni-movimento";

    const btnModifica = document.createElement("button");
    btnModifica.textContent = "Modifica";
    btnModifica.className = "btn-modifica";
    btnModifica.addEventListener("click", () => preparaModificaMovimento(m.id));

    const btnElimina = document.createElement("button");
    btnElimina.textContent = "Elimina";
    btnElimina.className = "btn-elimina";
    btnElimina.addEventListener("click", () => eliminaMovimento(m.id));

    azioni.appendChild(btnModifica);
    azioni.appendChild(btnElimina);

    li.appendChild(info);
    li.appendChild(azioni);
    listaMovimenti.appendChild(li);
  });
}


function formatMeseBreve(data) {
  return data
    .toLocaleDateString("it-IT", {
      month: "short",
      year: "2-digit"
    })
    .replace(".", "")
    .replace(" ", "-");
}

function calcolaScalaGrafico(valore) {
  if (valore <= 0) {
    return 100;
  }

  const target = valore * 1.1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(target)));
  const residual = target / magnitude;

  let nice;

  if (residual <= 1) {
    nice = 1;
  } else if (residual <= 2) {
    nice = 2;
  } else if (residual <= 5) {
    nice = 5;
  } else {
    nice = 10;
  }

  return nice * magnitude;
}

function getStoricoUsciteMensili() {
  const periodi = getPeriodiDisponibili()
    .slice()
    .sort((a, b) => a.key.localeCompare(b.key));

  const periodoSelezionato = getPeriodoSelezionatoInfo();

  let visibili = periodi;

  if (periodi.length > 10) {
    visibili = periodi.slice(-10);

    const presente = visibili.some(periodo => periodo.key === periodoSelezionato.key);

    if (!presente) {
      visibili[0] = periodoSelezionato;
      visibili = visibili
        .filter((periodo, index, array) => array.findIndex(p => p.key === periodo.key) === index)
        .sort((a, b) => a.key.localeCompare(b.key));
    }
  }

  return visibili.map(periodo => {
    const totaleUscite = movimenti
      .filter(m => getPeriodoFinanziario(m.data).key === periodo.key && m.tipo === "uscita")
      .reduce((tot, m) => tot + m.importo, 0);

    return {
      key: periodo.key,
      label: formatMeseBreve(periodo.end),
      totaleUscite
    };
  });
}

function aggiornaGraficoMensile() {
  if (!graficoMensile) {
    return;
  }

  const dati = getStoricoUsciteMensili();

  if (dati.length === 0) {
    graficoMensile.innerHTML = `
      <text x="50%" y="50%" text-anchor="middle" fill="#6b7280" font-size="18">
        Nessun dato disponibile
      </text>
    `;
    return;
  }

  const width = 760;
  const height = 320;
  const padding = { top: 20, right: 18, bottom: 56, left: 74 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...dati.map(d => d.totaleUscite), 0);
  const yMax = calcolaScalaGrafico(maxValue);
  const tickCount = 5;
  const step = yMax / tickCount;

  const currentKey = getPeriodoSelezionatoInfo().key;

  const yToCoord = valore => {
    const ratio = valore / yMax;
    return padding.top + innerHeight - ratio * innerHeight;
  };

  const xToCoord = index => {
    if (dati.length === 1) {
      return padding.left + innerWidth / 2;
    }
    return padding.left + (index * innerWidth) / (dati.length - 1);
  };

  const gridLines = Array.from({ length: tickCount + 1 }, (_, i) => {
    const value = step * i;
    const y = yToCoord(value);

    return `
      <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />
      <text x="${padding.left - 12}" y="${y + 4}" text-anchor="end" fill="#6b7280" font-size="12">${formatEuro(value)}</text>
    `;
  }).join("");

  const points = dati.map((d, index) => `${xToCoord(index)},${yToCoord(d.totaleUscite)}`).join(" ");

  const areaPath = (() => {
    const firstX = xToCoord(0);
    const lastX = xToCoord(dati.length - 1);
    const baseY = padding.top + innerHeight;

    const upper = dati.map((d, index) => `${xToCoord(index)} ${yToCoord(d.totaleUscite)}`).join(" L ");

    return `M ${firstX} ${baseY} L ${upper} L ${lastX} ${baseY} Z`;
  })();

  const circles = dati.map((d, index) => {
    const x = xToCoord(index);
    const y = yToCoord(d.totaleUscite);
    const isCurrent = d.key === currentKey;

    return `
      <circle cx="${x}" cy="${y}" r="${isCurrent ? 6 : 4}" fill="${isCurrent ? "#0f172a" : "#1d6f95"}" stroke="#ffffff" stroke-width="2" />
      <text x="${x}" y="${height - 18}" text-anchor="middle" fill="#6b7280" font-size="12">${d.label}</text>
    `;
  }).join("");

  graficoMensile.innerHTML = `
    ${gridLines}
    <path d="${areaPath}" fill="rgba(29, 111, 149, 0.10)"></path>
    <polyline points="${points}" fill="none" stroke="#1d6f95" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
    ${circles}
  `;
}



function dividiEtichetta(testo, maxParolePerRiga = 2) {
  const parole = String(testo).split(" ");
  const righe = [];

  for (let i = 0; i < parole.length; i += maxParolePerRiga) {
    righe.push(parole.slice(i, i + maxParolePerRiga).join(" "));
  }

  return righe.slice(0, 2);
}

function aggiornaGraficoCategorie() {
  if (!graficoCategorie) {
    return;
  }

  const movimentiPeriodo = getMovimentiPeriodo();

  const entratePeriodo = movimentiPeriodo
    .filter(m => m.tipo === "entrata")
    .reduce((tot, m) => tot + m.importo, 0);

  const dati = categorie
    .filter(categoria => categoria.tipo === "uscita")
    .map(categoria => {
      const totale = movimentiPeriodo
        .filter(m => m.tipo === "uscita" && m.categoria === categoria.nome)
        .reduce((tot, m) => tot + m.importo, 0);

      const budgetMassimo = entratePeriodo * Number(categoria.budgetPercent || 0) / 100;
      const residuo = budgetMassimo - totale;

      return {
        nome: categoria.nome,
        totale,
        residuo
      };
    })
    .filter(voce => voce.totale > 0)
    .sort((a, b) => {
      if (a.residuo !== b.residuo) {
        return a.residuo - b.residuo;
      }

      return b.totale - a.totale;
    });

  if (dati.length === 0) {
    graficoCategorie.innerHTML = `
      <text x="50%" y="50%" text-anchor="middle" fill="#6b7280" font-size="18">
        Nessuna spesa disponibile
      </text>
    `;
    return;
  }

  const width = 760;
  const height = 320;
  const padding = { top: 20, right: 16, bottom: 88, left: 74 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...dati.map(d => d.totale), 0);
  const yMax = calcolaScalaGrafico(maxValue);
  const tickCount = 5;
  const step = yMax / tickCount;

  const slotWidth = innerWidth / dati.length;
  const barWidth = Math.max(Math.min(slotWidth * 0.52, 42), 18);

  const yToCoord = valore => {
    const ratio = valore / yMax;
    return padding.top + innerHeight - ratio * innerHeight;
  };

  const gridLines = Array.from({ length: tickCount + 1 }, (_, i) => {
    const value = step * i;
    const y = yToCoord(value);

    return `
      <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />
      <text x="${padding.left - 12}" y="${y + 4}" text-anchor="end" fill="#6b7280" font-size="12">${formatEuro(value)}</text>
    `;
  }).join("");

  const bars = dati.map((d, index) => {
    const centerX = padding.left + slotWidth * index + slotWidth / 2;
    const x = centerX - barWidth / 2;
    const y = yToCoord(d.totale);
    const h = padding.top + innerHeight - y;
    const righe = dividiEtichetta(d.nome);
    const labelTspans = righe.map((riga, lineIndex) => {
      const dy = lineIndex === 0 ? "0" : "16";
      return `<tspan x="${centerX}" dy="${dy}">${riga}</tspan>`;
    }).join("");

    const coloreBarra = d.residuo < 0 ? "#991b1b" : "#166534";

    return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="3" fill="${coloreBarra}"></rect>
      <text x="${centerX}" y="${height - 42}" text-anchor="middle" fill="#6b7280" font-size="12">${labelTspans}</text>
    `;
  }).join("");

  const legenda = `
    <circle cx="${width - 210}" cy="18" r="5" fill="#166534"></circle>
    <text x="${width - 198}" y="22" fill="#6b7280" font-size="12">Dentro budget</text>
    <circle cx="${width - 102}" cy="18" r="5" fill="#991b1b"></circle>
    <text x="${width - 90}" y="22" fill="#6b7280" font-size="12">Fuori budget</text>
  `;

  graficoCategorie.innerHTML = `
    ${gridLines}
    ${bars}
    ${legenda}
  `;
}


function aggiornaDashboard() {
  aggiornaSelectPeriodi();

  const movimentiPeriodo = getMovimentiPeriodo();

  const entrate = movimentiPeriodo
    .filter(m => m.tipo === "entrata")
    .reduce((tot, m) => tot + m.importo, 0);

  const entrateExtra = movimentiPeriodo
    .filter(isEntrataExtra)
    .reduce((tot, m) => tot + m.importo, 0);

  const uscite = movimentiPeriodo
    .filter(m => m.tipo === "uscita")
    .reduce((tot, m) => tot + m.importo, 0);

  totEntrate.textContent = formatEuro(entrate);
  totEntrateExtra.textContent = formatEuro(entrateExtra);
  boxEntrateExtra.style.display = entrateExtra > 0 ? "block" : "none";
  totUscite.textContent = formatEuro(uscite);
  saldo.textContent = formatEuro(entrate - uscite);

  rangePeriodo.textContent = `Periodo selezionato: ${periodoSelect.options[periodoSelect.selectedIndex]?.textContent || ""}`;

  aggiornaStatistichePeriodo(movimentiPeriodo, uscite);
  aggiornaBudget(movimentiPeriodo, entrate);
  aggiornaSpeseCategoria(movimentiPeriodo, uscite);
  aggiornaGraficoMensile();
  aggiornaGraficoCategorie();
  aggiornaListaMovimenti(movimentiPeriodo);
}

function preparaModificaMovimento(id) {
  const movimento = movimenti.find(m => m.id === id);

  if (!movimento) {
    return;
  }

  movimentoInModificaId = id;

  dataInput.value = movimento.data;
  descrizioneInput.value = movimento.descrizione;
  importoInput.value = movimento.importo;
  tipoInput.value = movimento.tipo;

  aggiornaCategorieSelect();

  categoriaInput.value = movimento.categoria;

  salvaBtn.textContent = "Aggiorna movimento";
  annullaModificaBtn.style.display = "block";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function annullaModifica() {
  movimentoInModificaId = null;

  descrizioneInput.value = "";
  importoInput.value = "";
  dataInput.valueAsDate = new Date();
  tipoInput.value = "uscita";

  aggiornaCategorieSelect();

  salvaBtn.textContent = "Salva movimento";
  annullaModificaBtn.style.display = "none";
}

function eliminaMovimento(id) {
  const conferma = confirm("Vuoi eliminare questo movimento?");

  if (!conferma) {
    return;
  }

  movimenti = movimenti.filter(m => m.id !== id);
  salvaMovimenti();
  aggiornaDashboard();
}

function scaricaFile(nomeFile, contenuto, tipo) {
  const blob = new Blob([contenuto], { type: tipo });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = nomeFile;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function esportaBackupJson() {
  const backup = {
    nomeApp: "Spese 27",
    versione: 10,
    creatoIl: new Date().toISOString(),
    movimenti,
    categorie
  };

  const contenuto = JSON.stringify(backup, null, 2);
  const dataOggi = new Date().toISOString().slice(0, 10);

  scaricaFile(
    `backup-spese27-${dataOggi}.json`,
    contenuto,
    "application/json"
  );
}

function valoreCsv(valore) {
  const testo = String(valore ?? "");
  return `"${testo.replaceAll('"', '""')}"`;
}

function generaCsv(listaMovimentiDaEsportare) {
  const intestazione = [
    "Data",
    "Descrizione",
    "Importo",
    "Tipo",
    "Categoria",
    "Periodo finanziario"
  ];

  const righe = listaMovimentiDaEsportare.map(m => {
    const periodo = getPeriodoFinanziario(m.data);

    return [
      m.data,
      m.descrizione,
      String(m.importo).replace(".", ","),
      m.tipo,
      m.categoria,
      periodo.label
    ].map(valoreCsv).join(";");
  });

  return "\ufeffsep=;\n" + intestazione.join(";") + "\n" + righe.join("\n");
}

function esportaMovimentiCsvCompleto() {
  const contenuto = generaCsv(movimenti);
  const dataOggi = new Date().toISOString().slice(0, 10);

  scaricaFile(
    `movimenti-spese27-completo-${dataOggi}.csv`,
    contenuto,
    "text/csv;charset=utf-8"
  );
}

function esportaMovimentiCsvPeriodo() {
  const periodo = getPeriodoSelezionatoInfo();
  const contenuto = generaCsv(getMovimentiPeriodo());
  const dataOggi = new Date().toISOString().slice(0, 10);

  scaricaFile(
    `movimenti-spese27-${periodo.key}-${dataOggi}.csv`,
    contenuto,
    "text/csv;charset=utf-8"
  );
}

function importaBackupJson(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = e => {
    try {
      const backup = JSON.parse(e.target.result);

      if (!Array.isArray(backup.movimenti) || !Array.isArray(backup.categorie)) {
        alert("Backup non valido.");
        return;
      }

      const conferma = confirm(
        "Importando questo backup sostituirai i dati attuali. Vuoi continuare?"
      );

      if (!conferma) {
        return;
      }

      movimenti = backup.movimenti.map((movimento, index) => ({
        id: movimento.id || Date.now() + index,
        data: movimento.data,
        descrizione: movimento.descrizione,
        importo: Number(movimento.importo),
        tipo: movimento.tipo,
        categoria: movimento.categoria
      }));

      categorie = backup.categorie.map((categoria, index) => ({
        id: categoria.id || `cat_${Date.now()}_${index}`,
        nome: categoria.nome,
        tipo: categoria.tipo,
        budgetPercent: categoria.budgetPercent ?? 0
      }));

      ordinaCategorie();
      salvaTutto();

      aggiornaCategorieSelect();
      aggiornaFiltroCategorie();
      aggiornaListaCategorie();
      aggiornaDashboard();

      alert("Backup importato correttamente.");
    } catch (errore) {
      alert("Errore durante l'importazione del backup.");
    } finally {
      importaJsonInput.value = "";
    }
  };

  reader.readAsText(file);
}

salvaBtn.addEventListener("click", () => {
  const datiMovimento = {
    data: dataInput.value,
    descrizione: descrizioneInput.value.trim(),
    importo: Number(importoInput.value),
    tipo: tipoInput.value,
    categoria: categoriaInput.value
  };

  if (!datiMovimento.data || datiMovimento.importo <= 0) {
    alert("Compila data e importo. L'importo deve essere maggiore di zero.");
    return;
  }

  if (!datiMovimento.descrizione) {
    datiMovimento.descrizione = "Movimento";
  }

  if (!datiMovimento.categoria) {
    alert("Seleziona una categoria.");
    return;
  }

  if (movimentoInModificaId) {
    movimenti = movimenti.map(movimento => {
      if (movimento.id === movimentoInModificaId) {
        return {
          ...movimento,
          ...datiMovimento
        };
      }

      return movimento;
    });

    movimentoInModificaId = null;
    salvaBtn.textContent = "Salva movimento";
    annullaModificaBtn.style.display = "none";
  } else {
    const nuovoMovimento = {
      id: Date.now(),
      ...datiMovimento
    };

    movimenti.push(nuovoMovimento);
  }

  salvaMovimenti();

  aggiornaSelectPeriodi();
  periodoSelect.value = getPeriodoFinanziario(datiMovimento.data).key;
  aggiornaDashboard();

  descrizioneInput.value = "";
  importoInput.value = "";
  dataInput.valueAsDate = new Date();
});

tipoInput.addEventListener("change", aggiornaCategorieSelect);
aggiungiCategoriaBtn.addEventListener("click", aggiungiCategoria);
periodoSelect.addEventListener("change", aggiornaDashboard);

annullaModificaBtn.addEventListener("click", annullaModifica);

cercaMovimentiInput.addEventListener("input", aggiornaDashboard);
filtroTipoInput.addEventListener("change", aggiornaDashboard);
filtroCategoriaInput.addEventListener("change", aggiornaDashboard);
ordinamentoMovimentiInput.addEventListener("change", aggiornaDashboard);

resetFiltriBtn.addEventListener("click", () => {
  cercaMovimentiInput.value = "";
  filtroTipoInput.value = "tutti";
  filtroCategoriaInput.value = "tutte";
  ordinamentoMovimentiInput.value = "recenti";
  aggiornaDashboard();
});

toggleMovimentiBtn.addEventListener("click", () => {
  contenitoreMovimenti.classList.toggle("movimenti-collassati");
  aggiornaStatoListaMovimenti();
});

esportaJsonBtn.addEventListener("click", esportaBackupJson);
esportaCsvBtn.addEventListener("click", esportaMovimentiCsvCompleto);
esportaCsvPeriodoBtn.addEventListener("click", esportaMovimentiCsvPeriodo);
importaJsonInput.addEventListener("change", importaBackupJson);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}

salvaTutto();
aggiornaCategorieSelect();
aggiornaFiltroCategorie();
aggiornaListaCategorie();
aggiornaStatoListaMovimenti();
aggiornaDashboard();

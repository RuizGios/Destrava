/* ============================================================
   Destrava - logica do aplicativo
   Organizado em blocos. Procure o bloco pelo titulo em maiusculo.
   ============================================================ */

/* ---------- ATALHOS ---------- */
const $  = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => Array.from(raiz.querySelectorAll(sel));
const dinheiro = (v) => "R$ " + v.toFixed(2).replace(".", ",");

/* ---------- ESTADO ---------- */
/* Tudo que o usuario escolheu durante a navegacao fica aqui. */
const estado = {
  dificuldade: null,
  cidade: "Limeira, SP",
  carro: "aluno",
  filtros: new Set(),
  instrutor: null,
  agendamento: { data: null, hora: null, carro: "aluno", local: "", contato: "", gravar: false },
  aulaAtiva: null,
  telaAnterior: "home"
};

/* ---------- ARMAZENAMENTO ---------- */
/* localStorage pode falhar em aba anonima, entao tudo vai dentro de try. */
const Armazem = {
  ler(chave, padrao) {
    try {
      const bruto = localStorage.getItem("destrava:" + chave);
      return bruto ? JSON.parse(bruto) : padrao;
    } catch (e) { return padrao; }
  },
  gravar(chave, valor) {
    try { localStorage.setItem("destrava:" + chave, JSON.stringify(valor)); }
    catch (e) { /* sem armazenamento, o app continua funcionando na sessao */ }
  }
};

let aulas = Armazem.ler("aulas", []);

/* ---------- NAVEGACAO ---------- */
function irPara(tela) {
  $$(".screen").forEach(s => s.classList.remove("is-active"));
  const alvo = $("#screen-" + tela);
  if (alvo) {
    alvo.classList.add("is-active");
    const area = alvo.querySelector(".content, .live-body");
    if (area) area.scrollTop = 0;
  }
  // a barra de abas some nas telas de fluxo
  const comAbas = ["home", "lessons"];
  $("#tabbar").classList.toggle("is-hidden", !comAbas.includes(tela));
  $$(".tab").forEach(t => t.classList.toggle("is-on", t.dataset.tab === tela));
  if (tela === "lessons") desenharAulas();
}

function aviso(texto) {
  const t = $("#toast");
  t.textContent = texto;
  t.classList.add("is-on");
  clearTimeout(aviso._tempo);
  aviso._tempo = setTimeout(() => t.classList.remove("is-on"), 3200);
}

/* ============================================================
   TELA 1 - INICIO E BUSCA
   ============================================================ */
function montarInicio() {
  const area = $("#home-difficulties");
  area.innerHTML = "";
  DIFICULDADES.forEach(d => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = d;
    b.addEventListener("click", () => {
      estado.dificuldade = (estado.dificuldade === d) ? null : d;
      $$(".chip", area).forEach(c => c.classList.toggle("is-on", c.textContent === estado.dificuldade));
    });
    area.appendChild(b);
  });

  $("#home-city").addEventListener("change", e => { estado.cidade = e.target.value; });

  $$("#home-car .option").forEach(op => {
    op.addEventListener("click", () => {
      estado.carro = op.dataset.car;
      $$("#home-car .option").forEach(o => o.classList.toggle("is-on", o === op));
    });
  });

  $("#home-search").addEventListener("click", () => {
    if (!estado.dificuldade) { aviso("Escolha com o que você tem dificuldade."); return; }
    estado.agendamento.carro = estado.carro;
    montarLista();
    irPara("list");
  });
}

/* ============================================================
   TELA 2 - LISTA DE INSTRUTORES
   ============================================================ */
function precoDe(instrutor, tipoCarro) {
  return tipoCarro === "aluno" ? instrutor.preco - PRECOS.descontoCarroAluno : instrutor.preco;
}

function filtrarInstrutores() {
  return INSTRUTORES.filter(i => {
    if (i.cidade !== estado.cidade) return false;
    if (estado.dificuldade && !i.especialidades.includes(estado.dificuldade)) return false;
    if (estado.filtros.has("mulher") && i.genero !== "f") return false;
    if (estado.filtros.has("automatico") && !i.cambio.toLowerCase().includes("automático")) return false;
    if (estado.filtros.has("nota") && i.nota < 4.5) return false;
    if (estado.filtros.has("preco") && precoDe(i, estado.carro) > 80) return false;
    return true;
  }).sort((a, b) => b.nota - a.nota);
}

function montarLista() {
  $("#list-title").textContent = estado.dificuldade ? "Para " + estado.dificuldade.toLowerCase() : "Instrutores";
  const achados = filtrarInstrutores();
  const alvo = $("#list-results");
  alvo.innerHTML = "";

  $("#list-count").textContent = achados.length === 0
    ? ""
    : achados.length + (achados.length === 1 ? " instrutor disponível em " : " instrutores disponíveis em ") + estado.cidade;

  if (achados.length === 0) {
    alvo.innerHTML = '<div class="empty">Nenhum instrutor com esse perfil nesta cidade.<br>Tente remover um filtro ou trocar a dificuldade.</div>';
    return;
  }

  achados.forEach(i => {
    const preco = precoDe(i, estado.carro);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.innerHTML = `
      <div class="card-row">
        <div class="avatar">${i.iniciais}</div>
        <div>
          <div class="card-name">${i.nome}</div>
          <div class="card-sub">${i.especialidades.slice(0, 3).join(", ")}</div>
          <div class="card-rate"><b>&#9733; ${i.nota.toFixed(1).replace(".", ",")}</b> &middot; ${i.aulas} aulas &middot; ${i.bairro}</div>
        </div>
        <div class="card-price"><b>${dinheiro(preco)}</b><span>por aula</span></div>
      </div>
      <div class="seals">
        <span class="seal">Detran verificado</span>
        <span class="seal">Antecedentes ok</span>
        ${i.soMulheres ? '<span class="seal">Atende só mulheres</span>' : ""}
        <span class="seal seal--grey">${i.cambio}</span>
      </div>`;
    card.addEventListener("click", () => { abrirPerfil(i); });
    alvo.appendChild(card);
  });
}

function montarFiltros() {
  $$("#list-filters .fchip").forEach(f => {
    f.addEventListener("click", () => {
      const nome = f.dataset.filter;
      if (estado.filtros.has(nome)) estado.filtros.delete(nome); else estado.filtros.add(nome);
      f.classList.toggle("is-on");
      montarLista();
    });
  });
}

/* ============================================================
   TELA 3 - PERFIL DO INSTRUTOR
   ============================================================ */
function abrirPerfil(instrutor) {
  estado.instrutor = instrutor;
  const preco = precoDe(instrutor, estado.carro);

  $("#profile-content").innerHTML = `
    <div class="hero">
      <div class="avatar avatar--lg">${instrutor.iniciais}</div>
      <div class="card-name">${instrutor.nome}</div>
      <div class="card-sub">Instrutor credenciado &middot; ${instrutor.bairro}, ${instrutor.cidade}</div>
      <div class="card-rate"><b>&#9733; ${instrutor.nota.toFixed(1).replace(".", ",")}</b> &middot; ${instrutor.aulas} aulas &middot; ${instrutor.anos} anos de experiência</div>
    </div>

    <div class="section-label">Verificações</div>
    <div class="check-line"><span class="tick">&#10003;</span><span>Credencial de instrutor do Detran</span></div>
    <div class="check-line"><span class="tick">&#10003;</span><span>Certidão de antecedentes criminais negativa</span></div>
    <div class="check-line"><span class="tick">&#10003;</span><span>CNH e documento do veículo conferidos</span></div>

    <div class="section-label">Sobre</div>
    <p style="font-size:13.5px;line-height:1.55;">${instrutor.bio}</p>

    <div class="section-label">Especialidades</div>
    <div class="chips">${instrutor.especialidades.map(e => `<span class="chip">${e}</span>`).join("")}</div>

    <div class="section-label">Carro</div>
    <p style="font-size:13.5px;">${instrutor.carro} &middot; ${instrutor.cambio}</p>

    <div class="section-label">Avaliações</div>
    ${instrutor.avaliacoes.map(a => `
      <div class="quote">${a.texto}<cite>${a.autor} &middot; &#9733; ${a.nota.toFixed(1).replace(".", ",")}</cite></div>`).join("")}

    <button class="btn btn--block" id="profile-book" type="button">Agendar aula &middot; ${dinheiro(preco)}</button>
    <p class="note">O preço muda conforme o carro usado na aula. Você escolhe no próximo passo.</p>`;

  $("#profile-book").addEventListener("click", () => { montarAgendamento(); irPara("booking"); });
  irPara("profile");
}

/* ============================================================
   TELA 4 - AGENDAMENTO
   ============================================================ */
const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const HORARIOS = ["08:00", "09:30", "11:00", "14:00", "16:30", "18:00"];

function proximasDatas(quantidade) {
  const lista = [];
  for (let n = 1; n <= quantidade; n++) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    lista.push({
      iso: d.toISOString().slice(0, 10),
      dia: d.getDate(),
      semana: DIAS_SEMANA[d.getDay()],
      rotulo: d.getDate() + "/" + String(d.getMonth() + 1).padStart(2, "0")
    });
  }
  return lista;
}

function montarAgendamento() {
  const instrutor = estado.instrutor;
  $("#booking-title").textContent = "Agendar com " + instrutor.nome.split(" ")[0];
  estado.agendamento.data = null;
  estado.agendamento.hora = null;

  // datas
  const areaData = $("#booking-dates");
  areaData.innerHTML = "";
  proximasDatas(5).forEach(d => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "slot";
    b.innerHTML = `${d.rotulo}<small>${d.semana}</small>`;
    b.addEventListener("click", () => {
      estado.agendamento.data = d;
      $$(".slot", areaData).forEach(s => s.classList.toggle("is-on", s === b));
      atualizarResumo();
    });
    areaData.appendChild(b);
  });

  // horarios
  const areaHora = $("#booking-times");
  areaHora.innerHTML = "";
  HORARIOS.forEach(h => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "slot";
    b.textContent = h;
    b.addEventListener("click", () => {
      estado.agendamento.hora = h;
      $$(".slot", areaHora).forEach(s => s.classList.toggle("is-on", s === b));
      atualizarResumo();
    });
    areaHora.appendChild(b);
  });

  // carro
  const areaCarro = $("#booking-car");
  areaCarro.innerHTML = "";
  const opcoes = [
    { id: "aluno", titulo: "Meu carro", desc: "Você dirige o carro que já conhece", valor: instrutor.preco - PRECOS.descontoCarroAluno },
    { id: "instrutor", titulo: "Carro do instrutor", desc: instrutor.carro, valor: instrutor.preco }
  ];
  opcoes.forEach(op => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "option" + (op.id === estado.agendamento.carro ? " is-on" : "");
    b.innerHTML = `
      <span class="radio"></span>
      <span class="option-text"><b>${op.titulo}</b><small>${op.desc}</small></span>
      <span class="price-tag">${dinheiro(op.valor)}</span>`;
    b.addEventListener("click", () => {
      estado.agendamento.carro = op.id;
      $$(".option", areaCarro).forEach(o => o.classList.toggle("is-on", o === b));
      atualizarResumo();
    });
    areaCarro.appendChild(b);
  });

  atualizarResumo();
}

function atualizarResumo() {
  const valor = precoDe(estado.instrutor, estado.agendamento.carro);
  const total = valor + PRECOS.taxaSeguranca;
  $("#booking-summary").innerHTML = `
    <div class="summary-line"><span>Aula de 1 hora</span><span>${dinheiro(valor)}</span></div>
    <div class="summary-line"><span>Taxa de segurança</span><span>${dinheiro(PRECOS.taxaSeguranca)}</span></div>
    <div class="summary-line summary-line--total"><span>Total</span><span>${dinheiro(total)}</span></div>`;
}

function confirmarAgendamento() {
  const a = estado.agendamento;
  if (!a.data) { aviso("Escolha uma data."); return; }
  if (!a.hora) { aviso("Escolha um horário."); return; }

  a.local   = $("#booking-place").value.trim();
  a.contato = $("#booking-contact").value.trim();
  a.gravar  = $("#booking-record").checked;

  if (!a.local) { aviso("Informe o ponto de encontro."); return; }

  const valor = precoDe(estado.instrutor, a.carro);
  const aula = {
    id: "a" + Date.now(),
    instrutorId: estado.instrutor.id,
    instrutorNome: estado.instrutor.nome,
    iniciais: estado.instrutor.iniciais,
    dificuldade: estado.dificuldade,
    dataIso: a.data.iso,
    dataRotulo: a.data.rotulo,
    semana: a.data.semana,
    hora: a.hora,
    carro: a.carro,
    local: a.local,
    contato: a.contato,
    gravar: a.gravar,
    valor: valor,
    total: valor + PRECOS.taxaSeguranca,
    status: "agendada",
    nota: null
  };

  aulas.unshift(aula);
  Armazem.gravar("aulas", aulas);

  $("#done-content").innerHTML = `
    <div class="big-check">&#10003;</div>
    <div class="done-title">Aula agendada</div>
    <p class="done-text">
      ${aula.instrutorNome} vai te encontrar em ${aula.local},<br>
      ${aula.semana} ${aula.dataRotulo} às ${aula.hora}.<br><br>
      ${aula.contato ? "Avisamos " + aula.contato.split(" ")[0] + " quando a aula começar." : "Você ainda pode indicar um contato de confiança nas suas aulas."}
    </p>
    <button class="btn btn--block" id="done-lessons" type="button">Ver minhas aulas</button>
    <button class="btn btn--ghost btn--block btn--sm" id="done-home" type="button">Voltar ao início</button>`;

  $("#done-lessons").addEventListener("click", () => irPara("lessons"));
  $("#done-home").addEventListener("click", () => irPara("home"));
  irPara("done");
}

/* ============================================================
   TELA 5 - MINHAS AULAS
   ============================================================ */
function desenharAulas() {
  const alvo = $("#lessons-content");
  if (aulas.length === 0) {
    alvo.innerHTML = '<div class="empty">Você ainda não tem aulas marcadas.<br>Escolha uma dificuldade na aba Buscar para começar.</div>';
    return;
  }

  alvo.innerHTML = aulas.map(a => {
    const concluida = a.status === "concluida";
    return `
      <div class="lesson" data-aula="${a.id}">
        <div class="lesson-top">
          <div class="avatar">${a.iniciais}</div>
          <div>
            <div class="card-name">${a.instrutorNome}</div>
            <div class="lesson-when">${a.semana} ${a.dataRotulo} às ${a.hora} &middot; ${dinheiro(a.total)}</div>
            <div class="lesson-when">${a.local}</div>
          </div>
          <span class="badge ${concluida ? "badge--done" : ""}">${concluida ? "Concluída" : "Agendada"}</span>
        </div>
        <div class="lesson-actions">
          ${concluida
            ? (a.nota
                ? `<span class="card-rate"><b>&#9733; ${a.nota},0</b> avaliada por você</span>`
                : `<button class="btn btn--ghost btn--sm" data-acao="avaliar" data-aula="${a.id}" type="button">Avaliar aula</button>`)
            : `<button class="btn btn--sm" data-acao="iniciar" data-aula="${a.id}" type="button">Iniciar aula</button>
               <button class="btn btn--ghost btn--sm" data-acao="cancelar" data-aula="${a.id}" type="button">Cancelar</button>`}
        </div>
      </div>`;
  }).join("");

  $$("[data-acao]", alvo).forEach(b => {
    b.addEventListener("click", () => {
      const aula = aulas.find(x => x.id === b.dataset.aula);
      if (b.dataset.acao === "iniciar") iniciarAula(aula);
      if (b.dataset.acao === "avaliar") abrirAvaliacao(aula);
      if (b.dataset.acao === "cancelar") {
        aulas = aulas.filter(x => x.id !== aula.id);
        Armazem.gravar("aulas", aulas);
        desenharAulas();
        aviso("Aula cancelada.");
      }
    });
  });
}

/* ============================================================
   TELA 6 - AULA EM ANDAMENTO (mapa e GPS)

   O mapa tem duas versoes. Se o Leaflet carregar, usa mapa de rua
   de verdade. Se a internet falhar, cai num mapa simples desenhado
   na propria pagina, para a demonstracao nunca quebrar.
   ============================================================ */
let relogio = null, vigiaGps = null, passoDemo = 0;
let pontos = [];

/* ----- versao com Leaflet ----- */
const MapaReal = {
  mapa: null, marcador: null, traco: null,
  disponivel() {
    if (typeof L === "undefined") return false;
    // o Leaflet so funciona com o CSS dele junto. Se o CSS nao carregou,
    // o mapa sairia todo torto, entao e melhor usar o mapa de reserva.
    const teste = document.createElement("div");
    teste.className = "leaflet-container";
    teste.style.cssText = "position:absolute;visibility:hidden";
    document.body.appendChild(teste);
    const temCss = getComputedStyle(teste).overflow === "hidden";
    teste.remove();
    return temCss;
  },
  criar() {
    if (this.mapa) return;
    this.mapa = L.map("map", { zoomControl: false, attributionControl: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(this.mapa);
    this.traco = L.polyline([], { color: "#0E6B5C", weight: 5, opacity: .9 }).addTo(this.mapa);
    this.marcador = L.circleMarker([0, 0], {
      radius: 9, color: "#fff", weight: 3, fillColor: "#0E6B5C", fillOpacity: 1
    }).addTo(this.mapa);
  },
  reiniciar(coord) {
    this.criar();
    setTimeout(() => this.mapa.invalidateSize(), 120);
    this.traco.setLatLngs([]);
    this.mapa.setView(coord, 16);
    this.marcador.setLatLng(coord);
  },
  desenhar(lista) {
    const ultimo = lista[lista.length - 1];
    this.traco.setLatLngs(lista);
    this.marcador.setLatLng(ultimo);
    this.mapa.panTo(ultimo, { animate: true });
  }
};

/* ----- versao de reserva, sem internet ----- */
const MapaSimples = {
  area: null,
  limites: null,
  criar() {
    this.area = $("#map");
    this.area.innerHTML = `
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block;background:#E8EDEC">
        <g stroke="#D3DAD8" stroke-width="14" fill="none">
          <path d="M-10 80 H410"/><path d="M-10 200 H410"/>
          <path d="M90 -10 V310"/><path d="M280 -10 V310"/>
        </g>
        <g fill="#DCE3E1">
          <rect x="110" y="100" width="64" height="48" rx="3"/>
          <rect x="196" y="100" width="62" height="48" rx="3"/>
          <rect x="110" y="218" width="58" height="52" rx="3"/>
          <rect x="300" y="100" width="64" height="48" rx="3"/>
        </g>
        <polyline id="mini-traco" fill="none" stroke="#0E6B5C" stroke-width="6"
                  stroke-linecap="round" stroke-linejoin="round" points=""/>
        <circle id="mini-ponto" r="8" fill="#0E6B5C" stroke="#fff" stroke-width="3" cx="-50" cy="-50"/>
      </svg>`;
  },
  reiniciar() {
    this.criar();
    // os limites vem da rota de demonstracao, com uma folga nas bordas
    const lats = ROTA_DEMO.map(p => p[0]), lngs = ROTA_DEMO.map(p => p[1]);
    this.limites = {
      latMin: Math.min(...lats), latMax: Math.max(...lats),
      lngMin: Math.min(...lngs), lngMax: Math.max(...lngs)
    };
  },
  projetar(coord) {
    const l = this.limites;
    const x = 40 + ((coord[1] - l.lngMin) / ((l.lngMax - l.lngMin) || 1)) * 320;
    const y = 260 - ((coord[0] - l.latMin) / ((l.latMax - l.latMin) || 1)) * 220;
    return [x, y];
  },
  desenhar(lista) {
    const pares = lista.map(c => this.projetar(c));
    const linha = $("#mini-traco"), ponto = $("#mini-ponto");
    if (!linha || !ponto) return;
    linha.setAttribute("points", pares.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" "));
    const u = pares[pares.length - 1];
    ponto.setAttribute("cx", u[0].toFixed(1));
    ponto.setAttribute("cy", u[1].toFixed(1));
  }
};

let Mapa = null;

function iniciarAula(aula) {
  estado.aulaAtiva = aula;
  irPara("live");

  $("#live-title").textContent = "Aula com " + aula.instrutorNome;
  $("#live-note").textContent = "O trajeto fica registrado. Se a aula sair muito da região combinada, o app avisa você e seu contato de confiança.";
  pontos = [];
  passoDemo = 0;
  const inicio = Date.now();

  Mapa = MapaReal.disponivel() ? MapaReal : MapaSimples;
  Mapa.reiniciar(ROTA_DEMO[0]);

  // cronometro
  clearInterval(relogio);
  const carro = aula.carro === "aluno" ? "no seu carro" : "no carro do instrutor";
  $("#live-meta").textContent = `Iniciada às ${aula.hora} · 0 min decorridos · ${carro}`;
  relogio = setInterval(() => {
    const min = Math.floor((Date.now() - inicio) / 60000);
    $("#live-meta").textContent = `Iniciada às ${aula.hora} · ${min} min decorridos · ${carro}`;
  }, 1000);

  // GPS de verdade, com simulacao como reserva
  if (navigator.geolocation) {
    vigiaGps = navigator.geolocation.watchPosition(
      p => {
        $("#live-gps-label").textContent = "Localização ao vivo";
        moverPara([p.coords.latitude, p.coords.longitude]);
      },
      () => {
        $("#live-gps-label").textContent = "Modo demonstração";
        simularTrajeto();
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 }
    );
  } else {
    $("#live-gps-label").textContent = "Modo demonstração";
    simularTrajeto();
  }
}

function moverPara(coord) {
  pontos.push(coord);
  Mapa.desenhar(pontos);
}

function simularTrajeto() {
  clearInterval(simularTrajeto._t);
  moverPara(ROTA_DEMO[passoDemo++]);
  simularTrajeto._t = setInterval(() => {
    if (passoDemo >= ROTA_DEMO.length) { clearInterval(simularTrajeto._t); return; }
    moverPara(ROTA_DEMO[passoDemo++]);
  }, 2200);
}

function pararRastreio() {
  if (vigiaGps !== null && navigator.geolocation) navigator.geolocation.clearWatch(vigiaGps);
  vigiaGps = null;
  clearInterval(relogio);
  clearInterval(simularTrajeto._t);
}

function posicaoAtualTexto() {
  const p = pontos.length ? pontos[pontos.length - 1] : ROTA_DEMO[0];
  return `https://www.google.com/maps?q=${p[0].toFixed(5)},${p[1].toFixed(5)}`;
}

function montarAulaAoVivo() {
  $("#live-share").addEventListener("click", async () => {
    const aula = estado.aulaAtiva;
    const texto = `Estou em aula de direção com ${aula.instrutorNome}. Acompanhe por aqui: ${posicaoAtualTexto()}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Destrava", text: texto }); return; } catch (e) { /* cancelado */ }
    }
    try { await navigator.clipboard.writeText(texto); aviso("Link copiado. Envie para seu contato de confiança."); }
    catch (e) { aviso("Link da localização: " + posicaoAtualTexto()); }
  });

  $("#live-sos").addEventListener("click", () => {
    const aula = estado.aulaAtiva;
    const texto = `EMERGÊNCIA. Estou em aula com ${aula.instrutorNome}. Minha localização: ${posicaoAtualTexto()}`;
    if (navigator.share) { navigator.share({ title: "Emergência Destrava", text: texto }).catch(() => {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(texto).catch(() => {}); }
    $("#live-note").innerHTML = "<b>Alerta enviado.</b> Seu contato de confiança e nossa equipe receberam sua localização. Mantenha o aplicativo aberto.";
    aviso("Alerta de emergência disparado.");
  });

  $("#live-finish").addEventListener("click", () => {
    pararRastreio();
    const aula = estado.aulaAtiva;
    aula.status = "concluida";
    Armazem.gravar("aulas", aulas);
    abrirAvaliacao(aula);
  });
}

/* ============================================================
   TELA 7 - AVALIACAO
   ============================================================ */
const PONTOS_POSITIVOS = ["Me deixou calmo", "Explicou bem", "Pontual", "Carro em ordem", "Teve paciência", "Respeitou meu ritmo"];

function abrirAvaliacao(aula) {
  let nota = 0;
  const marcados = new Set();

  $("#rate-content").innerHTML = `
    <div style="text-align:center;margin-top:10px;">
      <div class="avatar avatar--lg">${aula.iniciais}</div>
      <div class="card-name" style="font-size:18px;">${aula.instrutorNome}</div>
      <div class="card-sub">${aula.semana} ${aula.dataRotulo} &middot; 1 hora</div>
    </div>
    <div class="stars" id="rate-stars"></div>
    <div style="text-align:center;font-size:12.5px;color:var(--muted);">Toque para avaliar</div>

    <div class="section-label">O que funcionou bem</div>
    <div class="chips" id="rate-chips"></div>

    <div class="section-label">Comentário</div>
    <textarea class="textarea" id="rate-text" placeholder="Conte como foi, para ajudar outros alunos a escolherem."></textarea>

    <button class="btn btn--block" id="rate-send" type="button">Enviar avaliação</button>
    <button class="btn btn--text" id="rate-report" type="button">Denunciar algo que aconteceu na aula</button>`;

  const areaEstrelas = $("#rate-stars");
  for (let n = 1; n <= 5; n++) {
    const s = document.createElement("button");
    s.type = "button";
    s.className = "star";
    s.textContent = "★";
    s.addEventListener("click", () => {
      nota = n;
      $$(".star", areaEstrelas).forEach((e, i) => e.classList.toggle("is-on", i < n));
    });
    areaEstrelas.appendChild(s);
  }

  const areaChips = $("#rate-chips");
  PONTOS_POSITIVOS.forEach(p => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = p;
    b.addEventListener("click", () => {
      if (marcados.has(p)) marcados.delete(p); else marcados.add(p);
      b.classList.toggle("is-on");
    });
    areaChips.appendChild(b);
  });

  $("#rate-send").addEventListener("click", () => {
    if (nota === 0) { aviso("Escolha de 1 a 5 estrelas."); return; }
    aula.nota = nota;
    aula.comentario = $("#rate-text").value.trim();
    aula.pontos = Array.from(marcados);
    aula.status = "concluida";
    Armazem.gravar("aulas", aulas);
    aviso("Avaliação enviada. Obrigado.");
    irPara("lessons");
  });

  $("#rate-report").addEventListener("click", () => {
    aviso("Denúncia registrada. Nossa equipe analisa em até 24 horas e o instrutor pode ser suspenso.");
  });

  irPara("rate");
}

/* ============================================================
   PARTIDA
   ============================================================ */
function iniciar() {
  montarInicio();
  montarFiltros();
  montarAulaAoVivo();

  $("#booking-confirm").addEventListener("click", confirmarAgendamento);

  $$("[data-back]").forEach(b => b.addEventListener("click", () => irPara(b.dataset.back)));
  $$(".tab").forEach(t => t.addEventListener("click", () => irPara(t.dataset.tab)));

  const nome = Armazem.ler("nome", null);
  if (nome) $("#home-greeting").textContent = "Oi, " + nome;

  irPara("home");
}

document.addEventListener("DOMContentLoaded", iniciar);

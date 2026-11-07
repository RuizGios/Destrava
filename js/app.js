/* ============================================================
   Destrava - logica do aplicativo
   Blocos, na ordem: atalhos, armazenamento, navegacao, telas,
   endereco por CEP, cadastro de instrutor, painel do especialista.
   ============================================================ */

/* ---------- ATALHOS ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const dinheiro = v => "R$ " + Number(v).toFixed(2).replace(".", ",");
const nota1 = v => Number(v).toFixed(1).replace(".", ",");
const soDigitos = s => (s || "").replace(/\D/g, "");
const escapar = s => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ---------- ARMAZENAMENTO ---------- */
/* localStorage falha em aba anonima, entao tudo passa por try. */
const Armazem = {
  ler(chave, padrao) {
    try {
      const bruto = localStorage.getItem("destrava:" + chave);
      return bruto ? JSON.parse(bruto) : padrao;
    } catch (e) { return padrao; }
  },
  gravar(chave, valor) {
    try { localStorage.setItem("destrava:" + chave, JSON.stringify(valor)); } catch (e) {}
  }
};

let aulas = Armazem.ler("aulas", []);
let candidaturas = Armazem.ler("candidaturas", null);
if (!candidaturas) { candidaturas = PENDENTES_EXEMPLO.slice(); Armazem.gravar("candidaturas", candidaturas); }
let sessao = Armazem.ler("sessao", null);
let contas  = Armazem.ler("contas", []);
let usuario = Armazem.ler("usuario", null);

/* arquivos enviados ficam so na memoria desta sessao.
   O navegador nao guarda arquivo grande, entao o que vai para o
   armazenamento e apenas o nome, o tamanho e o tipo. */
const arquivosNaMemoria = {};

/* ---------- ESTADO ---------- */
const estado = {
  perfil: "habilitado",
  dificuldade: null,
  cidade: CIDADES[0],
  carro: "aluno",
  filtros: new Set(),
  instrutor: null,
  agendamento: { data: null, hora: null, carro: "aluno" },
  enderecoManual: false,
  cepOk: false,
  aulaAtiva: null,
  cadastro: { especialidades: new Set(), docs: {} },
  filaAba: "pendente"
};

/* ---------- INSTRUTORES (fixos mais os aprovados) ---------- */
function candidaturaParaInstrutor(c) {
  return {
    id: c.id, nome: c.nome, iniciais: c.iniciais, genero: c.genero,
    cidade: c.cidade, bairro: c.bairro, nota: 5.0, aulas: 0,
    anos: c.anos, preco: c.preco, cambio: c.cambio, carro: c.carro,
    especialidades: c.especialidades, bio: c.bio,
    soMulheres: c.soMulheres, novo: true, avaliacoes: []
  };
}
function todosInstrutores() {
  return INSTRUTORES.concat(
    candidaturas.filter(c => c.status === "aprovado").map(candidaturaParaInstrutor)
  );
}
function acharInstrutor(id) { return todosInstrutores().find(i => i.id === id) || null; }

/* ============================================================
   NAVEGACAO
   ============================================================ */
const RAIZES = ["home", "lessons", "signup", "staff", "queue"];
let pilha = [];
let atual = { tela: "home", ctx: null };

const CONSTRUTORES = {
  home:    () => {},
  list:    montarLista,
  profile: ctx => montarPerfil(ctx),
  booking: () => montarAgendamento(),
  done:    () => {},
  lessons: desenharAulas,
  live:    () => {},
  rate:    ctx => montarAvaliacao(ctx),
  signup:  () => montarCadastro(),
  staff:   () => { $("#staff-errors").innerHTML = ""; },
  queue:   () => desenharFila(),
  review:  ctx => montarAnalise(ctx)
};

function mostrar(tela, ctx) {
  $$(".screen").forEach(s => s.classList.remove("is-active"));
  const alvo = $("#screen-" + tela);
  if (alvo) alvo.classList.add("is-active");
  if (CONSTRUTORES[tela]) CONSTRUTORES[tela](ctx);
  $$(".tab, .nav-links button").forEach(b => b.classList.toggle("is-on", b.dataset.go === tela));
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function irPara(tela, ctx) {
  if (tela === "staff" && sessao) tela = "queue";
  if (RAIZES.includes(tela)) pilha = []; else pilha.push(atual);
  atual = { tela, ctx };
  mostrar(tela, ctx);
  try { history.pushState({ p: pilha.length, tela }, "", "#" + tela); } catch (e) {}
}

function voltar() {
  if (pilha.length) { try { history.back(); return; } catch (e) {} }
  irPara("home");
}

window.addEventListener("popstate", () => {
  if (pilha.length) { atual = pilha.pop(); mostrar(atual.tela, atual.ctx); }
  else { atual = { tela: "home", ctx: null }; mostrar("home"); }
});

function aviso(texto) {
  const t = $("#toast");
  t.textContent = texto;
  t.classList.add("is-on");
  clearTimeout(aviso._t);
  aviso._t = setTimeout(() => t.classList.remove("is-on"), 3600);
}

function erros(alvo, lista) {
  $(alvo).innerHTML = lista.map(e => `<div>${escapar(e)}</div>`).join("");
}

/* ============================================================
   TELA 1 - INICIO
   ============================================================ */
/* trava a escolha do carro quando o aluno esta tirando a primeira
   habilitacao, porque nesse caso a aula so vale no carro do instrutor */
function aplicarPerfil() {
  const primeira = estado.perfil === "primeira";

  const aviso = $("#home-aviso");
  aviso.textContent = primeira ? AVISO_PRIMEIRA : "";
  aviso.classList.toggle("is-hidden", !primeira);

  $("#hero-eyebrow").textContent = primeira
    ? "Para quem está tirando a primeira habilitação"
    : "Para quem já tem CNH";

  const opcaoAluno = $('#home-car .option[data-car="aluno"]');
  opcaoAluno.classList.toggle("is-hidden", primeira);
  if (primeira) {
    estado.carro = "instrutor";
    $$("#home-car .option").forEach(o => o.classList.toggle("is-on", o.dataset.car === "instrutor"));
  }
  estado.agendamento.carro = estado.carro;
}

function montarInicio() {
  // perfil do aluno
  const areaPerfil = $("#home-profile");
  PERFIS.forEach(p => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "seg-btn" + (p.id === estado.perfil ? " is-on" : "");
    b.innerHTML = `${escapar(p.titulo)}<small>${escapar(p.desc)}</small>`;
    b.addEventListener("click", () => {
      estado.perfil = p.id;
      $$("#home-profile button").forEach(x => x.classList.toggle("is-on", x === b));
      aplicarPerfil();
    });
    areaPerfil.appendChild(b);
  });

  const area = $("#home-difficulties");
  [QUALQUER].concat(DIFICULDADES).forEach(d => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = d;
    b.addEventListener("click", () => {
      estado.dificuldade = estado.dificuldade === d ? null : d;
      $$(".chip", area).forEach(c => c.classList.toggle("is-on", c.textContent === estado.dificuldade));
    });
    area.appendChild(b);
  });

  const sel = $("#home-city");
  sel.innerHTML = CIDADES.map(c => `<option>${c}</option>`).join("");
  sel.addEventListener("change", e => { estado.cidade = e.target.value; });

  $$("#home-car .option").forEach(op => op.addEventListener("click", () => {
    estado.carro = op.dataset.car;
    $$("#home-car .option").forEach(o => o.classList.toggle("is-on", o === op));
  }));

  $("#home-search").addEventListener("click", () => {
    if (!estado.dificuldade) { aviso("Escolha uma dificuldade, ou a opção de só querer praticar."); return; }
    estado.agendamento.carro = estado.carro;
    irPara("list");
  });

  aplicarPerfil();
}

/* ============================================================
   TELA 2 - LISTA
   ============================================================ */
const precoDe = (i, tipo) => tipo === "aluno" ? i.preco - PRECOS.descontoCarroAluno : i.preco;

function filtrar() {
  const f = estado.filtros;
  const primeira = estado.perfil === "primeira";
  return todosInstrutores().filter(i => {
    if (i.cidade !== estado.cidade) return false;
    if (primeira && !i.primeira) return false;
    if (estado.dificuldade && estado.dificuldade !== QUALQUER
        && !i.especialidades.includes(estado.dificuldade)) return false;
    if (f.has("mulher") && i.genero !== "f") return false;
    if (f.has("homem") && (i.genero !== "m" || i.soMulheres)) return false;
    if (f.has("automatico") && !i.cambio.toLowerCase().includes("autom")) return false;
    if (f.has("manual") && !i.cambio.toLowerCase().includes("manual")) return false;
    if (f.has("nota") && i.nota < 4.5) return false;
    if (f.has("preco") && precoDe(i, estado.carro) > 80) return false;
    return true;
  }).sort((a, b) => b.nota - a.nota);
}

function montarLista() {
  $("#list-title").textContent =
    estado.perfil === "primeira" ? "Instrutores para primeira habilitação"
    : (estado.dificuldade && estado.dificuldade !== QUALQUER)
      ? "Instrutores para " + estado.dificuldade.toLowerCase()
      : "Instrutores disponíveis";

  const achados = filtrar();
  const alvo = $("#list-results");
  $("#list-count").textContent = achados.length
    ? `${achados.length} ${achados.length === 1 ? "instrutor disponível" : "instrutores disponíveis"} em ${estado.cidade}`
    : "";

  if (!achados.length) {
    alvo.className = "cards cards--one";
    alvo.innerHTML = '<div class="empty">Nenhum instrutor com esse perfil nesta cidade.<br>Tente remover um filtro ou trocar a dificuldade.</div>';
    return;
  }
  alvo.className = "cards";
  alvo.innerHTML = "";

  achados.forEach(i => {
    const preco = precoDe(i, estado.carro);
    const card = document.createElement("button");
    card.type = "button"; card.className = "card";
    card.innerHTML = `
      <div class="card-row">
        <div class="avatar">${escapar(i.iniciais)}</div>
        <div>
          <div class="card-name">${escapar(i.nome)}</div>
          <div class="card-sub">${escapar(i.especialidades.slice(0, 3).join(", "))}</div>
          <div class="card-rate">${i.novo
              ? '<b>Novo na plataforma</b>'
              : `<b>&#9733; ${nota1(i.nota)}</b> &middot; ${i.aulas} aulas`} &middot; ${escapar(i.bairro)}</div>
        </div>
        <div class="card-price"><b>${dinheiro(preco)}</b><span>por aula</span></div>
      </div>
      <div class="seals">
        <span class="seal">Detran verificado</span>
        <span class="seal">Antecedentes ok</span>
        ${i.soMulheres ? '<span class="seal seal--volt">Atende só mulheres</span>' : ""}
        <span class="seal seal--grey">${escapar(i.cambio)}</span>
      </div>`;
    card.addEventListener("click", () => irPara("profile", i.id));
    alvo.appendChild(card);
  });
}

function montarFiltros() {
  $$("#list-filters .fchip").forEach(f => f.addEventListener("click", () => {
    const n = f.dataset.filter;
    // genero e cambio sao pares que se excluem
    const oposto = { mulher: "homem", homem: "mulher", automatico: "manual", manual: "automatico" }[n];
    if (estado.filtros.has(n)) estado.filtros.delete(n);
    else { estado.filtros.add(n); if (oposto) estado.filtros.delete(oposto); }
    $$("#list-filters .fchip").forEach(c => c.classList.toggle("is-on", estado.filtros.has(c.dataset.filter)));
    montarLista();
  }));
  $("#list-clear").addEventListener("click", () => {
    estado.filtros.clear();
    $$("#list-filters .fchip").forEach(c => c.classList.remove("is-on"));
    montarLista();
  });
}

/* ============================================================
   TELA 3 - PERFIL
   ============================================================ */
function montarPerfil(id) {
  const i = acharInstrutor(id);
  if (!i) { irPara("list"); return; }
  estado.instrutor = i;
  const preco = precoDe(i, estado.carro);

  $("#profile-content").innerHTML = `
    <div class="profile-grid">
      <div>
        <div class="card-row" style="align-items:center;gap:18px;margin-bottom:6px;">
          <div class="avatar avatar--lg">${escapar(i.iniciais)}</div>
          <div>
            <h1 class="page-title" style="font-size:28px;margin:0;">${escapar(i.nome)}</h1>
            <div class="card-sub">Instrutor credenciado &middot; ${escapar(i.bairro)}, ${escapar(i.cidade)}</div>
            <div class="card-rate">${i.novo
              ? "<b>Novo na plataforma</b>"
              : `<b>&#9733; ${nota1(i.nota)}</b> &middot; ${i.aulas} aulas`} &middot; ${i.anos} anos de experiência</div>
          </div>
        </div>

        <div class="section-label">Verificações feitas pela nossa equipe</div>
        <div class="check-line"><span class="tick">&#10003;</span><span>Credencial de instrutor conferida no Detran</span></div>
        <div class="check-line"><span class="tick">&#10003;</span><span>Certidão de antecedentes criminais negativa</span></div>
        <div class="check-line"><span class="tick">&#10003;</span><span>CNH e documento do veículo dentro da validade</span></div>

        <div class="section-label">Sobre</div>
        <p>${escapar(i.bio)}</p>

        <div class="section-label">Especialidades</div>
        <div class="chips">${i.especialidades.map(e => `<span class="chip">${escapar(e)}</span>`).join("")}</div>

        <div class="section-label">Carro</div>
        <p>${escapar(i.carro)} &middot; câmbio ${escapar(i.cambio.toLowerCase())}</p>

        <div class="section-label">Avaliações</div>
        ${i.avaliacoes.length
          ? i.avaliacoes.map(a => `<div class="quote">${escapar(a.texto)}<cite>${escapar(a.autor)} &middot; &#9733; ${nota1(a.nota)}</cite></div>`).join("")
          : '<p class="note">Ainda não recebeu avaliações. Acabou de ser aprovado pela nossa equipe de verificação.</p>'}
      </div>

      <aside class="panel panel--sticky">
        <div class="sidebar-head">Agendar</div>
        <div class="summary-line"><span>Com o seu carro</span><span>${dinheiro(i.preco - PRECOS.descontoCarroAluno)}</span></div>
        <div class="summary-line"><span>Com o carro do instrutor</span><span>${dinheiro(i.preco)}</span></div>
        <div class="summary-line"><span>Taxa de segurança</span><span>${dinheiro(PRECOS.taxaSeguranca)}</span></div>
        <button class="btn btn--block" id="profile-book" type="button">Agendar aula &middot; ${dinheiro(preco + PRECOS.taxaSeguranca)}</button>
        <p class="note">Aula de 1 hora, sem pacote. Você escolhe o carro no próximo passo.</p>
      </aside>
    </div>`;

  $("#profile-book").addEventListener("click", () => irPara("booking"));
}

/* ============================================================
   TELA 4 - AGENDAMENTO
   ============================================================ */
const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const HORARIOS = ["08:00", "09:30", "11:00", "14:00", "16:30", "18:00"];

function proximasDatas(n) {
  const lista = [];
  for (let k = 1; k <= n; k++) {
    const d = new Date(); d.setDate(d.getDate() + k);
    lista.push({
      iso: d.toISOString().slice(0, 10),
      semana: DIAS_SEMANA[d.getDay()],
      rotulo: d.getDate() + "/" + String(d.getMonth() + 1).padStart(2, "0")
    });
  }
  return lista;
}

function montarAgendamento() {
  const i = estado.instrutor;
  if (!i) { irPara("home"); return; }
  $("#booking-title").textContent = "Agendar com " + i.nome.split(" ")[0];
  estado.agendamento.data = null;
  estado.agendamento.hora = null;
  erros("#booking-errors", []);

  $("#booking-resume-who").innerHTML = `
    <div class="card-row" style="align-items:center;margin-bottom:14px;">
      <div class="avatar">${escapar(i.iniciais)}</div>
      <div><div class="card-name" style="font-size:15px;">${escapar(i.nome)}</div>
      <div class="card-sub">${escapar(i.bairro)}, ${escapar(i.cidade)}</div></div>
    </div>`;

  const areaData = $("#booking-dates"); areaData.innerHTML = "";
  proximasDatas(5).forEach(d => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "slot";
    b.innerHTML = `${d.rotulo}<small>${d.semana}</small>`;
    b.addEventListener("click", () => {
      estado.agendamento.data = d;
      $$(".slot", areaData).forEach(s => s.classList.toggle("is-on", s === b));
    });
    areaData.appendChild(b);
  });

  const areaHora = $("#booking-times"); areaHora.innerHTML = "";
  HORARIOS.forEach(h => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "slot"; b.textContent = h;
    b.addEventListener("click", () => {
      estado.agendamento.hora = h;
      $$(".slot", areaHora).forEach(s => s.classList.toggle("is-on", s === b));
    });
    areaHora.appendChild(b);
  });

  const areaCarro = $("#booking-car"); areaCarro.innerHTML = "";
  const primeira = estado.perfil === "primeira";
  if (primeira) {
    estado.agendamento.carro = "instrutor";
    const nota = document.createElement("p");
    nota.className = "aviso";
    nota.style.marginTop = "0";
    nota.textContent = AVISO_PRIMEIRA;
    areaCarro.appendChild(nota);
  }
  (primeira ? [] : [{ id: "aluno", t: "Meu carro", d: "Você dirige o carro que já conhece", v: i.preco - PRECOS.descontoCarroAluno }])
  .concat([{ id: "instrutor", t: "Carro do instrutor", d: i.carro, v: i.preco }])
  .forEach(op => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "option" + (op.id === estado.agendamento.carro ? " is-on" : "");
    b.innerHTML = `<span class="radio"></span>
      <span class="option-text"><b>${escapar(op.t)}</b><small>${escapar(op.d)}</small></span>
      <span class="price-tag">${dinheiro(op.v)}</span>`;
    b.addEventListener("click", () => {
      estado.agendamento.carro = op.id;
      $$(".option", areaCarro).forEach(o => o.classList.toggle("is-on", o === b));
      atualizarResumo();
    });
    areaCarro.appendChild(b);
  });

  desenharConta();
  atualizarResumo();
}

function atualizarResumo() {
  const v = precoDe(estado.instrutor, estado.agendamento.carro);
  $("#booking-summary").innerHTML = `
    <div class="summary-line"><span>Aula de 1 hora</span><span>${dinheiro(v)}</span></div>
    <div class="summary-line"><span>Taxa de segurança</span><span>${dinheiro(PRECOS.taxaSeguranca)}</span></div>
    <div class="summary-line summary-line--total"><span>Total</span><span>${dinheiro(v + PRECOS.taxaSeguranca)}</span></div>`;
}

/* ============================================================
   CONTA DO ALUNO
   Guardada no proprio navegador. Serve para identificar quem marcou
   a aula e para ter um e-mail de contato. Nao e uma autenticacao de
   verdade: para valer, a senha tem que ser conferida num servidor.
   ============================================================ */
function desenharConta() {
  const alvo = $("#booking-account");
  if (!alvo) return;

  if (usuario) {
    alvo.innerHTML = `
      <div class="conta-ok">
        <div class="avatar">${escapar(usuario.nome.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase())}</div>
        <div class="conta-dados">
          <b>${escapar(usuario.nome)}</b>
          <span>${escapar(usuario.email)}</span>
        </div>
        <button class="linkish" id="conta-sair" type="button">Trocar</button>
      </div>
      <p class="hint">A confirmação da aula vai para esse e-mail.</p>`;
    $("#conta-sair").addEventListener("click", () => {
      usuario = null;
      Armazem.gravar("usuario", null);
      desenharConta();
    });
    return;
  }

  alvo.innerHTML = `
    <div class="row-2">
      <div class="field"><input class="field-input" id="conta-nome" type="text" placeholder="Seu nome"></div>
      <div class="field"><input class="field-input" id="conta-email" type="email" placeholder="Seu e-mail"></div>
    </div>
    <div class="field"><input class="field-input" id="conta-senha" type="password" placeholder="Senha, no mínimo 6 caracteres"></div>
    <button class="btn btn--line btn--sm btn--block" id="conta-entrar" type="button">Criar conta ou entrar</button>
    <p class="hint">Se você já tem conta, use o mesmo e-mail e a mesma senha para entrar.</p>`;

  $("#conta-entrar").addEventListener("click", entrarOuCriar);
  $("#conta-senha").addEventListener("keydown", e => { if (e.key === "Enter") entrarOuCriar(); });
}

function entrarOuCriar() {
  const nome  = $("#conta-nome").value.trim();
  const email = $("#conta-email").value.trim().toLowerCase();
  const senha = $("#conta-senha").value;
  const problemas = [];

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) problemas.push("Informe um e-mail válido.");
  if (senha.length < 6) problemas.push("A senha precisa ter pelo menos 6 caracteres.");

  const existente = contas.find(c => c.email === email);
  if (existente) {
    if (existente.senha !== senha) problemas.push("Essa senha não confere com a conta desse e-mail.");
  } else if (nome.split(" ").filter(Boolean).length < 1) {
    problemas.push("Informe seu nome para criar a conta.");
  }

  if (problemas.length) { erros("#booking-errors", problemas); aviso(problemas[0]); return; }

  if (existente) {
    usuario = { nome: existente.nome, email: existente.email };
    aviso("Bem-vindo de volta, " + existente.nome.split(" ")[0] + ".");
  } else {
    contas.push({ nome, email, senha });
    Armazem.gravar("contas", contas);
    usuario = { nome, email };
    aviso("Conta criada.");
  }
  Armazem.gravar("usuario", usuario);
  erros("#booking-errors", []);
  desenharConta();
}

/* ============================================================
   ENDERECO POR CEP
   Usa o ViaCEP, que e gratuito e nao precisa de cadastro.
   Se a busca falhar, o aluno digita o endereco na mao.
   ============================================================ */
function mascaraCep(v) {
  const d = soDigitos(v).slice(0, 8);
  return d.length > 5 ? d.slice(0, 5) + "-" + d.slice(5) : d;
}
function mascaraTel(v) {
  const d = soDigitos(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function travarEndereco(travado) {
  ["#booking-rua", "#booking-bairro", "#booking-cidade"].forEach(s => {
    const campo = $(s);
    campo.readOnly = travado;
    campo.parentElement.classList.toggle("is-locked", travado);
  });
}

let buscaEmCurso = 0;

async function buscarCep() {
  const cep = soDigitos($("#booking-cep").value);
  const status = $("#cep-status");
  if (cep.length !== 8) { estado.cepOk = false; return; }

  // cada busca ganha um numero. Se outra busca comecar, ou se a pessoa
  // escolher digitar o endereco a mao, a resposta antiga e descartada.
  const minhaVez = ++buscaEmCurso;
  const desatualizada = () => minhaVez !== buscaEmCurso || estado.enderecoManual;

  status.className = "hint";
  status.textContent = "Procurando o endereço...";

  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const j = await r.json();
    if (desatualizada()) return;
    if (j.erro) throw new Error("nao achou");
    $("#booking-rua").value = j.logradouro || "";
    $("#booking-bairro").value = j.bairro || "";
    $("#booking-cidade").value = (j.localidade || "") + (j.uf ? " / " + j.uf : "");
    estado.cepOk = true;
    estado.enderecoManual = !j.logradouro;   // alguns CEPs nao trazem a rua
    travarEndereco(!estado.enderecoManual);
    status.className = "hint is-ok";
    status.textContent = j.logradouro
      ? "Endereço encontrado. Agora é só o número."
      : "CEP de área geral. Complete a rua à mão.";
    $("#booking-numero").focus();
  } catch (e) {
    if (desatualizada()) return;
    estado.cepOk = false;
    status.className = "hint is-bad";
    status.textContent = "Não encontramos esse CEP. Confira os números ou digite o endereço à mão.";
  }
}

function montarCamposEndereco() {
  const cep = $("#booking-cep");
  cep.addEventListener("input", () => {
    cep.value = mascaraCep(cep.value);
    if (soDigitos(cep.value).length === 8) buscarCep();
  });
  cep.addEventListener("blur", buscarCep);

  $("#cep-manual").addEventListener("click", () => {
    buscaEmCurso++;
    estado.enderecoManual = true;
    travarEndereco(false);
    $("#cep-status").className = "hint";
    $("#cep-status").textContent = "Digite rua, bairro e cidade você mesmo.";
    $("#booking-rua").focus();
  });

  const tel = $("#booking-contato-tel");
  tel.addEventListener("input", () => { tel.value = mascaraTel(tel.value); });
}

function enderecoCompleto() {
  const rua = $("#booking-rua").value.trim();
  const num = $("#booking-numero").value.trim();
  const bairro = $("#booking-bairro").value.trim();
  const cidade = $("#booking-cidade").value.trim();
  const compl = $("#booking-complemento").value.trim();
  let txt = rua + (num ? ", " + num : "");
  if (compl) txt += " (" + compl + ")";
  if (bairro) txt += " - " + bairro;
  if (cidade) txt += ", " + cidade;
  return txt;
}

function validarAgendamento() {
  const lista = [];
  const a = estado.agendamento;
  $$("#screen-booking .field").forEach(f => f.classList.remove("has-error"));
  const marcar = sel => $(sel).parentElement.classList.add("has-error");

  if (!a.data) lista.push("Escolha a data da aula.");
  if (!a.hora) lista.push("Escolha o horário.");

  if (!estado.enderecoManual && !estado.cepOk) {
    lista.push("Informe um CEP válido ou escolha digitar o endereço à mão.");
    marcar("#booking-cep");
  }
  if (!$("#booking-rua").value.trim()) { lista.push("Informe a rua."); marcar("#booking-rua"); }
  if (!$("#booking-numero").value.trim()) { lista.push("Informe o número."); marcar("#booking-numero"); }
  if (estado.enderecoManual) {
    if (!$("#booking-bairro").value.trim()) { lista.push("Informe o bairro."); marcar("#booking-bairro"); }
    if (!$("#booking-cidade").value.trim()) { lista.push("Informe a cidade."); marcar("#booking-cidade"); }
  }

  if (!usuario) lista.push("Crie sua conta ou entre para confirmar a aula.");

  const nome = $("#booking-contato-nome").value.trim();
  const telDig = soDigitos($("#booking-contato-tel").value);
  if (nome.length < 2) { lista.push("Informe o nome do seu contato de confiança."); marcar("#booking-contato-nome"); }
  if (telDig.length < 10) { lista.push("Informe um telefone com DDD, com 10 ou 11 dígitos."); marcar("#booking-contato-tel"); }

  return lista;
}

async function confirmarAgendamento() {
  const problemas = validarAgendamento();
  if (problemas.length) {
    erros("#booking-errors", problemas);
    aviso("Faltam dados para confirmar a aula.");
    return;
  }
  erros("#booking-errors", []);

  const i = estado.instrutor, a = estado.agendamento;
  const valor = precoDe(i, a.carro);
  const aula = {
    id: "a" + Date.now(),
    instrutorId: i.id, instrutorNome: i.nome, iniciais: i.iniciais,
    dificuldade: estado.dificuldade,
    dataRotulo: a.data.rotulo, semana: a.data.semana, hora: a.hora,
    carro: a.carro,
    endereco: enderecoCompleto(),
    contatoNome: $("#booking-contato-nome").value.trim(),
    contatoTel: $("#booking-contato-tel").value.trim(),
    gravar: $("#booking-record").checked,
    valor, total: valor + PRECOS.taxaSeguranca,
    status: "agendada", nota: null
  };

  aula.alunoNome = usuario.nome;
  aula.alunoEmail = usuario.email;

  aulas.unshift(aula);
  Armazem.gravar("aulas", aulas);

  const envio = await enviarEmails(aula, usuario, i);

  $("#done-content").innerHTML = `
    <div class="big-check">&#10003;</div>
    <div class="done-title">Aula agendada</div>
    <p class="done-text">
      ${escapar(aula.instrutorNome)} encontra você em<br><b>${escapar(aula.endereco)}</b><br>
      ${escapar(aula.semana)} ${escapar(aula.dataRotulo)} às ${escapar(aula.hora)}.<br><br>
      Avisamos ${escapar(aula.contatoNome.split(" ")[0])} assim que a aula começar.<br><br>
      ${envio.enviado
        ? "Enviamos a confirmação para <b>" + escapar(usuario.email) + "</b> e avisamos o instrutor."
        : "A confirmação apareceu na tela porque o envio de e-mail ainda não foi ligado."}
    </p>
    <button class="btn btn--block" id="done-lessons" type="button">Ver minhas aulas</button>
    <button class="btn btn--line btn--block btn--sm" id="done-home" type="button">Voltar ao início</button>`;

  $("#done-lessons").addEventListener("click", () => irPara("lessons"));
  $("#done-home").addEventListener("click", () => irPara("home"));
  irPara("done");
}

/* ============================================================
   TELA 5 - MINHAS AULAS
   ============================================================ */
function desenharAulas() {
  const alvo = $("#lessons-content");
  if (!aulas.length) {
    alvo.className = "cards cards--one";
    alvo.innerHTML = '<div class="empty">Você ainda não tem aulas marcadas.<br>Escolha uma dificuldade em Buscar aula para começar.</div>';
    return;
  }
  alvo.className = "cards";
  alvo.innerHTML = aulas.map(a => {
    const fim = a.status === "concluida";
    return `
      <div class="card" style="cursor:default">
        <div class="card-row" style="align-items:center">
          <div class="avatar">${escapar(a.iniciais)}</div>
          <div>
            <div class="card-name">${escapar(a.instrutorNome)}</div>
            <div class="card-sub">${escapar(a.semana)} ${escapar(a.dataRotulo)} às ${escapar(a.hora)} &middot; ${dinheiro(a.total)}</div>
            <div class="card-sub">${escapar(a.endereco || "")}</div>
          </div>
          <span class="badge ${fim ? "badge--done" : ""}">${fim ? "Concluída" : "Agendada"}</span>
        </div>
        <div class="lesson-actions">
          ${fim
            ? (a.nota
                ? `<span class="card-rate"><b>&#9733; ${a.nota},0</b> avaliada por você</span>`
                : `<button class="btn btn--line btn--sm" data-acao="avaliar" data-aula="${a.id}" type="button">Avaliar aula</button>`)
            : `<button class="btn btn--sm" data-acao="iniciar" data-aula="${a.id}" type="button">Iniciar aula</button>
               <button class="btn btn--line btn--sm" data-acao="cancelar" data-aula="${a.id}" type="button">Cancelar</button>`}
        </div>
      </div>`;
  }).join("");

  $$("[data-acao]", alvo).forEach(b => b.addEventListener("click", () => {
    const aula = aulas.find(x => x.id === b.dataset.aula);
    if (!aula) return;
    if (b.dataset.acao === "iniciar") iniciarAula(aula);
    if (b.dataset.acao === "avaliar") irPara("rate", aula.id);
    if (b.dataset.acao === "cancelar") {
      aulas = aulas.filter(x => x.id !== aula.id);
      Armazem.gravar("aulas", aulas);
      desenharAulas();
      aviso("Aula cancelada.");
    }
  }));
}

/* ============================================================
   TELA 6 - AULA EM ANDAMENTO
   O mapa tem duas versoes. Com internet usa o Leaflet, com mapa de
   rua de verdade. Sem internet desenha um mapa simples, para a
   demonstracao nunca quebrar.
   ============================================================ */
let relogio = null, vigiaGps = null, passoDemo = 0, pontos = [];

const MapaReal = {
  mapa: null, marcador: null, traco: null,
  disponivel() {
    if (typeof L === "undefined") return false;
    const teste = document.createElement("div");
    teste.className = "leaflet-container";
    teste.style.cssText = "position:absolute;visibility:hidden";
    document.body.appendChild(teste);
    const temCss = getComputedStyle(teste).overflow === "hidden";
    teste.remove();
    return temCss;
  },
  reiniciar(coord) {
    if (!this.mapa) {
      this.mapa = L.map("map", { zoomControl: false, attributionControl: false });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(this.mapa);
      this.traco = L.polyline([], { color: "#0E1A17", weight: 6, opacity: .95 }).addTo(this.mapa);
      this.marcador = L.circleMarker([0, 0], { radius: 10, color: "#0E1A17", weight: 4, fillColor: "#CBFF4D", fillOpacity: 1 }).addTo(this.mapa);
    }
    setTimeout(() => this.mapa.invalidateSize(), 140);
    this.traco.setLatLngs([]);
    this.mapa.setView(coord, 16);
    this.marcador.setLatLng(coord);
  },
  desenhar(lista) {
    const u = lista[lista.length - 1];
    this.traco.setLatLngs(lista);
    this.marcador.setLatLng(u);
    this.mapa.panTo(u, { animate: true });
  }
};

const MapaSimples = {
  limites: null,
  reiniciar() {
    $("#map").innerHTML = `
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block;background:#E6EAE6">
        <g stroke="#D6DBD6" stroke-width="16" fill="none">
          <path d="M-10 80 H410"/><path d="M-10 200 H410"/><path d="M90 -10 V310"/><path d="M280 -10 V310"/>
        </g>
        <g fill="#DDE2DC">
          <rect x="112" y="102" width="62" height="46" rx="4"/><rect x="196" y="102" width="60" height="46" rx="4"/>
          <rect x="112" y="220" width="56" height="50" rx="4"/><rect x="300" y="102" width="62" height="46" rx="4"/>
        </g>
        <polyline id="mini-traco" fill="none" stroke="#0E1A17" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" points=""/>
        <circle id="mini-ponto" r="9" fill="#CBFF4D" stroke="#0E1A17" stroke-width="4" cx="-50" cy="-50"/>
      </svg>`;
    const lats = ROTA_DEMO.map(p => p[0]), lngs = ROTA_DEMO.map(p => p[1]);
    this.limites = {
      latMin: Math.min(...lats), latMax: Math.max(...lats),
      lngMin: Math.min(...lngs), lngMax: Math.max(...lngs)
    };
  },
  projetar(c) {
    const l = this.limites;
    return [
      40 + ((c[1] - l.lngMin) / ((l.lngMax - l.lngMin) || 1)) * 320,
      260 - ((c[0] - l.latMin) / ((l.latMax - l.latMin) || 1)) * 220
    ];
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
  pontos = []; passoDemo = 0;
  const inicio = Date.now();

  Mapa = MapaReal.disponivel() ? MapaReal : MapaSimples;
  Mapa.reiniciar(ROTA_DEMO[0]);

  const carro = aula.carro === "aluno" ? "no seu carro" : "no carro do instrutor";
  clearInterval(relogio);
  $("#live-meta").textContent = `Iniciada às ${aula.hora} · 0 min decorridos · ${carro}`;
  relogio = setInterval(() => {
    const min = Math.floor((Date.now() - inicio) / 60000);
    $("#live-meta").textContent = `Iniciada às ${aula.hora} · ${min} min decorridos · ${carro}`;
  }, 1000);

  if (navigator.geolocation) {
    vigiaGps = navigator.geolocation.watchPosition(
      p => { $("#live-gps-label").textContent = "Localização ao vivo"; moverPara([p.coords.latitude, p.coords.longitude]); },
      () => { $("#live-gps-label").textContent = "Modo demonstração"; simularTrajeto(); },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 }
    );
  } else {
    $("#live-gps-label").textContent = "Modo demonstração";
    simularTrajeto();
  }
}

function moverPara(c) { pontos.push(c); Mapa.desenhar(pontos); }

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
    const a = estado.aulaAtiva;
    const txt = `Estou em aula de direção com ${a.instrutorNome}. Acompanhe por aqui: ${posicaoAtualTexto()}`;
    if (navigator.share) { try { await navigator.share({ title: "Destrava", text: txt }); return; } catch (e) {} }
    try { await navigator.clipboard.writeText(txt); aviso("Link copiado. Envie para " + (a.contatoNome || "seu contato") + "."); }
    catch (e) { aviso("Localização: " + posicaoAtualTexto()); }
  });

  $("#live-sos").addEventListener("click", () => {
    const a = estado.aulaAtiva;
    const txt = `EMERGÊNCIA. Estou em aula com ${a.instrutorNome}. Minha localização: ${posicaoAtualTexto()}`;
    if (navigator.share) navigator.share({ title: "Emergência Destrava", text: txt }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(txt).catch(() => {});
    $("#live-note").innerHTML = "<b>Alerta enviado.</b> Seu contato de confiança e nossa equipe receberam sua localização. Mantenha o aplicativo aberto.";
    aviso("Alerta de emergência disparado.");
  });

  $("#live-finish").addEventListener("click", () => {
    pararRastreio();
    const a = estado.aulaAtiva;
    a.status = "concluida";
    Armazem.gravar("aulas", aulas);
    irPara("rate", a.id);
  });
}

/* ============================================================
   TELA 7 - AVALIACAO
   ============================================================ */
const PONTOS_POSITIVOS = ["Me deixou calmo", "Explicou bem", "Pontual", "Carro em ordem", "Teve paciência", "Respeitou meu ritmo"];

function montarAvaliacao(aulaId) {
  const aula = aulas.find(a => a.id === aulaId);
  if (!aula) { irPara("lessons"); return; }
  let nota = 0;
  const marcados = new Set();

  $("#rate-content").innerHTML = `
    <h1 class="page-title" style="text-align:center">Como foi a aula?</h1>
    <div class="panel" style="margin-top:14px">
      <div style="text-align:center">
        <div class="avatar avatar--lg" style="margin:0 auto 12px">${escapar(aula.iniciais)}</div>
        <div class="card-name" style="font-size:19px">${escapar(aula.instrutorNome)}</div>
        <div class="card-sub">${escapar(aula.semana)} ${escapar(aula.dataRotulo)} &middot; 1 hora</div>
      </div>
      <div class="stars" id="rate-stars"></div>
      <div style="text-align:center;font-size:13px;color:var(--muted)">Toque para avaliar</div>

      <div class="section-label">O que funcionou bem</div>
      <div class="chips" id="rate-chips"></div>

      <div class="section-label">Comentário</div>
      <textarea class="textarea" id="rate-text" placeholder="Conte como foi, para ajudar outros alunos a escolherem."></textarea>

      <button class="btn btn--block" id="rate-send" type="button">Enviar avaliação</button>
      <button class="btn btn--text btn--block" id="rate-report" type="button">Denunciar algo que aconteceu na aula</button>
    </div>`;

  const areaEstrelas = $("#rate-stars");
  for (let n = 1; n <= 5; n++) {
    const s = document.createElement("button");
    s.type = "button"; s.className = "star"; s.textContent = "★";
    s.addEventListener("click", () => {
      nota = n;
      $$(".star", areaEstrelas).forEach((e, k) => e.classList.toggle("is-on", k < n));
    });
    areaEstrelas.appendChild(s);
  }

  const areaChips = $("#rate-chips");
  PONTOS_POSITIVOS.forEach(p => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = p;
    b.addEventListener("click", () => {
      if (marcados.has(p)) marcados.delete(p); else marcados.add(p);
      b.classList.toggle("is-on");
    });
    areaChips.appendChild(b);
  });

  $("#rate-send").addEventListener("click", () => {
    if (!nota) { aviso("Escolha de 1 a 5 estrelas."); return; }
    aula.nota = nota;
    aula.comentario = $("#rate-text").value.trim();
    aula.pontos = Array.from(marcados);
    aula.status = "concluida";
    Armazem.gravar("aulas", aulas);
    aviso("Avaliação enviada. Obrigado.");
    irPara("lessons");
  });

  $("#rate-report").addEventListener("click", () =>
    aviso("Denúncia registrada. Nossa equipe analisa em até 24 horas e o instrutor pode ser suspenso durante a apuração."));
}

/* ============================================================
   TELA 8 - CADASTRO DE INSTRUTOR
   ============================================================ */
const LIMITE_ARQUIVO = 5 * 1024 * 1024;   // 5 MB
const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const pesoBonito = b => b < 1024 * 1024 ? Math.round(b / 1024) + " KB" : (b / 1048576).toFixed(1) + " MB";

function montarCadastro() {
  if ($("#sg-cidade").options.length) return;   // ja montado

  $("#sg-cidade").innerHTML = CIDADES.map(c => `<option>${c}</option>`).join("");

  const areaEsp = $("#sg-especialidades");
  DIFICULDADES.forEach(d => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = d;
    b.addEventListener("click", () => {
      const s = estado.cadastro.especialidades;
      if (s.has(d)) s.delete(d); else s.add(d);
      b.classList.toggle("is-on");
    });
    areaEsp.appendChild(b);
  });

  const tel = $("#sg-tel");
  tel.addEventListener("input", () => { tel.value = mascaraTel(tel.value); });

  // caixas de envio de documento
  $("#sg-docs").innerHTML = DOCUMENTOS.map(d => `
    <div class="dropzone" data-doc="${d.id}">
      <div class="dz-top">
        <div>
          <div class="dz-title">${escapar(d.titulo)}${d.obrigatorio
            ? '<span class="dz-req">obrigatório</span>'
            : '<span class="dz-opt">opcional</span>'}</div>
          <div class="dz-desc">${escapar(d.desc)}</div>
        </div>
        <button class="dz-pick" type="button" data-pick="${d.id}">Escolher arquivo</button>
      </div>
      <input type="file" id="file-${d.id}" accept="image/jpeg,image/png,image/webp,application/pdf" hidden>
      <div class="dz-slot" id="slot-${d.id}"></div>
    </div>`).join("");

  DOCUMENTOS.forEach(d => {
    const entrada = $("#file-" + d.id);
    $(`[data-pick="${d.id}"]`).addEventListener("click", () => entrada.click());
    entrada.addEventListener("change", () => {
      const arq = entrada.files && entrada.files[0];
      if (!arq) return;
      if (!TIPOS_ACEITOS.includes(arq.type)) { aviso("Aceitamos só JPG, PNG, WEBP ou PDF."); entrada.value = ""; return; }
      if (arq.size > LIMITE_ARQUIVO) { aviso("O arquivo passa de 5 MB. Reduza e tente de novo."); entrada.value = ""; return; }
      estado.cadastro.docs[d.id] = { id: d.id, nome: arq.name, tamanho: arq.size, tipo: arq.type };
      arquivosNaMemoria[d.id] = arq;
      desenharArquivo(d.id);
    });
  });

  $$("[data-step-next]").forEach(b => b.addEventListener("click", () => trocarEtapa(Number(b.dataset.stepNext))));
  $("#sg-send").addEventListener("click", enviarCadastro);
}

function desenharArquivo(docId) {
  const info = estado.cadastro.docs[docId];
  const caixa = $(`[data-doc="${docId}"]`);
  const slot = $("#slot-" + docId);
  if (!info) { slot.innerHTML = ""; caixa.classList.remove("is-filled"); return; }
  caixa.classList.remove("has-error");
  caixa.classList.add("is-filled");
  slot.innerHTML = `
    <div class="dz-file">
      <span class="nome">${escapar(info.nome)}</span>
      <span class="peso">${pesoBonito(info.tamanho)}</span>
      <button class="tirar" type="button" title="Remover">&times;</button>
    </div>`;
  $(".tirar", slot).addEventListener("click", () => {
    delete estado.cadastro.docs[docId];
    delete arquivosNaMemoria[docId];
    $("#file-" + docId).value = "";
    desenharArquivo(docId);
  });
}

function dadosCadastro() {
  return {
    nome: $("#sg-nome").value.trim(),
    credencialNum: $("#sg-credencial").value.trim(),
    email: $("#sg-email").value.trim(),
    telefone: $("#sg-tel").value.trim(),
    cidade: $("#sg-cidade").value,
    bairro: $("#sg-bairro").value.trim(),
    anos: Number($("#sg-anos").value || 0),
    preco: Number($("#sg-preco").value || 0),
    carro: $("#sg-carro").value.trim(),
    cambio: $("#sg-cambio").value,
    bio: $("#sg-bio").value.trim(),
    soMulheres: $("#sg-so-mulheres").checked,
    especialidades: Array.from(estado.cadastro.especialidades)
  };
}

function validarEtapa1() {
  const d = dadosCadastro(), lista = [];
  if (d.nome.split(" ").filter(Boolean).length < 2) lista.push("Informe seu nome completo.");
  if (d.credencialNum.length < 4) lista.push("Informe o número da sua credencial do Detran.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) lista.push("Informe um e-mail válido.");
  if (soDigitos(d.telefone).length < 10) lista.push("Informe um telefone com DDD.");
  if (!d.bairro) lista.push("Informe o bairro de referência.");
  if (!d.preco || d.preco < 30) lista.push("Informe o preço da aula, a partir de R$ 30.");
  if (!d.carro) lista.push("Informe o modelo do seu carro.");
  if (!d.especialidades.length) lista.push("Escolha pelo menos uma especialidade.");
  if (d.bio.length < 20) lista.push("Escreva pelo menos uma frase sobre a sua aula.");
  return lista;
}

function validarEtapa2() {
  const lista = [];
  $$(".dropzone").forEach(z => z.classList.remove("has-error"));
  DOCUMENTOS.filter(d => d.obrigatorio).forEach(d => {
    if (!estado.cadastro.docs[d.id]) {
      lista.push("Falta anexar: " + d.titulo + ".");
      $(`[data-doc="${d.id}"]`).classList.add("has-error");
    }
  });
  if (!$("#sg-consent").checked) lista.push("Você precisa autorizar a verificação dos documentos.");
  return lista;
}

function trocarEtapa(n) {
  if (n >= 2) {
    const p1 = validarEtapa1();
    if (p1.length) { mostrarEtapa(1); erros("#sg-errors", p1); aviso(p1[0]); return; }
  }
  if (n >= 3) {
    const p2 = validarEtapa2();
    if (p2.length) { mostrarEtapa(2); erros("#sg-errors", p2); aviso(p2[0]); return; }
    desenharRevisao();
  }
  erros("#sg-errors", []);
  mostrarEtapa(n);
}

function mostrarEtapa(n) {
  $$(".signup-step").forEach(s => s.classList.toggle("is-on", Number(s.dataset.step) === n));
  $$("#signup-steps .step").forEach((s, k) => {
    s.classList.toggle("is-on", k + 1 === n);
    s.classList.toggle("is-done", k + 1 < n);
  });
  window.scrollTo({ top: 0 });
}

function desenharRevisao() {
  const d = dadosCadastro();
  const linha = (a, b) => `<div class="review-line"><span>${escapar(a)}</span><span>${escapar(b)}</span></div>`;
  const docs = DOCUMENTOS.map(doc => {
    const f = estado.cadastro.docs[doc.id];
    return `<div class="doc-item">
      <span class="ico">${f && f.tipo === "application/pdf" ? "PDF" : "IMG"}</span>
      <span><span class="nome">${escapar(doc.titulo)}</span>
      <span class="meta">${f ? escapar(f.nome) + " · " + pesoBonito(f.tamanho) : "não enviado"}</span></span>
      ${f ? '<span class="ok">anexado</span>' : (doc.obrigatorio ? '<span class="falta">falta</span>' : '<span class="meta" style="margin-left:auto">opcional</span>')}
    </div>`;
  }).join("");

  $("#sg-review").innerHTML = `
    <div class="review-box">
      ${linha("Nome", d.nome)}
      ${linha("Credencial", d.credencialNum)}
      ${linha("Contato", d.email + " · " + d.telefone)}
      ${linha("Atende em", d.bairro + ", " + d.cidade)}
      ${linha("Experiência", d.anos + " anos")}
      ${linha("Preço da aula", dinheiro(d.preco))}
      ${linha("Carro", d.carro + " · " + d.cambio)}
      ${linha("Especialidades", d.especialidades.join(", "))}
      ${d.soMulheres ? linha("Atendimento", "Somente mulheres") : ""}
    </div>
    <div class="section-label">Documentos anexados</div>
    ${docs}`;
}

function enviarCadastro() {
  const p = validarEtapa1().concat(validarEtapa2());
  if (p.length) { erros("#sg-errors", p); aviso(p[0]); return; }

  const d = dadosCadastro();
  const iniciais = d.nome.split(" ").filter(Boolean).map(x => x[0]).slice(0, 2).join("").toUpperCase();
  const hoje = new Date();
  const candidatura = Object.assign({}, d, {
    id: "c" + Date.now(),
    iniciais,
    genero: d.soMulheres ? "f" : "",
    status: "pendente",
    enviadoEm: `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`,
    docs: Object.values(estado.cadastro.docs)
  });

  candidaturas.unshift(candidatura);
  Armazem.gravar("candidaturas", candidaturas);

  $("#done-content").innerHTML = `
    <div class="big-check">&#10003;</div>
    <div class="done-title">Cadastro enviado</div>
    <p class="done-text">
      Recebemos seus dados e seus documentos, ${escapar(d.nome.split(" ")[0])}.<br>
      Um especialista da nossa equipe confere a credencial no Detran e os antecedentes.<br>
      A resposta chega em <b>${escapar(d.email)}</b> em até 3 dias úteis.
    </p>
    <button class="btn btn--block" id="done-home" type="button">Voltar ao início</button>`;
  $("#done-home").addEventListener("click", () => irPara("home"));
  irPara("done");

  // limpa para um proximo cadastro
  estado.cadastro = { especialidades: new Set(), docs: {} };
  $$("#screen-signup input, #screen-signup textarea").forEach(c => {
    if (c.type === "checkbox") c.checked = false; else c.value = "";
  });
  $$("#sg-especialidades .chip").forEach(c => c.classList.remove("is-on"));
  DOCUMENTOS.forEach(doc => desenharArquivo(doc.id));
  mostrarEtapa(1);
}

/* ============================================================
   TELA 9 - LOGIN DO ESPECIALISTA
   Isto e um login de demonstracao, conferido no proprio navegador.
   Em producao a conferencia tem que acontecer no servidor.
   ============================================================ */
function montarLogin() {
  $("#staff-enter").addEventListener("click", () => {
    const email = $("#staff-email").value.trim().toLowerCase();
    const senha = $("#staff-senha").value;
    const quem = ESPECIALISTAS.find(e => e.email === email && e.senha === senha);
    if (!quem) {
      erros("#staff-errors", ["E-mail ou senha incorretos."]);
      return;
    }
    erros("#staff-errors", []);
    sessao = { nome: quem.nome, email: quem.email };
    Armazem.gravar("sessao", sessao);
    $("#staff-senha").value = "";
    irPara("queue");
  });

  $("#staff-senha").addEventListener("keydown", e => { if (e.key === "Enter") $("#staff-enter").click(); });

  $("#staff-exit").addEventListener("click", () => {
    sessao = null;
    Armazem.gravar("sessao", null);
    aviso("Você saiu da área do especialista.");
    irPara("home");
  });

  $$("#queue-tabs .tab-btn").forEach(b => b.addEventListener("click", () => {
    estado.filaAba = b.dataset.queue;
    $$("#queue-tabs .tab-btn").forEach(x => x.classList.toggle("is-on", x === b));
    desenharFila();
  }));
}

/* ============================================================
   TELA 10 - FILA DE APROVACAO
   ============================================================ */
function desenharFila() {
  if (!sessao) { irPara("staff"); return; }
  $("#queue-hello").textContent = "Olá, " + sessao.nome.split(" ")[0];

  const lista = candidaturas.filter(c => c.status === estado.filaAba);
  const alvo = $("#queue-list");

  const vazio = {
    pendente: "Nenhum cadastro esperando análise agora.",
    aprovado: "Nenhum instrutor aprovado ainda.",
    reprovado: "Nenhum cadastro reprovado."
  }[estado.filaAba];

  if (!lista.length) {
    alvo.className = "cards cards--one";
    alvo.innerHTML = `<div class="empty">${vazio}</div>`;
    return;
  }

  alvo.className = "cards";
  alvo.innerHTML = lista.map(c => {
    const faltando = DOCUMENTOS.filter(d => d.obrigatorio && !(c.docs || []).some(x => x.id === d.id));
    const selo = { pendente: "seal--volt", aprovado: "", reprovado: "seal--coral" }[c.status];
    return `
      <button class="card" data-abrir="${c.id}" type="button">
        <div class="card-row">
          <div class="avatar">${escapar(c.iniciais)}</div>
          <div>
            <div class="card-name">${escapar(c.nome)}</div>
            <div class="card-sub">${escapar(c.bairro)}, ${escapar(c.cidade)} &middot; ${c.anos} anos</div>
            <div class="card-sub">Credencial ${escapar(c.credencialNum)} &middot; enviado em ${escapar(c.enviadoEm)}</div>
          </div>
          <span class="badge ${c.status === "aprovado" ? "badge--done" : ""}">${escapar(c.status)}</span>
        </div>
        <div class="seals">
          <span class="seal ${selo}">${(c.docs || []).length} documento(s)</span>
          ${faltando.length
            ? `<span class="seal seal--coral">falta ${escapar(faltando.map(f => f.titulo.split(" ")[0]).join(", "))}</span>`
            : '<span class="seal">documentos completos</span>'}
        </div>
      </button>`;
  }).join("");

  $$("[data-abrir]", alvo).forEach(b =>
    b.addEventListener("click", () => irPara("review", b.dataset.abrir)));
}

/* ============================================================
   TELA 11 - ANALISE DE UM CADASTRO
   ============================================================ */
function montarAnalise(id) {
  if (!sessao) { irPara("staff"); return; }
  const c = candidaturas.find(x => x.id === id);
  if (!c) { irPara("queue"); return; }

  const linha = (a, b) => `<div class="review-line"><span>${escapar(a)}</span><span>${escapar(b)}</span></div>`;
  const docs = DOCUMENTOS.map(d => {
    const f = (c.docs || []).find(x => x.id === d.id);
    return `<div class="doc-item">
      <span class="ico">${f && /pdf/i.test(f.nome) ? "PDF" : "IMG"}</span>
      <span><span class="nome">${escapar(d.titulo)}</span>
      <span class="meta">${f ? escapar(f.nome) + " · " + pesoBonito(f.tamanho) : "não enviado"}</span></span>
      ${f ? '<span class="ok">anexado</span>'
          : (d.obrigatorio ? '<span class="falta">obrigatório e falta</span>' : '<span class="meta" style="margin-left:auto">opcional</span>')}
    </div>`;
  }).join("");

  const decidido = c.status !== "pendente";

  $("#review-content").innerHTML = `
    <span class="eyebrow">Análise de cadastro</span>
    <h1 class="page-title">${escapar(c.nome)}</h1>
    <div class="booking-grid">
      <div class="panel">
        <div class="review-box">
          ${linha("Credencial do Detran", c.credencialNum)}
          ${linha("Contato", c.email + " · " + c.telefone)}
          ${linha("Atende em", c.bairro + ", " + c.cidade)}
          ${linha("Experiência", c.anos + " anos")}
          ${linha("Preço da aula", dinheiro(c.preco))}
          ${linha("Carro", c.carro + " · " + c.cambio)}
          ${linha("Especialidades", (c.especialidades || []).join(", "))}
          ${c.soMulheres ? linha("Atendimento", "Somente mulheres") : ""}
          ${linha("Enviado em", c.enviadoEm)}
        </div>
        <div class="section-label">Sobre, escrito pelo instrutor</div>
        <div class="quote">${escapar(c.bio)}</div>
        <div class="section-label">Documentos</div>
        ${docs}
        <p class="note">Os arquivos ficam criptografados e só aparecem aqui, para a pessoa que analisa. Nada disso vai para o perfil público.</p>
      </div>

      <aside class="panel panel--sticky">
        <div class="sidebar-head">Decisão</div>
        ${decidido
          ? `<p class="note">Este cadastro já foi <b>${escapar(c.status)}</b>.
             ${c.motivo ? "<br>Motivo registrado: " + escapar(c.motivo) : ""}</p>
             <button class="btn btn--line btn--block btn--sm" id="rev-voltar" type="button">Voltar para a fila</button>`
          : `<div class="check-line"><span class="tick">&#10003;</span><span>Confira o número da credencial no cadastro do Detran</span></div>
             <div class="check-line"><span class="tick">&#10003;</span><span>Veja se a certidão tem menos de 90 dias</span></div>
             <div class="check-line"><span class="tick">&#10003;</span><span>Confira se o nome bate em todos os documentos</span></div>
             <div class="field-label">Observação (aparece no e-mail)</div>
             <textarea class="textarea" id="rev-motivo" placeholder="Obrigatório se reprovar."></textarea>
             <button class="btn btn--volt btn--block" id="rev-ok" type="button">Aprovar instrutor</button>
             <button class="btn btn--line btn--block btn--sm" id="rev-nao" type="button">Reprovar</button>
             <div class="errors" id="rev-errors"></div>`}
      </aside>
    </div>`;

  if (decidido) {
    $("#rev-voltar").addEventListener("click", () => irPara("queue"));
    return;
  }

  $("#rev-ok").addEventListener("click", () => {
    const faltando = DOCUMENTOS.filter(d => d.obrigatorio && !(c.docs || []).some(x => x.id === d.id));
    if (faltando.length) {
      erros("#rev-errors", ["Não dá para aprovar sem: " + faltando.map(f => f.titulo).join(", ") + "."]);
      return;
    }
    c.status = "aprovado";
    c.motivo = $("#rev-motivo").value.trim();
    Armazem.gravar("candidaturas", candidaturas);
    aviso(c.nome.split(" ")[0] + " foi aprovado e já aparece na busca dos alunos.");
    irPara("queue");
  });

  $("#rev-nao").addEventListener("click", () => {
    const motivo = $("#rev-motivo").value.trim();
    if (motivo.length < 5) {
      erros("#rev-errors", ["Escreva o motivo da reprovação. O instrutor recebe isso por e-mail."]);
      return;
    }
    c.status = "reprovado";
    c.motivo = motivo;
    Armazem.gravar("candidaturas", candidaturas);
    aviso("Cadastro reprovado e o motivo foi registrado.");
    irPara("queue");
  });
}

/* ============================================================
   PARTIDA
   ============================================================ */
function iniciar() {
  montarInicio();
  montarFiltros();
  montarCamposEndereco();
  montarAulaAoVivo();
  montarLogin();

  $("#booking-confirm").addEventListener("click", confirmarAgendamento);
  $("#modal-fechar").addEventListener("click", () => { $("#modal-email").hidden = true; });
  $("#modal-email").addEventListener("click", e => {
    if (e.target.id === "modal-email") $("#modal-email").hidden = true;
  });
  $$("[data-back]").forEach(b => b.addEventListener("click", voltar));
  $$("[data-go]").forEach(b => b.addEventListener("click", () => irPara(b.dataset.go)));

  mostrar("home");
  try { history.replaceState({ p: 0, tela: "home" }, "", "#home"); } catch (e) {}
}

document.addEventListener("DOMContentLoaded", iniciar);

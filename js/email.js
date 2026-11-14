/* ============================================================
   Destrava - envio de e-mail de confirmacao

   COMO LIGAR O ENVIO DE VERDADE (leva uns 10 minutos):

   1. Crie uma conta gratuita em emailjs.com (200 e-mails por mes).
   2. Em "Email Services", conecte um Gmail e copie o Service ID.
   3. Em "Email Templates", crie um template e copie o Template ID.
      No corpo do template use exatamente estas variaveis:
         Para:     {{to_email}}
         Assunto:  {{subject}}
         Conteudo: {{message}}
   4. Em "Account", copie a Public Key.
   5. Preencha os quatro campos abaixo e troque ativo para true.

   Enquanto ativo for false, o aplicativo nao envia nada: ele mostra
   na tela exatamente os dois e-mails que seriam enviados. Isso serve
   para demonstrar o fluxo sem depender de internet nem de conta.

   ATENCAO: a chave publica fica visivel no codigo do site, porque
   nao existe servidor. Para um trabalho de faculdade tudo bem. Para
   valer, o envio tem que sair de um servidor.
   ============================================================ */

const EMAIL_CONFIG = {
  ativo: false,
  servico: "",
  template: "",
  chavePublica: "",

  /* Para onde vai o aviso quando o instrutor nao tem e-mail cadastrado.
     Durante os testes do grupo, coloque aqui o e-mail de quem esta
     fazendo o papel de instrutor. */
  emailInstrutorTeste: ""
};

/* ---------- monta o texto dos dois e-mails ---------- */
function montarEmails(aula, usuario, instrutor) {
  const quando = `${aula.semana} ${aula.dataRotulo} às ${aula.hora}`;
  const carro = aula.carro === "aluno" ? "no carro do aluno" : "no carro do instrutor";
  const grava = aula.gravar ? "Sim, o aluno pediu gravação do áudio." : "Não.";

  const paraAluno = {
    para: usuario.email,
    assunto: `Aula confirmada com ${instrutor.nome} em ${aula.dataRotulo}`,
    corpo:
`Olá, ${usuario.nome.split(" ")[0]}.

Sua aula está confirmada.

Instrutor: ${instrutor.nome}
Quando: ${quando}
Onde: ${aula.endereco}
Carro: ${carro}
Valor: ${"R$ " + aula.total.toFixed(2).replace(".", ",")}

No dia da aula, abra o aplicativo e toque em Iniciar aula. A partir daí
o trajeto aparece no mapa e você pode enviar sua localização para
${aula.contatoNome}, que você cadastrou como contato de confiança.

Se precisar cancelar, faça isso pelo aplicativo, em Minhas aulas.

Equipe Destrava`
  };

  const paraInstrutor = {
    para: instrutor.email || EMAIL_CONFIG.emailInstrutorTeste,
    assunto: `Nova aula marcada: ${usuario.nome} em ${aula.dataRotulo}`,
    corpo:
`Olá, ${instrutor.nome.split(" ")[0]}.

Um aluno marcou uma aula com você pelo aplicativo.

Aluno: ${usuario.nome}
Contato do aluno: ${usuario.email}
Quando: ${quando}
Onde: ${aula.endereco}
Carro: ${carro}
Dificuldade informada: ${aula.dificuldade || "não informada"}
Gravação de áudio: ${grava}

O aluno indicou ${aula.contatoNome} como contato de confiança, que vai
acompanhar a localização durante a aula.

Equipe Destrava`
  };

  return [paraAluno, paraInstrutor];
}

/* ---------- envia, ou mostra na tela ---------- */
async function enviarEmails(aula, usuario, instrutor) {
  const emails = montarEmails(aula, usuario, instrutor);
  const configurado = EMAIL_CONFIG.ativo && EMAIL_CONFIG.servico
    && EMAIL_CONFIG.template && EMAIL_CONFIG.chavePublica
    && typeof emailjs !== "undefined";

  if (!configurado) { mostrarPreviaEmail(emails, false); return { enviado: false }; }

  try {
    emailjs.init({ publicKey: EMAIL_CONFIG.chavePublica });
    for (const e of emails) {
      if (!e.para) continue;
      await emailjs.send(EMAIL_CONFIG.servico, EMAIL_CONFIG.template, {
        to_email: e.para, subject: e.assunto, message: e.corpo
      });
    }
    return { enviado: true };
  } catch (erro) {
    mostrarPreviaEmail(emails, true);
    return { enviado: false, erro };
  }
}

/* ---------- caixa que mostra os e-mails ---------- */
const escHtml = t => String(t == null ? "" : t)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function mostrarPreviaEmail(emails, houveFalha) {
  const caixa = document.getElementById("modal-email");
  if (!caixa) return;

  document.getElementById("modal-aviso").textContent = houveFalha
    ? "O envio falhou, então aqui está o conteúdo dos e-mails. Confira as chaves em js/email.js."
    : "O envio de e-mail ainda não foi ligado, então estes são os dois e-mails que sairiam agora. As instruções para ligar estão em js/email.js.";

  document.getElementById("modal-corpo").innerHTML = emails.map(e => `
    <div class="email-card">
      <div class="email-linha"><span>Para</span><b>${escHtml(e.para || "sem e-mail cadastrado")}</b></div>
      <div class="email-linha"><span>Assunto</span><b>${escHtml(e.assunto)}</b></div>
      <pre class="email-corpo">${escHtml(e.corpo)}</pre>
    </div>`).join("");

  caixa.hidden = false;
}

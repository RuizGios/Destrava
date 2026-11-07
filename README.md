# Destrava

Aplicativo web de aulas de direção avulsas e monitoradas para quem já tem CNH.
Projeto da disciplina de Empreendedorismo, FT-Unicamp.

No ar em: https://ruizgios.github.io/Destrava/

---

## 1. O que é cada arquivo

```
Destrava/
├── index.html        todas as telas, uma dentro de cada <section>
├── manifest.json     permite instalar o app na tela inicial do celular
├── icon.svg          ícone do app
├── css/
│   └── style.css     todo o visual. As cores ficam no topo, em :root
└── js/
    ├── data.js       instrutores, cidades, preços, documentos exigidos
    └── app.js        navegação, busca, agendamento, GPS, cadastro, aprovação
```

Cinco arquivos. Sem instalação, sem npm, sem build.

---

## 2. Como atualizar o site depois de mexer

1. Abra https://github.com/RuizGios/Destrava
2. Clique em **Add file**, depois em **Upload files**
3. Arraste os arquivos trocados. O GitHub substitui os que já existem.
4. Clique em **Commit changes**
5. Em 1 ou 2 minutos o link já está com a versão nova. Se não mudar, aperte Ctrl+Shift+R para o navegador parar de usar a versão guardada.

Para editar um arquivo só, dá para clicar nele no GitHub, apertar o lápis, mexer no texto e salvar. É mais rápido para mudanças pequenas.

---

## 3. Como rodar no seu computador

Dois cliques no `index.html` resolve quase tudo. Só o GPS e a instalação na tela inicial exigem um servidor. Para ter um:

```
python -m http.server 8000
```

Depois abra `http://localhost:8000`. No VS Code, a extensão **Live Server** faz o mesmo com um clique.

---

## 4. O que o app faz

**Lado do aluno**
- Escolha entre dois perfis: já tenho CNH ou estou tirando a primeira habilitação
- Busca começando pela dificuldade (estrada, baliza, ladeira, medo de dirigir e outras), com a opção "qualquer uma, só quero praticar" para quem não sabe dizer
- Filtros por gênero do instrutor, câmbio, nota e preço
- Perfil com verificações, especialidades, carro e avaliações
- Agendamento com data, horário, escolha do carro e cálculo do preço
- Endereço preenchido automaticamente pelo CEP, com número e complemento separados
- Contato de confiança obrigatório
- Aula ao vivo com GPS, compartilhamento de localização e botão de emergência
- Avaliação com estrelas, pontos positivos e denúncia

No modo primeira habilitação o app mostra o aviso sobre a LAV, trava a aula no carro do instrutor com duplo pedal e lista só os instrutores que atendem esse público. O campo `primeira: true` em `js/data.js` define quem atende.

**Lado do instrutor**
- Cadastro em três etapas: dados, documentos e revisão
- Envio de credencial do Detran, CNH, antecedentes criminais, CRLV e foto
- Aviso de privacidade e consentimento antes de enviar

**Lado da equipe**
- Login restrito para especialistas
- Fila de cadastros pendentes, aprovados e reprovados
- Tela de análise com todos os dados e a lista de documentos
- Aprovar ou reprovar com observação, e o aprovado passa a aparecer na busca dos alunos

**Acesso de demonstração do especialista**
e-mail `ana@destrava.app`, senha `destrava2026`

---

## 5. Como mexer em cada coisa

### Adicionar instrutor
`js/data.js`, lista `INSTRUTORES`. Copie um bloco, cole embaixo e troque os valores. O `id` tem que ser diferente de todos os outros.

### Mudar preços
`js/data.js`, no topo:

```js
const PRECOS = {
  taxaSeguranca: 5,
  descontoCarroAluno: 20
};
```

### Mudar as cores e as fontes
`css/style.css`, nas primeiras linhas:

```css
--ink:#0E1A17;     /* verde quase preto, a base */
--volt:#CBFF4D;    /* verde limão, a cor de destaque */
--paper:#F6F3EC;   /* creme do fundo */
--coral:#FF5436;   /* emergência */
```

### Adicionar cidade
`js/data.js`, lista `CIDADES`. Lembre de ter pelo menos um instrutor nela.

### Mudar os documentos exigidos
`js/data.js`, lista `DOCUMENTOS`. O campo `obrigatorio` define se o cadastro pode ser enviado sem ele.

### Criar outro especialista
`js/data.js`, lista `ESPECIALISTAS`.

### Mudar os nomes do rodapé
`index.html`, dentro de `<footer class="rodape">`, na lista `equipe-lista`.

---

## 6. Identidade visual

- **Cores:** verde quase preto como base, verde limão como destaque e fundo creme. A ideia é parecer confiável sem parecer autoescola.
- **Fontes:** Space Grotesk nos títulos e Inter no texto, as duas do Google Fonts.
- **Motivo gráfico:** a faixa tracejada da estrada, que aparece no logo, embaixo do título principal e como divisor.
- **Botões:** fundo escuro com texto limão nas ações comuns, e limão com texto escuro na ação principal de cada tela.

---

## 7. Proteção dos dados dos instrutores

O cadastro pede documento com foto, então isso precisa estar resolvido antes de qualquer instrutor real usar o app. O que já está no produto e o que falta:

**Já está no app**
- Só pedimos o que é necessário para verificar que a pessoa pode dar aula
- O instrutor lê o aviso de privacidade e precisa autorizar antes de enviar
- Nenhum documento aparece no perfil público. O aluno vê só o selo de verificado
- Os arquivos só aparecem na tela de análise, para quem está logado como especialista

**Falta fazer antes de valer para gente de verdade**
- Os arquivos precisam ir para um armazenamento privado no servidor, com link assinado e prazo de validade, nunca ficar no navegador
- O login do especialista precisa ser conferido no servidor. Hoje ele é conferido no próprio navegador, o que serve para demonstração e não para produção
- Registro de quem abriu cada documento e quando
- Apagar os arquivos automaticamente depois de 90 dias da aprovação
- Botão para o instrutor pedir a exclusão dos dados dele
- Definir quem é o encarregado pelos dados, que a LGPD exige

Se o professor perguntar sobre LGPD, essa lista é a resposta. A base legal é o consentimento para a verificação e a execução do contrato para o resto.

---

## 8. O que ainda não funciona, de propósito

- **Pagamento.** Na Fase 1 o aluno acerta direto com o instrutor. A comissão entra na Fase 2.
- **Dados compartilhados entre aparelhos.** Cada navegador guarda os próprios dados. O próximo passo é o Firebase Firestore, que tem plano gratuito.
- **Arquivos dos documentos.** O app guarda o nome, o tamanho e o tipo. O arquivo em si só existe enquanto a aba estiver aberta.
- **Gravação de áudio.** A opção aparece e fica registrada na aula, mas ainda não grava.
- **E-mail de aprovação.** O app mostra na tela, mas não dispara e-mail.

Isso não é falha, é escopo. O MVP existe para testar se as pessoas usam o fluxo.

---

## 9. Divisão sugerida entre os 7

| Dupla ou pessoa | Responsabilidade |
| --- | --- |
| 1 e 2 | Cadastrar instrutores reais em `data.js` depois das entrevistas |
| 3 | Visual: revisar cores, textos e a tela de abertura |
| 4 e 5 | Testar o GPS na rua, no celular, com a aula em movimento |
| 6 | Publicação no GitHub e teste em Android e em iPhone |
| 7 | Roteiro do pitch e teste com as 3 alunas confirmadas |

Combine que só uma pessoa sobe arquivos por vez, para ninguém sobrescrever o trabalho do outro.

---

## 10. Cronograma até o pitch de 17/11

| Até | Entrega |
| --- | --- |
| 08/11 | Versão nova no ar e testada por todo o grupo |
| 10/11 | Instrutores reais no lugar dos de exemplo |
| 12/11 | GPS testado na rua, no celular |
| 14/11 | Teste do fluxo inteiro com as 3 alunas confirmadas |
| 15/11 | Correção do que elas apontarem |
| 16/11 | Ensaio do pitch com o link aberto no celular |
| 17/11 | Pitch |

---

## 11. Se algo quebrar

Aperte **F12** e abra a aba **Console**. O erro aparece em vermelho com o arquivo e a linha. Quase sempre é uma vírgula ou uma chave faltando em `data.js`.

O mapa tem duas versões. Se a internet estiver ruim e o Leaflet não carregar, o app desenha sozinho um mapa simples e a demonstração continua. A etiqueta no canto mostra "Localização ao vivo" quando o GPS está funcionando e "Modo demonstração" quando o trajeto está sendo simulado.

A busca de CEP usa o ViaCEP, que é gratuito. Se ele estiver fora do ar, o aluno clica em "Não sei o CEP, quero digitar o endereço" e preenche à mão.

# Destrava

Aplicativo web de aulas de direção avulsas para quem já tem CNH.
Projeto da disciplina de Empreendedorismo, FT-Unicamp.

---

## 1. O que é cada arquivo

```
destrava/
├── index.html        todas as telas do app, uma dentro de cada <section>
├── manifest.json     faz o app poder ser instalado na tela inicial do celular
├── icon.svg          ícone do app
├── css/
│   └── style.css     todo o visual. As cores ficam no topo, em :root
└── js/
    ├── data.js       lista de instrutores, dificuldades e preços
    └── app.js        a lógica: navegação, filtros, agendamento, GPS, avaliação
```

São cinco arquivos. Não existe instalação, não existe npm, não existe build.
Quem souber mexer em HTML mexe aqui, e quem não souber aprende em um dia.

---

## 2. Como abrir no seu computador

Baixe a pasta e dê dois cliques no `index.html`. O app abre no navegador.

Isso funciona para quase tudo. Só duas coisas exigem um servidor local:
o GPS do navegador e a instalação na tela inicial. Para ter um servidor,
abra o terminal na pasta e rode:

```
python -m http.server 8000
```

Depois acesse `http://localhost:8000` no navegador.

Quem usa VS Code pode instalar a extensão **Live Server** e clicar em
"Go Live" no canto inferior direito. Dá no mesmo e é mais fácil.

---

## 3. Como publicar e ter o link público

O plano é o GitHub Pages. É grátis, não pede cartão e o link funciona para
qualquer pessoa. Dá para fazer tudo pelo site, sem instalar o Git.

**Passo 1.** Uma pessoa do grupo cria conta em github.com.

**Passo 2.** Clica em **New repository**. Nome: `destrava`. Marque
**Public**. Clique em **Create repository**.

**Passo 3.** Na tela do repositório, clique em **uploading an existing file**.
Arraste a pasta inteira do projeto para a área indicada. Espere subir e
clique em **Commit changes**.

**Passo 4.** Vá em **Settings**, no menu lateral clique em **Pages**.
Em "Source" escolha **Deploy from a branch**. Em "Branch" escolha **main**
e a pasta **/ (root)**. Clique em **Save**.

**Passo 5.** Espere de 1 a 2 minutos e recarregue a página. O link aparece
no topo, nesse formato:

```
https://SEUUSUARIO.github.io/destrava/
```

Esse é o link que vocês mandam para o professor e para os investidores.

**Passo 6.** Para os outros 6 integrantes editarem, vá em **Settings**,
**Collaborators**, **Add people** e coloque o usuário de cada um.

> Se o Git travar na véspera, o plano B é o **Netlify Drop**. Entre em
> app.netlify.com/drop, arraste a pasta e o link sai na hora. Serve como
> emergência, mas o GitHub é melhor porque guarda o histórico e mostra que
> vocês desenvolveram.

---

## 4. Como mexer em cada coisa

### Adicionar ou mudar um instrutor
Abra `js/data.js`. Copie um bloco inteiro de instrutor, cole embaixo e troque
os valores. O `id` precisa ser diferente de todos os outros.

### Mudar preços
No mesmo arquivo, no topo:

```js
const PRECOS = {
  taxaSeguranca: 5,
  descontoCarroAluno: 20
};
```

O preço que aparece é o `preco` do instrutor, menos o desconto quando o aluno
usa o carro dele.

### Mudar as cores
Abra `css/style.css`. As primeiras linhas são todas as cores do app:

```css
--accent:#0E6B5C;     /* verde principal */
--warn:#B3321F;       /* vermelho da emergência */
```

Trocou ali, mudou no app inteiro.

### Adicionar uma dificuldade nova
Em `js/data.js`, na lista `DIFICULDADES`. Depois adicione essa mesma
dificuldade na lista `especialidades` de pelo menos um instrutor, senão a
busca não vai achar ninguém.

---

## 5. Divisão sugerida entre os 7

| Dupla ou pessoa | Responsabilidade |
| --- | --- |
| 1 e 2 | Dados reais: cadastrar instrutores de verdade em `data.js` depois das entrevistas |
| 3 | Visual: ajustar cores, ícones e a tela de abertura |
| 4 e 5 | Tela da aula ao vivo: testar o GPS no celular de verdade, na rua |
| 6 | Publicação: GitHub, link, testar em Android e em iPhone |
| 7 | Roteiro do pitch e teste com as 3 alunas confirmadas |

Combine que só uma pessoa sobe arquivos por vez, para ninguém sobrescrever o
trabalho do outro.

---

## 6. Cronograma até o pitch de 17/11

| Até | Entrega |
| --- | --- |
| 08/11 | Projeto no GitHub e link público funcionando |
| 10/11 | Instrutores reais cadastrados no lugar dos de exemplo |
| 12/11 | GPS testado na rua, no celular, com a aula em movimento |
| 14/11 | Teste com as 3 alunas confirmadas, do início ao fim |
| 15/11 | Correção do que elas apontarem |
| 16/11 | Ensaio do pitch com o link aberto no celular |
| 17/11 | Pitch |

---

## 7. O que já funciona e o que não funciona

**Funciona de verdade:**
busca por dificuldade e cidade, filtros, perfil do instrutor, agendamento com
cálculo de preço, aulas salvas no aparelho, GPS ao vivo durante a aula,
compartilhamento da localização, botão de emergência, avaliação com estrelas e
denúncia.

**Ainda não funciona, e é proposital nesta fase:**

- **Pagamento.** Na Fase 1 o aluno acerta direto com o instrutor. Entra só na
  Fase 2, junto com a comissão.
- **Cadastro de instrutor pelo próprio instrutor.** Hoje o grupo cadastra à
  mão em `data.js`, depois de conferir a credencial do Detran e os
  antecedentes.
- **Dados compartilhados entre aparelhos.** As aulas ficam salvas no navegador
  de cada pessoa. Para ter banco de dados compartilhado, o próximo passo é o
  Firebase Firestore, que tem plano gratuito.
- **Gravação de áudio.** A opção aparece na tela, mas ainda não grava.

Se o professor ou um investidor perguntar, a resposta honesta é essa: o MVP
existe para testar se as pessoas usam o fluxo, não para faturar ainda.

---

## 8. Se algo quebrar

Aperte **F12** no navegador e abra a aba **Console**. O erro aparece lá em
vermelho, com o nome do arquivo e a linha. Na maioria das vezes é uma vírgula
ou uma chave faltando em `data.js`.

O mapa tem duas versões. Se a internet estiver ruim e o Leaflet não carregar,
o app desenha sozinho um mapa simples e a demonstração continua. A etiqueta no
canto do mapa mostra "Localização ao vivo" quando o GPS está funcionando e
"Modo demonstração" quando o trajeto está sendo simulado.

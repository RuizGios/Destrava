/* ============================================================
   Destrava - dados do aplicativo
   Enquanto nao existe banco de dados, os cadastros ficam aqui.
   Para adicionar um instrutor, copie um bloco e troque os valores.
   ============================================================ */

/* Opcao para quem nao sabe dizer a dificuldade e so quer praticar. */
const QUALQUER = "Qualquer uma, só quero praticar";

const DIFICULDADES = [
  "Pegar estrada",
  "Dirigir na cidade",
  "Baliza",
  "Ladeira",
  "Dirigir à noite",
  "Medo de dirigir",
  "Câmbio manual",
  "Voltar a dirigir"
];

/* Quem esta usando o app. Muda quem aparece na busca e as regras da aula. */
const PERFIS = [
  { id: "habilitado", titulo: "Já tenho CNH", desc: "Quero praticar ou perder o medo" },
  { id: "primeira",   titulo: "Estou tirando a primeira", desc: "Preciso das aulas oficiais" }
];

const AVISO_PRIMEIRA = "Para a primeira habilitação a aula é registrada no Detran e só pode ser feita no carro do instrutor, com duplo pedal. Você precisa estar com a LAV (Licença de Aprendizagem Veicular) em dia.";

const CIDADES = ["Limeira, SP", "Campinas, SP", "Americana, SP", "Piracicaba, SP"];

const PRECOS = {
  taxaSeguranca: 5,
  descontoCarroAluno: 20   // quanto a aula fica mais barata com o carro do aluno
};

/* Contas dos especialistas que analisam os cadastros de instrutor.
   Isto e um login de demonstracao. Antes de ir para producao, a
   autenticacao precisa ser feita no servidor, nunca no navegador. */
const ESPECIALISTAS = [
  { email: "ana@destrava.app", senha: "destrava2026", nome: "Ana Ruiz" },
  { email: "especialista@destrava.app", senha: "destrava2026", nome: "Equipe de Verificação" }
];

const INSTRUTORES = [
  {
    id: "renata", nome: "Renata Souza", iniciais: "RS", genero: "f",
    cidade: "Limeira, SP", bairro: "Centro",
    nota: 4.8, aulas: 94, anos: 7, preco: 85,
    cambio: "Manual e automático", carro: "Onix 2021, duplo pedal",
    especialidades: ["Pegar estrada", "Dirigir na cidade", "Medo de dirigir", "Voltar a dirigir"],
    bio: "Trabalho com quem ficou anos sem dirigir. A primeira aula é sempre em rua vazia, no seu ritmo.",
    avaliacoes: [
      { texto: "Fiquei 6 anos sem dirigir. Em duas aulas já peguei a rodovia tranquila.", autor: "Mariana F.", nota: 5.0 },
      { texto: "Muito paciente. Não me deixou nervosa em nenhum momento.", autor: "Débora L.", nota: 5.0 }
    ]
  },
  {
    id: "marcos", primeira: true, nome: "Marcos Vieira", iniciais: "MV", genero: "m",
    cidade: "Limeira, SP", bairro: "Centro",
    nota: 4.6, aulas: 143, anos: 9, preco: 80,
    cambio: "Manual e automático", carro: "Argo 2020, duplo pedal",
    especialidades: ["Baliza", "Dirigir na cidade", "Ladeira", "Câmbio manual"],
    bio: "Baliza e manobra em espaço apertado são minha especialidade. Treino em estacionamento antes de ir pra rua.",
    avaliacoes: [
      { texto: "Finalmente aprendi a balizar. Método simples e direto.", autor: "Caio M.", nota: 5.0 }
    ]
  },
  {
    id: "carla", primeira: true, nome: "Carla Martins", iniciais: "CM", genero: "f",
    cidade: "Limeira, SP", bairro: "Vila Queiroz",
    nota: 4.9, aulas: 128, anos: 11, preco: 95,
    cambio: "Automático", carro: "HB20 2022, duplo pedal",
    especialidades: ["Pegar estrada", "Dirigir na cidade", "Ladeira"],
    bio: "Onze anos de autoescola e agora atendo direto. Foco em rodovia e trânsito pesado.",
    avaliacoes: [
      { texto: "Me ensinou a entrar na Anhanguera sem pânico. Valeu cada real.", autor: "Rafael T.", nota: 5.0 }
    ]
  },
  {
    id: "joel", primeira: true, nome: "Joel Bastos", iniciais: "JB", genero: "m",
    cidade: "Limeira, SP", bairro: "Jardim Nova Europa",
    nota: 4.7, aulas: 112, anos: 13, preco: 82,
    cambio: "Manual", carro: "Saveiro 2019, duplo pedal",
    especialidades: ["Câmbio manual", "Ladeira", "Pegar estrada", "Voltar a dirigir"],
    bio: "Treze anos dando aula. Se o seu problema é morrer o carro na subida, eu resolvo isso em uma aula.",
    avaliacoes: [
      { texto: "Tranquilo e muito didático. Nunca levantou a voz comigo.", autor: "Simone R.", nota: 5.0 }
    ]
  },
  {
    id: "priscila", nome: "Priscila Alves", iniciais: "PA", genero: "f",
    cidade: "Limeira, SP", bairro: "Jardim Glória",
    nota: 4.7, aulas: 61, anos: 4, preco: 75,
    cambio: "Manual", carro: "Gol 2019, duplo pedal",
    especialidades: ["Dirigir à noite", "Pegar estrada", "Câmbio manual"],
    bio: "Atendo bastante quem tem dificuldade de dirigir à noite e quem está trocando de automático para manual.",
    avaliacoes: [
      { texto: "Aula à noite foi exatamente o que eu precisava.", autor: "Juliana P.", nota: 5.0 }
    ]
  },
  {
    id: "wesley", nome: "Wesley Nunes", iniciais: "WN", genero: "m",
    cidade: "Limeira, SP", bairro: "Vila Cidade Jardim",
    nota: 4.5, aulas: 47, anos: 3, preco: 70,
    cambio: "Automático", carro: "Kwid 2022, duplo pedal",
    especialidades: ["Medo de dirigir", "Dirigir na cidade", "Baliza"],
    bio: "Comecei atendendo colegas com medo de dirigir e virou meu trabalho. Primeira aula sem cobrar deslocamento.",
    avaliacoes: [
      { texto: "Super acessível no horário e me deixou à vontade.", autor: "Tiago B.", nota: 4.0 }
    ]
  },
  {
    id: "beatriz", nome: "Beatriz Rocha", iniciais: "BR", genero: "f",
    cidade: "Campinas, SP", bairro: "Barão Geraldo",
    nota: 5.0, aulas: 37, anos: 3, preco: 90,
    cambio: "Automático", carro: "Kwid 2023, duplo pedal",
    especialidades: ["Medo de dirigir", "Voltar a dirigir", "Dirigir na cidade"],
    bio: "Atendo só mulheres. Minha abordagem é devagar, com parada sempre que você precisar.",
    soMulheres: true,
    avaliacoes: [
      { texto: "Saber que era uma instrutora mulher foi o que me fez marcar.", autor: "Ana Clara S.", nota: 5.0 }
    ]
  },
  {
    id: "eduardo", nome: "Eduardo Lima", iniciais: "EL", genero: "m",
    cidade: "Campinas, SP", bairro: "Cambuí",
    nota: 4.5, aulas: 88, anos: 6, preco: 78,
    cambio: "Manual", carro: "Polo 2021, duplo pedal",
    especialidades: ["Pegar estrada", "Câmbio manual", "Ladeira"],
    bio: "Rodovia e serra. Faço o trajeto Campinas e Jundiaí com quem tem medo de subida.",
    avaliacoes: [
      { texto: "Subimos a serra umas 5 vezes até eu ficar seguro.", autor: "Felipe A.", nota: 4.0 }
    ]
  },
  {
    id: "henrique", primeira: true, nome: "Henrique Dias", iniciais: "HD", genero: "m",
    cidade: "Campinas, SP", bairro: "Taquaral",
    nota: 4.8, aulas: 156, anos: 10, preco: 88,
    cambio: "Manual e automático", carro: "Corolla 2021, duplo pedal",
    especialidades: ["Dirigir na cidade", "Dirigir à noite", "Baliza", "Voltar a dirigir"],
    bio: "Trânsito de Campinas é meu dia a dia. Monto a rota de acordo com o que te trava.",
    avaliacoes: [
      { texto: "Me ensinou a sobreviver na Norte Sul no horário de pico.", autor: "Paula V.", nota: 5.0 }
    ]
  },
  {
    id: "tatiane", primeira: true, nome: "Tatiane Ferraz", iniciais: "TF", genero: "f",
    cidade: "Americana, SP", bairro: "Centro",
    nota: 4.9, aulas: 72, anos: 5, preco: 72,
    cambio: "Automático", carro: "Mobi 2022, duplo pedal",
    especialidades: ["Medo de dirigir", "Baliza", "Dirigir na cidade"],
    bio: "Gosto de aula curta e objetiva. Em uma hora dá para resolver muita coisa.",
    avaliacoes: [
      { texto: "Objetiva e simpática. Recomendo demais.", autor: "Letícia R.", nota: 5.0 }
    ]
  },
  {
    id: "anderson", primeira: true, nome: "Anderson Prado", iniciais: "AP", genero: "m",
    cidade: "Americana, SP", bairro: "Jardim São Paulo",
    nota: 4.6, aulas: 65, anos: 7, preco: 76,
    cambio: "Manual e automático", carro: "Onix 2020, duplo pedal",
    especialidades: ["Pegar estrada", "Ladeira", "Câmbio manual", "Voltar a dirigir"],
    bio: "Atendo quem vai começar a viajar de carro. A aula inteira pode ser na rodovia, se você quiser.",
    avaliacoes: [
      { texto: "Fiz duas aulas antes de viajar pro litoral e foi suficiente.", autor: "Marcos D.", nota: 5.0 }
    ]
  },
  {
    id: "rogerio", primeira: true, nome: "Rogério Pinto", iniciais: "RP", genero: "m",
    cidade: "Piracicaba, SP", bairro: "Paulista",
    nota: 4.4, aulas: 51, anos: 4, preco: 70,
    cambio: "Manual e automático", carro: "Fiesta 2018, duplo pedal",
    especialidades: ["Dirigir na cidade", "Baliza", "Voltar a dirigir"],
    bio: "Atendo em Piracicaba e região. Horário flexível, inclusive fim de semana.",
    avaliacoes: [
      { texto: "Conseguiu encaixar aula no sábado de manhã pra mim.", autor: "Bruno K.", nota: 4.0 }
    ]
  }
];

/* Documentos exigidos no cadastro de instrutor. */
const DOCUMENTOS = [
  { id: "credencial", titulo: "Credencial de instrutor do Detran", desc: "Frente e verso, ou o PDF emitido pelo Detran.", obrigatorio: true },
  { id: "cnh",        titulo: "CNH",                              desc: "Precisa estar dentro da validade.", obrigatorio: true },
  { id: "antecedentes", titulo: "Certidão de antecedentes criminais", desc: "Emitida gratuitamente no site da Polícia Federal, válida por 90 dias.", obrigatorio: true },
  { id: "crlv",       titulo: "Documento do veículo (CRLV)",       desc: "Só se você vai usar carro próprio nas aulas.", obrigatorio: false },
  { id: "foto",       titulo: "Foto de perfil",                    desc: "O aluno vê essa foto antes de agendar.", obrigatorio: false }
];

/* Cadastros que ja chegaram e estao esperando analise.
   Servem para o painel do especialista nao comecar vazio. */
const PENDENTES_EXEMPLO = [
  {
    id: "p-exemplo-1", nome: "Sandra Okamoto", iniciais: "SO", genero: "f",
    cidade: "Campinas, SP", bairro: "Jardim Chapadão",
    email: "sandra.okamoto@email.com", telefone: "(19) 99812-4477",
    credencialNum: "SP-048221", anos: 6, preco: 84,
    cambio: "Automático", carro: "HB20 2021, duplo pedal",
    especialidades: ["Medo de dirigir", "Dirigir na cidade", "Baliza"],
    bio: "Seis anos de autoescola em Campinas. Quero atender direto pelo aplicativo.",
    status: "pendente", enviadoEm: "04/11/2026",
    docs: [
      { id: "credencial", nome: "credencial-detran.pdf", tamanho: 412000 },
      { id: "cnh", nome: "cnh-frente-verso.jpg", tamanho: 1840000 },
      { id: "antecedentes", nome: "antecedentes-pf.pdf", tamanho: 98000 },
      { id: "crlv", nome: "crlv-2026.pdf", tamanho: 221000 }
    ]
  },
  {
    id: "p-exemplo-2", nome: "Gilberto Faria", iniciais: "GF", genero: "m",
    cidade: "Limeira, SP", bairro: "Vila Santa Josefa",
    email: "gilberto.faria@email.com", telefone: "(19) 99233-1180",
    credencialNum: "SP-031905", anos: 15, preco: 79,
    cambio: "Manual", carro: "Gol 2017, duplo pedal",
    especialidades: ["Câmbio manual", "Ladeira", "Pegar estrada"],
    bio: "Quinze anos de estrada. Prefiro aula cedo, antes das 9h.",
    status: "pendente", enviadoEm: "05/11/2026",
    docs: [
      { id: "credencial", nome: "credencial.jpg", tamanho: 760000 },
      { id: "cnh", nome: "cnh.jpg", tamanho: 1120000 }
    ]
  }
];

/* Pontos usados pelo mapa quando o GPS real nao esta disponivel.
   Sao coordenadas de um trajeto curto em Limeira, so para a demonstracao. */
const ROTA_DEMO = [
  [-22.5645, -47.4010], [-22.5638, -47.4002], [-22.5630, -47.3994],
  [-22.5622, -47.3989], [-22.5613, -47.3985], [-22.5604, -47.3983],
  [-22.5595, -47.3979], [-22.5587, -47.3972], [-22.5580, -47.3963],
  [-22.5574, -47.3953], [-22.5569, -47.3942], [-22.5566, -47.3930]
];

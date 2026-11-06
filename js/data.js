/* ============================================================
   Destrava - dados do aplicativo
   Enquanto nao existe banco de dados, os instrutores ficam aqui.
   Para adicionar um instrutor, copie um bloco e troque os valores.
   ============================================================ */

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

const PRECOS = {
  taxaSeguranca: 5,
  descontoCarroAluno: 20   // quanto a aula fica mais barata com o carro do aluno
};

const INSTRUTORES = [
  {
    id: "renata",
    nome: "Renata Souza",
    iniciais: "RS",
    genero: "f",
    cidade: "Limeira, SP",
    bairro: "Centro",
    nota: 4.8,
    aulas: 94,
    anos: 7,
    preco: 85,
    aceitaCarroAluno: true,
    cambio: "Manual e automático",
    carro: "Onix 2021, duplo pedal",
    especialidades: ["Pegar estrada", "Dirigir na cidade", "Medo de dirigir", "Voltar a dirigir"],
    bio: "Trabalho com quem ficou anos sem dirigir. A primeira aula é sempre em rua vazia, no seu ritmo.",
    avaliacoes: [
      { texto: "Fiquei 6 anos sem dirigir. Em duas aulas já peguei a rodovia tranquila.", autor: "Mariana F.", nota: 5.0 },
      { texto: "Muito paciente. Não me deixou nervosa em nenhum momento.", autor: "Débora L.", nota: 5.0 }
    ]
  },
  {
    id: "carla",
    nome: "Carla Martins",
    iniciais: "CM",
    genero: "f",
    cidade: "Limeira, SP",
    bairro: "Vila Queiroz",
    nota: 4.9,
    aulas: 128,
    anos: 11,
    preco: 95,
    aceitaCarroAluno: true,
    cambio: "Automático",
    carro: "HB20 2022, duplo pedal",
    especialidades: ["Pegar estrada", "Dirigir na cidade", "Ladeira"],
    bio: "Onze anos de autoescola e agora atendo direto. Foco em rodovia e trânsito pesado.",
    avaliacoes: [
      { texto: "Me ensinou a entrar na Anhanguera sem pânico. Valeu cada real.", autor: "Rafael T.", nota: 5.0 }
    ]
  },
  {
    id: "priscila",
    nome: "Priscila Alves",
    iniciais: "PA",
    genero: "f",
    cidade: "Limeira, SP",
    bairro: "Jardim Glória",
    nota: 4.7,
    aulas: 61,
    anos: 4,
    preco: 75,
    aceitaCarroAluno: true,
    cambio: "Manual",
    carro: "Gol 2019, duplo pedal",
    especialidades: ["Dirigir à noite", "Pegar estrada", "Câmbio manual"],
    bio: "Atendo bastante quem tem dificuldade de dirigir à noite e quem está trocando de automático para manual.",
    avaliacoes: [
      { texto: "Aula à noite foi exatamente o que eu precisava.", autor: "Juliana P.", nota: 5.0 }
    ]
  },
  {
    id: "marcos",
    nome: "Marcos Vieira",
    iniciais: "MV",
    genero: "m",
    cidade: "Limeira, SP",
    bairro: "Centro",
    nota: 4.6,
    aulas: 143,
    anos: 9,
    preco: 80,
    aceitaCarroAluno: true,
    cambio: "Manual e automático",
    carro: "Argo 2020, duplo pedal",
    especialidades: ["Baliza", "Dirigir na cidade", "Ladeira", "Câmbio manual"],
    bio: "Baliza e manobra em espaço apertado são minha especialidade. Treino em estacionamento antes de ir pra rua.",
    avaliacoes: [
      { texto: "Finalmente aprendi a balizar. Método simples e direto.", autor: "Caio M.", nota: 5.0 }
    ]
  },
  {
    id: "beatriz",
    nome: "Beatriz Rocha",
    iniciais: "BR",
    genero: "f",
    cidade: "Campinas, SP",
    bairro: "Barão Geraldo",
    nota: 5.0,
    aulas: 37,
    anos: 3,
    preco: 90,
    aceitaCarroAluno: true,
    cambio: "Automático",
    carro: "Kwid 2023, duplo pedal",
    especialidades: ["Medo de dirigir", "Voltar a dirigir", "Dirigir na cidade"],
    bio: "Atendo só mulheres. Minha abordagem é devagar, com parada sempre que você precisar.",
    soMulheres: true,
    avaliacoes: [
      { texto: "Saber que era uma instrutora mulher foi o que me fez marcar.", autor: "Ana Clara S.", nota: 5.0 }
    ]
  },
  {
    id: "eduardo",
    nome: "Eduardo Lima",
    iniciais: "EL",
    genero: "m",
    cidade: "Campinas, SP",
    bairro: "Cambuí",
    nota: 4.5,
    aulas: 88,
    anos: 6,
    preco: 78,
    aceitaCarroAluno: true,
    cambio: "Manual",
    carro: "Polo 2021, duplo pedal",
    especialidades: ["Pegar estrada", "Câmbio manual", "Ladeira"],
    bio: "Rodovia e serra. Faço o trajeto Campinas e Jundiaí com quem tem medo de subida.",
    avaliacoes: [
      { texto: "Subimos a serra umas 5 vezes até eu ficar seguro.", autor: "Felipe A.", nota: 4.0 }
    ]
  },
  {
    id: "tatiane",
    nome: "Tatiane Ferraz",
    iniciais: "TF",
    genero: "f",
    cidade: "Americana, SP",
    bairro: "Centro",
    nota: 4.9,
    aulas: 72,
    anos: 5,
    preco: 72,
    aceitaCarroAluno: true,
    cambio: "Automático",
    carro: "Mobi 2022, duplo pedal",
    especialidades: ["Medo de dirigir", "Baliza", "Dirigir na cidade"],
    bio: "Gosto de aula curta e objetiva. Em uma hora dá para resolver muita coisa.",
    avaliacoes: [
      { texto: "Objetiva e simpática. Recomendo demais.", autor: "Letícia R.", nota: 5.0 }
    ]
  },
  {
    id: "rogerio",
    nome: "Rogério Pinto",
    iniciais: "RP",
    genero: "m",
    cidade: "Piracicaba, SP",
    bairro: "Paulista",
    nota: 4.4,
    aulas: 51,
    anos: 4,
    preco: 70,
    aceitaCarroAluno: true,
    cambio: "Manual e automático",
    carro: "Fiesta 2018, duplo pedal",
    especialidades: ["Dirigir na cidade", "Baliza", "Voltar a dirigir"],
    bio: "Atendo em Piracicaba e região. Horário flexível, inclusive fim de semana.",
    avaliacoes: [
      { texto: "Conseguiu encaixar aula no sábado de manhã pra mim.", autor: "Bruno K.", nota: 4.0 }
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

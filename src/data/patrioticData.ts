export interface PatrioticLandmark {
  id: 'zumbo' | 'indico' | 'rovuma' | 'maputo';
  name: string;
  subtitle: string;
  referencePhrase: string;
  coordinates: [number, number]; // [lon, lat]
  province: string;
  description: string;
  historicalNote: string;
  significance: string;
  badgeColor: string;
}

export const PATRIOTIC_LANDMARKS: Record<string, PatrioticLandmark> = {
  zumbo: {
    id: 'zumbo',
    name: 'Zumbo',
    subtitle: 'Ponto Mais Ocidental de Moçambique',
    referencePhrase: 'Do Zumbo ao Índico',
    coordinates: [30.45, -15.61],
    province: 'Tete',
    description:
      'Vila histórica e sede distrital situada no extremo oeste da Província de Tete, na confluência do imponente Rio Zambeze com o Rio Luangwa, no ponto de encontro das fronteiras internacionais de Moçambique, Zâmbia e Zimbabué.',
    historicalNote:
      'Antigo e estratégico entreposto comercial fundado no século XVIII no coração das rotas do ouro e do marfim do Império de Monomotapa. Simboliza a soberania moçambicana no interior mais profundo do continente africano.',
    significance:
      'Marco inicial do célebre eixo de unidade nacional «Do Zumbo ao Índico», expressando a integridade territorial que liga o sertão continental às águas do mar.',
    badgeColor: '#f59e0b',
  },
  indico: {
    id: 'indico',
    name: 'Oceano Índico',
    subtitle: 'Canal de Moçambique & Costa Soberana',
    referencePhrase: 'Do Zumbo ao Índico',
    coordinates: [41.8, -18.65],
    province: 'Águas Territoriais',
    description:
      'Extensão marítima soberana com mais de 2.700 km de linha de costa, que banha 10 das 11 províncias direta ou bacias hidrográficas afluentes, acolhendo arquipélagos como Bazaruto e Quirimbas, e portos vitais para a África Austral.',
    historicalNote:
      'Ponte milenar de comércio e intercâmbio entre o continente africano, a Arábia, a Índia e o Oriente, por onde circularam as especiarias, a cultura suaíli e se consolidou a identidade costeira moçambicana.',
    significance:
      'Extremo oriental da pátria, porta de abertura ao mundo e recurso primordial para a economia azul, pesca e comércio internacional.',
    badgeColor: '#0ea5e9',
  },
  rovuma: {
    id: 'rovuma',
    name: 'Rio Rovuma',
    subtitle: 'Fronteira Setentrional (Norte)',
    referencePhrase: 'Do Rovuma ao Maputo',
    coordinates: [40.5, -10.47],
    province: 'Cabo Delgado',
    description:
      'Rio histórico que delimita a fronteira norte de Moçambique com a República Unida da Tanzânia, desaguando no Oceano Índico a norte da Baía de Palma.',
    historicalNote:
      'Berço da retaguarda segura da Luta de Libertação Nacional. Foi a partir das margens do Rovuma que os combatentes da FRELIMO transpuseram as linhas coloniais rumo à liberdade.',
    significance:
      'Vértice norte da soberania moçambicana, imortalizado no Hino Nacional e no lema fundador da independência proclamada por Samora Machel.',
    badgeColor: '#10b981',
  },
  maputo: {
    id: 'maputo',
    name: 'Rio Maputo & Ponta do Ouro',
    subtitle: 'Fronteira Meridional (Sul)',
    referencePhrase: 'Do Rovuma ao Maputo',
    coordinates: [32.89, -26.86],
    province: 'Maputo',
    description:
      'Extremo sul do território moçambicano, compreendendo as margens do Rio Maputo, a Reserva Especial de Maputo e as praias de coral da Ponta do Ouro, na fronteira com a África do Sul e Eswatini.',
    historicalNote:
      'Zona de resistência heroica dos chefes tradicionais ronga e tsonga contra a penetração colonial e ponto de amarração da soberania no Oceano Índico meridional.',
    significance:
      'Vértice sul da pátria amada, completando com o Rovuma a linha cardeal que une todas as províncias e povos num só destino.',
    badgeColor: '#ef4444',
  },
};

export const MOZAMBIQUE_BIRTH_TIMELINE = [
  {
    year: 'Séculos XVI–XIX',
    title: 'Resistência Tradicional & Reinos Pré-Coloniais',
    description:
      'Resistência contínua dos povos moçambicanos contra a ocupação colonial portuguesa. Destaque para o Império de Monomotapa, o Estado de Gaza liderado por Ngungunhane e Maguiguana Cossa, e as dinastias do Vale do Zambeze.',
  },
  {
    year: '25 de Junho de 1962',
    title: 'Fundação da FRELIMO em Dar-es-Salaam',
    description:
      'Unificação dos movimentos nacionalistas (UDENAMO, MANU e UNAMI) sob liderança do Dr. Eduardo Chivambo Mondlane, consagrando uma frente comum para libertar Moçambique do jugo colonial.',
  },
  {
    year: '25 de Setembro de 1964',
    title: 'Início da Luta Armada de Libertação',
    description:
      'Primeiro disparo contra o posto colonial de Chai, na província de Cabo Delgado, marcando o início de dez anos de combate nas províncias do norte e centro (Cabo Delgado, Niassa e Tete).',
  },
  {
    year: '7 de Setembro de 1974',
    title: 'Acordos de Lusaka & Governo de Transição',
    description:
      'Assinatura dos acordos de cessar-fogo na Zâmbia entre a FRELIMO e o governo português, reconhecendo a FRELIMO como legítima representante do povo moçambicano e estabelecendo o governo de transição liderado por Joaquim Chissano.',
  },
  {
    year: '25 de Junho de 1975',
    title: 'Proclamação Solene da Independência Nacional',
    description:
      'À meia-noite, no Estádio da Machava (Lourenço Marques, atual Maputo), o Presidente Samora Moisés Machel proclama solenemente a Independência Nacional: «Nasceu a República Popular de Moçambique! Do Rovuma ao Maputo, do Zumbo ao Índico, um só povo, uma só nação!»',
  },
];

export const NATIONAL_FLAG_MEANINGS = [
  {
    color: '#007A3D',
    name: 'Verde',
    meaning: 'As riquezas do solo fértil de Moçambique, a agricultura e as florestas.',
  },
  {
    color: '#111827',
    name: 'Preto',
    meaning: 'O continente africano e a herança dos seus povos.',
  },
  {
    color: '#FFD100',
    name: 'Amarelo',
    meaning: 'As riquezas minerais do subsolo moçambicano (ouro, carvão, rubis, gás).',
  },
  {
    color: '#FFFFFF',
    name: 'Branco',
    meaning: 'A paz, a justiça e a justeza da luta do povo moçambicano.',
  },
  {
    color: '#DA291C',
    name: 'Vermelho',
    meaning: 'A resistência secular ao colonialismo e o sangue derramado pela liberdade.',
  },
  {
    color: '#F59E0B',
    name: 'Estrela Dourada',
    meaning: 'A esperança do povo e a solidariedade internacional entre as nações.',
  },
];

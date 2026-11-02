import { TransportRoute, TransportNode, TransportLayerId, TransportLayersState } from '../types/index.ts';

export const DEFAULT_TRANSPORT_LAYERS: TransportLayersState = {
  primary_roads: false,
  secondary_roads: false,
  railways: false,
  ports: true,
  airports: true,
  aerodromes: true,
};

export const TRANSPORT_LAYERS_CONFIG: Record<
  TransportLayerId,
  {
    id: TransportLayerId;
    label: string;
    shortLabel: string;
    category: 'rodoviario' | 'ferroviario' | 'maritimo' | 'aereo';
    color: string;
    activeColor: string;
    description: string;
    iconName: 'road' | 'route' | 'train' | 'anchor' | 'plane' | 'compass';
  }
> = {
  primary_roads: {
    id: 'primary_roads',
    label: 'Estradas Primárias (Rede Principal)',
    shortLabel: 'Primárias',
    category: 'rodoviario',
    color: '#f59e0b', // Amber / Gold
    activeColor: '#fbbf24',
    description: 'Espinha dorsal rodoviária nacional (EN1, EN4, EN6, EN7, EN8) gerida pela ANE.',
    iconName: 'road',
  },
  secondary_roads: {
    id: 'secondary_roads',
    label: 'Estradas Secundárias & Regionais',
    shortLabel: 'Secundárias',
    category: 'rodoviario',
    color: '#06b6d4', // Cyan
    activeColor: '#22d3ee',
    description: 'Vias de ligação distrital, pólos turísticos e acessos a reservas e zonas costeiras.',
    iconName: 'route',
  },
  railways: {
    id: 'railways',
    label: 'Rede Ferroviária (CFM)',
    shortLabel: 'Ferrovias',
    category: 'ferroviario',
    color: '#ef4444', // Red / Crimson
    activeColor: '#f87171',
    description: 'Linhas dos Caminhos de Ferro de Moçambique: Corredor de Nacala, Beira, Sena e Limpopo.',
    iconName: 'train',
  },
  ports: {
    id: 'ports',
    label: 'Portos Marítimos & Terminais',
    shortLabel: 'Portos',
    category: 'maritimo',
    color: '#3b82f6', // Blue
    activeColor: '#60a5fa',
    description: 'Portos de águas profundas internacionais (Maputo, Beira, Nacala) e portos de cabotagem.',
    iconName: 'anchor',
  },
  airports: {
    id: 'airports',
    label: 'Aeroportos Internacionais & Nacionais',
    shortLabel: 'Aeroportos',
    category: 'aereo',
    color: '#a855f7', // Purple
    activeColor: '#c084fc',
    description: 'Aeroportos comerciais operados pela ADM (Aeroportos de Moçambique) com tráfego IATA.',
    iconName: 'plane',
  },
  aerodromes: {
    id: 'aerodromes',
    label: 'Aeródromos & Pistas Regionais',
    shortLabel: 'Aeródromos',
    category: 'aereo',
    color: '#10b981', // Emerald
    activeColor: '#34d399',
    description: 'Pistas e aeródromos para aviação regional, turismo, safaris, mineração e emergências.',
    iconName: 'compass',
  },
};

export const TRANSPORT_ROUTES: TransportRoute[] = [
  // 1. PRIMARY ROADS (Estradas Primárias / Rede Nacional ANE)
  {
    id: 'road_en1',
    layer: 'primary_roads',
    code: 'EN1',
    name: 'Estrada Nacional Número 1 (EN1 - Longitudinal Nacional)',
    operator: 'ANE - Administração Nacional de Estradas',
    extentKm: 2400,
    status: 'Operacional com trechos sob reabilitação estrutural',
    color: '#f59e0b',
    surfaceType: 'Asfalto CBUQ / TSD',
    laneConfiguration: '2 faixas de rodagem (7.0m) + bermas pavimentadas (1.5m); troço 2x2 com separador central rígido na Grande Maputo',
    provincesCrossed: [
      'Maputo Cidade',
      'Maputo Província',
      'Gaza',
      'Inhambane',
      'Sofala',
      'Manica',
      'Zambézia',
      'Nampula',
      'Cabo Delgado',
    ],
    keyBridges: [
      'Ponte Armando Guebuza sobre o Rio Zambeze (Caia - 2.376m)',
      'Ponte sobre o Rio Save (Nova e Histórica de Tirantes - 870m)',
      'Ponte sobre o Rio Lúrio (fronteira Nampula/Cabo Delgado)',
      'Ponte sobre o Rio Licungo (Mocuba)',
      'Ponte sobre o Rio Incomáti (Marracuene/Manhiça)',
    ],
    tollPlazas: [
      'Portagem de Maluana (km 54)',
      'Portagem de Chongoene (km 210)',
      'Portagem de Quissico (km 360)',
      'Portagem de Mapinhane (km 690)',
      'Portagem de Caia (km 1.180)',
    ],
    trafficVolume: '4.500 - 22.000 veículos/dia (TMDA)',
    coordinates: [
      [32.583, -25.965], // Maputo (Km 0)
      [32.671, -25.714], // Marracuene
      [32.808, -25.405], // Manhiça
      [33.003, -25.031], // Macia
      [33.642, -25.048], // Xai-Xai
      [33.801, -24.950], // Chongoene
      [34.205, -24.922], // Chidenguele
      [34.752, -24.671], // Quissico (Zavala)
      [35.032, -24.481], // Inharrime
      [35.342, -23.861], // Maxixe
      [35.351, -23.662], // Morrumbene
      [35.380, -23.334], // Massinga
      [35.201, -22.251], // Mapinhane
      [34.802, -21.801], // Muabsa
      [34.221, -21.054], // Ponte Rio Save
      [34.052, -20.502], // Muxúnguè
      [34.021, -19.231], // Inchope (Nó Viário Central)
      [34.072, -18.682], // Gorongosa
      [35.342, -17.821], // Caia (Ponte Armando Guebuza)
      [36.812, -17.601], // Nicoadala
      [37.031, -17.502], // Namacurra
      [36.982, -16.842], // Mocuba
      [37.701, -15.751], // Alto Molócuè
      [38.681, -15.462], // Murrupula
      [39.264, -15.121], // Nampula (Metrópole do Norte)
      [39.951, -14.902], // Namialo
      [39.802, -13.901], // Alua
      [39.821, -13.342], // Chiúre
      [40.521, -12.973], // Pemba (Término)
    ],
    stationsOrHubs: [
      { name: 'Maputo (Início Km 0)', coordinates: [32.583, -25.965], type: 'hub' },
      { name: 'Portagem de Maluana', coordinates: [32.740, -25.560], type: 'toll' },
      { name: 'Xai-Xai', coordinates: [33.642, -25.048], type: 'hub' },
      { name: 'Maxixe', coordinates: [35.342, -23.861], type: 'hub' },
      { name: 'Ponte Nova sobre o Rio Save', coordinates: [34.221, -21.054], type: 'bridge' },
      { name: 'Inchope (Entroncamento EN1 / EN6)', coordinates: [34.021, -19.231], type: 'hub' },
      { name: 'Ponte Armando Guebuza (Rio Zambeze)', coordinates: [35.342, -17.821], type: 'bridge' },
      { name: 'Mocuba (Nó da Alta Zambézia)', coordinates: [36.982, -16.842], type: 'hub' },
      { name: 'Nampula (Capital Económica do Norte)', coordinates: [39.264, -15.121], type: 'hub' },
      { name: 'Ponte Rio Lúrio', coordinates: [39.810, -13.620], type: 'bridge' },
      { name: 'Pemba (Porto e Baía de Pemba)', coordinates: [40.521, -12.973], type: 'hub' },
    ],
    description: 'A maior artéria de transporte de Moçambique, conectando a capital do país a 8 províncias ao longo de 2.400 km. É o eixo unificador do comércio interior.',
    strategicImportance: 'Garante o abastecimento das regiões centro e norte, transporte de colheitas agrícolas, cimento, combustíveis e passageiros.',
  },
  {
    id: 'road_en4',
    layer: 'primary_roads',
    code: 'EN4',
    name: 'Corredor de Maputo (EN4 - Autoestrada com Portagem)',
    operator: 'TRAC - Trans African Concessions / ANE',
    extentKm: 92,
    status: 'Autoestrada Concessionada de Alta Capacidade',
    color: '#f59e0b',
    surfaceType: 'Pavimento Concessionado CBUQ Reforçado',
    laneConfiguration: 'Autoestrada 2x3 (Nó de Machava ao Porto) e 2x2 com separador central e iluminação LED',
    provincesCrossed: ['Maputo Cidade', 'Maputo Província'],
    keyBridges: [
      'Viaduto do Nó de Tchumene',
      'Ponte sobre o Rio Incomáti (Moamba)',
      'Viaduto Multimodal da Matola Gare',
    ],
    tollPlazas: ['Portagem da Matola (km 12)', 'Portagem de Moamba (km 58)'],
    trafficVolume: '32.000 - 48.000 veículos/dia (tráfego de carga pesada internacional)',
    coordinates: [
      [32.573, -25.968], // Porto de Maputo
      [32.461, -25.961], // Matola
      [32.350, -25.800], // Tchumene
      [32.242, -25.602], // Moamba
      [31.981, -25.441], // Ressano Garcia / Fronteira África do Sul
    ],
    stationsOrHubs: [
      { name: 'Porto de Contentores e Minérios de Maputo', coordinates: [32.573, -25.968], type: 'hub' },
      { name: 'Portagem Principal da Matola', coordinates: [32.461, -25.961], type: 'toll' },
      { name: 'Nó Viário de Tchumene', coordinates: [32.350, -25.800], type: 'hub' },
      { name: 'Portagem de Moamba', coordinates: [32.242, -25.602], type: 'toll' },
      { name: 'Fronteira Internacional de Ressano Garcia', coordinates: [31.981, -25.441], type: 'border' },
    ],
    description: 'Autoestrada moderna internacional que liga o Porto de Maputo à província industrial sul-africana de Mpumalanga e a Joanesburgo/Pretória.',
    strategicImportance: 'Corredor nevrálgico de exportação de crómio, ferro, citrinos e trânsito diário de camiões porta-contentores da SADC.',
  },
  {
    id: 'road_en6',
    layer: 'primary_roads',
    code: 'EN6',
    name: 'Corredor da Beira (EN6 - Concessionada REVIMO)',
    operator: 'ANE / Concessionária REVIMO',
    extentKm: 287,
    status: 'Autoestrada Moderna / Portagens Electrónicas',
    color: '#f59e0b',
    surfaceType: 'Asfalto CBUQ com Reforço Geogrelha',
    laneConfiguration: 'Dupla via 2x2 com separador central nos acessos à Beira; 2 vias com faixas lentas em zonas de montanha',
    provincesCrossed: ['Sofala', 'Manica'],
    keyBridges: [
      'Ponte sobre o Rio Púnguè (Ponte Nova de Alta Capacidade)',
      'Ponte Rio Revue',
      'Ponte Rio Metuchira',
    ],
    tollPlazas: ['Portagem de Dondo', 'Portagem de Nhamatanda', 'Portagem de Chimoio'],
    trafficVolume: '6.500 - 14.000 veículos/dia',
    coordinates: [
      [34.836, -19.831], // Porto da Beira
      [34.741, -19.612], // Dondo
      [34.212, -19.271], // Nhamatanda
      [34.021, -19.231], // Inchope
      [33.651, -19.142], // Gondola
      [33.482, -19.121], // Chimoio
      [32.881, -18.942], // Manica
      [32.741, -18.971], // Machipanda / Fronteira Zimbabué
    ],
    stationsOrHubs: [
      { name: 'Porto de Águas Profundas da Beira', coordinates: [34.836, -19.831], type: 'hub' },
      { name: 'Portagem de Dondo', coordinates: [34.741, -19.612], type: 'toll' },
      { name: 'Ponte sobre o Rio Púnguè', coordinates: [34.500, -19.450], type: 'bridge' },
      { name: 'Nó Central de Inchope', coordinates: [34.021, -19.231], type: 'hub' },
      { name: 'Chimoio (Capital de Manica)', coordinates: [33.482, -19.121], type: 'hub' },
      { name: 'Fronteira de Machipanda (Zimbabué)', coordinates: [32.741, -18.971], type: 'border' },
    ],
    description: 'Corredor rodoviário fundamental entre o Oceano Índico e o Zimbabué, Zâmbia e República Democrática do Congo.',
    strategicImportance: 'Movimenta carga contentorizada, combustíveis por oleoduto/camião-cisterna e produtos agro-industriais do centro do continente.',
  },
  {
    id: 'road_en7',
    layer: 'primary_roads',
    code: 'EN7',
    name: 'Corredor de Tete (EN7 - Eixo Trans-Zambeze)',
    operator: 'ANE - Administração Nacional de Estradas',
    extentKm: 260,
    status: 'Pavimentado / Pavimento Pesado de Carga Mineira',
    color: '#f59e0b',
    surfaceType: 'Asfalto CBUQ com Base Britada Estabilizada',
    laneConfiguration: 'Faixa simples reforçada (7.2m) com faixas de desaceleração nos nós mineiros',
    provincesCrossed: ['Manica', 'Tete'],
    keyBridges: [
      'Ponte Samora Machel sobre o Rio Zambeze (715m)',
      'Ponte Kassuende sobre o Rio Zambeze (Nova travessia de carga pesada - 1.586m)',
      'Ponte sobre o Rio Luenha',
    ],
    tollPlazas: ['Portagem de Vanduzi', 'Portagem da Ponte Samora Machel / Kassuende'],
    trafficVolume: '4.800 - 9.200 veículos/dia',
    coordinates: [
      [33.431, -18.951], // Vanduzi (Entroncamento EN6)
      [33.182, -18.061], // Catandica
      [33.151, -16.702], // Changara
      [33.591, -16.162], // Tete Cidade (Pontes Samora Machel e Kassuende)
      [33.732, -16.121], // Moatize
      [34.361, -15.602], // Zóbuè / Fronteira Malawi
    ],
    stationsOrHubs: [
      { name: 'Vanduzi (Ligação EN6 / EN7)', coordinates: [33.431, -18.951], type: 'hub' },
      { name: 'Catandica (Celeiro de Manica)', coordinates: [33.182, -18.061], type: 'hub' },
      { name: 'Changara', coordinates: [33.151, -16.702], type: 'hub' },
      { name: 'Ponte Samora Machel (Rio Zambeze)', coordinates: [33.585, -16.155], type: 'bridge' },
      { name: 'Ponte Kassuende (Rio Zambeze)', coordinates: [33.615, -16.180], type: 'bridge' },
      { name: 'Moatize (Bacia Carbonífera e Mineira)', coordinates: [33.732, -16.121], type: 'hub' },
      { name: 'Fronteira de Zóbuè (Malawi)', coordinates: [34.361, -15.602], type: 'border' },
    ],
    description: 'Cruza o Rio Zambeze na cidade de Tete e assegura a ligação direta de Moçambique ao Malawi e Zâmbia.',
    strategicImportance: 'Rota primária para o comércio internacional do Malawi, tráfego pesado de carvão mineral de Moatize e ligação ao Porto da Beira.',
  },
  {
    id: 'road_en8',
    layer: 'primary_roads',
    code: 'EN8',
    name: 'Corredor de Nacala Rodoviário (EN8)',
    operator: 'ANE - Administração Nacional de Estradas',
    extentKm: 195,
    status: 'Pavimentado / Excelente Estado de Conservação',
    color: '#f59e0b',
    surfaceType: 'Asfalto CBUQ',
    laneConfiguration: '2 faixas de 3.5m com bermas asfaltadas de 2.0m e faixas adicionais de ultrapassagem',
    provincesCrossed: ['Nampula'],
    keyBridges: ['Ponte sobre o Rio Monapo', 'Ponte sobre o Rio Namialo'],
    tollPlazas: ['Portagem de Namialo', 'Portagem de Monapo'],
    trafficVolume: '5.200 - 10.000 veículos/dia',
    coordinates: [
      [39.264, -15.121], // Nampula
      [39.951, -14.902], // Namialo
      [40.421, -14.981], // Monapo
      [40.672, -15.032], // Ramal Ilha de Moçambique
      [40.682, -14.545], // Porto de Nacala
    ],
    stationsOrHubs: [
      { name: 'Nampula (Capital do Norte)', coordinates: [39.264, -15.121], type: 'hub' },
      { name: 'Namialo (Entroncamento EN1 / EN8)', coordinates: [39.951, -14.902], type: 'hub' },
      { name: 'Monapo (Polo Agro-Industrial)', coordinates: [40.421, -14.981], type: 'hub' },
      { name: 'Porto de Águas Profundas de Nacala', coordinates: [40.682, -14.545], type: 'hub' },
    ],
    description: 'Autoestrada regional que liga Nampula ao porto natural mais profundo da costa oriental africana em Nacala.',
    strategicImportance: 'Escoamento de tabaco, algodão, gergelim, noz de caju e abastecimento de matérias-primas industriais.',
  },
  {
    id: 'road_en2',
    layer: 'primary_roads',
    code: 'EN2',
    name: 'Estrada Nacional Número 2 (EN2 - Namaacha / Eswatini)',
    operator: 'ANE',
    extentKm: 75,
    status: 'Pavimentado / Tráfego Fronteiriço e Montanhoso',
    color: '#f59e0b',
    surfaceType: 'Asfalto CBUQ',
    laneConfiguration: 'Faixa simples 2 vias de 3.5m com banquetas de proteção nos Montes Libombos',
    provincesCrossed: ['Maputo Cidade', 'Maputo Província'],
    keyBridges: ['Ponte sobre o Rio Umbelúzi (Boane)', 'Ponte de Matola Rio'],
    tollPlazas: ['Portagem de Boane'],
    trafficVolume: '7.800 veículos/dia',
    coordinates: [
      [32.583, -25.965], // Maputo
      [32.461, -25.961], // Matola
      [32.332, -26.042], // Boane
      [32.021, -25.981], // Namaacha (Fronteira Eswatini)
    ],
    stationsOrHubs: [
      { name: 'Maputo', coordinates: [32.583, -25.965], type: 'hub' },
      { name: 'Boane (Nó Agrícola e Industrial)', coordinates: [32.332, -26.042], type: 'hub' },
      { name: 'Ponte Rio Umbelúzi', coordinates: [32.310, -26.030], type: 'bridge' },
      { name: 'Fronteira de Namaacha (Reino de Eswatini)', coordinates: [32.021, -25.981], type: 'border' },
    ],
    description: 'Ligação histórica entre Maputo e o Reino de Eswatini através das encostas dos Montes Libombos.',
    strategicImportance: 'Importante via turística, comercial e de abastecimento regional com Eswatini e África do Sul.',
  },
  {
    id: 'road_en10',
    layer: 'primary_roads',
    code: 'EN10',
    name: 'Corredor do Porto de Quelimane (EN10)',
    operator: 'ANE',
    extentKm: 32,
    status: 'Pavimentado',
    color: '#f59e0b',
    surfaceType: 'Asfalto CBUQ',
    laneConfiguration: '2 faixas de 3.5m com bermas consolidadas',
    provincesCrossed: ['Zambézia'],
    keyBridges: ['Ponte sobre o Rio dos Bons Sinais'],
    trafficVolume: '4.200 veículos/dia',
    coordinates: [
      [36.812, -17.601], // Nicoadala (Entroncamento EN1)
      [36.883, -17.882], // Quelimane Cidade e Porto
    ],
    stationsOrHubs: [
      { name: 'Nicoadala (Nó EN1)', coordinates: [36.812, -17.601], type: 'hub' },
      { name: 'Porto Fluvial e Cidade de Quelimane', coordinates: [36.883, -17.882], type: 'hub' },
    ],
    description: 'Ramal de penetração da EN1 que serve a capital da província da Zambézia e o seu porto marítimo fluvial.',
    strategicImportance: 'Escoamento de copra, arroz, peixe e abastecimento da província da Zambézia.',
  },
  {
    id: 'road_en221',
    layer: 'primary_roads',
    code: 'EN221',
    name: 'Corredor do Planalto de Niassa (EN221)',
    operator: 'ANE',
    extentKm: 310,
    status: 'Pavimentado em Grande Extensão',
    color: '#f59e0b',
    surfaceType: 'Tratamento Superficial Duplo (TSD)',
    laneConfiguration: '2 faixas de rodagem (6.5m) com valas de drenagem pluvial reforçadas',
    provincesCrossed: ['Niassa'],
    keyBridges: ['Ponte sobre o Rio Lugenda', 'Ponte sobre o Rio Luambala'],
    trafficVolume: '1.400 veículos/dia',
    coordinates: [
      [36.541, -14.802], // Cuamba
      [35.652, -14.351], // Mandimba
      [35.451, -13.802], // Massangulo
      [35.242, -13.312], // Lichinga
    ],
    stationsOrHubs: [
      { name: 'Cuamba (Entroncamento Ferroviário CFM)', coordinates: [36.541, -14.802], type: 'hub' },
      { name: 'Mandimba (Fronteira com Malawi)', coordinates: [35.652, -14.351], type: 'border' },
      { name: 'Lichinga (Capital de Niassa)', coordinates: [35.242, -13.312], type: 'hub' },
    ],
    description: 'Principal via de integração da Província do Niassa, unindo a cidade de Lichinga ao nó de Cuamba e à fronteira de Mandimba.',
    strategicImportance: 'Quebrou o isolamento histórico da província do Niassa e impulsiona a silvicultura e agricultura comercial.',
  },
  {
    id: 'road_en80',
    layer: 'primary_roads',
    code: 'EN80 / R775',
    name: 'Corredor Setentrional de Cabo Delgado (EN80)',
    operator: 'ANE',
    extentKm: 420,
    status: 'Pavimentado / Trechos em Obras de Reabilitação',
    color: '#f59e0b',
    surfaceType: 'Asfalto CBUQ e Macadame Estabilizado',
    laneConfiguration: '2 faixas de 3.5m',
    provincesCrossed: ['Cabo Delgado'],
    keyBridges: ['Ponte sobre o Rio Montepuez', 'Ponte sobre o Rio Messalo'],
    trafficVolume: '2.100 veículos/dia',
    coordinates: [
      [40.521, -12.973], // Pemba
      [39.821, -13.342], // Silva Macua
      [38.991, -13.121], // Montepuez
      [39.562, -11.631], // Mueda (Planalto)
      [40.352, -11.352], // Mocímboa da Praia
      [40.481, -10.781], // Palma / Afungi
    ],
    stationsOrHubs: [
      { name: 'Pemba (Capital Provincial)', coordinates: [40.521, -12.973], type: 'hub' },
      { name: 'Montepuez (Mineração de Rubis)', coordinates: [38.991, -13.121], type: 'hub' },
      { name: 'Mueda (Planalto dos Macondes)', coordinates: [39.562, -11.631], type: 'hub' },
      { name: 'Mocímboa da Praia', coordinates: [40.352, -11.352], type: 'hub' },
      { name: 'Palma (Península de Gás LNG Afungi)', coordinates: [40.481, -10.781], type: 'hub' },
    ],
    description: 'Conecta a capital provincial Pemba, o polo mineiro de Montepuez e a península de gás natural de Afungi.',
    strategicImportance: 'Vital para a indústria de gás natural liquefeito (LNG), exploração de rubis e segurança transfronteiriça.',
  },
  {
    id: 'road_en103',
    layer: 'primary_roads',
    code: 'EN103',
    name: 'Corredor Agrícola da Alta Zambézia (EN103 - Gurúè/Lioma)',
    operator: 'ANE',
    extentKm: 215,
    status: 'Pavimentado / Trechos Asfaltados',
    color: '#f59e0b',
    surfaceType: 'Tratamento Superficial Duplo (TSD)',
    laneConfiguration: '2 faixas de 3.25m em relevo montanhoso',
    provincesCrossed: ['Zambézia', 'Niassa'],
    keyBridges: ['Ponte Rio Licungo Superior', 'Ponte Rio Malema'],
    trafficVolume: '2.200 veículos/dia',
    coordinates: [
      [36.982, -16.842], // Mocuba (EN1)
      [36.981, -15.462], // Gurúè (Montanhas de Chá)
      [36.782, -15.181], // Lioma (Celeiro de Soja)
      [36.541, -14.802], // Cuamba (Niassa)
    ],
    stationsOrHubs: [
      { name: 'Mocuba (Nó EN1)', coordinates: [36.982, -16.842], type: 'hub' },
      { name: 'Gurúè (Centro Chazeiro Nacional)', coordinates: [36.981, -15.462], type: 'hub' },
      { name: 'Lioma (Maior Produtor de Soja do País)', coordinates: [36.782, -15.181], type: 'hub' },
      { name: 'Cuamba', coordinates: [36.541, -14.802], type: 'hub' },
    ],
    description: 'Liga a EN1 em Mocuba à região fértil do Gurúè e à província do Niassa em Cuamba.',
    strategicImportance: 'Corredor agro-alimentar estratégico para o escoamento de chá, soja, feijão, milho e macadâmia.',
  },
  {
    id: 'road_en202',
    layer: 'primary_roads',
    code: 'EN202',
    name: 'Corredor do Vale do Limpopo (EN202 - Chókwè/Guijá)',
    operator: 'ANE',
    extentKm: 135,
    status: 'Pavimentado',
    color: '#f59e0b',
    surfaceType: 'Asfalto CBUQ',
    laneConfiguration: '2 faixas de 3.5m com bermas para circulação de maquinaria agrícola',
    provincesCrossed: ['Gaza'],
    keyBridges: ['Ponte sobre o Rio Limpopo (Chókwè/Guijá)', 'Barragem Açude de Macarretane'],
    trafficVolume: '3.600 veículos/dia',
    coordinates: [
      [33.003, -25.031], // Macia (EN1)
      [32.991, -24.532], // Chókwè (Regadio do Limpopo)
      [33.021, -24.491], // Guijá
      [33.042, -24.321], // Macarretane
    ],
    stationsOrHubs: [
      { name: 'Macia (Nó EN1)', coordinates: [33.003, -25.031], type: 'hub' },
      { name: 'Chókwè (Capital do Celeiro do Limpopo)', coordinates: [32.991, -24.532], type: 'hub' },
      { name: 'Ponte de Guijá (Rio Limpopo)', coordinates: [33.010, -24.510], type: 'bridge' },
      { name: 'Barragem de Macarretane', coordinates: [33.042, -24.321], type: 'hub' },
    ],
    description: 'Espinha dorsal do maior perímetro irrigado de Moçambique no Vale do Rio Limpopo.',
    strategicImportance: 'Escoamento de arroz, tomate industrial, hortícolas e gado bovino para o mercado de Maputo.',
  },

  // 2. SECONDARY & REGIONAL ROADS (Estradas Secundárias e Regionais)
  {
    id: 'road_r200',
    layer: 'secondary_roads',
    code: 'R200',
    name: 'Estrada Maputo - Ponta do Ouro & Malongane (R200)',
    operator: 'ANE / REVIMO',
    extentKm: 125,
    status: 'Asfaltado / Padrão Internacional com Ponte Maputo-Katembe',
    color: '#06b6d4',
    surfaceType: 'Asfalto CBUQ com Drenagem Costeira',
    laneConfiguration: '2 faixas de 3.5m com bermas ciclopedonais',
    provincesCrossed: ['Maputo Cidade', 'Maputo Província'],
    keyBridges: ['Ponte Maputo-Katembe (Maior ponte suspensa de África - 680m)', 'Ponte Rio Futi'],
    tollPlazas: ['Portagem da Katembe', 'Portagem de Bela Vista'],
    trafficVolume: '3.500 veículos/dia (8.000 em época balnear)',
    coordinates: [
      [32.571, -26.012], // Katembe
      [32.662, -26.351], // Bela Vista
      [32.701, -26.502], // Salamanga
      [32.891, -26.842], // Ponta do Ouro
      [32.880, -26.790], // Ponta Malongane
    ],
    stationsOrHubs: [
      { name: 'Ponte Maputo-Katembe', coordinates: [32.571, -26.012], type: 'bridge' },
      { name: 'Bela Vista (Sede do Distrito de Matutuíne)', coordinates: [32.662, -26.351], type: 'hub' },
      { name: 'Reserva Especial de Maputo (Parque Nacional)', coordinates: [32.701, -26.502], type: 'hub' },
      { name: 'Ponta do Ouro (Fronteira com Kosi Bay / RSA)', coordinates: [32.891, -26.842], type: 'border' },
    ],
    description: 'Moderna via construída após a Ponte Maputo-Katembe, integrando a costa sul moçambicana e o ecoturismo marítimo.',
    strategicImportance: 'Catalisador do turismo transfronteiriço da África do Sul, reservas de elefantes e praias virgens de mergulho.',
  },
  {
    id: 'road_r201',
    layer: 'secondary_roads',
    code: 'R201',
    name: 'Estrada Macia - Praia do Bilene (R201)',
    operator: 'ANE',
    extentKm: 34,
    status: 'Pavimentado',
    color: '#06b6d4',
    surfaceType: 'Asfalto CBUQ',
    laneConfiguration: '2 faixas de 3.5m',
    provincesCrossed: ['Gaza'],
    keyBridges: [],
    trafficVolume: '2.800 veículos/dia',
    coordinates: [
      [33.003, -25.031], // Macia (EN1)
      [33.242, -25.260], // Praia do Bilene (Lagoa Uembje)
    ],
    stationsOrHubs: [
      { name: 'Macia (Nó EN1)', coordinates: [33.003, -25.031], type: 'hub' },
      { name: 'Praia do Bilene (Lagoa Salgada de Uembje)', coordinates: [33.242, -25.260], type: 'hub' },
    ],
    description: 'Acesso pavimentado à lagoa de Uembje, principal estância turística familiar do sul do país.',
    strategicImportance: 'Destino de lazer e hotelaria de alta frequência a 170 km de Maputo.',
  },
  {
    id: 'road_r480',
    layer: 'secondary_roads',
    code: 'R480',
    name: 'Acesso Costeiro de Vilankulo (R480)',
    operator: 'ANE',
    extentKm: 28,
    status: 'Pavimentado',
    color: '#06b6d4',
    surfaceType: 'Asfalto CBUQ',
    laneConfiguration: '2 faixas de 3.5m',
    provincesCrossed: ['Inhambane'],
    keyBridges: [],
    trafficVolume: '2.400 veículos/dia',
    coordinates: [
      [35.201, -22.251], // Mapinhane (EN1)
      [35.313, -22.018], // Vilankulo
    ],
    stationsOrHubs: [
      { name: 'Mapinhane (Entroncamento EN1)', coordinates: [35.201, -22.251], type: 'hub' },
      { name: 'Vila Turística de Vilankulo (Acesso a Bazaruto)', coordinates: [35.313, -22.018], type: 'hub' },
    ],
    description: 'Ramal pavimentado que conecta a EN1 à vila costeira de Vilankulo e ao embarcadouro para o Parque Nacional Marinho de Bazaruto.',
    strategicImportance: 'Infraestrutura de apoio aos hotéis internacionais, aeroporto internacional de Vilankulo e safaris marítimos.',
  },
  {
    id: 'road_r449',
    layer: 'secondary_roads',
    code: 'R449',
    name: 'Circuito Turístico de Tofo & Barra (R449)',
    operator: 'ANE / Município de Inhambane',
    extentKm: 32,
    status: 'Pavimentado',
    color: '#06b6d4',
    surfaceType: 'Asfalto CBUQ',
    laneConfiguration: '2 faixas de 3.0m',
    provincesCrossed: ['Inhambane'],
    keyBridges: [],
    trafficVolume: '2.100 veículos/dia',
    coordinates: [
      [35.378, -23.864], // Cidade de Inhambane
      [35.541, -23.852], // Praia do Tofo
      [35.512, -23.791], // Praia da Barra
    ],
    stationsOrHubs: [
      { name: 'Inhambane (Cidade Histórica Terra da Boa Gente)', coordinates: [35.378, -23.864], type: 'hub' },
      { name: 'Praia do Tofo (Capital Mundial de Raias Manta e Tubarão Baleia)', coordinates: [35.541, -23.852], type: 'hub' },
      { name: 'Península da Barra (Farol da Barra)', coordinates: [35.512, -23.791], type: 'hub' },
    ],
    description: 'Estrada cénica que liga a cidade histórica de Inhambane aos maiores santuários de mergulho oceânico da África Austral.',
    strategicImportance: 'Espinha dorsal do turismo internacional de mergulho, resorts e gastronomia da província.',
  },
  {
    id: 'road_r512',
    layer: 'secondary_roads',
    code: 'R512',
    name: 'Estrada Ecológica da Gorongosa (R512 - Chitengo)',
    operator: 'ANE / Administração do Parque da Gorongosa',
    extentKm: 42,
    status: 'Terra Batida e Revestimento Estabilizado de Alta Resistência',
    color: '#06b6d4',
    surfaceType: 'Terra Batida e Revestimento Estabilizado',
    laneConfiguration: 'Pista ecológica com valetas laterais de retenção',
    provincesCrossed: ['Sofala'],
    keyBridges: ['Ponte sobre o Rio Vunduzi'],
    trafficVolume: '450 veículos/dia',
    coordinates: [
      [34.072, -18.682], // Gorongosa Vila (EN1)
      [34.351, -18.980], // Acampamento de Chitengo (Sede do Parque)
    ],
    stationsOrHubs: [
      { name: 'Vila da Gorongosa (Saída EN1)', coordinates: [34.072, -18.682], type: 'hub' },
      { name: 'Chitengo (Centro de Ciência e Turismo da Gorongosa)', coordinates: [34.351, -18.980], type: 'hub' },
    ],
    description: 'Via de acesso ao Parque Nacional da Gorongosa, considerado um dos maiores sucessos de restauração biológica e ecoturismo do planeta.',
    strategicImportance: 'Pesquisa científica internacional, proteção da biodiversidade e subsistência de comunidades rurais.',
  },
  {
    id: 'road_r704',
    layer: 'secondary_roads',
    code: 'R704',
    name: 'Estrada de Cahora Bassa (R704 - Songo)',
    operator: 'ANE / HCB - Hidroeléctrica de Cahora Bassa',
    extentKm: 145,
    status: 'Pavimentado / Pavimento Especial para Equipamento Pesado',
    color: '#06b6d4',
    surfaceType: 'Asfalto CBUQ',
    laneConfiguration: '2 faixas de 3.5m com guardas de segurança em desfiladeiro',
    provincesCrossed: ['Tete'],
    keyBridges: ['Viadutos de Estima', 'Ponte sobre o Rio Sanhangoè'],
    trafficVolume: '1.200 veículos/dia',
    coordinates: [
      [33.591, -16.162], // Tete Cidade
      [33.151, -16.702], // Changara
      [32.741, -15.721], // Estima
      [32.772, -15.611], // Vila do Songo (Albufeira de Cahora Bassa)
    ],
    stationsOrHubs: [
      { name: 'Tete Cidade', coordinates: [33.591, -16.162], type: 'hub' },
      { name: 'Planalto de Estima', coordinates: [32.741, -15.721], type: 'hub' },
      { name: 'Vila do Songo (Central Hidroeléctrica HCB)', coordinates: [32.772, -15.611], type: 'hub' },
    ],
    description: 'Estrada de montanha que conduz à Barragem Hidroeléctrica de Cahora Bassa, a maior fonte de energia renovável da África Austral.',
    strategicImportance: 'Segurança energética regional (Moçambique, África do Sul e Zimbabwe), pesca da kapenta e manutenção da infraestrutura da HCB.',
  },
  {
    id: 'road_r760',
    layer: 'secondary_roads',
    code: 'R760',
    name: 'Acesso à Ilha de Moçambique (R760 - Património UNESCO)',
    operator: 'ANE',
    extentKm: 48,
    status: 'Pavimentado / Excelente Conservação',
    color: '#06b6d4',
    surfaceType: 'Asfalto CBUQ',
    laneConfiguration: '2 faixas com iluminação na aproximação costeira',
    provincesCrossed: ['Nampula'],
    keyBridges: ['Ponte da Ilha de Moçambique (3.800m sobre o Oceano Índico)'],
    trafficVolume: '1.800 veículos/dia',
    coordinates: [
      [40.421, -14.981], // Monapo (EN8)
      [40.672, -15.032], // Lumbo (Entrada da Ponte)
      [40.730, -15.036], // Ilha de Moçambique
    ],
    stationsOrHubs: [
      { name: 'Monapo (Nó EN8)', coordinates: [40.421, -14.981], type: 'hub' },
      { name: 'Lumbo (Aeródromo Histórico e Entrada da Ponte)', coordinates: [40.672, -15.032], type: 'hub' },
      { name: 'Ponte da Ilha de Moçambique (3.8 km sobre o mar)', coordinates: [40.700, -15.034], type: 'bridge' },
      { name: 'Ilha de Moçambique (Património Mundial da UNESCO)', coordinates: [40.730, -15.036], type: 'hub' },
    ],
    description: 'Conecta a EN8 à Ilha de Moçambique através de uma impressionante ponte de 3,8 km sobre o Oceano Índico.',
    strategicImportance: 'Preservação histórica mundial, turismo cultural e vida económica dos pescadores e artesãos da ilha.',
  },
  {
    id: 'road_r601',
    layer: 'secondary_roads',
    code: 'R601',
    name: 'Corredor das Terras Altas de Chimanimani (R601)',
    operator: 'ANE',
    extentKm: 85,
    status: 'Pavimentado / Trechos em Macadame',
    color: '#06b6d4',
    surfaceType: 'Tratamento Superficial Duplo (TSD)',
    laneConfiguration: '2 faixas de 3.25m em curvas de montanha',
    provincesCrossed: ['Manica'],
    keyBridges: ['Ponte Rio Lucite', 'Ponte Rio Zona'],
    trafficVolume: '1.100 veículos/dia',
    coordinates: [
      [33.482, -19.121], // Chimoio (EN6)
      [33.281, -19.412], // Sussundenga
      [33.150, -19.821], // Parque Nacional de Chimanimani (Monte Binga)
    ],
    stationsOrHubs: [
      { name: 'Chimoio (Saída EN6)', coordinates: [33.482, -19.121], type: 'hub' },
      { name: 'Sussundenga (Centro Agrícola de Frutas)', coordinates: [33.281, -19.412], type: 'hub' },
      { name: 'Parque Nacional de Chimanimani (Monte Binga - 2.436m)', coordinates: [33.150, -19.821], type: 'hub' },
    ],
    description: 'Estrada de penetração nas montanhas de Manica em direção ao maciço de Chimanimani e ao pico mais alto de Moçambique (Monte Binga).',
    strategicImportance: 'Ecoturismo alpino, produção de maçãs, citrinos e café de altitude, e conservação de florestas endémicas.',
  },
  {
    id: 'road_r1001',
    layer: 'secondary_roads',
    code: 'R1001',
    name: 'Estrada Ecológica do Monte Namúli (R1001)',
    operator: 'ANE',
    extentKm: 78,
    status: 'Terra Batida e Revestimento Macadame',
    color: '#06b6d4',
    surfaceType: 'Terra Batida e Revestimento Estabilizado',
    laneConfiguration: 'Pista de montanha para veículos todo-o-terreno e camiões agrícolas',
    provincesCrossed: ['Zambézia'],
    keyBridges: ['Ponte Rio Licungo Superior'],
    trafficVolume: '350 veículos/dia',
    coordinates: [
      [36.981, -15.462], // Gurúè Vila
      [37.051, -15.352], // Plantações de Chá de Chá Moçambique
      [37.031, -15.221], // Encostas do Monte Namúli (2.419m)
    ],
    stationsOrHubs: [
      { name: 'Vila de Gurúè', coordinates: [36.981, -15.462], type: 'hub' },
      { name: 'Plantações Históricas de Chá', coordinates: [37.051, -15.352], type: 'hub' },
      { name: 'Maciço do Monte Namúli (Biodiversidade Endémica)', coordinates: [37.031, -15.221], type: 'hub' },
    ],
    description: 'Acesso às encostas do segundo pico mais elevado de Moçambique e às extensas plantações verdes de chá do Gurúè.',
    strategicImportance: 'Importância botânica mundial (hotspot de biodiversidade afromontana) e colheita de chá para exportação.',
  },
  {
    id: 'road_r1002',
    layer: 'secondary_roads',
    code: 'R1002',
    name: 'Acesso Costeiro de Pebane (R1002 - Areias Pesadas)',
    operator: 'ANE',
    extentKm: 155,
    status: 'Revestimento Estabilizado / Pavimentado nos Centros Urbanos',
    color: '#06b6d4',
    surfaceType: 'Misto (Asfalto CBUQ nos nós urbanos e Terra Estabilizada)',
    laneConfiguration: 'Faixa simples 2 vias de 3.5m',
    provincesCrossed: ['Zambézia'],
    keyBridges: ['Ponte Rio Raraga'],
    trafficVolume: '950 veículos/dia',
    coordinates: [
      [37.031, -17.502], // Namacurra (EN1)
      [37.481, -17.321], // Maganja da Costa
      [38.132, -17.262], // Pebane
    ],
    stationsOrHubs: [
      { name: 'Namacurra (Saída da EN1)', coordinates: [37.031, -17.502], type: 'hub' },
      { name: 'Maganja da Costa', coordinates: [37.481, -17.321], type: 'hub' },
      { name: 'Vila Costeira de Pebane (Mineração de Ilmenite e Zircão)', coordinates: [38.132, -17.262], type: 'hub' },
    ],
    description: 'Eixo de ligação da EN1 ao litoral norte da Zambézia, servindo o porto e os jazigos costeiros de minerais pesados.',
    strategicImportance: 'Mineração de areias pesadas (ilmenite, rutilo), pesca artesanal e abastecimento da faixa costeira.',
  },
  {
    id: 'road_r1201',
    layer: 'secondary_roads',
    code: 'R1201',
    name: 'Corredor da Reserva Especial do Niassa (R1201 - Mecula)',
    operator: 'ANE / Administração da Reserva do Niassa',
    extentKm: 195,
    status: 'Terra Batida e Macadame Estabilizado',
    color: '#06b6d4',
    surfaceType: 'Terra Batida e Revestimento Estabilizado',
    laneConfiguration: 'Pista de proteção ambiental (6.0m)',
    provincesCrossed: ['Niassa', 'Cabo Delgado'],
    keyBridges: ['Ponte Rio Lugenda em Mecula', 'Ponte Rio Rovuma (Travessia)'],
    trafficVolume: '220 veículos/dia',
    coordinates: [
      [37.541, -13.221], // Marrupa
      [37.652, -12.081], // Mecula (Sede da Reserva)
    ],
    stationsOrHubs: [
      { name: 'Marrupa (Entroncamento Regional)', coordinates: [37.541, -13.221], type: 'hub' },
      { name: 'Mecula (Sede da Reserva Especial do Niassa)', coordinates: [37.652, -12.081], type: 'hub' },
    ],
    description: 'Estrada de acesso ao maior ecossistema protegido de Moçambique (42.000 km²), santuário de elefantes, leões e cães-selvagens.',
    strategicImportance: 'Combate à caça furtiva, conservação de grandes mamíferos e ecoturismo de expedição selvagem.',
  },

  // 3. RAILWAYS (CFM)
  {
    id: 'rail_cfm_ressano',
    layer: 'railways',
    code: 'CFM-Sul (Linha de Ressano Garcia)',
    name: 'Linha Ferroviária de Ressano Garcia',
    operator: 'CFM - Caminhos de Ferro de Moçambique (Sul)',
    extentKm: 88,
    status: 'Operacional / Tráfego Intenso 24/7 de Carga Pesada',
    color: '#ef4444',
    dashPattern: true,
    coordinates: [
      [32.573, -25.975], // Porto de Maputo
      [32.461, -25.961], // Matola Gare
      [32.351, -25.752], // Machava
      [32.242, -25.602], // Moamba
      [31.981, -25.441], // Ressano Garcia / Transnet África do Sul
    ],
    stationsOrHubs: [
      { name: 'Estação Central de Maputo / Porto', coordinates: [32.573, -25.975] },
      { name: 'Matola Gare', coordinates: [32.461, -25.961] },
      { name: 'Moamba', coordinates: [32.242, -25.602] },
      { name: 'Ressano Garcia (Intercâmbio Transnet)', coordinates: [31.981, -25.441] },
    ],
    description: 'A mais lucrativa linha ferroviária do sul de Moçambique, ligada ao Porto de Maputo e à rede ferroviária da Transnet (África do Sul).',
    strategicImportance: 'Transporta milhões de toneladas de crómio, ferro, carvão magnético e combustíveis anualmente.',
  },
  {
    id: 'rail_cfm_limpopo',
    layer: 'railways',
    code: 'CFM-Sul (Linha do Limpopo)',
    name: 'Linha Ferroviária do Limpopo',
    operator: 'CFM - Caminhos de Ferro de Moçambique (Sul)',
    extentKm: 522,
    status: 'Operacional / Comboios de Passageiros e Mercadorias',
    color: '#ef4444',
    dashPattern: true,
    coordinates: [
      [32.573, -25.975], // Maputo
      [32.671, -25.714], // Marracuene
      [32.808, -25.405], // Manhiça
      [32.981, -24.521], // Chókwè
      [33.012, -24.491], // Guijá
      [32.501, -23.602], // Combomune
      [32.302, -23.901], // Mabalane
      [31.851, -22.181], // Chicualacuala (Fronteira Zimbabué / NRZ)
    ],
    stationsOrHubs: [
      { name: 'Maputo', coordinates: [32.573, -25.975] },
      { name: 'Chókwè (Bacia do Limpopo)', coordinates: [32.981, -24.521] },
      { name: 'Mabalane', coordinates: [32.302, -23.901] },
      { name: 'Chicualacuala (Fronteira com Zimbabué)', coordinates: [31.851, -22.181] },
    ],
    description: 'Linha ferroviária de grande extensão que acompanha o Vale do Limpopo até à fronteira sudoeste do Zimbabué.',
    strategicImportance: 'Alternativa ferroviária estratégica para países sem acesso ao mar (Zimbabué, Zâmbia, Botsuana) acederem ao Porto de Maputo.',
  },
  {
    id: 'rail_cfm_goba',
    layer: 'railways',
    code: 'CFM-Sul (Linha de Goba)',
    name: 'Linha Ferroviária de Goba',
    operator: 'CFM - Caminhos de Ferro de Moçambique (Sul)',
    extentKm: 64,
    status: 'Operacional / Reabilitada para Açúcar e Papel',
    color: '#ef4444',
    dashPattern: true,
    coordinates: [
      [32.573, -25.975], // Maputo
      [32.332, -26.042], // Boane
      [32.141, -26.212], // Goba / Fronteira Eswatini
    ],
    stationsOrHubs: [
      { name: 'Maputo', coordinates: [32.573, -25.975] },
      { name: 'Boane', coordinates: [32.332, -26.042] },
      { name: 'Goba (Fronteira Eswatini Railways)', coordinates: [32.141, -26.212] },
    ],
    description: 'Linha ferroviária que liga o Porto de Maputo à rede ferroviária de Eswatini, recentemente reactivada para comboios directos de carga.',
    strategicImportance: 'Exportação de açúcar, madeira e pasta de papel de Eswatini através do porto moçambicano.',
  },
  {
    id: 'rail_cfm_machipanda',
    layer: 'railways',
    code: 'CFM-Centro (Linha de Machipanda)',
    name: 'Linha Ferroviária de Machipanda (Corredor da Beira)',
    operator: 'CFM - Caminhos de Ferro de Moçambique (Centro)',
    extentKm: 317,
    status: 'Recentemente Modernizada / Comboios de Passageiros Retomados',
    color: '#ef4444',
    dashPattern: true,
    coordinates: [
      [34.836, -19.831], // Porto da Beira
      [34.741, -19.612], // Dondo
      [34.212, -19.271], // Nhamatanda
      [33.651, -19.142], // Gondola
      [33.482, -19.121], // Chimoio
      [32.881, -18.942], // Manica
      [32.741, -18.971], // Machipanda / Fronteira Zimbabué
    ],
    stationsOrHubs: [
      { name: 'Porto da Beira', coordinates: [34.836, -19.831] },
      { name: 'Dondo', coordinates: [34.741, -19.612] },
      { name: 'Chimoio', coordinates: [33.482, -19.121] },
      { name: 'Manica', coordinates: [32.881, -18.942] },
      { name: 'Machipanda (Fronteira Zimbabué)', coordinates: [32.741, -18.971] },
    ],
    description: 'Linha histórica do Corredor da Beira, modernizada com novos carris pesados e locomotivas de última geração para acelerar o trânsito com o Zimbabué.',
    strategicImportance: 'Eixo ferro-portuário essencial para a economia do Zimbabué e da região central de Moçambique.',
  },
  {
    id: 'rail_cfm_sena',
    layer: 'railways',
    code: 'CFM-Centro (Linha de Sena)',
    name: 'Linha Ferroviária de Sena (Carvão de Moatize)',
    operator: 'CFM - Caminhos de Ferro de Moçambique (Centro)',
    extentKm: 575,
    status: 'Operacional / Capacidade de 20 Milhões de Toneladas/Ano',
    color: '#ef4444',
    dashPattern: true,
    coordinates: [
      [34.836, -19.831], // Porto da Beira
      [34.741, -19.612], // Dondo
      [34.832, -18.902], // Muanza
      [35.151, -18.252], // Inhamitanga
      [35.342, -17.821], // Caia
      [35.322, -17.452], // Sena (Ponte Dona Ana sobre o Rio Zambeze)
      [35.311, -17.431], // Mutarara
      [34.502, -16.851], // Doa
      [33.732, -16.121], // Moatize (Minas de Carvão)
    ],
    stationsOrHubs: [
      { name: 'Porto da Beira', coordinates: [34.836, -19.831] },
      { name: 'Dondo (Bifurcação)', coordinates: [34.741, -19.612] },
      { name: 'Inhamitanga (Ramal de Marromeu)', coordinates: [35.151, -18.252] },
      { name: 'Vila de Sena (Ponte Dona Ana - 3,67 km)', coordinates: [35.322, -17.452] },
      { name: 'Moatize (Terminal Carbonífero)', coordinates: [33.732, -16.121] },
    ],
    description: 'Cruzando o Rio Zambeze pela monumental Ponte Dona Ana (uma das mais longas pontes ferroviárias do hemisfério sul), conecta as minas de Moatize ao Porto da Beira.',
    strategicImportance: 'Espinha dorsal do escoamento carbonífero do Vale do Zambeze e transporte de passageiros interprovincial.',
  },
  {
    id: 'rail_cfm_nacala',
    layer: 'railways',
    code: 'CFM-Norte / CDN (Corredor de Nacala)',
    name: 'Linha Ferroviária do Corredor de Nacala',
    operator: 'CFM / CDN - Corredor de Desenvolvimento do Norte',
    extentKm: 912,
    status: 'Padrão Internacional Pesado / Conexão Ferroviária a Lichinga',
    color: '#ef4444',
    dashPattern: true,
    coordinates: [
      [40.682, -14.545], // Porto de Nacala
      [40.421, -14.981], // Monapo
      [39.264, -15.121], // Nampula
      [38.302, -14.962], // Ribaúè
      [37.361, -14.941], // Malema
      [36.541, -14.802], // Cuamba
      [35.851, -14.981], // Entre-Lagos (Fronteira Malawi)
      [35.242, -13.312], // Lichinga (Ramal de Niassa)
    ],
    stationsOrHubs: [
      { name: 'Porto de Nacala (Terminal Marítimo)', coordinates: [40.682, -14.545] },
      { name: 'Nampula (Estação Central do Norte)', coordinates: [39.264, -15.121] },
      { name: 'Cuamba (Entroncamento Estratégico)', coordinates: [36.541, -14.802] },
      { name: 'Entre-Lagos (Malawi)', coordinates: [35.851, -14.981] },
      { name: 'Lichinga (Planalto de Niassa)', coordinates: [35.242, -13.312] },
    ],
    description: 'Um dos mais modernos corredores logísticos multimodais de África, atravessando Nampula e Niassa até ao Malawi.',
    strategicImportance: 'Escoamento de carvão e cereais, transporte de carga geral e ligação do mar profundo de Nacala ao interior africano.',
  },
];

export const TRANSPORT_NODES: TransportNode[] = [
  // 4. COMMERCIAL PORTS
  {
    id: 'port_maputo',
    layer: 'ports',
    code: 'PRT-MAP',
    name: 'Porto Internacional de Maputo & Matola',
    category: 'Porto de Águas Profundas',
    provinceId: '01',
    provinceName: 'Cidade de Maputo',
    coordinates: [32.572, -25.975],
    runwayOrBerths: '14 Cais Comerciais / Calado até 14.5 metros',
    operator: 'MPDC - Sociedade de Desenvolvimento do Porto de Maputo',
    capacityOrTraffic: 'Mais de 31 Milhões de Toneladas / Ano (Recorde Nacional)',
    description: 'O maior e mais desenvolvido complexo portuário de Moçambique, localizado na Baía de Maputo com acessos rodoviários e ferroviários directos à África do Sul e Eswatini.',
    highlights: [
      'Terminal de Contentores de última geração e scanner de raio-X de alto fluxo',
      'Terminal de Granéis de Matola (TCM) especializado em carvão e magnetita',
      'Terminal de Frutas e Citrinos do Vale do Limpopo e Mpumalanga',
      'Canal de acesso dragado a 14.2 metros para receber navios Panamax e Post-Panamax',
    ],
  },
  {
    id: 'port_beira',
    layer: 'ports',
    code: 'PRT-BEW',
    name: 'Porto da Beira',
    category: 'Porto de Águas Profundas',
    provinceId: '05',
    provinceName: 'Sofala',
    coordinates: [34.836, -19.831],
    runwayOrBerths: '12 Cais Comerciais / Calado até 12 metros',
    operator: 'Cornelder de Moçambique / CFM',
    capacityOrTraffic: 'Cerca de 14 Milhões de Toneladas / Ano',
    description: 'Porto hub da região centro do país, servindo como porta de entrada e saída marítima primária para Zimbabué, Zâmbia, Malawi e RDC.',
    highlights: [
      'Terminal de Petróleo e Gasoduto direto Beira-Feruka (Zimbabué)',
      'Terminal de Contentores moderno e pátios multimodais interligados à EN6 e Linhas de Sena e Machipanda',
      'Porto essencial para exportação de tabaco, minerais e fertilizantes agrícolas',
    ],
  },
  {
    id: 'port_nacala',
    layer: 'ports',
    code: 'PRT-MNC',
    name: 'Porto de Nacala',
    category: 'Porto de Águas Profundas',
    provinceId: '09',
    provinceName: 'Nampula',
    coordinates: [40.682, -14.545],
    runwayOrBerths: 'Cais de Águas Profundas / Calado Natural até 18 metros',
    operator: 'CFM / CDN',
    capacityOrTraffic: 'Mais de 18 Milhões de Toneladas / Ano',
    description: 'O melhor porto natural de águas profundas de toda a costa oriental africana, abrigado numa baía protegida sem necessidade de dragagem frequente.',
    highlights: [
      'Calado natural excepcional que permite atracar navios Capesize sem restrições de maré',
      'Terminal de Carvão de Nacala-a-Velha com carregadores de navios contínuos',
      'Terminal comercial modernizado com financiamento da JICA (Japão) e novos cais de contentores',
    ],
  },
  {
    id: 'port_pemba',
    layer: 'ports',
    code: 'PRT-POL',
    name: 'Porto de Pemba',
    category: 'Porto Secundário',
    provinceId: '10',
    provinceName: 'Cabo Delgado',
    coordinates: [40.505, -12.969],
    runwayOrBerths: 'Cais Comercial / Calado até 8.5 metros',
    operator: 'CFM',
    capacityOrTraffic: 'Apoio Logístico Offshore e Cabotagem',
    description: 'Localizado na terceira maior baía natural do mundo, é o centro de apoio logístico para o sector de hidrocarbonetos na Bacia do Rovuma.',
    highlights: [
      'Base logística para operações offshore de petróleo e gás',
      'Terminal de cabotagem e movimentação de mercadorias para o norte',
    ],
  },
  {
    id: 'port_quelimane',
    layer: 'ports',
    code: 'PRT-UEL',
    name: 'Porto de Quelimane',
    category: 'Porto Secundário',
    provinceId: '08',
    provinceName: 'Zambézia',
    coordinates: [36.883, -17.882],
    runwayOrBerths: 'Cais Fluvial no Rio dos Bons Sinais',
    operator: 'CFM',
    capacityOrTraffic: 'Cabotagem Geral e Pesca Industrial',
    description: 'Porto fluvial histórico situado a cerca de 20 km da costa do Oceano Índico, junto à cidade de Quelimane.',
    highlights: [
      'Pólo de cabotagem e transporte de copra, peixe e madeira',
      'Infraestrutura de apoio à pesca de camarão no Banco de Sofala',
    ],
  },
  {
    id: 'port_inhambane',
    layer: 'ports',
    code: 'PRT-INH',
    name: 'Porto Histórico de Inhambane & Maxixe',
    category: 'Porto Secundário',
    provinceId: '04',
    provinceName: 'Inhambane',
    coordinates: [35.378, -23.864],
    runwayOrBerths: 'Cais Histórico e Terminal de Dhows Tradicionais',
    operator: 'CFM / Município de Inhambane',
    capacityOrTraffic: 'Cabotagem e Transporte Diário de Passageiros',
    description: 'Porto quinhentista na Baía de Inhambane, famoso pela tradicional travessia marítima em barcos à vela (dhows) e lanchas entre Inhambane e Maxixe.',
    highlights: [
      'Mais de 2.000 passageiros transportados diariamente na travessia Inhambane-Maxixe',
      'Porto pesqueiro e património histórico e marítimo nacional',
    ],
  },
  {
    id: 'port_angoche',
    layer: 'ports',
    code: 'PRT-ANO',
    name: 'Porto de Angoche',
    category: 'Porto Secundário',
    provinceId: '09',
    provinceName: 'Nampula',
    coordinates: [39.905, -16.230],
    runwayOrBerths: 'Cais de Cabotagem e Pesca',
    operator: 'CFM',
    capacityOrTraffic: 'Pesca e Cabotagem Regional',
    description: 'Porto costeiro no sul da província de Nampula, vocacionado para a indústria pesqueira e cabotagem costeira.',
    highlights: ['Terminal de pesca e apoio aos arquipélagos e ilhas satélites'],
  },

  // 5. INTERNATIONAL & NATIONAL AIRPORTS (ADM)
  {
    id: 'air_mpm',
    layer: 'airports',
    code: 'MPM / FQMA',
    name: 'Aeroporto Internacional de Maputo',
    category: 'Aeroporto Internacional',
    provinceId: '01',
    provinceName: 'Cidade de Maputo',
    coordinates: [32.573, -25.921],
    elevationMeters: 44,
    runwayOrBerths: 'Pista 05/23: 3.660 m (Asfalto / Padrão Cat. 4E)',
    operator: 'ADM - Aeroportos de Moçambique',
    capacityOrTraffic: 'Capacidade para 3.5 Milhões de Passageiros / Ano',
    description: 'O principal aeroporto internacional de Moçambique, localizado no bairro de Mavalane a 5 km do centro de Maputo. Hub das Linhas Aéreas de Moçambique (LAM).',
    highlights: [
      'Terminal internacional moderno capaz de receber aeronaves Boeing 777, 787 e Airbus A350',
      'Conexões directas com Lisboa, Joanesburgo, Doha, Adis Abeba, Luanda, Nairobi e Harare',
      'Terminal de carga aérea climatizado com capacidade para produtos frescos e farmacêuticos',
    ],
  },
  {
    id: 'air_bew',
    layer: 'airports',
    code: 'BEW / FQBR',
    name: 'Aeroporto Internacional da Beira',
    category: 'Aeroporto Internacional',
    provinceId: '05',
    provinceName: 'Sofala',
    coordinates: [34.908, -19.796],
    elevationMeters: 33,
    runwayOrBerths: 'Pista 12/30: 2.360 m (Asfalto)',
    operator: 'ADM - Aeroportos de Moçambique',
    capacityOrTraffic: 'Mais de 500.000 Passageiros / Ano',
    description: 'Segundo maior aeroporto internacional do país, servindo como hub para a região central e para voos regionais com a África do Sul e Zimbabué.',
    highlights: [
      'Pista adaptada para aeronaves narrowbody (Boeing 737 / Airbus A320)',
      'Localização estratégica para ligações ao Corredor da Beira',
    ],
  },
  {
    id: 'air_apl',
    layer: 'airports',
    code: 'APL / FQNP',
    name: 'Aeroporto Internacional de Nampula',
    category: 'Aeroporto Internacional',
    provinceId: '09',
    provinceName: 'Nampula',
    coordinates: [39.282, -15.106],
    elevationMeters: 440,
    runwayOrBerths: 'Pista 05/23: 2.000 m (Asfalto)',
    operator: 'ADM - Aeroportos de Moçambique',
    capacityOrTraffic: '400.000 Passageiros / Ano',
    description: 'Aeroporto de referência para todo o norte moçambicano, com forte movimento de executivos, investidores agrícolas e tráfego regional.',
    highlights: ['Conexões directas com Maputo, Beira, Pemba, Nacala e Joanesburgo'],
  },
  {
    id: 'air_vnx',
    layer: 'airports',
    code: 'VNX / FQVL',
    name: 'Aeroporto Internacional de Vilankulo',
    category: 'Aeroporto Internacional',
    provinceId: '04',
    provinceName: 'Inhambane',
    coordinates: [35.313, -22.018],
    elevationMeters: 35,
    runwayOrBerths: 'Pista 17/35: 1.500 m (Asfalto)',
    operator: 'ADM - Aeroportos de Moçambique',
    capacityOrTraffic: '200.000 Passageiros / Ano (Pólo Turístico)',
    description: 'Terminal internacional premiado pelo design bioclimático, sendo a principal porta de entrada aérea internacional para o Arquipélago de Bazaruto.',
    highlights: [
      'Voos directos regulares de Joanesburgo (Airlink) e Maputo (LAM)',
      'Terminal ecológico de alto padrão com serviços aduaneiros e de imigração para turistas internacionais',
    ],
  },
  {
    id: 'air_pol',
    layer: 'airports',
    code: 'POL / FQPB',
    name: 'Aeroporto Internacional de Pemba',
    category: 'Aeroporto Internacional',
    provinceId: '10',
    provinceName: 'Cabo Delgado',
    coordinates: [40.522, -12.981],
    elevationMeters: 95,
    runwayOrBerths: 'Pista 17/35: 2.150 m (Asfalto)',
    operator: 'ADM - Aeroportos de Moçambique',
    capacityOrTraffic: '300.000 Passageiros / Ano',
    description: 'Aeroporto internacional costeiro que atende ao sector de gás natural da Bacia do Rovuma e ao turismo das Ilhas Quirimbas.',
    highlights: ['Pista moderna com iluminação nocturna e voos directos de Joanesburgo e Maputo'],
  },
  {
    id: 'air_mnc',
    layer: 'airports',
    code: 'MNC / FQNC',
    name: 'Aeroporto Internacional de Nacala',
    category: 'Aeroporto Internacional',
    provinceId: '09',
    provinceName: 'Nampula',
    coordinates: [40.712, -14.593],
    elevationMeters: 125,
    runwayOrBerths: 'Pista 01/19: 3.100 m (Asfalto de Grande Capacidade)',
    operator: 'ADM - Aeroportos de Moçambique',
    capacityOrTraffic: 'Capacidade de até 500.000 Passageiros / Ano',
    description: 'Infraestrutura aeroportuária moderna com capacidade para acolher aeronaves widebody de longo curso, integrando a Zona Económica Especial de Nacala.',
    highlights: ['Pista de 3.100 metros apta a receber aeronaves de fuselagem larga'],
  },
  {
    id: 'air_tet',
    layer: 'airports',
    code: 'TET / FQTT',
    name: 'Aeroporto de Chingozi - Tete',
    category: 'Aeroporto Nacional',
    provinceId: '07',
    provinceName: 'Tete',
    coordinates: [33.640, -16.175],
    elevationMeters: 160,
    runwayOrBerths: 'Pista 01/19: 2.400 m (Asfalto)',
    operator: 'ADM - Aeroportos de Moçambique',
    capacityOrTraffic: '250.000 Passageiros / Ano',
    description: 'Aeroporto crucial para a indústria de mineração de carvão de Moatize e projectos energéticos do Vale do Zambeze.',
    highlights: ['Tráfego corporativo intenso com voos diários para Maputo e Joanesburgo'],
  },
  {
    id: 'air_uel',
    layer: 'airports',
    code: 'UEL / FQQL',
    name: 'Aeroporto de Quelimane',
    category: 'Aeroporto Nacional',
    provinceId: '08',
    provinceName: 'Zambézia',
    coordinates: [36.870, -17.855],
    elevationMeters: 11,
    runwayOrBerths: 'Pista 18/36: 1.800 m (Asfalto)',
    operator: 'ADM - Aeroportos de Moçambique',
    capacityOrTraffic: '150.000 Passageiros / Ano',
    description: 'Serve a província da Zambézia com voos comerciais regulares para a Beira e Maputo.',
    highlights: ['Infraestrutura moderna de navegação e terminal de passageiros remodelado'],
  },
  {
    id: 'air_vxc',
    layer: 'airports',
    code: 'VXC / FQLC',
    name: 'Aeroporto de Lichinga',
    category: 'Aeroporto Nacional',
    provinceId: '11',
    provinceName: 'Niassa',
    coordinates: [35.266, -13.274],
    elevationMeters: 1370,
    runwayOrBerths: 'Pista 14/32: 2.500 m (Asfalto)',
    operator: 'ADM - Aeroportos de Moçambique',
    capacityOrTraffic: '100.000 Passageiros / Ano',
    description: 'O aeroporto mais alto de Moçambique, situado a quase 1.400 metros de altitude no planalto de Niassa.',
    highlights: ['Pista longa adaptada a operações em altitude'],
  },
  {
    id: 'air_vpy',
    layer: 'airports',
    code: 'VPY / FQCH',
    name: 'Aeroporto de Chimoio',
    category: 'Aeroporto Nacional',
    provinceId: '06',
    provinceName: 'Manica',
    coordinates: [33.428, -19.151],
    elevationMeters: 700,
    runwayOrBerths: 'Pista 13/31: 2.150 m (Asfalto)',
    operator: 'ADM - Aeroportos de Moçambique',
    capacityOrTraffic: '120.000 Passageiros / Ano',
    description: 'Atende ao corredor agro-industrial de Manica e ao tráfego de ligação com o Zimbabué.',
    highlights: ['Terminal renovado e voos de ligação regulares com Maputo'],
  },
  {
    id: 'air_inh',
    layer: 'airports',
    code: 'INH / FQIN',
    name: 'Aeroporto de Inhambane',
    category: 'Aeroporto Nacional',
    provinceId: '04',
    provinceName: 'Inhambane',
    coordinates: [35.408, -23.876],
    elevationMeters: 9,
    runwayOrBerths: 'Pista 16/34: 1.500 m (Asfalto)',
    operator: 'ADM - Aeroportos de Moçambique',
    capacityOrTraffic: '100.000 Passageiros / Ano',
    description: 'Serve a histórica cidade de Inhambane e as estâncias turísticas de Tofo e Barra.',
    highlights: ['Voos regulares da LAM e charters turísticos sazonais da África Austral'],
  },

  // 6. REGIONAL AERODROMES (Pistas & Aeródromos Regionais)
  {
    id: 'aero_bazaruto',
    layer: 'aerodromes',
    code: 'BZB',
    name: 'Aeródromo da Ilha de Bazaruto',
    category: 'Aeródromo Regional',
    provinceId: '04',
    provinceName: 'Inhambane',
    coordinates: [35.474, -21.545],
    elevationMeters: 15,
    runwayOrBerths: 'Pista Compactada 1.100 m',
    operator: 'Parque Nacional de Bazaruto / Resorts Privados',
    capacityOrTraffic: 'Voos charter turísticos e helitransporte',
    description: 'Pista exclusiva na Ilha de Bazaruto para charters de hóspedes de resorts de luxo e fiscalização ambiental do Parque Nacional.',
    highlights: ['Acesso aéreo directo aos resorts da ilha a partir de Vilankulo e Joanesburgo'],
  },
  {
    id: 'aero_santa_carolina',
    layer: 'aerodromes',
    code: 'SCR',
    name: 'Aeródromo de Santa Carolina (Ilha do Paraíso)',
    category: 'Aeródromo Regional',
    provinceId: '04',
    provinceName: 'Inhambane',
    coordinates: [35.340, -21.621],
    elevationMeters: 5,
    runwayOrBerths: 'Pista Histórica 950 m',
    operator: 'Administração Local / Conservação',
    capacityOrTraffic: 'Aeronaves ligeiras e emergência',
    description: 'Pista histórica na mítica Ilha de Santa Carolina, destino de mergulho e ecoturismo exclusivo.',
    highlights: ['Pista cercada por águas cristalinas na baía de Bazaruto'],
  },
  {
    id: 'aero_ponta_ouro',
    layer: 'aerodromes',
    code: 'PDZ',
    name: 'Aeródromo da Ponta do Ouro',
    category: 'Aeródromo Regional',
    provinceId: '02',
    provinceName: 'Maputo Província',
    coordinates: [32.883, -26.835],
    elevationMeters: 30,
    runwayOrBerths: 'Pista de Relva / Cascalho 800 m',
    operator: 'Comunitário / Aviação Geral',
    capacityOrTraffic: 'Aviação ligeira privada e salvamento',
    description: 'Serve a zona balnear da Ponta do Ouro no extremo sul de Moçambique.',
    highlights: ['Utilizado por aeronaves ligeiras de turismo e vigilância da Reserva Marinha Parcial'],
  },
  {
    id: 'aero_bilene',
    layer: 'aerodromes',
    code: 'BLN',
    name: 'Aeródromo da Praia do Bilene',
    category: 'Aeródromo Regional',
    provinceId: '03',
    provinceName: 'Gaza',
    coordinates: [33.242, -25.260],
    elevationMeters: 25,
    runwayOrBerths: 'Pista Estabilizada 1.000 m',
    operator: 'Município de Bilene',
    capacityOrTraffic: 'Charters de fim-de-semana e desporto aéreo',
    description: 'Pista de aviação recreativa e turística junto à Lagoa do Bilene.',
    highlights: ['Popular para ultraleves, paraquedismo e fins-de-semana de recreio'],
  },
  {
    id: 'aero_lumbo',
    layer: 'aerodromes',
    code: 'LBO',
    name: 'Aeródromo Histórico do Lumbo',
    category: 'Aeródromo Regional',
    provinceId: '09',
    provinceName: 'Nampula',
    coordinates: [40.672, -15.032],
    elevationMeters: 10,
    runwayOrBerths: 'Pista Histórica Asfaltada 1.300 m',
    operator: 'ADM / Ilha de Moçambique',
    capacityOrTraffic: 'Voos de turismo histórico e delegações',
    description: 'O primeiro aeródromo construído em Moçambique, situado em terra firme em frente à histórica Ilha de Moçambique.',
    highlights: ['Porta de entrada aérea para o Património Mundial da UNESCO da Ilha de Moçambique'],
  },
  {
    id: 'aero_songo',
    layer: 'aerodromes',
    code: 'SGO',
    name: 'Aeródromo de Songo (Cahora Bassa)',
    category: 'Aeródromo Regional',
    provinceId: '07',
    provinceName: 'Tete',
    coordinates: [32.771, -15.602],
    elevationMeters: 880,
    runwayOrBerths: 'Pista Asfaltada 1.400 m',
    operator: 'HCB - Hidroeléctrica de Cahora Bassa',
    capacityOrTraffic: 'Tráfego corporativo da hidroeléctrica',
    description: 'Construído no planalto de Songo para servir a gigantesca Central Hidroeléctrica de Cahora Bassa.',
    highlights: ['Utilizado regularmente pela frota corporativa da HCB e técnicos internacionais'],
  },
  {
    id: 'aero_chitengo',
    layer: 'aerodromes',
    code: 'CHG',
    name: 'Aeródromo de Chitengo (Gorongosa)',
    category: 'Aeródromo Regional',
    provinceId: '05',
    provinceName: 'Sofala',
    coordinates: [34.351, -18.980],
    elevationMeters: 40,
    runwayOrBerths: 'Pista de Cascalho Compactado 1.200 m',
    operator: 'Parque Nacional da Gorongosa',
    capacityOrTraffic: 'Safaris turísticos e missões científicas',
    description: 'Pista localizada junto ao acampamento principal de Chitengo no Parque Nacional da Gorongosa.',
    highlights: ['Voos charter directos trazendo cientistas mundiais e turistas de safaris'],
  },
  {
    id: 'aero_cuamba',
    layer: 'aerodromes',
    code: 'CXA',
    name: 'Aeródromo de Cuamba',
    category: 'Aeródromo Regional',
    provinceId: '11',
    provinceName: 'Niassa',
    coordinates: [36.533, -14.821],
    elevationMeters: 590,
    runwayOrBerths: 'Pista 1.200 m',
    operator: 'ADM',
    capacityOrTraffic: 'Apoio regional ao interior de Niassa',
    description: 'Pista situada no centro urbano e ferroviário de Cuamba.',
    highlights: ['Ligação rápida ao entreposto rodo-ferroviário de Niassa'],
  },
  {
    id: 'aero_angoche',
    layer: 'aerodromes',
    code: 'ANO',
    name: 'Aeródromo de Angoche',
    category: 'Aeródromo Regional',
    provinceId: '09',
    provinceName: 'Nampula',
    coordinates: [39.911, -16.223],
    elevationMeters: 20,
    runwayOrBerths: 'Pista 1.100 m',
    operator: 'ADM / Pesca',
    capacityOrTraffic: 'Aviação costeira',
    description: 'Serve a histórica cidade costeira de Angoche e a sua indústria pesqueira.',
    highlights: ['Acesso rápido ao litoral sul da província de Nampula'],
  },
  {
    id: 'aero_gurue',
    layer: 'aerodromes',
    code: 'VRE',
    name: 'Aeródromo de Gurúè',
    category: 'Aeródromo Regional',
    provinceId: '08',
    provinceName: 'Zambézia',
    coordinates: [36.980, -15.460],
    elevationMeters: 750,
    runwayOrBerths: 'Pista 1.150 m',
    operator: 'ADM / Sector Chazeiro',
    capacityOrTraffic: 'Tráfego agro-industrial e turismo de montanha',
    description: 'Localizado no sopé do Monte Namúli, no meio das maiores plantações de chá de Moçambique.',
    highlights: ['Pista cénica rodeada por plantações verdes de chá e montanhas'],
  },
  {
    id: 'aero_marromeu',
    layer: 'aerodromes',
    code: 'MRM',
    name: 'Aeródromo de Marromeu',
    category: 'Aeródromo Regional',
    provinceId: '05',
    provinceName: 'Sofala',
    coordinates: [35.940, -18.280],
    elevationMeters: 15,
    runwayOrBerths: 'Pista 1.050 m',
    operator: 'Companhia de Sena / ADM',
    capacityOrTraffic: 'Açucareira e Reserva Especial de Búfalos',
    description: 'Pista do Delta do Zambeze que atende à indústria de açúcar de Marromeu e aos safaris do Delta.',
    highlights: ['Acesso ao Complexo de Marromeu (Sítio Ramsar de importância internacional)'],
  },
  {
    id: 'aero_ulongue',
    layer: 'aerodromes',
    code: 'ULG',
    name: 'Aeródromo de Ulongué (Angónia)',
    category: 'Aeródromo Regional',
    provinceId: '07',
    provinceName: 'Tete',
    coordinates: [34.360, -14.710],
    elevationMeters: 1280,
    runwayOrBerths: 'Pista de Terra Batida 1.000 m',
    operator: 'Distrito de Angónia',
    capacityOrTraffic: 'Tráfego agrícola e humanitário',
    description: 'Situado no fértil planalto de Angónia, o celeiro agrícola da província de Tete.',
    highlights: ['Apoio ao agronegócio de batata, milho e hortícolas de montanha'],
  },
  {
    id: 'aero_montepuez',
    layer: 'aerodromes',
    code: 'MTZ',
    name: 'Aeródromo de Montepuez',
    category: 'Aeródromo Regional',
    provinceId: '10',
    provinceName: 'Cabo Delgado',
    coordinates: [38.980, -13.125],
    elevationMeters: 510,
    runwayOrBerths: 'Pista 1.300 m',
    operator: 'ADM / Mineração',
    capacityOrTraffic: 'Mineração e comércio de pedras preciosas',
    description: 'Pista de apoio ao polo de mineração de rubis e agricultura do interior de Cabo Delgado.',
    highlights: ['Tráfego corporativo mineiro da Gemfields / Montepuez Ruby Mining'],
  },
  {
    id: 'aero_mueda',
    layer: 'aerodromes',
    code: 'MUD',
    name: 'Aeródromo de Mueda',
    category: 'Aeródromo Regional',
    provinceId: '10',
    provinceName: 'Cabo Delgado',
    coordinates: [39.560, -11.670],
    elevationMeters: 820,
    runwayOrBerths: 'Pista Asfaltada 1.500 m',
    operator: 'ADM / Defesa',
    capacityOrTraffic: 'Aviação regional e segurança',
    description: 'Pista histórica no Planalto dos Macondes, no norte de Cabo Delgado.',
    highlights: ['Hub aéreo logístico para o planalto setentrional de Cabo Delgado'],
  },
  {
    id: 'aero_mocimboa',
    layer: 'aerodromes',
    code: 'MZB',
    name: 'Aeródromo de Mocímboa da Praia',
    category: 'Aeródromo Regional',
    provinceId: '10',
    provinceName: 'Cabo Delgado',
    coordinates: [40.350, -11.350],
    elevationMeters: 25,
    runwayOrBerths: 'Pista Asfaltada 2.000 m',
    operator: 'ADM',
    capacityOrTraffic: 'Reabilitação / Logística portuária e humanitária',
    description: 'Pista asfaltada que serve a vila portuária de Mocímboa da Praia e o acesso a Palma.',
    highlights: ['Pista de 2.000 metros capaz de receber turboélices e jactos regionais'],
  },
  {
    id: 'aero_palma',
    layer: 'aerodromes',
    code: 'AFG',
    name: 'Aeródromo de Afungi / Palma',
    category: 'Aeródromo Regional',
    provinceId: '10',
    provinceName: 'Cabo Delgado',
    coordinates: [40.500, -10.850],
    elevationMeters: 30,
    runwayOrBerths: 'Pista Asfaltada de Alto Desempenho 2.300 m',
    operator: 'TotalEnergies / Parque de Gás Natural LNG',
    capacityOrTraffic: 'Aviação corporativa de projectos de LNG',
    description: 'Aeródromo construído propositadamente para o megaprojecto de gás natural liquefeito da Área 1 da Bacia do Rovuma.',
    highlights: ['Infraestrutura moderna concebida para jactos executivos e voos intercontinentais de pessoal de engenharia'],
  },
];

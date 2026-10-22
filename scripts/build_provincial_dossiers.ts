import fs from 'fs';
import { PROVINCES_DATA, OFFICIAL_SOURCES } from '../src/data/provincesData.ts';
import { TETE_PROVINCE_INDICATORS, TETE_TOURISM_HERITAGE, TETE_INFRASTRUCTURES, TETE_SOURCES } from '../src/data/teteData.ts';
import { IndicatorValue, TourismHeritageItem } from '../src/types/index.ts';

export interface ProvincialDossier {
  provinceId: string;
  name: string;
  officialName: string;
  capital: string;
  region: string;
  color: string;
  indicators: IndicatorValue[];
  tourismHeritage: TourismHeritageItem[];
  infrastructures: { name: string; category: string; description: string }[];
  sources: Record<string, string>;
}

const DOSSIERS: Record<string, ProvincialDossier> = {};

// 1. Tete Dossier (uses existing verified Tete data)
DOSSIERS['07'] = {
  provinceId: '07',
  name: 'Tete',
  officialName: 'Província de Tete',
  capital: 'Cidade de Tete',
  region: 'Centro',
  color: '#f97316',
  indicators: TETE_PROVINCE_INDICATORS,
  tourismHeritage: TETE_TOURISM_HERITAGE,
  infrastructures: TETE_INFRASTRUCTURES.map((inf) => ({
    name: inf.name,
    category: inf.type,
    description: inf.description,
  })),
  sources: TETE_SOURCES,
};

// 2. Generate detailed dossiers for all other provinces
Object.values(PROVINCES_DATA).forEach((prov) => {
  if (prov.id === '07') return;

  const sources = {
    demographics: 'INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)',
    cartography: 'MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0',
    tourism: 'Visit Mozambique (INATUR) & UNESCO Património Mundial e Imaterial',
    economy: 'Ministério da Economia e Finanças (MEF) & Banco de Moçambique',
    infrastructure: 'Administração Nacional de Estradas (ANE) & CFM',
  };

  const indicators: IndicatorValue[] = [
    {
      id: 'identificacao',
      label: 'Designação Oficial',
      value: prov.officialName,
      formattedValue: `${prov.officialName} (Código MAEFP: ${prov.id})`,
      source: sources.cartography,
      referenceYear: '2021',
      category: 'geografia',
      notes: `Unidade provincial autónoma na região ${prov.region} de Moçambique.`,
    },
    {
      id: 'capital',
      label: 'Capital Provincial',
      value: prov.capital,
      formattedValue: `${prov.capital} (Município)`,
      source: sources.cartography,
      referenceYear: '2021',
      category: 'geografia',
      notes: `Sede dos órgãos executivos e judiciais da Província de ${prov.name}.`,
    },
    {
      id: 'superficie',
      label: 'Superfície Territorial',
      value: prov.areaKm2,
      formattedValue: `${new Intl.NumberFormat('pt-MZ').format(prov.areaKm2)} km²`,
      unit: 'km²',
      source: sources.cartography,
      referenceYear: '2021',
      category: 'geografia',
      notes: `Território subdividido em ${prov.districtsCount} distritos oficiais MAEFP.`,
    },
    {
      id: 'populacao_censo_2017',
      label: 'População (Censo 2017)',
      value: prov.population2017,
      formattedValue: `${new Intl.NumberFormat('pt-MZ').format(prov.population2017)} habitantes`,
      unit: 'hab.',
      source: sources.demographics,
      referenceYear: '2017',
      category: 'demografia',
      notes: 'Dados definitivos apurados pelo IV Recenseamento Geral da População e Habitação do INE.',
    },
    {
      id: 'populacao_projecao_2024',
      label: 'População Estimada (2024)',
      value: prov.population2024,
      formattedValue: `${new Intl.NumberFormat('pt-MZ').format(prov.population2024)} habitantes`,
      unit: 'hab.',
      source: sources.demographics,
      referenceYear: '2024',
      category: 'demografia',
      notes: 'Projecção demográfica oficial elaborada pela Divisão de Estatísticas Demográficas do INE.',
    },
    {
      id: 'densidade_2024',
      label: 'Densidade Populacional (2024)',
      value: prov.density2024,
      formattedValue: `${prov.density2024.toFixed(1)} hab/km²`,
      unit: 'hab/km²',
      source: sources.demographics,
      referenceYear: '2024',
      category: 'demografia',
      notes: 'Calculada a partir da projecção 2024 e da área cartográfica oficial MAEFP.',
    },
    {
      id: 'recursos_estrategicos',
      label: 'Pilares Económicos',
      value: prov.economicProfile.primaryActivities.slice(0, 3).join(', '),
      formattedValue: prov.economicProfile.primaryActivities.join(' • '),
      source: sources.economy,
      referenceYear: '2023',
      category: 'economia',
      notes: prov.economicProfile.overview,
    },
    {
      id: 'ponto_culminante',
      label: 'Relevo Notável',
      value: prov.highestPoint?.name || 'Relevo costeiro',
      formattedValue: prov.highestPoint ? `${prov.highestPoint.name} (${prov.highestPoint.altitudeMeters} m)` : 'Relevo de baixa altitude',
      unit: 'm',
      source: sources.cartography,
      referenceYear: '2021',
      category: 'geografia',
      notes: 'Ponto culminante e de maior altitude no território provincial.',
    },
  ];

  // Tailored Tourism & Heritage
  const tourismHeritage: TourismHeritageItem[] = [];
  const infrastructures: { name: string; category: string; description: string }[] = [];

  if (prov.id === '01') { // Cidade de Maputo
    tourismHeritage.push(
      {
        id: 'estacao_cfm',
        title: 'Estação Central dos Caminhos de Ferro (CFM)',
        category: 'Património Histórico & Arquitectónico',
        location: 'Praça dos Trabalhadores, Maputo',
        description: 'Considerada uma das mais belas estações ferroviárias do mundo, com cúpula de cobre desenhada por associados de Gustave Eiffel (1910).',
        source: 'INATUR',
      },
      {
        id: 'fortaleza_maputo',
        title: 'Fortaleza de Nossa Senhora da Conceição',
        category: 'Património Histórico & Arquitectónico',
        location: 'Baixa de Maputo',
        description: 'Construída em 1787, guarda os restos mortais do guerreiro e imperador Ngungunhane e canhões históricos da época dos descobrimentos.',
        source: 'INATUR',
      },
      {
        id: 'ilha_inhaca',
        title: 'Ilha e Reserva Marinha da Inhaca',
        category: 'Património Natural',
        location: 'Baía de Maputo (KaNyaka)',
        description: 'Santuário ecológico de recifes de coral intactos, tartarugas marinhas e estação de biologia marítima da Universidade Eduardo Mondlane.',
        source: 'INATUR',
      }
    );
    infrastructures.push(
      { name: 'Ponte Maputo-KaTembe', category: 'Rodoviária', description: 'Maior ponte suspensa de África (3.041 m de comprimento total e vão de 680 m).' },
      { name: 'Porto de Maputo', category: 'Portuária', description: 'Porto de águas profundas de referência regional e ligação à África do Sul.' },
      { name: 'Aeroporto Internacional de Mavalane', category: 'Aeroportuária', description: 'Principal hub aéreo internacional de Moçambique.' }
    );
  } else if (prov.id === '02') { // Maputo Província
    tourismHeritage.push(
      {
        id: 'parque_maputo',
        title: 'Parque Nacional de Maputo',
        category: 'Património Natural',
        location: 'Matutuíne',
        description: 'Paisagem protegida de savanas litorais, lagoas costeiras, centenas de elefantes africanos e praias deslumbrantes onde desovam tartarugas marinhas.',
        source: 'ANAC / INATUR',
      },
      {
        id: 'ponta_do_ouro',
        title: 'Praia da Ponta do Ouro',
        category: 'Património Natural',
        location: 'Matutuíne, Fronteira África do Sul',
        description: 'Pólo balnear de renome internacional para mergulho com golfinhos, tubarões e prática de surf.',
        source: 'INATUR',
      },
      {
        id: 'gwaza_muthini',
        title: 'Cerimónia Tradicional Gwaza Muthini',
        category: 'Património Cultural Imaterial',
        location: 'Marracuene',
        description: 'Evocação anual da histórica resistência do povo Ronga contra as forças coloniais em 1895, com danças guerreiras e prova do fruto Canhu.',
        source: 'Ministério da Cultura',
      }
    );
    infrastructures.push(
      { name: 'Auto-estrada N4 e Porto da Matola', category: 'Logística', description: 'Corredor Trans-Kalahari / Maputo e terminais minerais da Matola.' },
      { name: 'Fundição de Alumínio MOZAL', category: 'Industrial', description: 'Maior empreendimento industrial do país no Parque de Beluluane.' },
      { name: 'Barragem dos Pequenos Libombos', category: 'Hídrica', description: 'Abastecimento de água à região metropolitana de Maputo e Matola.' }
    );
  } else if (prov.id === '03') { // Gaza
    tourismHeritage.push(
      {
        id: 'lagoa_bilene',
        title: 'Praia do Bilene e Lagoa Uembje',
        category: 'Património Natural',
        location: 'Bilene',
        description: 'Lagoa de água salgada de 27 km de extensão, de águas calmas e translúcidas, ideal para desportos aquáticos e repouso.',
        source: 'INATUR',
      },
      {
        id: 'parque_limpopo',
        title: 'Parque Nacional do Limpopo',
        category: 'Património Natural',
        location: 'Massingir / Chicualacuala',
        description: 'Integrado no Parque Transfronteiriço do Grande Limpopo com o Kruger Park (África do Sul) e Gonarezhou (Zimbabué), com rica mega-fauna.',
        source: 'ANAC',
      },
      {
        id: 'chaimite',
        title: 'Monumento Histórico de Chaimite',
        category: 'Património Histórico & Arquitectónico',
        location: 'Mandlakazi',
        description: 'Antiga capital sagrada do Império de Gaza e local histórico da captura de Ngungunhane pelas forças portuguesas.',
        source: 'Ministério da Cultura',
      }
    );
    infrastructures.push(
      { name: 'Aeroporto Filipe Jacinto Nyusi (Chongoene)', category: 'Aeroportuária', description: 'Novo aeroporto internacional da província de Gaza.' },
      { name: 'Perímetro Irrigado do Chókwè', category: 'Agrícola', description: 'Maior sistema de regadio agrícola do país na bacia do Limpopo.' },
      { name: 'Mina de Areias Pesadas de Chibuto (Dingsheng)', category: 'Mineira', description: 'Grande exploração de ilmenite, rútilo e zircão.' }
    );
  } else if (prov.id === '04') { // Inhambane
    tourismHeritage.push(
      {
        id: 'timbila_chopi',
        title: 'Timbila Chopi (Património Mundial Imaterial)',
        category: 'Património Cultural Imaterial',
        location: 'Zavala / Quissico',
        description: 'Orquestras tradicionais de xilofones artesanais de madeira de M’bila, reconhecidas pela UNESCO como Obra-Prima do Património Oral e Imaterial da Humanidade.',
        source: 'UNESCO / INATUR',
      },
      {
        id: 'arquipelago_bazaruto',
        title: 'Parque Nacional do Arquipélago de Bazaruto',
        category: 'Património Natural',
        location: 'Vilankulo / Inhassoro',
        description: 'Cinco ilhas paradisíacas com recifes de coral imaculados, dunas gigantescas e o último santuário do Dugongo no Oceano Índico Ocidental.',
        source: 'ANAC / INATUR',
      },
      {
        id: 'praia_tofo',
        title: 'Praia do Tofo e Baía de Inhambane',
        category: 'Património Natural',
        location: 'Inhambane',
        description: 'Meca mundial para observação durante todo o ano de raias-manta gigantes, tubarões-baleia e migração de baleias-de-bossas.',
        source: 'INATUR',
      }
    );
    infrastructures.push(
      { name: 'Central e Gasoduto de Temane (SASOL)', category: 'Energia', description: 'Exploração de gás natural de Pande/Temane para Moçambique e África do Sul.' },
      { name: 'Aeroporto Internacional de Vilankulo', category: 'Aeroportuária', description: 'Porta de entrada turística com voos directos internacionais.' },
      { name: 'Porto Histórico de Inhambane', category: 'Portuária', description: 'Navegação de dhows tradicionais na Baía de Inhambane.' }
    );
  } else if (prov.id === '05') { // Sofala
    tourismHeritage.push(
      {
        id: 'gorongosa',
        title: 'Parque Nacional da Gorongosa',
        category: 'Património Natural',
        location: 'Gorongosa / Muanza',
        description: 'Exemplo mundial de restauração ecológica e conservação da biodiversidade, acolhendo leões, elefantes, mabecos e a luxuriante Serra da Gorongosa.',
        source: 'Gorongosa Restoration Project / ANAC',
      },
      {
        id: 'reserva_marromeu',
        title: 'Reserva Especial de Marromeu (Delta do Zambeze)',
        category: 'Património Natural',
        location: 'Marromeu',
        description: 'Sítio RAMSAR de importância internacional com uma das maiores densidades de búfalos africanos e centenas de espécies de aves aquáticas.',
        source: 'ANAC',
      },
      {
        id: 'farol_macuti',
        title: 'Farol do Macúti e Praias da Beira',
        category: 'Património Histórico & Arquitectónico',
        location: 'Cidade da Beira',
        description: 'Histórico farol em faixas vermelhas e brancas construído em 1904 sobre a costa do Índico na foz do Rio Púnguè.',
        source: 'INATUR',
      }
    );
    infrastructures.push(
      { name: 'Porto da Beira e Corredor da Beira', category: 'Logística', description: 'Porto comercial vital para o Zimbabué, Zâmbia e Malawi com ferrovia e oleoduto.' },
      { name: 'Ponte Armando Guebuza sobre o Zambeze', category: 'Rodoviária', description: 'Ponte de 2.376 m em Caia ligando o Norte e o Sul do país pela N1.' },
      { name: 'Açucareiras de Marromeu e Búzi', category: 'Agro-indústria', description: 'Grandes complexos agro-industriais de açúcar de cana.' }
    );
  } else if (prov.id === '06') { // Manica
    tourismHeritage.push(
      {
        id: 'monte_binga',
        title: 'Monte Binga (Ponto Mais Alto de Moçambique)',
        category: 'Património Natural',
        location: 'Sussundenga (2.436 m)',
        description: 'O cume mais elevado de Moçambique, coroando a cordilheira de Chimanimani na fronteira com o Zimbabué.',
        source: 'INATUR',
      },
      {
        id: 'parque_chimanimani',
        title: 'Parque Nacional de Chimanimani',
        category: 'Património Natural',
        location: 'Sussundenga',
        description: 'Maciço montanhoso de quartzito com plantas endémicas raras, florestas de altitude, cascatas pristinas e pinturas rupestres san antigas.',
        source: 'ANAC',
      },
      {
        id: 'cabeca_velho',
        title: 'Cabeça do Velho (Maciço Antropomórfico)',
        category: 'Património Histórico & Arquitectónico',
        location: 'Cidade de Chimoio',
        description: 'Formação rochosa natural impressionante com o perfil exato de um rosto humano envelhecido, símbolo da cidade de Chimoio.',
        source: 'INATUR',
      }
    );
    infrastructures.push(
      { name: 'Corredor Rodoviário N6 (Machipanda)', category: 'Rodoviária', description: 'Ligação moderna da Beira ao Zimbabué via Chimoio e Manica.' },
      { name: 'Barragem de Chicamba Real', category: 'Hidroelétrica', description: 'Central hidroelétrica no Rio Revué alimentando a rede do Centro.' },
      { name: 'Grandes Empreendimentos Hortícolas de Vanduzi', category: 'Agro-negócio', description: 'Exportação de hortícolas de valor acrescentado para a Europa.' }
    );
  } else if (prov.id === '08') { // Zambézia
    tourismHeritage.push(
      {
        id: 'cha_gurue',
        title: 'Plantações Históricas de Chá de Guruè & Monte Namúli',
        category: 'Património Natural',
        location: 'Guruè (2.419 m)',
        description: 'Vastas plantações de chá esmeralda em socalcos sob a imponente sombra do Monte Namúli, o 2º cume mais alto do país e montanha sagrada.',
        source: 'INATUR',
      },
      {
        id: 'praia_zalala',
        title: 'Praia de Zalala',
        category: 'Património Natural',
        location: 'Quelimane',
        description: 'Extensa praia oceânica de areias prateadas orlada por coqueirais ondulantes e povoada por pescadores tradicionais.',
        source: 'INATUR',
      },
      {
        id: 'parque_gile',
        title: 'Parque Nacional de Gilé',
        category: 'Património Natural',
        location: 'Gilé / Pebane',
        description: 'Maior bloco preservado de floresta de Miombo costeiro em Moçambique, lar de rinocerontes negros reintroduzidos e elefantes.',
        source: 'ANAC',
      }
    );
    infrastructures.push(
      { name: 'Ponte de Macuse e Corredor Logístico', category: 'Logística', description: 'Projecto ferroviário e portuário de ligação às minas do interior.' },
      { name: 'Porto Fluvial de Quelimane', category: 'Portuária', description: 'Porto histórico nas margens do Rio dos Bons Sinais.' },
      { name: 'Bacia Hidrográfica do Rio Licungo', category: 'Agrícola', description: 'Principal vale irrigado de produção de arroz da Zambézia.' }
    );
  } else if (prov.id === '09') { // Nampula
    tourismHeritage.push(
      {
        id: 'ilha_mocambique',
        title: 'Ilha de Moçambique (Património Mundial da UNESCO)',
        category: 'Património Histórico & Arquitectónico',
        location: 'Ilha de Moçambique',
        description: 'Classificada pela UNESCO desde 1991, foi a primeira capital de Moçambique. Destacam-se a Fortaleza de São Sebastião, o Palácio de São Paulo e a Capela do Baluarte.',
        source: 'UNESCO / INATUR',
      },
      {
        id: 'baia_nacala',
        title: 'Baía e Porto de Águas Profundas de Nacala',
        category: 'Património Natural',
        location: 'Nacala',
        description: 'Excecional baía natural com recifes de coral abissais, águas calmas e praias paradisíacas como Fernão Veloso.',
        source: 'INATUR',
      },
      {
        id: 'musica_tufi',
        title: 'Dança Tradicional Tufo',
        category: 'Património Cultural Imaterial',
        location: 'Costa de Nampula e Ilha de Moçambique',
        description: 'Dança tradicional das mulheres Macuas, caracterizada pelo uso de capulanas garridas idênticas, rosto pintado com pó de Musiro e ritmo cadenciado.',
        source: 'Ministério da Cultura',
      }
    );
    infrastructures.push(
      { name: 'Corredor Integrado de Nacala (CFM Norte)', category: 'Ferroviária', description: 'Linha férrea de 912 km ligando as minas de Moatize e o Malawi ao mar.' },
      { name: 'Porto de Nacala', category: 'Portuária', description: 'Porto natural de águas profundas (até 21 m de calado) sem necessidade de dragagem.' },
      { name: 'Mina de Areias Pesadas de Moma (Kenmare)', category: 'Mineira', description: 'Uma das maiores produtoras mundiais de titânio (ilmenite e rútilo).' }
    );
  } else if (prov.id === '10') { // Cabo Delgado
    tourismHeritage.push(
      {
        id: 'ilhas_quirimbas',
        title: 'Arquipélago das Quirimbas e Ilha do Ibo',
        category: 'Património Natural',
        location: 'Ibo / Quissanga',
        description: 'Conjunto de 32 ilhas coralinas no Oceano Índico. A Ilha do Ibo conserva solares centenários, fortes coloniais e ourivesaria tradicional em filigrana de prata.',
        source: 'UNESCO / INATUR',
      },
      {
        id: 'baia_pemba',
        title: 'Baía de Pemba e Praia de Wimbi',
        category: 'Património Natural',
        location: 'Pemba',
        description: 'Terceira maior baía natural do planeta, famosa pela Praia de Wimbi com areias brancas finas e recifes de coral a poucos metros da costa.',
        source: 'INATUR',
      },
      {
        id: 'escultura_maconde',
        title: 'Arte e Escultura em Pau-Preto Maconde (Mapiko)',
        category: 'Património Cultural Imaterial',
        location: 'Planalto de Mueda',
        description: 'Tradição secular de entalhe em ébano/pau-preto (Djetimó e Shetani) e dança tradicional de máscaras Mapiko, reconhecida pela UNESCO.',
        source: 'UNESCO / Ministério da Cultura',
      }
    );
    infrastructures.push(
      { name: 'Complexo de Gás Natural Liquefeito de Palma (Rovuma LNG)', category: 'Energia', description: 'Mega-reservas de gás offshore nos blocos Área 1 e Área 4 (Coral Sul FLNG).' },
      { name: 'Mina de Rubis de Montepuez (MRM)', category: 'Mineira', description: 'Maior jazida e operação de mineração de rubis de qualidade gema do mundo.' },
      { name: 'Mina de Grafite de Balama (Syrah Resources)', category: 'Mineira', description: 'Maior produtora global de grafite de alta pureza para baterias de veículos elétricos.' }
    );
  } else if (prov.id === '11') { // Niassa
    tourismHeritage.push(
      {
        id: 'reserva_niassa',
        title: 'Reserva Especial do Niassa (Maior Área Protegida de Moçambique)',
        category: 'Património Natural',
        location: 'Mecula / Mavago (42.000 km²)',
        description: 'A maior reserva natural do país e uma das maiores florestas protegidas de Miombo de África, refúgio de 12.000 elefantes, leões e centenas de mabecos.',
        source: 'ANAC',
      },
      {
        id: 'lago_niassa',
        title: 'Lago Niassa (Lago Malawi)',
        category: 'Património Natural',
        location: 'Lago (Metangula / Cobué)',
        description: 'O 3º maior lago africano, célebre pela transparência extraordinária das suas águas e por albergar mais de 1.000 espécies de ciclídeos endémicos.',
        source: 'INATUR',
      },
      {
        id: 'inselbergs_marrupa',
        title: 'Inselbergs e Montanhas Sagradas do Niassa',
        category: 'Património Natural',
        location: 'Marrupa / Mecula',
        description: 'Gigantescos monólitos graníticos que emergem dramaticamente da savana arbórea, locais de rituais tradicionais dos chefes comunitários.',
        source: 'INATUR',
      }
    );
    infrastructures.push(
      { name: 'Linha Férrea Cuamba-Lichinga', category: 'Ferroviária', description: 'Ramal ferroviário que liga a capital do Niassa ao Corredor de Nacala.' },
      { name: 'Aeroporto de Lichinga', category: 'Aeroportuária', description: 'Aeroporto do planalto com voos regulares comerciais.' },
      { name: 'Grandes Florestas Plantadas de Pinho e Eucalipto', category: 'Silvicultura', description: 'Pólo silvícola e industrial de transformação de madeira em Lichinga e Sanga.' }
    );
  }

  DOSSIERS[prov.id] = {
    provinceId: prov.id,
    name: prov.name,
    officialName: prov.officialName,
    capital: prov.capital,
    region: prov.region,
    color: prov.color,
    indicators,
    tourismHeritage,
    infrastructures,
    sources,
  };
});

fs.writeFileSync(
  'src/data/provincialDossiersData.ts',
  `import { IndicatorValue, TourismHeritageItem } from '../types/index.ts';

export interface ProvincialDossier {
  provinceId: string;
  name: string;
  officialName: string;
  capital: string;
  region: string;
  color: string;
  indicators: IndicatorValue[];
  tourismHeritage: TourismHeritageItem[];
  infrastructures: { name: string; category: string; description: string }[];
  sources: Record<string, string>;
}

export const PROVINCIAL_DOSSIERS: Record<string, ProvincialDossier> = ${JSON.stringify(
    DOSSIERS,
    null,
    2
  )};
`
);

console.log('Successfully wrote src/data/provincialDossiersData.ts for all', Object.keys(DOSSIERS).length, 'provinces!');

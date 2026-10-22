import { IndicatorValue, TourismHeritageItem } from '../types/index.ts';

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

export const PROVINCIAL_DOSSIERS: Record<string, ProvincialDossier> = {
  "10": {
    "provinceId": "10",
    "name": "Cabo Delgado",
    "officialName": "Província de Cabo Delgado",
    "capital": "Pemba",
    "region": "Norte",
    "color": "#0891b2",
    "indicators": [
      {
        "id": "identificacao",
        "label": "Designação Oficial",
        "value": "Província de Cabo Delgado",
        "formattedValue": "Província de Cabo Delgado (Código MAEFP: 10)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Unidade provincial autónoma na região Norte de Moçambique."
      },
      {
        "id": "capital",
        "label": "Capital Provincial",
        "value": "Pemba",
        "formattedValue": "Pemba (Município)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Sede dos órgãos executivos e judiciais da Província de Cabo Delgado."
      },
      {
        "id": "superficie",
        "label": "Superfície Territorial",
        "value": 82625,
        "formattedValue": "82 625 km²",
        "unit": "km²",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Território subdividido em 17 distritos oficiais MAEFP."
      },
      {
        "id": "populacao_censo_2017",
        "label": "População (Censo 2017)",
        "value": 2333278,
        "formattedValue": "2 333 278 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2017",
        "category": "demografia",
        "notes": "Dados definitivos apurados pelo IV Recenseamento Geral da População e Habitação do INE."
      },
      {
        "id": "populacao_projecao_2024",
        "label": "População Estimada (2024)",
        "value": 2645000,
        "formattedValue": "2 645 000 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Projecção demográfica oficial elaborada pela Divisão de Estatísticas Demográficas do INE."
      },
      {
        "id": "densidade_2024",
        "label": "Densidade Populacional (2024)",
        "value": 32,
        "formattedValue": "32.0 hab/km²",
        "unit": "hab/km²",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Calculada a partir da projecção 2024 e da área cartográfica oficial MAEFP."
      },
      {
        "id": "recursos_estrategicos",
        "label": "Pilares Económicos",
        "value": "Gás Natural Liquefeito (GNL), Mineração de Rubis e Grafite, Pesca e Turismo Marinho",
        "formattedValue": "Gás Natural Liquefeito (GNL) • Mineração de Rubis e Grafite • Pesca e Turismo Marinho • Algodão e Castanha de Caju",
        "source": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
        "referenceYear": "2023",
        "category": "economia",
        "notes": "Província setentrional que faz fronteira com a Tanzânia pelo Rio Rovuma. Possui o Arquipélago das Quirimbas com rica vida coralífera e está no centro da transformação energética global com os megaprojectos de Gás Natural."
      },
      {
        "id": "ponto_culminante",
        "label": "Relevo Notável",
        "value": "Planalto de Mueda",
        "formattedValue": "Planalto de Mueda (980 m)",
        "unit": "m",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Ponto culminante e de maior altitude no território provincial."
      }
    ],
    "tourismHeritage": [
      {
        "id": "ilhas_quirimbas",
        "title": "Arquipélago das Quirimbas e Ilha do Ibo",
        "category": "Património Natural",
        "location": "Ibo / Quissanga",
        "description": "Conjunto de 32 ilhas coralinas no Oceano Índico. A Ilha do Ibo conserva solares centenários, fortes coloniais e ourivesaria tradicional em filigrana de prata.",
        "source": "UNESCO / INATUR"
      },
      {
        "id": "baia_pemba",
        "title": "Baía de Pemba e Praia de Wimbi",
        "category": "Património Natural",
        "location": "Pemba",
        "description": "Terceira maior baía natural do planeta, famosa pela Praia de Wimbi com areias brancas finas e recifes de coral a poucos metros da costa.",
        "source": "INATUR"
      },
      {
        "id": "escultura_maconde",
        "title": "Arte e Escultura em Pau-Preto Maconde (Mapiko)",
        "category": "Património Cultural Imaterial",
        "location": "Planalto de Mueda",
        "description": "Tradição secular de entalhe em ébano/pau-preto (Djetimó e Shetani) e dança tradicional de máscaras Mapiko, reconhecida pela UNESCO.",
        "source": "UNESCO / Ministério da Cultura"
      }
    ],
    "infrastructures": [
      {
        "name": "Complexo de Gás Natural Liquefeito de Palma (Rovuma LNG)",
        "category": "Energia",
        "description": "Mega-reservas de gás offshore nos blocos Área 1 e Área 4 (Coral Sul FLNG)."
      },
      {
        "name": "Mina de Rubis de Montepuez (MRM)",
        "category": "Mineira",
        "description": "Maior jazida e operação de mineração de rubis de qualidade gema do mundo."
      },
      {
        "name": "Mina de Grafite de Balama (Syrah Resources)",
        "category": "Mineira",
        "description": "Maior produtora global de grafite de alta pureza para baterias de veículos elétricos."
      }
    ],
    "sources": {
      "demographics": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
      "cartography": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
      "tourism": "Visit Mozambique (INATUR) & UNESCO Património Mundial e Imaterial",
      "economy": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
      "infrastructure": "Administração Nacional de Estradas (ANE) & CFM"
    }
  },
  "11": {
    "provinceId": "11",
    "name": "Niassa",
    "officialName": "Província do Niassa",
    "capital": "Lichinga",
    "region": "Norte",
    "color": "#4f46e5",
    "indicators": [
      {
        "id": "identificacao",
        "label": "Designação Oficial",
        "value": "Província do Niassa",
        "formattedValue": "Província do Niassa (Código MAEFP: 11)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Unidade provincial autónoma na região Norte de Moçambique."
      },
      {
        "id": "capital",
        "label": "Capital Provincial",
        "value": "Lichinga",
        "formattedValue": "Lichinga (Município)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Sede dos órgãos executivos e judiciais da Província de Niassa."
      },
      {
        "id": "superficie",
        "label": "Superfície Territorial",
        "value": 129056,
        "formattedValue": "129 056 km²",
        "unit": "km²",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Território subdividido em 16 distritos oficiais MAEFP."
      },
      {
        "id": "populacao_censo_2017",
        "label": "População (Censo 2017)",
        "value": 1865976,
        "formattedValue": "1 865 976 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2017",
        "category": "demografia",
        "notes": "Dados definitivos apurados pelo IV Recenseamento Geral da População e Habitação do INE."
      },
      {
        "id": "populacao_projecao_2024",
        "label": "População Estimada (2024)",
        "value": 2180000,
        "formattedValue": "2 180 000 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Projecção demográfica oficial elaborada pela Divisão de Estatísticas Demográficas do INE."
      },
      {
        "id": "densidade_2024",
        "label": "Densidade Populacional (2024)",
        "value": 16.9,
        "formattedValue": "16.9 hab/km²",
        "unit": "hab/km²",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Calculada a partir da projecção 2024 e da área cartográfica oficial MAEFP."
      },
      {
        "id": "recursos_estrategicos",
        "label": "Pilares Económicos",
        "value": "Silvicultura e Reflorestamento, Agricultura de Cereais e Leguminosas, Conservação de Fauna Bravia",
        "formattedValue": "Silvicultura e Reflorestamento • Agricultura de Cereais e Leguminosas • Conservação de Fauna Bravia • Pesca de Água Doce",
        "source": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
        "referenceYear": "2023",
        "category": "economia",
        "notes": "A mais vasta província de Moçambique em extensão territorial (129.056 km²), com a menor densidade demográfica (16,9 hab/km²). Alberga o majestoso Lago Niassa e a Reserva Especial do Niassa, um dos últimos grandes santuários de elefantes e cães-selvagens em África."
      },
      {
        "id": "ponto_culminante",
        "label": "Relevo Notável",
        "value": "Maciço de Jeci (Lago Niassa)",
        "formattedValue": "Maciço de Jeci (Lago Niassa) (1836 m)",
        "unit": "m",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Ponto culminante e de maior altitude no território provincial."
      }
    ],
    "tourismHeritage": [
      {
        "id": "reserva_niassa",
        "title": "Reserva Especial do Niassa (Maior Área Protegida de Moçambique)",
        "category": "Património Natural",
        "location": "Mecula / Mavago (42.000 km²)",
        "description": "A maior reserva natural do país e uma das maiores florestas protegidas de Miombo de África, refúgio de 12.000 elefantes, leões e centenas de mabecos.",
        "source": "ANAC"
      },
      {
        "id": "lago_niassa",
        "title": "Lago Niassa (Lago Malawi)",
        "category": "Património Natural",
        "location": "Lago (Metangula / Cobué)",
        "description": "O 3º maior lago africano, célebre pela transparência extraordinária das suas águas e por albergar mais de 1.000 espécies de ciclídeos endémicos.",
        "source": "INATUR"
      },
      {
        "id": "inselbergs_marrupa",
        "title": "Inselbergs e Montanhas Sagradas do Niassa",
        "category": "Património Natural",
        "location": "Marrupa / Mecula",
        "description": "Gigantescos monólitos graníticos que emergem dramaticamente da savana arbórea, locais de rituais tradicionais dos chefes comunitários.",
        "source": "INATUR"
      }
    ],
    "infrastructures": [
      {
        "name": "Linha Férrea Cuamba-Lichinga",
        "category": "Ferroviária",
        "description": "Ramal ferroviário que liga a capital do Niassa ao Corredor de Nacala."
      },
      {
        "name": "Aeroporto de Lichinga",
        "category": "Aeroportuária",
        "description": "Aeroporto do planalto com voos regulares comerciais."
      },
      {
        "name": "Grandes Florestas Plantadas de Pinho e Eucalipto",
        "category": "Silvicultura",
        "description": "Pólo silvícola e industrial de transformação de madeira em Lichinga e Sanga."
      }
    ],
    "sources": {
      "demographics": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
      "cartography": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
      "tourism": "Visit Mozambique (INATUR) & UNESCO Património Mundial e Imaterial",
      "economy": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
      "infrastructure": "Administração Nacional de Estradas (ANE) & CFM"
    }
  },
  "07": {
    "provinceId": "07",
    "name": "Tete",
    "officialName": "Província de Tete",
    "capital": "Cidade de Tete",
    "region": "Centro",
    "color": "#f97316",
    "indicators": [
      {
        "id": "identificacao",
        "label": "Designação Oficial",
        "value": "Província de Tete",
        "formattedValue": "Província de Tete (Código MAEFP: 07)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 (Distritos) e Layer 0 (Províncias)",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Unidade provincial autónoma localizada na região Centro-Oeste de Moçambique."
      },
      {
        "id": "capital",
        "label": "Capital Provincial",
        "value": "Cidade de Tete",
        "formattedValue": "Cidade de Tete (Município)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 (Distritos) e Layer 0 (Províncias)",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Situada na margem direita do Rio Zambeze, sede dos órgãos provinciais de governação."
      },
      {
        "id": "superficie",
        "label": "Superfície Territorial",
        "value": 100724,
        "formattedValue": "100.724 km²",
        "unit": "km²",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 (Distritos) e Layer 0 (Províncias)",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Quarta maior província do país em extensão territorial, ocupando 12,6% do território moçambicano."
      },
      {
        "id": "populacao_censo_2017",
        "label": "População (Censo 2017)",
        "value": 2764169,
        "formattedValue": "2.764.169 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - IV Recenseamento Geral da População e Habitação (Censo 2017) e Projecções Demográficas 2017-2050 (INE 2020/2024)",
        "referenceYear": "2017",
        "category": "demografia",
        "notes": "Resultados definitivos do IV RGPH 2017 apurados pelo INE."
      },
      {
        "id": "populacao_projecao_2024",
        "label": "População Estimada (2024)",
        "value": 3210000,
        "formattedValue": "3.210.000 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - IV Recenseamento Geral da População e Habitação (Censo 2017) e Projecções Demográficas 2017-2050 (INE 2020/2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Projeção oficial de crescimento populacional elaborada pelo INE Moçambique."
      },
      {
        "id": "densidade_2024",
        "label": "Densidade Populacional (2024)",
        "value": 31.9,
        "formattedValue": "31,9 hab/km²",
        "unit": "hab/km²",
        "source": "INE Moçambique - IV Recenseamento Geral da População e Habitação (Censo 2017) e Projecções Demográficas 2017-2050 (INE 2020/2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Cálculo de habitantes por quilómetro quadrado baseado na projeção demográfica 2024."
      },
      {
        "id": "divisao_distritos",
        "label": "Divisão Administrativa Oficial",
        "value": 15,
        "formattedValue": "15 distritos oficiais (14 unidades cartográficas MOZGIS)",
        "unit": "distritos",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 (Distritos) e Layer 0 (Províncias)",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Os 15 distritos oficiais do MAEFP são: Angónia, Cahora Bassa, Changara, Chifunde, Chiúta, Dôa, Macanga, Magoé, Marara, Marávia, Moatize, Mutarara, Cidade de Tete, Tsangano e Zumbo. Na base cartográfica MOZGIS Layer 2, o distrito de Marara encontra-se integrado na delimitação contígua de Changara."
      },
      {
        "id": "hidroeletrica_hcb",
        "label": "Geração Hidroelétrica (HCB)",
        "value": 2075,
        "formattedValue": "2.075 MW de capacidade instalada",
        "unit": "MW",
        "source": "Ministério da Economia e Finanças (MEF) & Relatórios Anuais HCB / Vulcan Mozambique",
        "referenceYear": "2023",
        "category": "economia",
        "notes": "Barragem de Cahora Bassa, uma das maiores centrais hidroelétricas de África e o principal gerador para o Sistema Interligado Nacional e para a SADC (África do Sul e Zimbabué)."
      },
      {
        "id": "bacia_carbonifera",
        "label": "Recurso Mineral Estratégico",
        "value": "Carvão Mineral de Moatize",
        "formattedValue": "Carvão Metalúrgico (Coque) e Térmico",
        "source": "Ministério da Economia e Finanças (MEF) & Relatórios Anuais HCB / Vulcan Mozambique",
        "referenceYear": "2023",
        "category": "economia",
        "notes": "Moatize concentra a maior bacia carbonífera de Moçambique, explorada por mineração a céu aberto com exportação pelos portos da Beira e Nacala."
      },
      {
        "id": "agricultura_planalto",
        "label": "Agricultura de Altitude",
        "value": "Batata-reno, Milho, Feijão, Soja e Tabaco",
        "formattedValue": "Celeiro do Planalto de Angónia e Tsangano",
        "source": "Ministério da Economia e Finanças (MEF) & Relatórios Anuais HCB / Vulcan Mozambique",
        "referenceYear": "2022",
        "category": "economia",
        "notes": "Solos férteis derivados de rochas basálticas e altitude superior a 1.200 m permitem duas a três colheitas anuais."
      },
      {
        "id": "pecuaria_tradicional",
        "label": "Pecuária Tradicional Famosa",
        "value": "Caprinocultura (Cabrito de Tete)",
        "formattedValue": "Mais de 650.000 cabeças de gado caprino",
        "source": "Ministério da Economia e Finanças (MEF) & Relatórios Anuais HCB / Vulcan Mozambique",
        "referenceYear": "2022",
        "category": "economia",
        "notes": "O \"Cabrito de Tete\" é nacionalmente reputado pela sua carne macia e sabor decorrente da vegetação autóctone do vale do Zambeze."
      },
      {
        "id": "rio_zambeze",
        "label": "Eixo Hidrográfico Principal",
        "value": "Rio Zambeze",
        "formattedValue": "Rio Zambeze e Albufeira de Cahora Bassa (~2.700 km² de espelho d'água)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 (Distritos) e Layer 0 (Províncias)",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "O 4º maior rio de África corta transversalmente a província de oeste para sudeste."
      }
    ],
    "tourismHeritage": [
      {
        "id": "cahora_bassa_albufeira",
        "title": "Albufeira e Gargantas de Cahora Bassa",
        "category": "Património Natural",
        "location": "Distritos de Cahora Bassa e Magoé",
        "description": "Um dos maiores lagos artificiais de África, com 2.700 km² de espelho d'água encaixado entre desfiladeiros de rocha basáltica. Famoso destino para pesca desportiva internacional do Peixe-Tigre (Hydrocynus vittatus), passeios náuticos e observação de aves.",
        "source": "Visit Mozambique (INATUR - Instituto Nacional do Turismo) & UNESCO Património Imaterial",
        "yearReference": "2023"
      },
      {
        "id": "parque_nacional_magoe",
        "title": "Parque Nacional de Mágoè",
        "category": "Património Natural",
        "location": "Distrito de Magoé (Margem Sul de Cahora Bassa)",
        "description": "Área de conservação oficial criada pelo Governo de Moçambique em 2013, cobrindo 3.558 km². Alberga populações viáveis de elefantes, hipopótamos, crocodilos do Nilo, leões, leopardos e diversas espécies de antílopes no ecossistema de savana do Zambeze.",
        "source": "Visit Mozambique (INATUR - Instituto Nacional do Turismo) & UNESCO Património Imaterial",
        "yearReference": "2023"
      },
      {
        "id": "forte_sao_tiago_maior",
        "title": "Forte de São Tiago Maior de Tete",
        "category": "Património Histórico & Arquitectónico",
        "location": "Cidade de Tete (Margem do Rio Zambeze)",
        "description": "Fortificação histórica do século XVI, erigida pelos navegadores e comerciantes portugueses como entreposto militar e comercial na rota do ouro dos reinos de Monomotapa.",
        "source": "Visit Mozambique (INATUR - Instituto Nacional do Turismo) & UNESCO Património Imaterial",
        "yearReference": "2022"
      },
      {
        "id": "missao_sao_jose_boroma",
        "title": "Missão Jesuíta de São José de Boroma",
        "category": "Património Histórico & Arquitectónico",
        "location": "Distrito de Marara / Vale do Zambeze",
        "description": "Imponente complexo arquitetónico religioso em tijolo e cantaria construído pela Companhia de Jesus no século XIX, que funcionou como centro de ensino profissional, tradução de línguas nativas e agricultura experimental.",
        "source": "Visit Mozambique (INATUR - Instituto Nacional do Turismo) & UNESCO Património Imaterial",
        "yearReference": "2022"
      },
      {
        "id": "gule_wamkulu_nyau",
        "title": "Dança Ritual Gule Wamkulu (Sociedade Secreta Nyau)",
        "category": "Património Cultural Imaterial",
        "location": "Distritos de Angónia, Macanga, Tsangano e Zumbo",
        "description": "Classificada pela UNESCO como Obra-Prima do Património Oral e Imaterial da Humanidade. Ritual de dança de máscaras e trajes rituais que representam espíritos de ancestrais e animais sagrados, transmitido ancestralmente entre os povos Chewa.",
        "source": "UNESCO & Ministério da Cultura e Turismo",
        "yearReference": "2008 / 2023"
      },
      {
        "id": "cabrito_de_tete",
        "title": "Tradição Gastronómica: O Cabrito de Tete",
        "category": "Gastronomia",
        "location": "Cidade de Tete, Changara e toda a província",
        "description": "Reconhecido em todo o território nacional como uma das iguarias culinárias mais distintas de Moçambique. O gado caprino criado solto entre a vegetação de acácias e arbustos do vale confere à carne uma maciez e sabor inconfundíveis, tradicionalmente servido grelhado na brasa com Nsima e piripiri.",
        "source": "Visit Mozambique (INATUR - Instituto Nacional do Turismo) & UNESCO Património Imaterial",
        "yearReference": "2023"
      }
    ],
    "infrastructures": [
      {
        "name": "Ponte Samora Machel",
        "category": "Ponte Rodoviária Suspensa",
        "description": "Ponte histórica inaugurada em 1973 que atravessa o Rio Zambeze na Cidade de Tete, conectando o norte e o sul da província e integrando a rota internacional para o Zimbabué e Malawi."
      },
      {
        "name": "Ponte Kassuende",
        "category": "Ponte Rodoviária de Viga Contínua",
        "description": "Inaugurada em 2014 a jusante da Cidade de Tete, desvia o tráfego pesado de minérios e mercadorias internacionais do centro urbano."
      },
      {
        "name": "Corredor Logístico de Nacala (CLN)",
        "category": "Linha Ferroviária de Carga Pesada",
        "description": "Ferrovia moderna de tração dupla construída para escoar carvão metalúrgico das minas de Moatize através do território do Malawi até ao porto de águas profundas de Nacala."
      },
      {
        "name": "Linha de Sena (CFM Centro)",
        "category": "Linha Férrea Histórica Reabilitada",
        "description": "Espinha dorsal ferroviária que liga as jazidas minerais de Tete ao Porto da Beira, atravessando a histórica ponte Dona Ana em Mutarara."
      },
      {
        "name": "Aeroporto de Chingodzi (Tete)",
        "category": "Aeroporto Comercial (IATA: TET)",
        "description": "Serve a província com ligações diárias regulares a Maputo, Beira e voos charters corporativos para apoio às indústrias mineira e energética."
      }
    ],
    "sources": {
      "demographics": "INE Moçambique - IV Recenseamento Geral da População e Habitação (Censo 2017) e Projecções Demográficas 2017-2050 (INE 2020/2024)",
      "cartography": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 (Distritos) e Layer 0 (Províncias)",
      "tourism": "Visit Mozambique (INATUR - Instituto Nacional do Turismo) & UNESCO Património Imaterial",
      "economy": "Ministério da Economia e Finanças (MEF) & Relatórios Anuais HCB / Vulcan Mozambique",
      "infrastructure": "Administração Nacional de Estradas (ANE) & Porto dos Caminhos de Ferro de Moçambique (CFM)"
    }
  },
  "01": {
    "provinceId": "01",
    "name": "Cidade de Maputo",
    "officialName": "Província da Cidade de Maputo (Capital)",
    "capital": "Maputo",
    "region": "Sul",
    "color": "#0284c7",
    "indicators": [
      {
        "id": "identificacao",
        "label": "Designação Oficial",
        "value": "Província da Cidade de Maputo (Capital)",
        "formattedValue": "Província da Cidade de Maputo (Capital) (Código MAEFP: 01)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Unidade provincial autónoma na região Sul de Moçambique."
      },
      {
        "id": "capital",
        "label": "Capital Provincial",
        "value": "Maputo",
        "formattedValue": "Maputo (Município)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Sede dos órgãos executivos e judiciais da Província de Cidade de Maputo."
      },
      {
        "id": "superficie",
        "label": "Superfície Territorial",
        "value": 347,
        "formattedValue": "347 km²",
        "unit": "km²",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Território subdividido em 7 distritos oficiais MAEFP."
      },
      {
        "id": "populacao_censo_2017",
        "label": "População (Censo 2017)",
        "value": 1101170,
        "formattedValue": "1 101 170 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2017",
        "category": "demografia",
        "notes": "Dados definitivos apurados pelo IV Recenseamento Geral da População e Habitação do INE."
      },
      {
        "id": "populacao_projecao_2024",
        "label": "População Estimada (2024)",
        "value": 1160000,
        "formattedValue": "1 160 000 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Projecção demográfica oficial elaborada pela Divisão de Estatísticas Demográficas do INE."
      },
      {
        "id": "densidade_2024",
        "label": "Densidade Populacional (2024)",
        "value": 3342.9,
        "formattedValue": "3342.9 hab/km²",
        "unit": "hab/km²",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Calculada a partir da projecção 2024 e da área cartográfica oficial MAEFP."
      },
      {
        "id": "recursos_estrategicos",
        "label": "Pilares Económicos",
        "value": "Serviços Financeiros e Bancários, Comércio Geral, Administração Pública",
        "formattedValue": "Serviços Financeiros e Bancários • Comércio Geral • Administração Pública • Transportes & Logística",
        "source": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
        "referenceYear": "2023",
        "category": "economia",
        "notes": "Capital da República de Moçambique com estatuto especial de província. Constitui o principal centro político, diplomático, financeiro e corporativo do país, acolhendo a sede dos órgãos de soberania e as principais instituições nacionais."
      },
      {
        "id": "ponto_culminante",
        "label": "Relevo Notável",
        "value": "Elevações de Sommerschield / Polana",
        "formattedValue": "Elevações de Sommerschield / Polana (65 m)",
        "unit": "m",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Ponto culminante e de maior altitude no território provincial."
      }
    ],
    "tourismHeritage": [
      {
        "id": "estacao_cfm",
        "title": "Estação Central dos Caminhos de Ferro (CFM)",
        "category": "Património Histórico & Arquitectónico",
        "location": "Praça dos Trabalhadores, Maputo",
        "description": "Considerada uma das mais belas estações ferroviárias do mundo, com cúpula de cobre desenhada por associados de Gustave Eiffel (1910).",
        "source": "INATUR"
      },
      {
        "id": "fortaleza_maputo",
        "title": "Fortaleza de Nossa Senhora da Conceição",
        "category": "Património Histórico & Arquitectónico",
        "location": "Baixa de Maputo",
        "description": "Construída em 1787, guarda os restos mortais do guerreiro e imperador Ngungunhane e canhões históricos da época dos descobrimentos.",
        "source": "INATUR"
      },
      {
        "id": "ilha_inhaca",
        "title": "Ilha e Reserva Marinha da Inhaca",
        "category": "Património Natural",
        "location": "Baía de Maputo (KaNyaka)",
        "description": "Santuário ecológico de recifes de coral intactos, tartarugas marinhas e estação de biologia marítima da Universidade Eduardo Mondlane.",
        "source": "INATUR"
      }
    ],
    "infrastructures": [
      {
        "name": "Ponte Maputo-KaTembe",
        "category": "Rodoviária",
        "description": "Maior ponte suspensa de África (3.041 m de comprimento total e vão de 680 m)."
      },
      {
        "name": "Porto de Maputo",
        "category": "Portuária",
        "description": "Porto de águas profundas de referência regional e ligação à África do Sul."
      },
      {
        "name": "Aeroporto Internacional de Mavalane",
        "category": "Aeroportuária",
        "description": "Principal hub aéreo internacional de Moçambique."
      }
    ],
    "sources": {
      "demographics": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
      "cartography": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
      "tourism": "Visit Mozambique (INATUR) & UNESCO Património Mundial e Imaterial",
      "economy": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
      "infrastructure": "Administração Nacional de Estradas (ANE) & CFM"
    }
  },
  "02": {
    "provinceId": "02",
    "name": "Maputo Província",
    "officialName": "Província de Maputo",
    "capital": "Matola",
    "region": "Sul",
    "color": "#2563eb",
    "indicators": [
      {
        "id": "identificacao",
        "label": "Designação Oficial",
        "value": "Província de Maputo",
        "formattedValue": "Província de Maputo (Código MAEFP: 02)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Unidade provincial autónoma na região Sul de Moçambique."
      },
      {
        "id": "capital",
        "label": "Capital Provincial",
        "value": "Matola",
        "formattedValue": "Matola (Município)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Sede dos órgãos executivos e judiciais da Província de Maputo Província."
      },
      {
        "id": "superficie",
        "label": "Superfície Territorial",
        "value": 26058,
        "formattedValue": "26 058 km²",
        "unit": "km²",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Território subdividido em 8 distritos oficiais MAEFP."
      },
      {
        "id": "populacao_censo_2017",
        "label": "População (Censo 2017)",
        "value": 2051815,
        "formattedValue": "2 051 815 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2017",
        "category": "demografia",
        "notes": "Dados definitivos apurados pelo IV Recenseamento Geral da População e Habitação do INE."
      },
      {
        "id": "populacao_projecao_2024",
        "label": "População Estimada (2024)",
        "value": 2550000,
        "formattedValue": "2 550 000 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Projecção demográfica oficial elaborada pela Divisão de Estatísticas Demográficas do INE."
      },
      {
        "id": "densidade_2024",
        "label": "Densidade Populacional (2024)",
        "value": 97.9,
        "formattedValue": "97.9 hab/km²",
        "unit": "hab/km²",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Calculada a partir da projecção 2024 e da área cartográfica oficial MAEFP."
      },
      {
        "id": "recursos_estrategicos",
        "label": "Pilares Económicos",
        "value": "Indústria Transformadora, Agro-indústria (Açúcar), Construção Civil",
        "formattedValue": "Indústria Transformadora • Agro-indústria (Açúcar) • Construção Civil • Turismo Costeiro",
        "source": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
        "referenceYear": "2023",
        "category": "economia",
        "notes": "Maior pólo industrial e manufactureiro de Moçambique. Abriga a cidade de Matola e estende-se desde as praias de Ponta do Ouro até à fronteira com a África do Sul e Essuatíni."
      },
      {
        "id": "ponto_culminante",
        "label": "Relevo Notável",
        "value": "Montes Libombos (Fronteira Namaacha)",
        "formattedValue": "Montes Libombos (Fronteira Namaacha) (750 m)",
        "unit": "m",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Ponto culminante e de maior altitude no território provincial."
      }
    ],
    "tourismHeritage": [
      {
        "id": "parque_maputo",
        "title": "Parque Nacional de Maputo",
        "category": "Património Natural",
        "location": "Matutuíne",
        "description": "Paisagem protegida de savanas litorais, lagoas costeiras, centenas de elefantes africanos e praias deslumbrantes onde desovam tartarugas marinhas.",
        "source": "ANAC / INATUR"
      },
      {
        "id": "ponta_do_ouro",
        "title": "Praia da Ponta do Ouro",
        "category": "Património Natural",
        "location": "Matutuíne, Fronteira África do Sul",
        "description": "Pólo balnear de renome internacional para mergulho com golfinhos, tubarões e prática de surf.",
        "source": "INATUR"
      },
      {
        "id": "gwaza_muthini",
        "title": "Cerimónia Tradicional Gwaza Muthini",
        "category": "Património Cultural Imaterial",
        "location": "Marracuene",
        "description": "Evocação anual da histórica resistência do povo Ronga contra as forças coloniais em 1895, com danças guerreiras e prova do fruto Canhu.",
        "source": "Ministério da Cultura"
      }
    ],
    "infrastructures": [
      {
        "name": "Auto-estrada N4 e Porto da Matola",
        "category": "Logística",
        "description": "Corredor Trans-Kalahari / Maputo e terminais minerais da Matola."
      },
      {
        "name": "Fundição de Alumínio MOZAL",
        "category": "Industrial",
        "description": "Maior empreendimento industrial do país no Parque de Beluluane."
      },
      {
        "name": "Barragem dos Pequenos Libombos",
        "category": "Hídrica",
        "description": "Abastecimento de água à região metropolitana de Maputo e Matola."
      }
    ],
    "sources": {
      "demographics": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
      "cartography": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
      "tourism": "Visit Mozambique (INATUR) & UNESCO Património Mundial e Imaterial",
      "economy": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
      "infrastructure": "Administração Nacional de Estradas (ANE) & CFM"
    }
  },
  "03": {
    "provinceId": "03",
    "name": "Gaza",
    "officialName": "Província de Gaza",
    "capital": "Xai-Xai",
    "region": "Sul",
    "color": "#0d9488",
    "indicators": [
      {
        "id": "identificacao",
        "label": "Designação Oficial",
        "value": "Província de Gaza",
        "formattedValue": "Província de Gaza (Código MAEFP: 03)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Unidade provincial autónoma na região Sul de Moçambique."
      },
      {
        "id": "capital",
        "label": "Capital Provincial",
        "value": "Xai-Xai",
        "formattedValue": "Xai-Xai (Município)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Sede dos órgãos executivos e judiciais da Província de Gaza."
      },
      {
        "id": "superficie",
        "label": "Superfície Territorial",
        "value": 75709,
        "formattedValue": "75 709 km²",
        "unit": "km²",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Território subdividido em 14 distritos oficiais MAEFP."
      },
      {
        "id": "populacao_censo_2017",
        "label": "População (Censo 2017)",
        "value": 1446654,
        "formattedValue": "1 446 654 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2017",
        "category": "demografia",
        "notes": "Dados definitivos apurados pelo IV Recenseamento Geral da População e Habitação do INE."
      },
      {
        "id": "populacao_projecao_2024",
        "label": "População Estimada (2024)",
        "value": 1558000,
        "formattedValue": "1 558 000 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Projecção demográfica oficial elaborada pela Divisão de Estatísticas Demográficas do INE."
      },
      {
        "id": "densidade_2024",
        "label": "Densidade Populacional (2024)",
        "value": 20.6,
        "formattedValue": "20.6 hab/km²",
        "unit": "hab/km²",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Calculada a partir da projecção 2024 e da área cartográfica oficial MAEFP."
      },
      {
        "id": "recursos_estrategicos",
        "label": "Pilares Económicos",
        "value": "Agricultura de Regadio (Arroz), Pecuária Bovina, Mineração de Areias Pesadas",
        "formattedValue": "Agricultura de Regadio (Arroz) • Pecuária Bovina • Mineração de Areias Pesadas • Turismo",
        "source": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
        "referenceYear": "2023",
        "category": "economia",
        "notes": "Conhecida como o celeiro do sul do país graças ao fértil vale do Rio Limpopo e ao perímetro irrigado de Chókwè. Destaque para o Parque Nacional do Limpopo (integrante do Parque Transfronteiriço do Grande Limpopo)."
      },
      {
        "id": "ponto_culminante",
        "label": "Relevo Notável",
        "value": "Planalto de Chicualacuala",
        "formattedValue": "Planalto de Chicualacuala (450 m)",
        "unit": "m",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Ponto culminante e de maior altitude no território provincial."
      }
    ],
    "tourismHeritage": [
      {
        "id": "lagoa_bilene",
        "title": "Praia do Bilene e Lagoa Uembje",
        "category": "Património Natural",
        "location": "Bilene",
        "description": "Lagoa de água salgada de 27 km de extensão, de águas calmas e translúcidas, ideal para desportos aquáticos e repouso.",
        "source": "INATUR"
      },
      {
        "id": "parque_limpopo",
        "title": "Parque Nacional do Limpopo",
        "category": "Património Natural",
        "location": "Massingir / Chicualacuala",
        "description": "Integrado no Parque Transfronteiriço do Grande Limpopo com o Kruger Park (África do Sul) e Gonarezhou (Zimbabué), com rica mega-fauna.",
        "source": "ANAC"
      },
      {
        "id": "chaimite",
        "title": "Monumento Histórico de Chaimite",
        "category": "Património Histórico & Arquitectónico",
        "location": "Mandlakazi",
        "description": "Antiga capital sagrada do Império de Gaza e local histórico da captura de Ngungunhane pelas forças portuguesas.",
        "source": "Ministério da Cultura"
      }
    ],
    "infrastructures": [
      {
        "name": "Aeroporto Filipe Jacinto Nyusi (Chongoene)",
        "category": "Aeroportuária",
        "description": "Novo aeroporto internacional da província de Gaza."
      },
      {
        "name": "Perímetro Irrigado do Chókwè",
        "category": "Agrícola",
        "description": "Maior sistema de regadio agrícola do país na bacia do Limpopo."
      },
      {
        "name": "Mina de Areias Pesadas de Chibuto (Dingsheng)",
        "category": "Mineira",
        "description": "Grande exploração de ilmenite, rútilo e zircão."
      }
    ],
    "sources": {
      "demographics": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
      "cartography": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
      "tourism": "Visit Mozambique (INATUR) & UNESCO Património Mundial e Imaterial",
      "economy": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
      "infrastructure": "Administração Nacional de Estradas (ANE) & CFM"
    }
  },
  "04": {
    "provinceId": "04",
    "name": "Inhambane",
    "officialName": "Província de Inhambane",
    "capital": "Inhambane",
    "region": "Sul",
    "color": "#059669",
    "indicators": [
      {
        "id": "identificacao",
        "label": "Designação Oficial",
        "value": "Província de Inhambane",
        "formattedValue": "Província de Inhambane (Código MAEFP: 04)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Unidade provincial autónoma na região Sul de Moçambique."
      },
      {
        "id": "capital",
        "label": "Capital Provincial",
        "value": "Inhambane",
        "formattedValue": "Inhambane (Município)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Sede dos órgãos executivos e judiciais da Província de Inhambane."
      },
      {
        "id": "superficie",
        "label": "Superfície Territorial",
        "value": 68615,
        "formattedValue": "68 615 km²",
        "unit": "km²",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Território subdividido em 14 distritos oficiais MAEFP."
      },
      {
        "id": "populacao_censo_2017",
        "label": "População (Censo 2017)",
        "value": 1496824,
        "formattedValue": "1 496 824 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2017",
        "category": "demografia",
        "notes": "Dados definitivos apurados pelo IV Recenseamento Geral da População e Habitação do INE."
      },
      {
        "id": "populacao_projecao_2024",
        "label": "População Estimada (2024)",
        "value": 1612000,
        "formattedValue": "1 612 000 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Projecção demográfica oficial elaborada pela Divisão de Estatísticas Demográficas do INE."
      },
      {
        "id": "densidade_2024",
        "label": "Densidade Populacional (2024)",
        "value": 23.5,
        "formattedValue": "23.5 hab/km²",
        "unit": "hab/km²",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Calculada a partir da projecção 2024 e da área cartográfica oficial MAEFP."
      },
      {
        "id": "recursos_estrategicos",
        "label": "Pilares Económicos",
        "value": "Turismo Costeiro e Mergulho, Extracção de Gás Natural, Pesca Artesanal",
        "formattedValue": "Turismo Costeiro e Mergulho • Extracção de Gás Natural • Pesca Artesanal • Castanha de Caju e Citrinos",
        "source": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
        "referenceYear": "2023",
        "category": "economia",
        "notes": "Conhecida historicamente como a Terra de Boa Gente. É o destino turístico por excelência de Moçambique, abrangendo a Baía de Inhambane, Tofo, Barra, Vilankulo e o Parque Nacional do Arquipélago de Bazaruto."
      },
      {
        "id": "ponto_culminante",
        "label": "Relevo Notável",
        "value": "Dunas de Panda / Interior de Funhalouro",
        "formattedValue": "Dunas de Panda / Interior de Funhalouro (220 m)",
        "unit": "m",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Ponto culminante e de maior altitude no território provincial."
      }
    ],
    "tourismHeritage": [
      {
        "id": "timbila_chopi",
        "title": "Timbila Chopi (Património Mundial Imaterial)",
        "category": "Património Cultural Imaterial",
        "location": "Zavala / Quissico",
        "description": "Orquestras tradicionais de xilofones artesanais de madeira de M’bila, reconhecidas pela UNESCO como Obra-Prima do Património Oral e Imaterial da Humanidade.",
        "source": "UNESCO / INATUR"
      },
      {
        "id": "arquipelago_bazaruto",
        "title": "Parque Nacional do Arquipélago de Bazaruto",
        "category": "Património Natural",
        "location": "Vilankulo / Inhassoro",
        "description": "Cinco ilhas paradisíacas com recifes de coral imaculados, dunas gigantescas e o último santuário do Dugongo no Oceano Índico Ocidental.",
        "source": "ANAC / INATUR"
      },
      {
        "id": "praia_tofo",
        "title": "Praia do Tofo e Baía de Inhambane",
        "category": "Património Natural",
        "location": "Inhambane",
        "description": "Meca mundial para observação durante todo o ano de raias-manta gigantes, tubarões-baleia e migração de baleias-de-bossas.",
        "source": "INATUR"
      }
    ],
    "infrastructures": [
      {
        "name": "Central e Gasoduto de Temane (SASOL)",
        "category": "Energia",
        "description": "Exploração de gás natural de Pande/Temane para Moçambique e África do Sul."
      },
      {
        "name": "Aeroporto Internacional de Vilankulo",
        "category": "Aeroportuária",
        "description": "Porta de entrada turística com voos directos internacionais."
      },
      {
        "name": "Porto Histórico de Inhambane",
        "category": "Portuária",
        "description": "Navegação de dhows tradicionais na Baía de Inhambane."
      }
    ],
    "sources": {
      "demographics": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
      "cartography": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
      "tourism": "Visit Mozambique (INATUR) & UNESCO Património Mundial e Imaterial",
      "economy": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
      "infrastructure": "Administração Nacional de Estradas (ANE) & CFM"
    }
  },
  "05": {
    "provinceId": "05",
    "name": "Sofala",
    "officialName": "Província de Sofala",
    "capital": "Beira",
    "region": "Centro",
    "color": "#d97706",
    "indicators": [
      {
        "id": "identificacao",
        "label": "Designação Oficial",
        "value": "Província de Sofala",
        "formattedValue": "Província de Sofala (Código MAEFP: 05)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Unidade provincial autónoma na região Centro de Moçambique."
      },
      {
        "id": "capital",
        "label": "Capital Provincial",
        "value": "Beira",
        "formattedValue": "Beira (Município)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Sede dos órgãos executivos e judiciais da Província de Sofala."
      },
      {
        "id": "superficie",
        "label": "Superfície Territorial",
        "value": 68018,
        "formattedValue": "68 018 km²",
        "unit": "km²",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Território subdividido em 13 distritos oficiais MAEFP."
      },
      {
        "id": "populacao_censo_2017",
        "label": "População (Censo 2017)",
        "value": 2221803,
        "formattedValue": "2 221 803 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2017",
        "category": "demografia",
        "notes": "Dados definitivos apurados pelo IV Recenseamento Geral da População e Habitação do INE."
      },
      {
        "id": "populacao_projecao_2024",
        "label": "População Estimada (2024)",
        "value": 2580000,
        "formattedValue": "2 580 000 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Projecção demográfica oficial elaborada pela Divisão de Estatísticas Demográficas do INE."
      },
      {
        "id": "densidade_2024",
        "label": "Densidade Populacional (2024)",
        "value": 37.9,
        "formattedValue": "37.9 hab/km²",
        "unit": "hab/km²",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Calculada a partir da projecção 2024 e da área cartográfica oficial MAEFP."
      },
      {
        "id": "recursos_estrategicos",
        "label": "Pilares Económicos",
        "value": "Logística Portuária e Corredor Internacional, Agro-indústria Açucareira, Pesca de Camarão",
        "formattedValue": "Logística Portuária e Corredor Internacional • Agro-indústria Açucareira • Pesca de Camarão • Ecoturismo",
        "source": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
        "referenceYear": "2023",
        "category": "economia",
        "notes": "Coração logístico da região centro de Moçambique. A cidade da Beira é a segunda maior cidade económica e o seu porto serve países do hinterland como Zimbabué, Zâmbia e Malawi."
      },
      {
        "id": "ponto_culminante",
        "label": "Relevo Notável",
        "value": "Maciço da Gorongosa (Monte Gogógo)",
        "formattedValue": "Maciço da Gorongosa (Monte Gogógo) (1863 m)",
        "unit": "m",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Ponto culminante e de maior altitude no território provincial."
      }
    ],
    "tourismHeritage": [
      {
        "id": "gorongosa",
        "title": "Parque Nacional da Gorongosa",
        "category": "Património Natural",
        "location": "Gorongosa / Muanza",
        "description": "Exemplo mundial de restauração ecológica e conservação da biodiversidade, acolhendo leões, elefantes, mabecos e a luxuriante Serra da Gorongosa.",
        "source": "Gorongosa Restoration Project / ANAC"
      },
      {
        "id": "reserva_marromeu",
        "title": "Reserva Especial de Marromeu (Delta do Zambeze)",
        "category": "Património Natural",
        "location": "Marromeu",
        "description": "Sítio RAMSAR de importância internacional com uma das maiores densidades de búfalos africanos e centenas de espécies de aves aquáticas.",
        "source": "ANAC"
      },
      {
        "id": "farol_macuti",
        "title": "Farol do Macúti e Praias da Beira",
        "category": "Património Histórico & Arquitectónico",
        "location": "Cidade da Beira",
        "description": "Histórico farol em faixas vermelhas e brancas construído em 1904 sobre a costa do Índico na foz do Rio Púnguè.",
        "source": "INATUR"
      }
    ],
    "infrastructures": [
      {
        "name": "Porto da Beira e Corredor da Beira",
        "category": "Logística",
        "description": "Porto comercial vital para o Zimbabué, Zâmbia e Malawi com ferrovia e oleoduto."
      },
      {
        "name": "Ponte Armando Guebuza sobre o Zambeze",
        "category": "Rodoviária",
        "description": "Ponte de 2.376 m em Caia ligando o Norte e o Sul do país pela N1."
      },
      {
        "name": "Açucareiras de Marromeu e Búzi",
        "category": "Agro-indústria",
        "description": "Grandes complexos agro-industriais de açúcar de cana."
      }
    ],
    "sources": {
      "demographics": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
      "cartography": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
      "tourism": "Visit Mozambique (INATUR) & UNESCO Património Mundial e Imaterial",
      "economy": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
      "infrastructure": "Administração Nacional de Estradas (ANE) & CFM"
    }
  },
  "06": {
    "provinceId": "06",
    "name": "Manica",
    "officialName": "Província de Manica",
    "capital": "Chimoio",
    "region": "Centro",
    "color": "#ca8a04",
    "indicators": [
      {
        "id": "identificacao",
        "label": "Designação Oficial",
        "value": "Província de Manica",
        "formattedValue": "Província de Manica (Código MAEFP: 06)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Unidade provincial autónoma na região Centro de Moçambique."
      },
      {
        "id": "capital",
        "label": "Capital Provincial",
        "value": "Chimoio",
        "formattedValue": "Chimoio (Município)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Sede dos órgãos executivos e judiciais da Província de Manica."
      },
      {
        "id": "superficie",
        "label": "Superfície Territorial",
        "value": 61661,
        "formattedValue": "61 661 km²",
        "unit": "km²",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Território subdividido em 12 distritos oficiais MAEFP."
      },
      {
        "id": "populacao_censo_2017",
        "label": "População (Censo 2017)",
        "value": 1911237,
        "formattedValue": "1 911 237 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2017",
        "category": "demografia",
        "notes": "Dados definitivos apurados pelo IV Recenseamento Geral da População e Habitação do INE."
      },
      {
        "id": "populacao_projecao_2024",
        "label": "População Estimada (2024)",
        "value": 2235000,
        "formattedValue": "2 235 000 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Projecção demográfica oficial elaborada pela Divisão de Estatísticas Demográficas do INE."
      },
      {
        "id": "densidade_2024",
        "label": "Densidade Populacional (2024)",
        "value": 36.2,
        "formattedValue": "36.2 hab/km²",
        "unit": "hab/km²",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Calculada a partir da projecção 2024 e da área cartográfica oficial MAEFP."
      },
      {
        "id": "recursos_estrategicos",
        "label": "Pilares Económicos",
        "value": "Agricultura Comercial e Horticultura, Fruticultura de Exportação, Silvicultura e Madeira",
        "formattedValue": "Agricultura Comercial e Horticultura • Fruticultura de Exportação • Silvicultura e Madeira • Mineração de Ouro",
        "source": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
        "referenceYear": "2023",
        "category": "economia",
        "notes": "Província interior montanhosa de solos muito férteis e clima privilegiado. Destaque para a produção intensiva de líchias, bananas, milho e hortícolas de exportação."
      },
      {
        "id": "ponto_culminante",
        "label": "Relevo Notável",
        "value": "Monte Binga (Ponto mais alto de Moçambique)",
        "formattedValue": "Monte Binga (Ponto mais alto de Moçambique) (2436 m)",
        "unit": "m",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Ponto culminante e de maior altitude no território provincial."
      }
    ],
    "tourismHeritage": [
      {
        "id": "monte_binga",
        "title": "Monte Binga (Ponto Mais Alto de Moçambique)",
        "category": "Património Natural",
        "location": "Sussundenga (2.436 m)",
        "description": "O cume mais elevado de Moçambique, coroando a cordilheira de Chimanimani na fronteira com o Zimbabué.",
        "source": "INATUR"
      },
      {
        "id": "parque_chimanimani",
        "title": "Parque Nacional de Chimanimani",
        "category": "Património Natural",
        "location": "Sussundenga",
        "description": "Maciço montanhoso de quartzito com plantas endémicas raras, florestas de altitude, cascatas pristinas e pinturas rupestres san antigas.",
        "source": "ANAC"
      },
      {
        "id": "cabeca_velho",
        "title": "Cabeça do Velho (Maciço Antropomórfico)",
        "category": "Património Histórico & Arquitectónico",
        "location": "Cidade de Chimoio",
        "description": "Formação rochosa natural impressionante com o perfil exato de um rosto humano envelhecido, símbolo da cidade de Chimoio.",
        "source": "INATUR"
      }
    ],
    "infrastructures": [
      {
        "name": "Corredor Rodoviário N6 (Machipanda)",
        "category": "Rodoviária",
        "description": "Ligação moderna da Beira ao Zimbabué via Chimoio e Manica."
      },
      {
        "name": "Barragem de Chicamba Real",
        "category": "Hidroelétrica",
        "description": "Central hidroelétrica no Rio Revué alimentando a rede do Centro."
      },
      {
        "name": "Grandes Empreendimentos Hortícolas de Vanduzi",
        "category": "Agro-negócio",
        "description": "Exportação de hortícolas de valor acrescentado para a Europa."
      }
    ],
    "sources": {
      "demographics": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
      "cartography": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
      "tourism": "Visit Mozambique (INATUR) & UNESCO Património Mundial e Imaterial",
      "economy": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
      "infrastructure": "Administração Nacional de Estradas (ANE) & CFM"
    }
  },
  "08": {
    "provinceId": "08",
    "name": "Zambézia",
    "officialName": "Província da Zambézia",
    "capital": "Quelimane",
    "region": "Centro",
    "color": "#16a34a",
    "indicators": [
      {
        "id": "identificacao",
        "label": "Designação Oficial",
        "value": "Província da Zambézia",
        "formattedValue": "Província da Zambézia (Código MAEFP: 08)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Unidade provincial autónoma na região Centro de Moçambique."
      },
      {
        "id": "capital",
        "label": "Capital Provincial",
        "value": "Quelimane",
        "formattedValue": "Quelimane (Município)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Sede dos órgãos executivos e judiciais da Província de Zambézia."
      },
      {
        "id": "superficie",
        "label": "Superfície Territorial",
        "value": 105008,
        "formattedValue": "105 008 km²",
        "unit": "km²",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Território subdividido em 22 distritos oficiais MAEFP."
      },
      {
        "id": "populacao_censo_2017",
        "label": "População (Censo 2017)",
        "value": 5110087,
        "formattedValue": "5 110 087 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2017",
        "category": "demografia",
        "notes": "Dados definitivos apurados pelo IV Recenseamento Geral da População e Habitação do INE."
      },
      {
        "id": "populacao_projecao_2024",
        "label": "População Estimada (2024)",
        "value": 5890000,
        "formattedValue": "5 890 000 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Projecção demográfica oficial elaborada pela Divisão de Estatísticas Demográficas do INE."
      },
      {
        "id": "densidade_2024",
        "label": "Densidade Populacional (2024)",
        "value": 56.1,
        "formattedValue": "56.1 hab/km²",
        "unit": "hab/km²",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Calculada a partir da projecção 2024 e da área cartográfica oficial MAEFP."
      },
      {
        "id": "recursos_estrategicos",
        "label": "Pilares Económicos",
        "value": "Agricultura Alimentar (Mandioca, Arroz), Chá de Altitude (Gurué), Madeira Nobre",
        "formattedValue": "Agricultura Alimentar (Mandioca, Arroz) • Chá de Altitude (Gurué) • Madeira Nobre • Pesca de Crustáceos",
        "source": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
        "referenceYear": "2023",
        "category": "economia",
        "notes": "Segunda província mais populosa de Moçambique. Possui um rico património agrícola e florestal, estendendo-se desde as famosas montanhas de chá de Gurué até às águas costeiras de Pebane e Chinde."
      },
      {
        "id": "ponto_culminante",
        "label": "Relevo Notável",
        "value": "Monte Namúli (Segundo ponto mais alto do país)",
        "formattedValue": "Monte Namúli (Segundo ponto mais alto do país) (2419 m)",
        "unit": "m",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Ponto culminante e de maior altitude no território provincial."
      }
    ],
    "tourismHeritage": [
      {
        "id": "cha_gurue",
        "title": "Plantações Históricas de Chá de Guruè & Monte Namúli",
        "category": "Património Natural",
        "location": "Guruè (2.419 m)",
        "description": "Vastas plantações de chá esmeralda em socalcos sob a imponente sombra do Monte Namúli, o 2º cume mais alto do país e montanha sagrada.",
        "source": "INATUR"
      },
      {
        "id": "praia_zalala",
        "title": "Praia de Zalala",
        "category": "Património Natural",
        "location": "Quelimane",
        "description": "Extensa praia oceânica de areias prateadas orlada por coqueirais ondulantes e povoada por pescadores tradicionais.",
        "source": "INATUR"
      },
      {
        "id": "parque_gile",
        "title": "Parque Nacional de Gilé",
        "category": "Património Natural",
        "location": "Gilé / Pebane",
        "description": "Maior bloco preservado de floresta de Miombo costeiro em Moçambique, lar de rinocerontes negros reintroduzidos e elefantes.",
        "source": "ANAC"
      }
    ],
    "infrastructures": [
      {
        "name": "Ponte de Macuse e Corredor Logístico",
        "category": "Logística",
        "description": "Projecto ferroviário e portuário de ligação às minas do interior."
      },
      {
        "name": "Porto Fluvial de Quelimane",
        "category": "Portuária",
        "description": "Porto histórico nas margens do Rio dos Bons Sinais."
      },
      {
        "name": "Bacia Hidrográfica do Rio Licungo",
        "category": "Agrícola",
        "description": "Principal vale irrigado de produção de arroz da Zambézia."
      }
    ],
    "sources": {
      "demographics": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
      "cartography": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
      "tourism": "Visit Mozambique (INATUR) & UNESCO Património Mundial e Imaterial",
      "economy": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
      "infrastructure": "Administração Nacional de Estradas (ANE) & CFM"
    }
  },
  "09": {
    "provinceId": "09",
    "name": "Nampula",
    "officialName": "Província de Nampula",
    "capital": "Nampula",
    "region": "Norte",
    "color": "#9333ea",
    "indicators": [
      {
        "id": "identificacao",
        "label": "Designação Oficial",
        "value": "Província de Nampula",
        "formattedValue": "Província de Nampula (Código MAEFP: 09)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Unidade provincial autónoma na região Norte de Moçambique."
      },
      {
        "id": "capital",
        "label": "Capital Provincial",
        "value": "Nampula",
        "formattedValue": "Nampula (Município)",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Sede dos órgãos executivos e judiciais da Província de Nampula."
      },
      {
        "id": "superficie",
        "label": "Superfície Territorial",
        "value": 81606,
        "formattedValue": "81 606 km²",
        "unit": "km²",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Território subdividido em 23 distritos oficiais MAEFP."
      },
      {
        "id": "populacao_censo_2017",
        "label": "População (Censo 2017)",
        "value": 6102867,
        "formattedValue": "6 102 867 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2017",
        "category": "demografia",
        "notes": "Dados definitivos apurados pelo IV Recenseamento Geral da População e Habitação do INE."
      },
      {
        "id": "populacao_projecao_2024",
        "label": "População Estimada (2024)",
        "value": 6950000,
        "formattedValue": "6 950 000 habitantes",
        "unit": "hab.",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Projecção demográfica oficial elaborada pela Divisão de Estatísticas Demográficas do INE."
      },
      {
        "id": "densidade_2024",
        "label": "Densidade Populacional (2024)",
        "value": 85.2,
        "formattedValue": "85.2 hab/km²",
        "unit": "hab/km²",
        "source": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
        "referenceYear": "2024",
        "category": "demografia",
        "notes": "Calculada a partir da projecção 2024 e da área cartográfica oficial MAEFP."
      },
      {
        "id": "recursos_estrategicos",
        "label": "Pilares Económicos",
        "value": "Comércio e Distribuição Regional, Castanha de Caju e Algodão, Porto de Águas Profundas",
        "formattedValue": "Comércio e Distribuição Regional • Castanha de Caju e Algodão • Porto de Águas Profundas • Mineração de Areias Pesadas",
        "source": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
        "referenceYear": "2023",
        "category": "economia",
        "notes": "A província mais populosa de Moçambique, carinhosamente chamada \"Capital do Norte\". Centro vibrante da cultura Macua, integra o porto natural de Nacala e a lendária Ilha de Moçambique, primeira capital do território."
      },
      {
        "id": "ponto_culminante",
        "label": "Relevo Notável",
        "value": "Inselbergs de Ribáuè",
        "formattedValue": "Inselbergs de Ribáuè (1450 m)",
        "unit": "m",
        "source": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
        "referenceYear": "2021",
        "category": "geografia",
        "notes": "Ponto culminante e de maior altitude no território provincial."
      }
    ],
    "tourismHeritage": [
      {
        "id": "ilha_mocambique",
        "title": "Ilha de Moçambique (Património Mundial da UNESCO)",
        "category": "Património Histórico & Arquitectónico",
        "location": "Ilha de Moçambique",
        "description": "Classificada pela UNESCO desde 1991, foi a primeira capital de Moçambique. Destacam-se a Fortaleza de São Sebastião, o Palácio de São Paulo e a Capela do Baluarte.",
        "source": "UNESCO / INATUR"
      },
      {
        "id": "baia_nacala",
        "title": "Baía e Porto de Águas Profundas de Nacala",
        "category": "Património Natural",
        "location": "Nacala",
        "description": "Excecional baía natural com recifes de coral abissais, águas calmas e praias paradisíacas como Fernão Veloso.",
        "source": "INATUR"
      },
      {
        "id": "musica_tufi",
        "title": "Dança Tradicional Tufo",
        "category": "Património Cultural Imaterial",
        "location": "Costa de Nampula e Ilha de Moçambique",
        "description": "Dança tradicional das mulheres Macuas, caracterizada pelo uso de capulanas garridas idênticas, rosto pintado com pó de Musiro e ritmo cadenciado.",
        "source": "Ministério da Cultura"
      }
    ],
    "infrastructures": [
      {
        "name": "Corredor Integrado de Nacala (CFM Norte)",
        "category": "Ferroviária",
        "description": "Linha férrea de 912 km ligando as minas de Moatize e o Malawi ao mar."
      },
      {
        "name": "Porto de Nacala",
        "category": "Portuária",
        "description": "Porto natural de águas profundas (até 21 m de calado) sem necessidade de dragagem."
      },
      {
        "name": "Mina de Areias Pesadas de Moma (Kenmare)",
        "category": "Mineira",
        "description": "Uma das maiores produtoras mundiais de titânio (ilmenite e rútilo)."
      }
    ],
    "sources": {
      "demographics": "INE Moçambique - Censo 2017 e Projecções Demográficas 2017-2050 (INE 2024)",
      "cartography": "MOZGIS / MAEFP - Divisão Administrativa MapServer Layer 2 e Layer 0",
      "tourism": "Visit Mozambique (INATUR) & UNESCO Património Mundial e Imaterial",
      "economy": "Ministério da Economia e Finanças (MEF) & Banco de Moçambique",
      "infrastructure": "Administração Nacional de Estradas (ANE) & CFM"
    }
  }
};

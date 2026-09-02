import { PrismaClient, type MachineCondition } from "@prisma/client";
import bcrypt from "bcryptjs";
import { mockGeocodingProvider } from "../src/lib/geo/geocoding";

const prisma = new PrismaClient();

const CATEGORIES = [
  "Tratores",
  "Colheitadeiras",
  "Plantadeiras",
  "Semeadoras",
  "Pulverizadores",
  "Arados",
  "Grades",
  "Distribuidores",
  "Implementos",
  "Equipamentos de Irrigação",
  "Transporte Agrícola",
  "Tecnologia Agrícola",
  "Outros",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function wikimediaFilePath(fileName: string) {
  const encoded = encodeURIComponent(fileName.replace(/ /g, "_"));
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}`;
}

// Fotos reais de máquinas agrícolas (Wikimedia Commons, licenças livres), escolhidas para
// corresponder ao tipo de equipamento de cada anúncio — evita placeholders genéricos sem relação com o produto.
const MACHINE_IMAGES: readonly (readonly [string, string])[] = [
  ["Massey Ferguson 175 red tractor September 2005.jpg", "Massey Ferguson 3060 tractor.jpg"],
  [
    "John Deere 4630 Self-Propelled Sprayer (16269461688).jpg",
    "Agrifac Condor self-propelled sprayer at IndAgra Farm Romexpo 2010 (back view).JPG",
  ],
  [
    "New Holland combine at work near Stoneleigh 1.jpg",
    "New Holland combine at work near Stoneleigh 2.jpg",
  ],
  [
    "Agroline drill combination product photo from angled and side.jpg",
    "Claydon Hybrid T, Agritechnica 2023, Hanover (P1160376).jpg",
  ],
  ["Disc ploughs in field.jpg", "Tractor y arado.jpg"],
  ["John Deere disk harrow.jpg", "Man harrowing with tractor and disk harrow.jpg"],
  [
    "Amazone Cirrus, Agritechnica 2023, Hanover (P1160361).jpg",
    "Agroline drill combination product foto black white from behind.jpg",
  ],
  [
    "Ferguson fertiliser spreader on MF 35 at Lincoln 2008.jpg",
    "JD with Acuspread AS85 multi-purpose spreader.jpg",
  ],
  ["Amazone 180 Super Flail Mower 01.jpg", "Teagle EKR-S flail mower - IMG 4608.jpg"],
  ["Center pivot irrigation in Colorado.JPG", "Pivot center tower.jpg"],
  ["Grain hopper trailer 01.jpg", "Grain hopper trailer 02.jpg"],
  [
    "John Deere 6175R tractor Cuxham Oxfordshire England 01.jpg",
    "John Deere 6175R tractor Cuxham Oxfordshire England 02.jpg",
  ],
  ["Case IH 2388 beim Rapsdrusch.JPG", "Case 2388 5539.jpg"],
  [
    "Kirloskar - Silent Diesel Generator Set - Kolkata 2017-12-12 6083.JPG",
    "Whisperwatt 70 generator.JPG",
  ],
  ["Massey Ferguson 6485, Delvano field sprayer.jpg", "Deutz-Fahr 5090.D5 mit Lochmann Spritze.jpg"],
  ["Accord Sämaschine DA-L Oktober 2011.JPG", "A farmer seeding on his field.jpg"],
  [
    "NutRE portable soil sensing device in field.jpg",
    "Applications of integrated IoT and smart sensors for precision farming.jpg",
  ],
  ["Raven CRx+ Guidance Kit, Agritechnica 2023, Hanover (P1160328).jpg", "Claas Baseline HD.jpg"],
  [
    "31 05 2022 Ato Alusivo à Visita à Bahia Farm Show (52113545335).jpg",
    "DJI 0017 HJN.jpg",
  ],
  ["Fritzmeier Isaria, Fendt 927 Vario.jpg", "GreenSeeker RT200.jpg"],
];

const OWNERS = [
  { name: "João Pereira", email: "joao.owner@arvum.dev", city: "Ribeirão Preto", state: "SP" },
  { name: "Marta Souza", email: "marta.owner@arvum.dev", city: "Londrina", state: "PR" },
  { name: "Carlos Lima", email: "carlos.owner@arvum.dev", city: "Rio Verde", state: "GO" },
  {
    name: "Fernanda Rocha",
    email: "fernanda.owner@arvum.dev",
    city: "Passo Fundo",
    state: "RS",
  },
];

const RENTERS = [
  { name: "Bruno Alves", email: "bruno.renter@arvum.dev" },
  { name: "Camila Dias", email: "camila.renter@arvum.dev" },
  { name: "Diego Nunes", email: "diego.renter@arvum.dev" },
  { name: "Elaine Costa", email: "elaine.renter@arvum.dev" },
];

const DEMO_PASSWORD = "Demo@123";

interface MachineSpec {
  ownerIndex: number;
  categorySlug: string;
  title: string;
  brand: string;
  model: string;
  manufactureYear: number;
  description: string;
  condition: MachineCondition;
  dailyPriceInCents: number;
  requiresOperator: boolean;
  recommendedCrops: string[];
  // Entrega pelo proprietário (Context.md §8.10) — só algumas máquinas oferecem, para variar o
  // dado de demonstração; sem raio, a modalidade fica indisponível para essa máquina.
  deliveryRadiusKm?: number;
  deliveryPricePerKmInCents?: number;
  deliveryBaseFeeInCents?: number;
}

const MACHINES: MachineSpec[] = [
  {
    ownerIndex: 0,
    categorySlug: "tratores",
    title: "Trator Massey Ferguson 275",
    brand: "Massey Ferguson",
    model: "275",
    manufactureYear: 2018,
    description:
      "Trator 4x2 revisado, ideal para preparo de solo e reboque de implementos leves.",
    condition: "GOOD",
    dailyPriceInCents: 45000,
    requiresOperator: false,
    recommendedCrops: ["soja", "milho"],
    deliveryRadiusKm: 80,
    deliveryPricePerKmInCents: 220,
    deliveryBaseFeeInCents: 2500,
  },
  {
    ownerIndex: 0,
    categorySlug: "pulverizadores",
    title: "Pulverizador Jacto Uniport 3030",
    brand: "Jacto",
    model: "Uniport 3030",
    manufactureYear: 2020,
    description:
      "Pulverizador autopropelido com barra de 30 metros, piloto automático e monitor de aplicação.",
    condition: "EXCELLENT",
    dailyPriceInCents: 120000,
    requiresOperator: true,
    recommendedCrops: ["soja", "algodão", "milho"],
    deliveryRadiusKm: 50,
  },
  {
    ownerIndex: 1,
    categorySlug: "colheitadeiras",
    title: "Colheitadeira New Holland TC 5090",
    brand: "New Holland",
    model: "TC 5090",
    manufactureYear: 2016,
    description:
      "Colheitadeira para soja e milho, plataforma de 20 pés, ótimo estado de conservação.",
    condition: "GOOD",
    dailyPriceInCents: 280000,
    requiresOperator: true,
    recommendedCrops: ["soja", "milho"],
    deliveryRadiusKm: 150,
    deliveryPricePerKmInCents: 450,
    deliveryBaseFeeInCents: 8000,
  },
  {
    ownerIndex: 1,
    categorySlug: "plantadeiras",
    title: "Plantadeira Semeato SHM 11/13",
    brand: "Semeato",
    model: "SHM 11/13",
    manufactureYear: 2019,
    description:
      "Plantadeira de precisão com 11 linhas, ideal para soja e milho em pequenas e médias áreas.",
    condition: "GOOD",
    dailyPriceInCents: 60000,
    requiresOperator: false,
    recommendedCrops: ["soja", "milho"],
  },
  {
    ownerIndex: 2,
    categorySlug: "arados",
    title: "Arado de Discos Baldan 4x28",
    brand: "Baldan",
    model: "4x28",
    manufactureYear: 2015,
    description: "Arado de discos com 4 discos de 28 polegadas, indicado para preparo primário do solo.",
    condition: "FAIR",
    dailyPriceInCents: 25000,
    requiresOperator: false,
    recommendedCrops: ["soja", "milho", "algodão"],
  },
  {
    ownerIndex: 2,
    categorySlug: "grades",
    title: "Grade Niveladora Tatu Marchesan",
    brand: "Tatu Marchesan",
    model: "GNTM 20",
    manufactureYear: 2017,
    description: "Grade niveladora de 20 discos, ótima para nivelamento e destorroamento do solo.",
    condition: "GOOD",
    dailyPriceInCents: 22000,
    requiresOperator: false,
    recommendedCrops: ["soja", "milho", "cana-de-açúcar"],
    deliveryRadiusKm: 40,
    deliveryPricePerKmInCents: 180,
    deliveryBaseFeeInCents: 2000,
  },
  {
    ownerIndex: 3,
    categorySlug: "semeadoras",
    title: "Semeadora Stara Prima 2400",
    brand: "Stara",
    model: "Prima 2400",
    manufactureYear: 2021,
    description: "Semeadora-adubadora de 24 linhas para plantio direto, com monitor de plantio.",
    condition: "EXCELLENT",
    dailyPriceInCents: 90000,
    requiresOperator: true,
    recommendedCrops: ["soja", "milho", "algodão"],
  },
  {
    ownerIndex: 3,
    categorySlug: "distribuidores",
    title: "Distribuidor de Calcário Kuhn Axent",
    brand: "Kuhn",
    model: "Axent 100.1",
    manufactureYear: 2018,
    description: "Distribuidor de calcário e fertilizante com capacidade de 10 mil litros.",
    condition: "GOOD",
    dailyPriceInCents: 35000,
    requiresOperator: false,
    recommendedCrops: ["soja", "milho", "café"],
  },
  {
    ownerIndex: 0,
    categorySlug: "implementos",
    title: "Roçadeira Hidráulica Lavrale",
    brand: "Lavrale",
    model: "RH 180",
    manufactureYear: 2019,
    description:
      "Roçadeira hidráulica de 1,80m, ideal para manutenção de pastagens e áreas de acesso.",
    condition: "GOOD",
    dailyPriceInCents: 18000,
    requiresOperator: false,
    recommendedCrops: ["pastagem"],
  },
  {
    ownerIndex: 1,
    categorySlug: "equipamentos-de-irrigacao",
    title: "Pivô Central Valley 8000",
    brand: "Valley",
    model: "8000 Series",
    manufactureYear: 2014,
    description:
      "Pivô central de irrigação com painel de controle remoto, cobertura de até 50 hectares.",
    condition: "FAIR",
    dailyPriceInCents: 150000,
    requiresOperator: true,
    recommendedCrops: ["soja", "milho", "café", "cana-de-açúcar"],
  },
  {
    ownerIndex: 2,
    categorySlug: "transporte-agricola",
    title: "Carreta Agrícola Basculante Randon",
    brand: "Randon",
    model: "Basculante 8t",
    manufactureYear: 2020,
    description:
      "Carreta basculante com capacidade de 8 toneladas, ideal para transporte de grãos e insumos.",
    condition: "EXCELLENT",
    dailyPriceInCents: 30000,
    requiresOperator: false,
    recommendedCrops: [],
  },
  {
    ownerIndex: 3,
    categorySlug: "tratores",
    title: "Trator John Deere 6110J",
    brand: "John Deere",
    model: "6110J",
    manufactureYear: 2022,
    description: "Trator 4x4 com cabine climatizada, baixa horas de uso, revisões em dia.",
    condition: "NEW",
    dailyPriceInCents: 65000,
    requiresOperator: false,
    recommendedCrops: ["soja", "milho", "café"],
  },
  {
    ownerIndex: 0,
    categorySlug: "colheitadeiras",
    title: "Colheitadeira Case IH 2388",
    brand: "Case IH",
    model: "2388",
    manufactureYear: 2012,
    description:
      "Colheitadeira robusta para grandes áreas, plataforma de 25 pés, necessita pequenos reparos.",
    condition: "NEEDS_MAINTENANCE",
    dailyPriceInCents: 200000,
    requiresOperator: true,
    recommendedCrops: ["soja", "milho", "algodão"],
  },
  {
    ownerIndex: 1,
    categorySlug: "outros",
    title: "Gerador Diesel Portátil 50kVA",
    brand: "Stemac",
    model: "SS50",
    manufactureYear: 2019,
    description: "Gerador a diesel de 50kVA para apoio em operações de irrigação e beneficiamento.",
    condition: "GOOD",
    dailyPriceInCents: 40000,
    requiresOperator: false,
    recommendedCrops: [],
    deliveryRadiusKm: 60,
  },
  {
    ownerIndex: 2,
    categorySlug: "pulverizadores",
    title: "Pulverizador de Arrasto Montana",
    brand: "Montana",
    model: "AM18",
    manufactureYear: 2017,
    description: "Pulverizador de arrasto com barra de 18 metros, tanque de 2000 litros.",
    condition: "GOOD",
    dailyPriceInCents: 55000,
    requiresOperator: false,
    recommendedCrops: ["soja", "algodão"],
  },
  {
    ownerIndex: 1,
    categorySlug: "tecnologia-agricola",
    title: "Dosador de Sementes de Precisão Accord DA-L",
    brand: "Accord",
    model: "DA-L",
    manufactureYear: 2021,
    description:
      "Unidade dosadora de sementes de precisão, compatível com plantio direto — controla a distribuição individual de sementes linha a linha, sem necessidade de alugar a plantadeira completa.",
    condition: "GOOD",
    dailyPriceInCents: 15000,
    requiresOperator: false,
    recommendedCrops: ["soja", "milho"],
  },
  {
    ownerIndex: 3,
    categorySlug: "tecnologia-agricola",
    title: "Sensor Portátil de Solo e Nutrientes NutRE",
    brand: "Biota Precision Agriculture",
    model: "NutRE",
    manufactureYear: 2023,
    description:
      "Sensor portátil para análise de nutrientes e umidade do solo em campo, com leitura em tempo real para apoiar decisões de adubação.",
    condition: "EXCELLENT",
    dailyPriceInCents: 12000,
    requiresOperator: false,
    recommendedCrops: [],
  },
  {
    ownerIndex: 0,
    categorySlug: "tecnologia-agricola",
    title: "Kit de Piloto Automático Raven CRx+",
    brand: "Raven",
    model: "CRx+",
    manufactureYear: 2023,
    description:
      "Kit de piloto automático e correção de sinal GPS para tratores e colheitadeiras, com precisão de poucos centímetros.",
    condition: "EXCELLENT",
    dailyPriceInCents: 20000,
    requiresOperator: false,
    recommendedCrops: [],
  },
  {
    ownerIndex: 2,
    categorySlug: "tecnologia-agricola",
    title: "Dosador de Sementes Pneumático J.Assy Selenium",
    brand: "J.Assy",
    model: "Selenium",
    manufactureYear: 2023,
    description:
      "Dosador pneumático de alta precisão para soja, milho, algodão, sorgo e feijão. Não exige ajuste ou desmontagem na troca de kits de cultura e tem janela de visualização para acompanhar o desempenho durante o plantio.",
    condition: "EXCELLENT",
    dailyPriceInCents: 18000,
    requiresOperator: false,
    recommendedCrops: ["soja", "milho", "algodão", "sorgo", "feijão"],
  },
  {
    ownerIndex: 1,
    categorySlug: "tecnologia-agricola",
    title: "Sensor de Fluxo J.Assy Visum Adubo",
    brand: "J.Assy",
    model: "Visum Adubo",
    manufactureYear: 2023,
    description:
      "Sensor de fluxo de adubo com comunicação 100% sem fio e compatível com ISOBUS — monitora a vazão do insumo e alerta sobre entupimentos e falhas que possam comprometer a germinação.",
    condition: "EXCELLENT",
    dailyPriceInCents: 10000,
    requiresOperator: false,
    recommendedCrops: [],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.machineCategory.createMany({
    data: CATEGORIES.map((name) => ({ name, slug: slugify(name) })),
    skipDuplicates: true,
  });
  const categories = await prisma.machineCategory.findMany();
  const categoryIdBySlug = new Map(categories.map((category) => [category.slug, category.id]));

  const admin = await prisma.user.upsert({
    where: { email: "admin@arvum.dev" },
    update: {},
    create: {
      name: "Administradora Demo",
      email: "admin@arvum.dev",
      passwordHash,
      role: "ADMIN",
    },
  });

  const ownerRecords: { userId: string; propertyId: string }[] = [];

  for (const owner of OWNERS) {
    const user = await prisma.user.upsert({
      where: { email: owner.email },
      update: {},
      create: { name: owner.name, email: owner.email, passwordHash },
    });

    const propertyId = `seed-property-${user.id}`;
    const coordinates = mockGeocodingProvider.geocode({ city: owner.city, state: owner.state });
    await prisma.property.upsert({
      where: { id: propertyId },
      update: { latitude: coordinates?.latitude, longitude: coordinates?.longitude },
      create: {
        id: propertyId,
        ownerId: user.id,
        name: `Fazenda ${owner.name.split(" ")[0]}`,
        addressLine: "Estrada Rural, s/n",
        city: owner.city,
        state: owner.state,
        postalCode: "00000-000",
        roadType: "Estrada de terra",
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
      },
    });

    ownerRecords.push({ userId: user.id, propertyId });
  }

  for (const renter of RENTERS) {
    await prisma.user.upsert({
      where: { email: renter.email },
      update: {},
      create: { name: renter.name, email: renter.email, passwordHash },
    });
  }

  for (const [index, spec] of MACHINES.entries()) {
    const owner = ownerRecords[spec.ownerIndex];
    const categoryId = categoryIdBySlug.get(spec.categorySlug);
    if (!owner || !categoryId) continue;

    const machineId = `seed-machine-${index}`;
    const slug = `${slugify(spec.title)}-${index}`;

    const machine = await prisma.machine.upsert({
      where: { id: machineId },
      update: {
        slug,
        recommendedCrops: [...spec.recommendedCrops],
        deliveryRadiusKm: spec.deliveryRadiusKm,
        deliveryPricePerKmInCents: spec.deliveryPricePerKmInCents,
        deliveryBaseFeeInCents: spec.deliveryBaseFeeInCents,
      },
      create: {
        id: machineId,
        ownerId: owner.userId,
        propertyId: owner.propertyId,
        categoryId,
        title: spec.title,
        slug,
        brand: spec.brand,
        model: spec.model,
        manufactureYear: spec.manufactureYear,
        description: spec.description,
        condition: spec.condition,
        recommendedCrops: [...spec.recommendedCrops],
        requiresOperator: spec.requiresOperator,
        dailyPriceInCents: spec.dailyPriceInCents,
        deliveryRadiusKm: spec.deliveryRadiusKm,
        deliveryPricePerKmInCents: spec.deliveryPricePerKmInCents,
        deliveryBaseFeeInCents: spec.deliveryBaseFeeInCents,
        status: "ACTIVE",
      },
    });

    const machineImages = MACHINE_IMAGES[index];
    if (!machineImages) continue;
    const [primaryImage, secondaryImage] = machineImages;
    await prisma.machineImage.deleteMany({ where: { machineId: machine.id } });
    await prisma.machineImage.createMany({
      data: [
        {
          machineId: machine.id,
          url: wikimediaFilePath(primaryImage),
          altText: spec.title,
          position: 0,
        },
        {
          machineId: machine.id,
          url: wikimediaFilePath(secondaryImage),
          altText: spec.title,
          position: 1,
        },
      ],
    });
  }

  console.log("Seed concluído.");
  console.log(`Admin: ${admin.email} / senha: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

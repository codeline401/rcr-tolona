// prisma/seed.ts
// Script d'import des données géographiques de Madagascar.
// Lancer avec : npx ts-node prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import fs from "fs";
import path from "path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Chemin vers les fixtures Django (à ajuster selon ton projet)
// Copie les fichiers JSON depuis rcr-django/rcr/fixtures/ dans backend/prisma/fixtures/
const FIXTURES_DIR = path.join(__dirname, "fixtures");

async function main() {
  console.log("🌱 Début du seed géographique...");

  // Charger le fichier Districts.json de Django
  // Format Django : [{ "model": "mada.district", "pk": 1, "fields": { "name": "...", ... } }]
  const districtsPath = path.join(FIXTURES_DIR, "Districts.json");

  if (!fs.existsSync(districtsPath)) {
    console.log("⚠️  Fichier Districts.json introuvable dans prisma/fixtures/");
    console.log("   Copie les fichiers depuis rcr-django/rcr/fixtures/");
    return;
  }

  const rawDistricts = JSON.parse(fs.readFileSync(districtsPath, "utf-8"));
  console.log(`   → ${rawDistricts.length} districts trouvés`);

  // TODO: adapter selon la structure exacte des fixtures Django
  // Pour l'instant on crée des données de test manuellement

  // Créer une province de test
  const province = await prisma.province.upsert({
    where: { name: "Analamanga" },
    update: {},
    create: { name: "Analamanga" },
  });

  // Créer une région de test
  const region = await prisma.region.upsert({
    where: { name: "Analamanga" },
    update: {},
    create: {
      name: "Analamanga",
      code: "A",
      order: 1,
      provinceId: province.id,
    },
  });

  // Créer un district de test
  await prisma.district.upsert({
    where: { name: "Antananarivo Renivohitra" },
    update: {},
    create: {
      name: "Antananarivo Renivohitra",
      code: "1",
      isValid: true,
      regionId: region.id,
    },
  });

  console.log("✅ Seed terminé");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

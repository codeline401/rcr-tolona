// prisma/seed.ts
// Script d'import des données géographiques de Madagascar + création des utilisateurs de test.
// Lancer avec : npx ts-node prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
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

  console.log("✅ Seed géographique terminé");

  await seedUsers();

  console.log("\n✅ Seed complet terminé");
}

async function seedUsers() {
  console.log("\n👤 Création des utilisateurs de test...");

  const adminPassword = await bcrypt.hash("Admin1234!", 12);
  const memberPassword = await bcrypt.hash("Member1234!", 12);

  // Compte super-administrateur
  const admin = await prisma.user.upsert({
    where: { email: "admin@rcr.mg" },
    update: {},
    create: {
      email: "admin@rcr.mg",
      password: adminPassword,
      isActive: true,
      isStaff: true,
      isSuperuser: true,
    },
  });
  console.log(`   ✅ Admin créé : ${admin.email}`);

  // Compte modérateur
  const staff = await prisma.user.upsert({
    where: { email: "staff@rcr.mg" },
    update: {},
    create: {
      email: "staff@rcr.mg",
      password: memberPassword,
      isActive: true,
      isStaff: true,
      isSuperuser: false,
    },
  });
  console.log(`   ✅ Staff créé  : ${staff.email}`);

  console.log("\n🔑 Identifiants de test :");
  console.log("   admin@rcr.mg  →  Admin1234!");
  console.log("   staff@rcr.mg  →  Member1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

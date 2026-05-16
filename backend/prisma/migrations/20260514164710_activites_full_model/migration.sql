/*
  Warnings:

  - You are about to drop the column `title` on the `Activite` table. All the data in the column will be lost.
  - Added the required column `titre` to the `Activite` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Activite` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateFin` on table `Activite` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "EtapeStatut" AS ENUM ('non_demarre', 'en_cours', 'termine');

-- CreateEnum
CREATE TYPE "ContributionStatut" AS ENUM ('en_attente', 'valide', 'annule', 'rembourse');

-- AlterTable: Step 1 — add new columns; titre nullable to allow data migration
ALTER TABLE "Activite"
ADD COLUMN     "budgetPrevu" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "canceled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canceledById" TEXT,
ADD COLUMN     "districtId" TEXT,
ADD COLUMN     "finished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "objectifFinancement" DECIMAL(12,2),
ADD COLUMN     "responsableId" TEXT,
ADD COLUMN     "titre" TEXT;

-- AlterTable: Step 2 — migrate existing data before setting NOT NULL
UPDATE "Activite" SET "titre" = COALESCE("title", 'Sans titre') WHERE "titre" IS NULL;
UPDATE "Activite" SET "description" = '' WHERE "description" IS NULL;
UPDATE "Activite" SET "dateFin" = "dateDebut" + INTERVAL '1 day' WHERE "dateFin" IS NULL;

-- AlterTable: Step 3 — drop old column and enforce NOT NULL constraints
ALTER TABLE "Activite"
DROP COLUMN "title",
ALTER COLUMN "titre" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT '',
ALTER COLUMN "dateFin" SET NOT NULL;

-- CreateTable
CREATE TABLE "Etape" (
    "id" TEXT NOT NULL,
    "activiteId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "statut" "EtapeStatut" NOT NULL DEFAULT 'non_demarre',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Etape_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Etape_valid_dates_check" CHECK ("dateFin" >= "dateDebut")
);

-- CreateTable
CREATE TABLE "PosteBudget" (
    "id" TEXT NOT NULL,
    "activiteId" TEXT NOT NULL,
    "nomPoste" TEXT NOT NULL,
    "montantPrevu" DECIMAL(12,2) NOT NULL,
    "montantReel" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PosteBudget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL,
    "activiteId" TEXT NOT NULL,
    "contributeurId" TEXT,
    "nomAnonyme" TEXT,
    "emailAnonyme" TEXT,
    "montant" DECIMAL(12,2) NOT NULL,
    "referencePaiement" TEXT,
    "preuvePaiement" TEXT,
    "statut" "ContributionStatut" NOT NULL DEFAULT 'en_attente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Activite" ADD CONSTRAINT "Activite_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Membre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activite" ADD CONSTRAINT "Activite_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activite" ADD CONSTRAINT "Activite_canceledById_fkey" FOREIGN KEY ("canceledById") REFERENCES "Membre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etape" ADD CONSTRAINT "Etape_activiteId_fkey" FOREIGN KEY ("activiteId") REFERENCES "Activite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosteBudget" ADD CONSTRAINT "PosteBudget_activiteId_fkey" FOREIGN KEY ("activiteId") REFERENCES "Activite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_activiteId_fkey" FOREIGN KEY ("activiteId") REFERENCES "Activite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_contributeurId_fkey" FOREIGN KEY ("contributeurId") REFERENCES "Membre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "activite_responsableid_idx" ON "Activite"("responsableId");
CREATE INDEX "activite_districtid_idx" ON "Activite"("districtId");
CREATE INDEX "activite_canceledbyid_idx" ON "Activite"("canceledById");
CREATE INDEX "etape_activiteid_idx" ON "Etape"("activiteId");
CREATE INDEX "postebudget_activiteid_idx" ON "PosteBudget"("activiteId");
CREATE INDEX "contribution_activiteid_idx" ON "Contribution"("activiteId");
CREATE INDEX "contribution_contributeurid_idx" ON "Contribution"("contributeurId");

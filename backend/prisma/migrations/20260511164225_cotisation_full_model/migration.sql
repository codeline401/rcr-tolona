/*
  Warnings:

  - You are about to drop the `Tranche` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[membreId,typeCotisationId,campagneId]` on the table `Cotisation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Tranche" DROP CONSTRAINT "Tranche_cotisationId_fkey";

-- DropTable
DROP TABLE "Tranche";

-- CreateTable
CREATE TABLE "TrancheCotisation" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "dateEcheance" TIMESTAMP(3),
    "payee" BOOLEAN NOT NULL DEFAULT false,
    "cotisationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrancheCotisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaiementCotisation" (
    "id" TEXT NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "datePaiement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moyenPaiement" TEXT NOT NULL DEFAULT 'ESPECES',
    "reference" TEXT,
    "estValide" BOOLEAN NOT NULL DEFAULT true,
    "cotisationId" TEXT NOT NULL,
    "trancheId" TEXT,
    "enregistreParId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaiementCotisation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrancheCotisation_cotisationId_numero_key" ON "TrancheCotisation"("cotisationId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "Cotisation_membreId_typeCotisationId_campagneId_key" ON "Cotisation"("membreId", "typeCotisationId", "campagneId");

-- AddForeignKey
ALTER TABLE "TrancheCotisation" ADD CONSTRAINT "TrancheCotisation_cotisationId_fkey" FOREIGN KEY ("cotisationId") REFERENCES "Cotisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaiementCotisation" ADD CONSTRAINT "PaiementCotisation_cotisationId_fkey" FOREIGN KEY ("cotisationId") REFERENCES "Cotisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaiementCotisation" ADD CONSTRAINT "PaiementCotisation_trancheId_fkey" FOREIGN KEY ("trancheId") REFERENCES "TrancheCotisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaiementCotisation" ADD CONSTRAINT "PaiementCotisation_enregistreParId_fkey" FOREIGN KEY ("enregistreParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

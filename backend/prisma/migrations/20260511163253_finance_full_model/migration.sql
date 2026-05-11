/*
  Warnings:

  - You are about to drop the column `note` on the `TransactionFinanciere` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reference]` on the table `TransactionFinanciere` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reference` to the `TransactionFinanciere` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Membre" ALTER COLUMN "hasUser" SET DEFAULT false;

-- AlterTable
ALTER TABLE "TransactionFinanciere" DROP COLUMN "note",
ADD COLUMN     "annule" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cotisationId" TEXT,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "paiementCotisationId" TEXT,
ADD COLUMN     "reference" TEXT NOT NULL,
ADD COLUMN     "transactionSourceId" TEXT;

-- CreateTable
CREATE TABLE "RepartitionCotisation" (
    "id" TEXT NOT NULL,
    "montantTotal" DECIMAL(15,2) NOT NULL,
    "partDistrict" DECIMAL(15,2) NOT NULL,
    "partRegion" DECIMAL(15,2) NOT NULL,
    "partNationale" DECIMAL(15,2) NOT NULL,
    "paiementId" TEXT NOT NULL,
    "districtId" TEXT,
    "regionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepartitionCotisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletUtilisateur" (
    "id" TEXT NOT NULL,
    "solde" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "utilisateurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletUtilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MouvementWallet" (
    "id" TEXT NOT NULL,
    "sens" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "reference" TEXT NOT NULL,
    "description" TEXT,
    "walletId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MouvementWallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RepartitionCotisation_paiementId_key" ON "RepartitionCotisation"("paiementId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletUtilisateur_utilisateurId_key" ON "WalletUtilisateur"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "MouvementWallet_reference_key" ON "MouvementWallet"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionFinanciere_reference_key" ON "TransactionFinanciere"("reference");

-- AddForeignKey
ALTER TABLE "TransactionFinanciere" ADD CONSTRAINT "TransactionFinanciere_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionFinanciere" ADD CONSTRAINT "TransactionFinanciere_transactionSourceId_fkey" FOREIGN KEY ("transactionSourceId") REFERENCES "TransactionFinanciere"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepartitionCotisation" ADD CONSTRAINT "RepartitionCotisation_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepartitionCotisation" ADD CONSTRAINT "RepartitionCotisation_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletUtilisateur" ADD CONSTRAINT "WalletUtilisateur_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouvementWallet" ADD CONSTRAINT "MouvementWallet_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "WalletUtilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "ElectionConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Config globale',
    "dateLimite" TIMESTAMP(3),
    "paysId" TEXT,
    "regionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ElectionConfig_name_paysId_regionId_key" ON "ElectionConfig"("name", "paysId", "regionId");

-- AddForeignKey
ALTER TABLE "RepartitionCotisation" ADD CONSTRAINT "RepartitionCotisation_paiementId_fkey" FOREIGN KEY ("paiementId") REFERENCES "PaiementCotisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectionConfig" ADD CONSTRAINT "ElectionConfig_paysId_fkey" FOREIGN KEY ("paysId") REFERENCES "Pays"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectionConfig" ADD CONSTRAINT "ElectionConfig_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

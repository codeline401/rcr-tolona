-- CreateTable
CREATE TABLE "Province" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "order" INTEGER,
    "provinceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT false,
    "isArrondissement" BOOLEAN NOT NULL DEFAULT false,
    "regionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commune" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commune_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fokontany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "communeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fokontany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adresse" (
    "id" TEXT NOT NULL,
    "districtId" TEXT,
    "fokontanyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Adresse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isStaff" BOOLEAN NOT NULL DEFAULT false,
    "isSuperuser" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "resetPasswordToken" TEXT,
    "resetPasswordExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pays" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "drapeau" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membre" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "sexe" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "cin" TEXT NOT NULL,
    "passeport" TEXT,
    "nationaliteId" TEXT,
    "adresseId" TEXT,
    "adresseEtranger" TEXT,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "formationRcr" BOOLEAN NOT NULL DEFAULT false,
    "anneeDecouverte" TEXT NOT NULL,
    "canalDecouverte" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "attentes" TEXT,
    "niveauEtude" TEXT NOT NULL,
    "metier" TEXT NOT NULL,
    "secteurActivite" TEXT,
    "engagement" TEXT NOT NULL,
    "membreActif" BOOLEAN NOT NULL DEFAULT true,
    "partageContacts" BOOLEAN NOT NULL DEFAULT false,
    "statut" TEXT NOT NULL DEFAULT 'actif',
    "canVote" BOOLEAN NOT NULL DEFAULT false,
    "photo" TEXT,
    "codeRegion" TEXT,
    "codeDistrict" TEXT,
    "codeDivision" TEXT,
    "divisionNumber" INTEGER,
    "divisionAlphanumeric" TEXT,
    "registrationNumber" TEXT,
    "isRegistrationNumberDefinitive" BOOLEAN NOT NULL DEFAULT false,
    "oldRegistrationNumber" TEXT,
    "dateRegistrationNumber" TIMESTAMP(3),
    "validityStatus" INTEGER NOT NULL DEFAULT 1,
    "treatedById" TEXT,
    "treatedAt" TIMESTAMP(3),
    "validityLastComment" TEXT NOT NULL DEFAULT '',
    "validityHistoryComment" JSONB NOT NULL DEFAULT '[]',
    "isExcluded" BOOLEAN NOT NULL DEFAULT false,
    "excludedById" TEXT,
    "excludedAt" TIMESTAMP(3),
    "utilisateurId" TEXT,
    "hasUser" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampagneCotisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateFin" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampagneCotisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeCotisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "montantFixe" DECIMAL(10,2),
    "nombreTranche" INTEGER NOT NULL DEFAULT 1,
    "obligatoire" BOOLEAN NOT NULL DEFAULT true,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "isNewVersion" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypeCotisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cotisation" (
    "id" TEXT NOT NULL,
    "montantTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "membreId" TEXT NOT NULL,
    "typeCotisationId" TEXT NOT NULL,
    "campagneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cotisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tranche" (
    "id" TEXT NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "datePaiement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "cotisationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tranche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompteFinancier" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "solde" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "membreId" TEXT,
    "districtId" TEXT,
    "paysId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompteFinancier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionFinanciere" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "note" TEXT,
    "compteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionFinanciere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "illustration" TEXT,
    "excerpt" TEXT,
    "body" TEXT NOT NULL,
    "publish" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DF',
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Election" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "afficherResultats" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Election_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Choice" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "description" TEXT,
    "electionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Choice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "token" TEXT,
    "electionId" TEXT NOT NULL,
    "userId" TEXT,
    "choiceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoteToken" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "electionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoteToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activite" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "lieu" TEXT,
    "illustration" TEXT,
    "publique" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Province_name_key" ON "Province"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Region_name_key" ON "Region"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Region_code_key" ON "Region"("code");

-- CreateIndex
CREATE UNIQUE INDEX "District_name_key" ON "District"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pays_name_key" ON "Pays"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Membre_cin_key" ON "Membre"("cin");

-- CreateIndex
CREATE UNIQUE INDEX "Membre_registrationNumber_key" ON "Membre"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Membre_utilisateurId_key" ON "Membre"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "CampagneCotisation_name_key" ON "CampagneCotisation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TypeCotisation_name_key" ON "TypeCotisation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CompteFinancier_nom_key" ON "CompteFinancier"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "CompteFinancier_membreId_key" ON "CompteFinancier"("membreId");

-- CreateIndex
CREATE UNIQUE INDEX "CompteFinancier_districtId_key" ON "CompteFinancier"("districtId");

-- CreateIndex
CREATE UNIQUE INDEX "CompteFinancier_paysId_key" ON "CompteFinancier"("paysId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Election_slug_key" ON "Election"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_electionId_userId_key" ON "Vote"("electionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "VoteToken_code_key" ON "VoteToken"("code");

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commune" ADD CONSTRAINT "Commune_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fokontany" ADD CONSTRAINT "Fokontany_communeId_fkey" FOREIGN KEY ("communeId") REFERENCES "Commune"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adresse" ADD CONSTRAINT "Adresse_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adresse" ADD CONSTRAINT "Adresse_fokontanyId_fkey" FOREIGN KEY ("fokontanyId") REFERENCES "Fokontany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membre" ADD CONSTRAINT "Membre_nationaliteId_fkey" FOREIGN KEY ("nationaliteId") REFERENCES "Pays"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membre" ADD CONSTRAINT "Membre_adresseId_fkey" FOREIGN KEY ("adresseId") REFERENCES "Adresse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membre" ADD CONSTRAINT "Membre_treatedById_fkey" FOREIGN KEY ("treatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membre" ADD CONSTRAINT "Membre_excludedById_fkey" FOREIGN KEY ("excludedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membre" ADD CONSTRAINT "Membre_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membre" ADD CONSTRAINT "Membre_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cotisation" ADD CONSTRAINT "Cotisation_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "Membre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cotisation" ADD CONSTRAINT "Cotisation_typeCotisationId_fkey" FOREIGN KEY ("typeCotisationId") REFERENCES "TypeCotisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cotisation" ADD CONSTRAINT "Cotisation_campagneId_fkey" FOREIGN KEY ("campagneId") REFERENCES "CampagneCotisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tranche" ADD CONSTRAINT "Tranche_cotisationId_fkey" FOREIGN KEY ("cotisationId") REFERENCES "Cotisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompteFinancier" ADD CONSTRAINT "CompteFinancier_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "Membre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompteFinancier" ADD CONSTRAINT "CompteFinancier_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompteFinancier" ADD CONSTRAINT "CompteFinancier_paysId_fkey" FOREIGN KEY ("paysId") REFERENCES "Pays"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionFinanciere" ADD CONSTRAINT "TransactionFinanciere_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "CompteFinancier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Choice" ADD CONSTRAINT "Choice_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "Choice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteToken" ADD CONSTRAINT "VoteToken_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

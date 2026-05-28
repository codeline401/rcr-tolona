// ─── API Response wrapper ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  meta?: PaginationMeta
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'MODERATOR' | 'MEMBER'

export interface User {
  id: string
  email: string
  role: UserRole
  membreId?: string
  createdAt: string
}

export interface AuthTokenPayload {
  token: string
  user: User
}

// ─── Membre ───────────────────────────────────────────────────────────────────
export type MembreStatut = 'ACTIF' | 'INACTIF' | 'SUSPENDU' | 'EXCLU'
export type Genre = 'MASCULIN' | 'FEMININ' | 'AUTRE'

export interface Membre {
  id: string
  matricule: string
  nom: string
  prenom: string
  email?: string
  telephone?: string
  genre?: Genre
  dateNaissance?: string
  adresse?: string
  photo?: string
  statut: MembreStatut
  dateAdhesion: string
  createdAt: string
  updatedAt: string
}

// ─── Cotisation ───────────────────────────────────────────────────────────────
export type CotisationStatut = 'EN_COURS' | 'TERMINEE' | 'ANNULEE'
export type PaiementStatut = 'EN_ATTENTE' | 'VALIDE' | 'INVALIDE'

export interface Campagne {
  id: string
  nom: string
  annee: number
  statut: CotisationStatut
  montantCible: number
  createdAt: string
}

export interface Cotisation {
  id: string
  membreId: string
  campagneId: string
  montant: number
  statut: PaiementStatut
  datePaiement?: string
  createdAt: string
  membre?: Membre
  campagne?: Campagne
}

// ─── Finance ──────────────────────────────────────────────────────────────────
export type TransactionType = 'CREDIT' | 'DEBIT'

export interface Compte {
  id: string
  nom: string
  solde: number
  createdAt: string
}

export interface Transaction {
  id: string
  compteId: string
  type: TransactionType
  montant: number
  libelle: string
  date: string
  createdAt: string
  compte?: Compte
}

// ─── Blog ─────────────────────────────────────────────────────────────────────
export interface Article {
  id: string
  titre: string
  slug: string
  corps: string
  illustration?: string
  publie: boolean
  auteurId: string
  createdAt: string
  updatedAt: string
}

// ─── Voting ───────────────────────────────────────────────────────────────────
export type ElectionStatut = 'BROUILLON' | 'OUVERTE' | 'FERMEE' | 'ARCHIVEE'

export interface Election {
  id: string
  titre: string
  description?: string
  statut: ElectionStatut
  dateOuverture?: string
  dateFermeture?: string
  createdAt: string
}

// ─── Activité ─────────────────────────────────────────────────────────────────
export type ActiviteStatut = 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE'

export interface Activite {
  id: string
  titre: string
  description?: string
  statut: ActiviteStatut
  dateDebut?: string
  dateFin?: string
  budgetPrevu?: number
  createdAt: string
}

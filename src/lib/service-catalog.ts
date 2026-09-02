/**
 * Catalogue des services Assirik — types + constantes partagées.
 *
 * Ce module NE MARQUE PAS "use server" : il ne contient que des
 * constantes de référence et des types, qui peuvent être importés à la
 * fois par des Server Components (ex: pages publiques) et par des Client
 * Components (ex: formulaires admin) sans violer la règle Next.js
 * "A 'use server' file can only export async functions".
 *
 * Toute logique d'écriture liée aux services (create, update, delete,
 * reorder, toggleActive) reste dans `src/lib/service-actions.ts` qui,
 * lui, est marqué "use server".
 */

export const SERVICE_CATEGORIES = [
  "VISA",
  "HOTELS",
  "CHAUFFEUR",
  "ASSURANCE",
  "TRANSFERT",
  "ENTREPRISE",
  "AUTRE",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const SERVICE_ICONS = [
  "stamp",
  "hotel",
  "car",
  "shield",
  "transfer",
  "briefcase",
  "compass",
  "users",
  "card",
] as const;

export type ServiceIcon = (typeof SERVICE_ICONS)[number];

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  VISA: "Assistance visa",
  HOTELS: "Hôtels",
  CHAUFFEUR: "Véhicule avec chauffeur",
  ASSURANCE: "Assurance voyage",
  TRANSFERT: "Transferts aéroport",
  ENTREPRISE: "Sur-mesure entreprise",
  AUTRE: "Autre",
};

/**
 * Curated airport list for the autocomplete. Covers:
 *   - West Africa + Senegal primary
 *   - Main diaspora destinations (France, Belgium, Italy, Spain, USA, Canada)
 *   - Omra / Middle East (Jeddah, Medina, Dubai, Doha, Istanbul)
 *   - Other commonly-served airports
 *
 * IATA codes only (Kiwi expects them). Keep the list ~80 entries — anything
 * bigger needs an API like /locations/query.
 */
export type Airport = {
  code: string; // IATA
  city: string;
  cityEn?: string;
  country: string;
  countryEn?: string;
};

export const POPULAR_AIRPORTS: Airport[] = [
  // Sénégal
  { code: "DSS", city: "Dakar", cityEn: "Dakar", country: "Sénégal", countryEn: "Senegal" },
  // Afrique de l'Ouest
  { code: "ABJ", city: "Abidjan", cityEn: "Abidjan", country: "Côte d'Ivoire", countryEn: "Ivory Coast" },
  { code: "ACC", city: "Accra", cityEn: "Accra", country: "Ghana", countryEn: "Ghana" },
  { code: "LOS", city: "Lagos", cityEn: "Lagos", country: "Nigeria", countryEn: "Nigeria" },
  { code: "CMN", city: "Casablanca", cityEn: "Casablanca", country: "Maroc", countryEn: "Morocco" },
  { code: "RAK", city: "Marrakech", cityEn: "Marrakech", country: "Maroc", countryEn: "Morocco" },
  { code: "TUN", city: "Tunis", cityEn: "Tunis", country: "Tunisie", countryEn: "Tunisia" },
  { code: "ALG", city: "Alger", cityEn: "Algiers", country: "Algérie", countryEn: "Algeria" },
  { code: "BKO", city: "Bamako", cityEn: "Bamako", country: "Mali", countryEn: "Mali" },
  { code: "OUA", city: "Ouagadougou", cityEn: "Ouagadougou", country: "Burkina Faso", countryEn: "Burkina Faso" },
  { code: "NIM", city: "Niamey", cityEn: "Niamey", country: "Niger", countryEn: "Niger" },
  { code: "CKY", city: "Conakry", cityEn: "Conakry", country: "Guinée", countryEn: "Guinea" },
  { code: "ROB", city: "Monrovia", cityEn: "Monrovia", country: "Liberia", countryEn: "Liberia" },
  { code: "DKR", city: "Dakar", cityEn: "Dakar", country: "Sénégal", countryEn: "Senegal" },
  // Afrique Centrale / Est
  { code: "ADD", city: "Addis-Abeba", cityEn: "Addis Ababa", country: "Éthiopie", countryEn: "Ethiopia" },
  { code: "NBO", city: "Nairobi", cityEn: "Nairobi", country: "Kenya", countryEn: "Kenya" },
  { code: "KGL", city: "Kigali", cityEn: "Kigali", country: "Rwanda", countryEn: "Rwanda" },
  { code: "LBV", city: "Libreville", country: "Gabon", countryEn: "Gabon" },
  { code: "DLA", city: "Douala", country: "Cameroun", countryEn: "Cameroon" },
  { code: "FIH", city: "Kinshasa", country: "RDC", countryEn: "DR Congo" },
  { code: "PNR", city: "Pointe-Noire", country: "Congo", countryEn: "Congo" },
  // Europe (diaspora)
  { code: "CDG", city: "Paris", cityEn: "Paris", country: "France", countryEn: "France" },
  { code: "ORY", city: "Paris (Orly)", cityEn: "Paris (Orly)", country: "France", countryEn: "France" },
  { code: "MRS", city: "Marseille", cityEn: "Marseille", country: "France", countryEn: "France" },
  { code: "LYS", city: "Lyon", cityEn: "Lyon", country: "France", countryEn: "France" },
  { code: "BVA", city: "Paris (Beauvais)", cityEn: "Paris (Beauvais)", country: "France", countryEn: "France" },
  { code: "NTE", city: "Nantes", cityEn: "Nantes", country: "France", countryEn: "France" },
  { code: "BRU", city: "Bruxelles", cityEn: "Brussels", country: "Belgique", countryEn: "Belgium" },
  { code: "AMS", city: "Amsterdam", country: "Pays-Bas", countryEn: "Netherlands" },
  { code: "FRA", city: "Francfort", cityEn: "Frankfurt", country: "Allemagne", countryEn: "Germany" },
  { code: "MUC", city: "Munich", country: "Allemagne", countryEn: "Germany" },
  { code: "BER", city: "Berlin", country: "Allemagne", countryEn: "Germany" },
  { code: "MAD", city: "Madrid", country: "Espagne", countryEn: "Spain" },
  { code: "BCN", city: "Barcelone", cityEn: "Barcelona", country: "Espagne", countryEn: "Spain" },
  { code: "FCO", city: "Rome", country: "Italie", countryEn: "Italy" },
  { code: "MXP", city: "Milan", country: "Italie", countryEn: "Italy" },
  { code: "VIE", city: "Vienne", country: "Autriche", countryEn: "Austria" },
  { code: "ZRH", city: "Zurich", country: "Suisse", countryEn: "Switzerland" },
  { code: "GVA", city: "Genève", country: "Suisse", countryEn: "Switzerland" },
  { code: "LHR", city: "Londres", cityEn: "London", country: "Royaume-Uni", countryEn: "United Kingdom" },
  { code: "LGW", city: "Londres (Gatwick)", country: "Royaume-Uni", countryEn: "United Kingdom" },
  { code: "IST", city: "Istanbul", country: "Turquie", countryEn: "Turkey" },
  { code: "SAW", city: "Istanbul (Sabiha)", country: "Turquie", countryEn: "Turkey" },
  // Moyen-Orient (Omra + business)
  { code: "JED", city: "Djeddah", cityEn: "Jeddah", country: "Arabie saoudite", countryEn: "Saudi Arabia" },
  { code: "MED", city: "Médine", cityEn: "Medina", country: "Arabie saoudite", countryEn: "Saudi Arabia" },
  { code: "RUH", city: "Riyad", cityEn: "Riyadh", country: "Arabie saoudite", countryEn: "Saudi Arabia" },
  { code: "DXB", city: "Dubaï", cityEn: "Dubai", country: "Émirats arabes unis", countryEn: "UAE" },
  { code: "AUH", city: "Abu Dhabi", country: "Émirats arabes unis", countryEn: "UAE" },
  { code: "DOH", city: "Doha", country: "Qatar", countryEn: "Qatar" },
  { code: "CAI", city: "Le Caire", cityEn: "Cairo", country: "Égypte", countryEn: "Egypt" },
  { code: "AMM", city: "Amman", country: "Jordanie", countryEn: "Jordan" },
  // Amérique du Nord
  { code: "JFK", city: "New York", country: "États-Unis", countryEn: "United States" },
  { code: "EWR", city: "Newark", country: "États-Unis", countryEn: "United States" },
  { code: "IAD", city: "Washington", country: "États-Unis", countryEn: "United States" },
  { code: "ATL", city: "Atlanta", country: "États-Unis", countryEn: "United States" },
  { code: "MIA", city: "Miami", country: "États-Unis", countryEn: "United States" },
  { code: "YUL", city: "Montréal", cityEn: "Montreal", country: "Canada", countryEn: "Canada" },
  { code: "YYZ", city: "Toronto", country: "Canada", countryEn: "Canada" },
  // Asie
  { code: "BKK", city: "Bangkok", country: "Thaïlande", countryEn: "Thailand" },
  { code: "PEK", city: "Pékin", cityEn: "Beijing", country: "Chine", countryEn: "China" },
  { code: "PVG", city: "Shanghai", country: "Chine", countryEn: "China" },
  { code: "DEL", city: "New Delhi", country: "Inde", countryEn: "India" },
];

export function searchAirports(query: string, locale: "fr" | "en" = "fr"): Airport[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return POPULAR_AIRPORTS.slice(0, 20);
  return POPULAR_AIRPORTS.filter((a) => {
    const haystack = [
      a.code,
      a.city,
      a.cityEn ?? "",
      a.country,
      a.countryEn ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  }).slice(0, 20);
}

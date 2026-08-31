/**
 * Seed for the FaqItem table — 8 FR + 8 EN, covering the 6 categories
 * (general, payment, visa, flight, omra, services) plus a couple extra to
 * round out the catalogue. Idempotent — re-running the script upserts on
 * (locale, category, order).
 *
 * Usage: pnpm tsx scripts/seed-faq.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Locale = "fr" | "en";

type Seed = {
  locale: Locale;
  category: "general" | "payment" | "visa" | "flight" | "omra" | "services";
  question: string;
  answer: string;
  order: number;
  isActive?: boolean;
};

const seeds: Seed[] = [
  // ───────────── French ─────────────
  {
    locale: "fr",
    category: "general",
    question:
      "Depuis combien de temps Assirik Tours organise-t-elle des voyages ?",
    answer:
      "L'agence opère depuis 2009 à Dakar — plus de quinze ans d'expérience cumulée sur le Sénégal, l'Omra, le Maroc, la Turquie, Dubaï et l'Europe. Une grande partie de notre chiffre vient de clients qui reviennent ou qui nous sont recommandés par leur entourage diaspora.",
    order: 1,
  },
  {
    locale: "fr",
    category: "general",
    question: "Comment vous contacter en dehors des heures de bureau ?",
    answer:
      "Notre numéro WhatsApp Business (+221 77 549 53 14) reste ouvert 7j/7 pour les demandes urgentes — vols du lendemain, retards, RDV consulat imminent. Le fixe (+221 33 821 01 81) et l'e-mail (assiriktours@gmail.com) reprennent du service dès l'ouverture (8h30 lun-ven, 9h sam).",
    order: 2,
  },

  // Paiement
  {
    locale: "fr",
    category: "payment",
    question: "Quels modes de paiement acceptez-vous ?",
    answer:
      "Nous acceptons aujourd'hui la carte bancaire via Stripe (espèces Visa, Mastercard, Amex en ligne) et le dépôt / virement bancaire vers notre compte Société Générale Sénégal. **Le paiement mobile (Wave, Orange Money, Free Money) sera disponible très prochainement** — contactez-nous si vous voulez être prévenu dès l'ouverture. Les règlements sur place en espèces au siège restent possibles pour les dépôts initiaux.",
    order: 1,
  },
  {
    locale: "fr",
    category: "payment",
    question: "Comment fonctionne l'acompte ?",
    answer:
      "À la confirmation du devis, un acompte de **30 %** du montant total est demandé pour bloquer les réservations (vols et hôtels). Le solde est à régler **15 jours avant le départ** pour les séjours et **30 jours avant** pour les Omra et Hajj. Toute commande de dernière minute (< 30 jours) est payable en intégralité au moment de la confirmation.",
    order: 2,
  },

  // Visa
  {
    locale: "fr",
    category: "visa",
    question: "Quels sont les délais d'obtention d'un visa Schengen depuis Dakar ?",
    answer:
      "Pour la France, comptez **15 à 21 jours ouvrés** en 2025-2026 (variable selon la haute saison). Allemagne et Espagne : 21 à 30 jours. Belgique via TLScontact : 18 à 25 jours (gain de 2-3 jours grâce à la dématérialisation). Pour réduire les délais, déposez votre dossier 6 semaines avant la date de départ prévue, surtout en haute saison (juin-août).",
    order: 1,
  },
  {
    locale: "fr",
    category: "visa",
    question:
      "Que faire en cas de refus de visa après avoir réservé un voyage ?",
    answer:
      "Premier réflexe : ne pas annuler vous-même. Nous **réclamons le remboursement partiel** auprès des fournisseurs (compagnie aérienne + hôtel + assurance) selon leurs conditions. Les frais de visa et de dossier Assirik ne sont pas remboursables. Si une nouvelle demande est possible à court terme, nous retraitons votre dossier gratuitement dans les 90 jours.",
    order: 2,
  },

  // Flight
  {
    locale: "fr",
    category: "flight",
    question: "Vos prix de vols incluent-ils les bagages ?",
    answer:
      "Chaque devis indique explicitement la franchise (1 bagage cabine + 1 bagage en soute de 23 kg pour les long-courriers, 1 bagage cabine seul pour certaines low-cost). Nous lisons toujours cette ligne avec vous avant validation pour éviter les surprises au comptoir d'enregistrement.",
    order: 1,
  },

  // Omra
  {
    locale: "fr",
    category: "omra",
    question: "Quel budget prévoir pour une Omra Ramadan depuis Dakar en 2026 ?",
    answer:
      "Entre **1 400 000 et 1 900 000 FCFA** par personne en chambre double pour une Omra Ramadan de 10 jours (vol + hôtel 4★ à La Mecque et Médine + transferts + visa + assurance + Mahram si nécessaire). Hors Ramadan, comptez 25 à 35 % de moins. Hajj : budget moyen autour de 3 500 000 FCFA, variable selon la durée et la catégorie d'hôtel.",
    order: 1,
  },
  {
    locale: "fr",
    category: "omra",
    question: "Faut-il un Mahram pour les femmes ?",
    answer:
      "Pour l'Omra, la règle **Mahram obligatoire pour les femmes de moins de 45 ans** (selon la majorité des interprétations saoudiennes). Pour le Hajj, c'est obligatoire pour toutes les femmes sans exception, sauf cas particulier validé par l'ambassade. Nous établissons l'attestation Mahram nécessaire lors du dépôt du visa.",
    order: 2,
  },

  // Services
  {
    locale: "fr",
    category: "services",
    question: "Proposez-vous l'assurance voyage ?",
    answer:
      "Oui, l'assurance voyage (rapatriement + annulation + bagages) est incluse dans tous nos forfaits sauf mention contraire explicite sur le devis. Vous recevez la police PDF par e-mail dès le paiement du solde, en partenariat avec un courtier agréé CIMA et des assureurs reconnus (AXA, Allianz, etc.). Pour les visas Schengen, l'assurance fournie respecte le seuil minimum de 30 000 €.",
    order: 1,
  },
  {
    locale: "fr",
    category: "services",
    question:
      "Pouvez-vous gérer le transfert aéroport et les déplacements sur place ?",
    answer:
      "Oui. Sur Dakar nous opérons avec un réseau de chauffeurs partenaires (climatisé, véhicule berline ou minibus selon le nombre). Pour les destinations intérieures et internationales, le transfert aéroport ↔ hôtel est inclus dans le forfait. Pour des déplacements en cours de séjour (visites, excursions), nous ajustons le devis avec un véhicule privé sur demande.",
    order: 2,
  },
];

const seedsEN: Seed[] = [
  // ───────────── English ─────────────
  {
    locale: "en",
    category: "general",
    question: "How long has Assirik Tours been organising trips?",
    answer:
      "The agency has been operating from Dakar since 2009 — over fifteen years of cumulative experience across Senegal, Umrah, Morocco, Turkey, Dubai and Europe. A large share of our bookings comes from repeat customers and referrals from the Senegalese diaspora.",
    order: 1,
  },
  {
    locale: "en",
    category: "general",
    question: "How do I reach you outside office hours?",
    answer:
      "Our WhatsApp Business number (+221 77 549 53 14) is reachable 7 days a week for urgent requests — same-day flights, delays, looming consulate appointments. The landline (+221 33 821 01 81) and email (assiriktours@gmail.com) resume from opening time (8:30 Mon-Fri, 9:00 Sat).",
    order: 2,
  },

  {
    locale: "en",
    category: "payment",
    question: "Which payment methods do you accept?",
    answer:
      "Today we accept credit cards via Stripe (Visa, Mastercard, Amex online) and bank deposit or wire transfer to our Société Générale Sénégal account. **Mobile money (Wave, Orange Money, Free Money) is coming very soon** — drop us a note if you want a heads-up when it goes live. Cash payments at our office remain possible for initial deposits.",
    order: 1,
  },
  {
    locale: "en",
    category: "payment",
    question: "How does the deposit work?",
    answer:
      "On quote confirmation a **30 % deposit** secures the bookings (flights and hotels). The balance is due **15 days before departure** for regular stays and **30 days before** for Umrah and Hajj packages. Last-minute bookings (under 30 days) require payment in full at confirmation.",
    order: 2,
  },

  {
    locale: "en",
    category: "visa",
    question: "How long does a Schengen visa take from Dakar?",
    answer:
      "For France, expect **15 to 21 business days** in 2025-2026 (slower in high season). Germany and Spain run 21-30 days. Belgium via TLScontact: 18-25 days (the digitised process saves 2-3 days). To stay safe, lodge the file 6 weeks before departure, especially June-August.",
    order: 1,
  },
  {
    locale: "en",
    category: "visa",
    question: "What happens if my visa is refused after I booked a trip?",
    answer:
      "Do not cancel on your own. We claim the **partial refund** with the suppliers (airline + hotel + insurance) per their conditions. Visa fees and our file-handling fees are non-refundable. If a fresh application is feasible shortly after, we re-process your file free of charge within 90 days.",
    order: 2,
  },

  {
    locale: "en",
    category: "flight",
    question: "Do your flight prices include luggage?",
    answer:
      "Each quote states the allowance explicitly (1 cabin bag + 1 checked bag of 23 kg on long-hauls, 1 cabin-only on some low-cost fares). We always read this line with you before validation so there are no surprises at the check-in counter.",
    order: 1,
  },

  {
    locale: "en",
    category: "omra",
    question: "What budget should I plan for a Ramadan Umrah from Dakar in 2026?",
    answer:
      "Between **1,400,000 and 1,900,000 XOF** per person sharing a double room for a 10-day Ramadan Umrah (flights + 4★ hotel in Mecca and Medina + transfers + visa + insurance + Mahram where needed). Outside Ramadan, expect 25-35 % less. Hajj averages around 3,500,000 XOF depending on duration and hotel category.",
    order: 1,
  },
  {
    locale: "en",
    category: "omra",
    question: "Is a Mahram required for women?",
    answer:
      "For Umrah, a **Mahram is mandatory for women under 45** (according to the dominant Saudi interpretation). For Hajj, it is mandatory for all women without exception unless the embassy validates a specific case. We draft the Mahram attestation needed for the visa submission.",
    order: 2,
  },

  {
    locale: "en",
    category: "services",
    question: "Do you offer travel insurance?",
    answer:
      "Yes, travel insurance (repatriation + cancellation + luggage) is included in every package unless explicitly noted otherwise on the quote. You receive the PDF policy by email upon final payment, brokered by a CIMA-licensed intermediary with recognised underwriters (AXA, Allianz, etc.). For Schengen visas the policy meets the required 30 000 € minimum.",
    order: 1,
  },
  {
    locale: "en",
    category: "services",
    question: "Can you handle airport transfers and ground transport?",
    answer:
      "Yes. In Dakar we work with a network of partner drivers (air-conditioned sedan or minibus depending on headcount). For inland and international destinations, airport ↔ hotel transfer is included in the package. For in-trip mobility (sightseeing, excursions) we adjust the quote with a private vehicle on request.",
    order: 2,
  },
];

async function main() {
  let created = 0;
  let updated = 0;

  async function upsertOne(s: Seed) {
    const existing = await prisma.faqItem.findFirst({
      where: {
        locale: s.locale,
        category: s.category,
        order: s.order,
      },
    });
    if (existing) {
      await prisma.faqItem.update({
        where: { id: existing.id },
        data: {
          question: s.question,
          answer: s.answer,
          isActive: s.isActive ?? true,
        },
      });
      updated++;
    } else {
      await prisma.faqItem.create({
        data: {
          locale: s.locale,
          category: s.category,
          question: s.question,
          answer: s.answer,
          order: s.order,
          isActive: s.isActive ?? true,
        },
      });
      created++;
    }
  }

  for (const s of [...seeds, ...seedsEN]) {
    await upsertOne(s);
  }

  const total = await prisma.faqItem.count({ where: { isActive: true } });
  console.log(`✓ ${created} created, ${updated} updated · ${total} active total`);
  console.log("✓ Seed FAQ terminé");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

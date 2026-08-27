# Guide opérateur Assirik Tours — utilisation quotidienne du back-office

> À lire par toute l'équipe qui gère les voyages. Pour les questions techniques (déploiement, CI, migrations), voir le `README.md` racine.

## Connexion

1. Allez sur `https://assiriktours.sn/admin`.
2. Saisissez votre email + mot de passe.
3. Si vous avez activé la 2FA (fortement recommandé pour le super-admin), saisissez le code à 6 chiffres de votre application d'authentification.
4. Pour activer la 2FA : rendez-vous dans **Paramètres → Mon compte → Activer la 2FA**.

## Au quotidien

### Traiter une nouvelle demande (formulaire de contact)

1. Allez dans **Réservations** dans le menu de gauche.
2. Cliquez sur la ligne pour voir le détail (Prénom, Nom, email, message).
3. Recontactez la personne sur WhatsApp avec le bouton dédié.
4. Une fois le devis confirmé, changez le statut (`EN_COURS` → `CONFIRMEE` → `PAYEE`).

### Ajouter une destination

1. **Destinations → + Nouvelle destination**.
2. Renseignez : titre, slug (auto), région, résumé court, description longue.
3. Pour l'image principale : uploadez d'abord la photo dans **Médiathèque**, copiez le `public_id`, collez-le dans le champ `heroImageId`.
4. Cochez `Publié` pour rendre la fiche visible sur le site public.
5. Cochez `À la une** pour la faire apparaître sur la page d'accueil.

### Créer une offre / un forfait

1. **Offres → + Nouvelle offre**.
2. Sélectionnez la destination parente (à créer d'abord si besoin).
3. Renseignez : titre, type (Séjour / Circuit / Sur mesure / Omra / Hajj / Billetterie), prix FCFA, durée en jours, voyageurs max.
4. Même logique pour l'image de couverture via la **Médiathèque**.
5. Publiée → l'offre apparaît dans `/offres` et dans la page de sa destination.

### Suivre un dossier visa

1. **Dossiers visa → Nouveau dossier** (à gauche du tableau).
2. Renseignez : email + nom du client, destination, type de visa, frais, échéance.
3. La checklist des pièces à fournir est générée automatiquement selon la destination.
4. Au fur et à mesure des uploads (par le client ou par vous), cochez les pièces reçues.
5. Mettez à jour le statut au fil de l'eau : `Brouillon` → `Documents manquants` → `En traitement` → `Accepté / Refusé**.

### Consulter les rapports

1. **Rapports** dans le menu.
2. Vous voyez le CA encaissé (total / mois / année), le taux de conversion, le CA par destination, le pipeline par statut.
3. Utilisez cette page pour vos réunions mensuelles et pour identifier les destinations qui performent.

### Exporter la base clients

1. **Clients (CRM)** dans le menu.
2. Utilisez la barre de recherche pour filtrer par nom, email ou téléphone.
3. Cliquez sur **Exporter en CSV** pour télécharger la liste filtrée au format tableur.

### Modifier les informations de l'agence

1. **Paramètres → Identité agence**.
2. Vous pouvez modifier : numéro WhatsApp, téléphone fixe, email, adresse, horaires, réseaux sociaux.
3. Les changements sont propagés sur l'ensemble du site (footer, contact, page Contact).

## Cycle de vie d'une réservation

```
NOUVELLE (formulaire contact)
  → EN_COURS (devis envoyé)
  → CONFIRMEE (client a accepté + acompte reçu)
  → PAYEE (solde encaissé)
  → TERMINEE (voyage réalisé)

Une réservation peut aussi être ANNULEE à n'importe quelle étape.
```

## Notifications automatiques

À chaque nouvelle réservation, le back-office reçoit une notification interne. Pour l'instant, **les emails transactionnels** (confirmation au client, rappel paiement) ne sont pas encore câblés — Phase 2.

## Bonnes pratiques

- **Toujours renseigner l'email** d'un dossier visa (pour la liaison avec l'espace client).
- **Toujours publier** une offre avant de la partager sur WhatsApp / réseaux sociaux (sinon les clients verront une 404).
- **Marquer les offres phares `featured`** : elles apparaîtront sur la page d'accueil.
- **Compresser les photos avant upload** sur Cloudinary (max 2 MB, format JPG ou WebP, ratio 3:2 idéal pour les hero).

## Besoin d'aide

- Bug sur le site → ouvrez un ticket sur GitHub (issues).
- Question commerciale → envoyez un message WhatsApp à l'administrateur technique.
- Question sur la procédure → ce guide. Si quelque chose manque, proposez un ajout.

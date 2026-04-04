export interface QuestionOption {
  value: string;
  label: string;
  emoji?: string;
}

export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single' | 'multi';
  maxSelect?: number;
  options: QuestionOption[];
  hasOther: boolean;
}

export const PROPERTY_QUESTIONS: Question[] = [
  {
    id: 'sensation',
    title: 'Sensation dominante',
    subtitle: 'Je suis une maison…',
    type: 'single',
    hasOther: true,
    options: [
      { value: 'apaisante', label: 'Apaisante', emoji: '🧘' },
      { value: 'lumineuse', label: 'Lumineuse', emoji: '☀️' },
      { value: 'elegante', label: 'Élégante', emoji: '✨' },
      { value: 'chaleureuse', label: 'Chaleureuse', emoji: '🔥' },
      { value: 'inspirante', label: 'Inspirante', emoji: '💡' },
      { value: 'dynamique', label: 'Dynamique', emoji: '⚡' },
      { value: 'intimiste', label: 'Intimiste', emoji: '🌙' },
      { value: 'spectaculaire', label: 'Spectaculaire', emoji: '🤩' },
    ],
  },
  {
    id: 'ambiance',
    title: 'Ton ambiance au quotidien',
    type: 'single',
    hasOther: true,
    options: [
      { value: 'minimaliste', label: 'Minimaliste & ordonnée', emoji: '🪴' },
      { value: 'boheme', label: 'Bohème & détendue', emoji: '🌺' },
      { value: 'tropicale', label: 'Tropicale & vivante', emoji: '🌿' },
      { value: 'contemporaine', label: 'Contemporaine & nette', emoji: '🏙️' },
      { value: 'familiale', label: 'Familiale & pratique', emoji: '👨‍👩‍👧' },
      { value: 'artistique', label: 'Artistique & atypique', emoji: '🎨' },
    ],
  },
  {
    id: 'meilleur_moment',
    title: 'Ton meilleur moment',
    type: 'single',
    hasOther: true,
    options: [
      { value: 'lever_soleil', label: 'Lever du soleil', emoji: '🌅' },
      { value: 'milieu_journee', label: 'Milieu de journée', emoji: '☀️' },
      { value: 'fin_aprem', label: "Fin d'après-midi", emoji: '🌤️' },
      { value: 'coucher_soleil', label: 'Coucher du soleil', emoji: '🌇' },
      { value: 'soiree', label: 'Soirée', emoji: '🌆' },
      { value: 'nuit', label: 'Nuit', emoji: '🌙' },
    ],
  },
  {
    id: 'piece_signature',
    title: 'Ta pièce "signature"',
    type: 'single',
    hasOther: true,
    options: [
      { value: 'entree', label: 'Entrée / arrivée', emoji: '🚪' },
      { value: 'salon', label: 'Salon', emoji: '🛋️' },
      { value: 'cuisine', label: 'Cuisine', emoji: '🍳' },
      { value: 'suite_parentale', label: 'Suite parentale', emoji: '🛏️' },
      { value: 'chambres', label: 'Chambre(s)', emoji: '🛌' },
      { value: 'salle_bain', label: 'Salle de bain', emoji: '🛁' },
      { value: 'bureau', label: 'Bureau / espace pro', emoji: '💻' },
      { value: 'exterieur', label: 'Extérieur (terrasse/jardin)', emoji: '🌳' },
      { value: 'piscine', label: 'Piscine / pool area', emoji: '🏊' },
    ],
  },
  {
    id: 'premiere_impression',
    title: 'Première impression des visiteurs',
    type: 'multi',
    maxSelect: 2,
    hasOther: true,
    options: [
      { value: 'waouh', label: '"Waouh" (volume / architecture)', emoji: '😮' },
      { value: 'lumiere', label: 'Lumière', emoji: '💡' },
      { value: 'calme', label: 'Calme', emoji: '🤫' },
      { value: 'vue', label: 'Vue', emoji: '👀' },
      { value: 'finitions', label: 'Qualité des finitions', emoji: '💎' },
      { value: 'confort', label: 'Impression de confort', emoji: '🛋️' },
      { value: 'espace', label: "Impression d'espace", emoji: '🏠' },
    ],
  },
  {
    id: 'atout_fort',
    title: 'Ton atout le plus fort',
    type: 'single',
    hasOther: true,
    options: [
      { value: 'localisation', label: 'Localisation', emoji: '📍' },
      { value: 'vue', label: 'Vue', emoji: '🏔️' },
      { value: 'lumiere', label: 'Lumière naturelle', emoji: '☀️' },
      { value: 'volumes', label: 'Volumes / hauteur sous plafond', emoji: '📐' },
      { value: 'exterieurs', label: 'Extérieurs', emoji: '🌿' },
      { value: 'piscine', label: 'Piscine', emoji: '🏊' },
      { value: 'agencement', label: 'Agencement intelligent', emoji: '🧩' },
      { value: 'materiaux', label: 'Matériaux / finitions', emoji: '🪵' },
      { value: 'potentiel_locatif', label: 'Potentiel locatif', emoji: '💰' },
    ],
  },
  {
    id: 'particularite',
    title: 'Ta particularité assumée',
    subtitle: 'Le caractère',
    type: 'single',
    hasOther: true,
    options: [
      { value: 'atypique', label: 'Atypique / non standard', emoji: '🎭' },
      { value: 'acces', label: 'Accès particulier', emoji: '🛤️' },
      { value: 'voisinage', label: 'Voisinage proche', emoji: '🏘️' },
      { value: 'travaux', label: 'Quelques travaux / entretien', emoji: '🔧' },
      { value: 'style_marque', label: 'Style très marqué', emoji: '🎨' },
      { value: 'terrain_atypique', label: 'Terrain/extérieur atypique', emoji: '🌾' },
      { value: 'aucun', label: 'Aucun point particulier', emoji: '✅' },
    ],
  },
  {
    id: 'energie_sociale',
    title: 'Ton énergie sociale',
    type: 'single',
    hasOther: true,
    options: [
      { value: 'calme', label: 'Plutôt calme', emoji: '🧘' },
      { value: 'conviviale', label: 'Plutôt conviviale', emoji: '🎉' },
      { value: 'equilibre', label: 'Équilibre (calme + recevoir)', emoji: '⚖️' },
      { value: 'zones_separees', label: 'Dépend des espaces', emoji: '🏠' },
    ],
  },
  {
    id: 'accueil',
    title: "Ton accueil quand on entre",
    type: 'single',
    hasOther: true,
    options: [
      { value: 'cocon', label: 'Impression "cocon" immédiate', emoji: '🤗' },
      { value: 'luxe_discret', label: 'Impression "luxe discret"', emoji: '💎' },
      { value: 'ouverture', label: 'Impression "ouverture / respiration"', emoji: '🌬️' },
      { value: 'design', label: 'Impression "design / architecture"', emoji: '🏛️' },
      { value: 'maison_vie', label: 'Impression "maison de vie"', emoji: '🏡' },
    ],
  },
  {
    id: 'lien_exterieur',
    title: "Lien avec l'extérieur",
    type: 'single',
    hasOther: true,
    options: [
      { value: 'tres_ouverte', label: 'Très ouverte (dedans/dehors)', emoji: '🪟' },
      { value: 'exterieur_central', label: "Extérieur central (on y vit)", emoji: '🌳' },
      { value: 'exterieurs_secondaires', label: 'Extérieurs présents mais secondaires', emoji: '🌿' },
      { value: 'cocon', label: 'Plutôt intérieure (cocon)', emoji: '🏠' },
    ],
  },
  {
    id: 'faite_pour',
    title: 'Je suis faite pour…',
    type: 'single',
    hasOther: true,
    options: [
      { value: 'reposer', label: 'Se reposer', emoji: '😴' },
      { value: 'creer', label: "Créer / s'inspirer", emoji: '🎨' },
      { value: 'famille', label: 'Vivre en famille', emoji: '👨‍👩‍👧‍👦' },
      { value: 'recevoir', label: 'Recevoir', emoji: '🍷' },
      { value: 'travailler', label: 'Travailler (home office)', emoji: '💻' },
      { value: 'investir', label: 'Investir / louer', emoji: '💰' },
      { value: 'mix', label: 'Mix (plusieurs usages)', emoji: '🔄' },
    ],
  },
  {
    id: 'profil_occupant',
    title: 'Mon profil occupant idéal',
    type: 'single',
    hasOther: true,
    options: [
      { value: 'couple', label: 'Couple', emoji: '💑' },
      { value: 'famille', label: 'Famille', emoji: '👨‍👩‍👧' },
      { value: 'solo', label: 'Solo', emoji: '🧑' },
      { value: 'groupe', label: 'Groupe / coliving', emoji: '👥' },
      { value: 'investisseur', label: 'Investisseur', emoji: '📈' },
      { value: 'digital_nomad', label: 'Digital nomad', emoji: '🌍' },
      { value: 'retraite', label: 'Retraite / résidence secondaire', emoji: '🏖️' },
    ],
  },
  {
    id: 'ne_convient_pas',
    title: 'Ce qui ne lui convient pas',
    type: 'multi',
    hasOther: true,
    options: [
      { value: 'fetes', label: 'Fêtes fréquentes', emoji: '🎉' },
      { value: 'bruit', label: 'Bruit / musique tard', emoji: '🔊' },
      { value: 'passage', label: 'Passage constant', emoji: '🚶' },
      { value: 'enfants_bas_age', label: 'Enfants en bas âge', emoji: '👶' },
      { value: 'animaux', label: 'Animaux', emoji: '🐕' },
      { value: 'manque_entretien', label: "Manque d'entretien", emoji: '🧹' },
      { value: 'aucun', label: 'Aucun / flexible', emoji: '✅' },
    ],
  },
  {
    id: 'animaux',
    title: 'Ma relation avec les animaux',
    type: 'single',
    hasOther: true,
    options: [
      { value: 'acceptes', label: 'Acceptés', emoji: '🐾' },
      { value: 'sous_conditions', label: 'Acceptés sous conditions', emoji: '📋' },
      { value: 'non_acceptes', label: 'Non acceptés', emoji: '🚫' },
      { value: 'a_discuter', label: 'À discuter', emoji: '💬' },
    ],
  },
  {
    id: 'phrase_rencontre',
    title: 'Phrase de rencontre',
    subtitle: 'Générateur bio',
    type: 'single',
    hasOther: true,
    options: [
      { value: 'apaise', label: '"Je suis une maison qui apaise."', emoji: '🧘' },
      { value: 'inspire', label: '"Je suis une maison qui inspire."', emoji: '💡' },
      { value: 'partager', label: '"Je suis une maison faite pour partager."', emoji: '🤝' },
      { value: 'simple', label: '"Je suis une maison simple à vivre."', emoji: '🏡' },
      { value: 'caractere', label: '"Je suis une maison de caractère."', emoji: '🎭' },
      { value: 'rare', label: '"Je suis une maison rare."', emoji: '💎' },
    ],
  },
];

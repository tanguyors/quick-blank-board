-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- RAG documents table for chatbot knowledge base
CREATE TABLE IF NOT EXISTS rag_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  metadata jsonb DEFAULT '{}',
  embedding vector(384),
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(content, '')), 'B')
  ) STORED,
  created_at timestamptz DEFAULT now()
);

-- Index for full-text search
CREATE INDEX IF NOT EXISTS rag_documents_search_idx ON rag_documents USING gin(search_vector);

-- Function to search documents by text similarity (French full-text search)
CREATE OR REPLACE FUNCTION search_rag_documents(query_text text, match_count int DEFAULT 5)
RETURNS TABLE (id uuid, title text, content text, category text, rank real)
LANGUAGE sql STABLE
AS $$
  SELECT
    d.id,
    d.title,
    d.content,
    d.category,
    ts_rank(d.search_vector, plainto_tsquery('french', query_text))::real as rank
  FROM rag_documents d
  WHERE d.search_vector @@ plainto_tsquery('french', query_text)
  ORDER BY rank DESC
  LIMIT match_count;
$$;

-- RLS
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read
CREATE POLICY "rag_documents_read" ON rag_documents FOR SELECT TO authenticated USING (true);

-- Seed the knowledge base
INSERT INTO rag_documents (title, content, category) VALUES

-- CGU essentials
('Rôle de la plateforme SOMA GATE', 'SOMA GATE est une plateforme de mise en relation immobilière. SOMA GATE n''intervient pas en tant qu''agent immobilier, courtier, notaire ou conseil juridique. SOMA GATE n''intervient dans aucune transaction, négociation, signature ou paiement entre les utilisateurs.', 'legal'),

('Responsabilité documents', 'Les documents éventuellement fournis par les utilisateurs (titres de propriété, contrats de location, permis, zonage, licences) ne sont ni vérifiés ni validés par SOMA GATE et sont communiqués à titre informatif uniquement. Il appartient à chaque utilisateur de procéder à ses propres vérifications auprès des autorités compétentes, d''un notaire ou d''un conseil juridique.', 'legal'),

('Limitation de responsabilité', 'SOMA GATE ne saurait être tenue responsable de toute perte, litige, fraude ou préjudice résultant d''une transaction réalisée entre utilisateurs de la plateforme. L''utilisateur reconnaît utiliser la plateforme à ses propres risques.', 'legal'),

-- Freehold vs Leasehold
('Freehold vs Leasehold explication', 'Freehold signifie que vous possédez le bien et le terrain pour toujours. Pas de loyer foncier. Liberté totale de revente, transmission ou modification. Leasehold signifie que vous possédez uniquement les murs pour une durée limitée, généralement entre 20 et 40 ans. Le terrain appartient à un tiers. Vous payez un ground rent et des charges. En résumé : Freehold = propriété complète et permanente. Leasehold = propriété temporaire.', 'faq'),

('Investissement Freehold Bali', 'À Bali, le Freehold (Hak Milik) est réservé aux citoyens indonésiens. Les étrangers peuvent acquérir via un Hak Pakai (droit d''usage, renouvelable) ou via une PT PMA (société étrangère). Le Leasehold (Hak Sewa) est plus accessible pour les étrangers avec des baux de 25 à 30 ans renouvelables.', 'faq'),

-- Transaction workflow
('Parcours transaction SomaGate', 'Le parcours SomaGate se déroule en 14 étapes : 1. Match (swipe sur un bien), 2. Demande de visite, 3. Proposition de dates par le propriétaire, 4. Confirmation de visite, 5. Visite effectuée, 6. Expression d''intention (offre/continuer/arrêter), 7. Offre (au prix affiché ou négociation), 8. Acceptation ou rejet par le vendeur, 9. Génération automatique des documents (LOI, Term Sheet, Contrat), 10. Validation des documents par les deux parties, 11. Finalisation du deal avec double validation, 12. Certification Client Certifié, 13. Feedback, 14. Archivage.', 'workflow'),

('Demande de visite', 'Après un match, l''acheteur peut demander une visite. Le propriétaire propose jusqu''à 3 créneaux. Les deux parties confirment. Des rappels automatiques sont envoyés J-1 et H-2 avant la visite. Les rendez-vous non honorés sans justification impactent négativement votre score de confiance.', 'workflow'),

('Faire une offre', 'Après la visite, l''acheteur peut faire une offre : au prix affiché, en négociation (proposer un montant), en paiement initial (location), ou mensuel. Le vendeur peut accepter, refuser avec motif, ou faire une contre-offre. En cas de rejet, l''acheteur peut reformuler une offre.', 'workflow'),

('Documents générés', 'SomaGate génère automatiquement 3 documents : la Lettre d''Intention (LOI) avec les parties et conditions, le Term Sheet avec les termes financiers et un dépôt de 10%, et le Contrat de Vente ou de Location complet. Chaque document doit être validé par l''acheteur ET le vendeur.', 'workflow'),

-- Security
('Sécurité anti-fraude', 'SomaGate intègre un système anti-fraude : les numéros de téléphone sont automatiquement bloqués dans les messages. Les mots suspects (WhatsApp, virement, Western Union, Bitcoin) sont détectés et signalés. Toutes les conversations sont enregistrées et permettent de retracer chaque étape. En échangeant en dehors de SomaGate, vous renoncez à toute protection liée à la centralisation des preuves.', 'security'),

('Score de confiance', 'Chaque utilisateur a un score de confiance de 0 à 10. Le score augmente avec les transactions réussies et les visites honorées. Le score diminue en cas de no-show à une visite ou de refus de visite fréquents. Après une transaction finalisée, les deux parties obtiennent le badge Client Certifié.', 'security'),

-- Home Exchange
('Home Exchange', 'SomaGate propose un service de Home Exchange permettant aux propriétaires d''échanger leur maison. Le principe : la plateforme met en relation les propriétaires, qui gèrent directement entre eux les modalités. L''acheteur propose une durée d''échange (1 semaine à 6 mois), un éventuel complément financier, et les conditions. C''est une solution simple pour tester l''intérêt du marché.', 'feature'),

-- Bali market
('Marché immobilier Bali 2025-2026', 'Les autorités de Bali ont renforcé les restrictions sur les permis de construire, notamment sur les terres agricoles et zones vertes. Cela entraîne une raréfaction de l''offre et une augmentation de la valeur des biens existants. Les villas conformes avec cadre juridique clair deviennent des actifs très recherchés. Investir à Bali est une décision stratégique à moyen et long terme.', 'market'),

('Prix immobilier Bali par quartier', 'Prix indicatifs à Bali : Canggu (villas 200K-500K EUR), Seminyak (appartements 150K-400K EUR), Ubud (villas 100K-350K EUR), Uluwatu (villas 250K-600K EUR), Sanur (maisons 120K-300K EUR), Kuta (studios 50K-150K EUR). Les prix varient selon la surface, l''état et le type de droit (Freehold plus cher que Leasehold).', 'market'),

-- App features
('Fonctionnalités SomaGate', 'SomaGate offre : exploration par swipe et carte interactive, matching intelligent, messagerie sécurisée avec anti-fraude, workflow transaction complet en 14 étapes, génération automatique de documents légaux, système de score de confiance, badge Client Certifié, notifications en temps réel, 8 langues, 4 devises, mode sombre, Home Exchange, et administration complète.', 'feature'),

('Langues et devises', 'SomaGate est disponible en 8 langues : français, anglais, espagnol, allemand, néerlandais, indonésien, chinois et russe. Les prix peuvent être affichés en EUR, USD, GBP ou IDR avec conversion automatique.', 'feature');

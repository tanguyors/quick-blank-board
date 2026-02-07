import { supabase } from '@/integrations/supabase/client';

export interface DocumentTemplate {
  type: 'loi' | 'term_sheet' | 'contrat_vente' | 'contrat_location';
  title: string;
}

const DOCUMENT_TEMPLATES: Record<string, DocumentTemplate> = {
  loi: {
    type: 'loi',
    title: "Lettre d'Intention (LOI)",
  },
  term_sheet: {
    type: 'term_sheet',
    title: 'Term Sheet',
  },
  contrat_vente: {
    type: 'contrat_vente',
    title: 'Contrat de Vente',
  },
  contrat_location: {
    type: 'contrat_location',
    title: 'Contrat de Location',
  },
};

export class DocumentGenerationService {
  /**
   * Generate documents after an offer is made
   */
  static async generateDocumentsForOffer(transactionId: string) {
    const { data: tx, error } = await supabase
      .from('wf_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    if (error || !tx) throw new Error('Transaction introuvable');

    // Fetch property & profiles
    const [propertyRes, buyerRes, sellerRes] = await Promise.all([
      supabase.from('properties').select('*').eq('id', tx.property_id).single(),
      supabase.from('profiles').select('*').eq('id', tx.buyer_id).single(),
      supabase.from('profiles').select('*').eq('id', tx.seller_id).single(),
    ]);

    const property = propertyRes.data;
    const buyer = buyerRes.data;
    const seller = sellerRes.data;

    if (!property || !buyer || !seller) throw new Error('Données manquantes');

    const isVente = property.operations === 'vente';
    const docs: { type: string; title: string; content: Record<string, any> }[] = [];

    // 1. Always generate LOI
    docs.push({
      type: 'loi',
      title: DOCUMENT_TEMPLATES.loi.title,
      content: this.generateLOIContent(tx, property, buyer, seller),
    });

    // 2. Always generate Term Sheet
    docs.push({
      type: 'term_sheet',
      title: DOCUMENT_TEMPLATES.term_sheet.title,
      content: this.generateTermSheetContent(tx, property, buyer, seller),
    });

    // 3. Contract based on operation type
    if (isVente) {
      docs.push({
        type: 'contrat_vente',
        title: DOCUMENT_TEMPLATES.contrat_vente.title,
        content: this.generateContratVenteContent(tx, property, buyer, seller),
      });
    } else {
      docs.push({
        type: 'contrat_location',
        title: DOCUMENT_TEMPLATES.contrat_location.title,
        content: this.generateContratLocationContent(tx, property, buyer, seller),
      });
    }

    // Insert all documents
    const { data: insertedDocs, error: insertError } = await supabase
      .from('wf_documents')
      .insert(
        docs.map(doc => ({
          transaction_id: transactionId,
          type: doc.type,
          title: doc.title,
          content: doc.content as any,
          version: 1,
        }))
      )
      .select();

    if (insertError) throw insertError;

    // Update transaction status to documents_generated
    await supabase
      .from('wf_transactions')
      .update({
        status: 'documents_generated' as any,
        previous_status: tx.status as any,
      })
      .eq('id', transactionId);

    // Log
    await supabase.from('wf_transaction_logs').insert({
      transaction_id: transactionId,
      action: 'documents_generated',
      actor_id: tx.buyer_id,
      actor_role: 'system',
      previous_status: tx.status as any,
      new_status: 'documents_generated' as any,
      details: { document_count: docs.length, document_types: docs.map(d => d.type) } as any,
    });

    // Notify both parties
    await Promise.all([
      supabase.from('wf_notifications').insert({
        user_id: tx.buyer_id,
        transaction_id: transactionId,
        type: 'documents_generated',
        title: 'Documents prêts 📄',
        message: `${docs.length} documents ont été générés pour votre transaction. Veuillez les consulter et valider.`,
        action_url: `/transaction/${transactionId}`,
      }),
      supabase.from('wf_notifications').insert({
        user_id: tx.seller_id,
        transaction_id: transactionId,
        type: 'documents_generated',
        title: 'Documents prêts 📄',
        message: `${docs.length} documents ont été générés suite à l'offre reçue. Veuillez les consulter et valider.`,
        action_url: `/transaction/${transactionId}`,
      }),
    ]);

    return insertedDocs;
  }

  /**
   * Validate a document (buyer or seller)
   */
  static async validateDocument(
    documentId: string,
    userId: string,
    role: 'buyer' | 'seller'
  ) {
    const updateData =
      role === 'buyer'
        ? { buyer_validated: true, buyer_validated_at: new Date().toISOString() }
        : { seller_validated: true, seller_validated_at: new Date().toISOString() };

    const { error } = await supabase
      .from('wf_documents')
      .update(updateData)
      .eq('id', documentId);

    if (error) throw error;

    // Check if all documents for this transaction are validated by both
    const { data: doc } = await supabase
      .from('wf_documents')
      .select('transaction_id')
      .eq('id', documentId)
      .single();

    if (doc) {
      const { data: allDocs } = await supabase
        .from('wf_documents')
        .select('*')
        .eq('transaction_id', doc.transaction_id);

      const allValidated = allDocs?.every(d => d.buyer_validated && d.seller_validated);

      if (allValidated) {
        // Move transaction to in_validation
        await supabase
          .from('wf_transactions')
          .update({
            status: 'in_validation' as any,
            previous_status: 'documents_generated' as any,
          })
          .eq('id', doc.transaction_id);

        await supabase.from('wf_transaction_logs').insert({
          transaction_id: doc.transaction_id,
          action: 'all_documents_validated',
          actor_id: userId,
          actor_role: role,
          previous_status: 'documents_generated' as any,
          new_status: 'in_validation' as any,
        });
      }
    }
  }

  // ---------- Content generators ----------

  private static generateLOIContent(tx: any, property: any, buyer: any, seller: any) {
    return {
      document_type: "Lettre d'Intention",
      date: new Date().toISOString(),
      reference: `LOI-${tx.id.slice(0, 8).toUpperCase()}`,
      parties: {
        acheteur: {
          nom: buyer.full_name || `${buyer.first_name || ''} ${buyer.last_name || ''}`.trim(),
          email: buyer.email,
          whatsapp: buyer.whatsapp,
        },
        vendeur: {
          nom: seller.full_name || `${seller.first_name || ''} ${seller.last_name || ''}`.trim(),
          email: seller.email,
          whatsapp: seller.whatsapp,
          entreprise: seller.company_name,
        },
      },
      bien: {
        type: property.type,
        adresse: property.adresse,
        surface: property.surface,
        chambres: property.chambres,
        salles_bain: property.salles_bain,
        droit: property.droit,
      },
      conditions: {
        prix_demande: property.prix,
        prix_offert: tx.offer_amount,
        type_offre: tx.offer_type,
        devise: property.prix_currency,
        details_offre: tx.offer_details,
      },
      clauses: [
        "L'acheteur manifeste son intention ferme d'acquérir le bien décrit ci-dessus.",
        "Le prix proposé est négociable sous réserve d'accord mutuel.",
        "La présente lettre ne constitue pas un engagement définitif mais une manifestation d'intérêt sérieux.",
        "Les parties s'engagent à négocier de bonne foi.",
        "La transaction sera finalisée après validation des documents par les deux parties.",
      ],
    };
  }

  private static generateTermSheetContent(tx: any, property: any, buyer: any, seller: any) {
    return {
      document_type: 'Term Sheet',
      date: new Date().toISOString(),
      reference: `TS-${tx.id.slice(0, 8).toUpperCase()}`,
      resume_transaction: {
        bien: `${property.type} - ${property.adresse}`,
        operation: property.operations,
        prix_initial: property.prix,
        prix_offert: tx.offer_amount,
        devise: property.prix_currency,
      },
      conditions_financieres: {
        montant_total: tx.offer_amount,
        depot_garantie: Math.round((tx.offer_amount || 0) * 0.1),
        pourcentage_depot: '10%',
        modalites_paiement: tx.offer_type === 'cash' ? 'Paiement comptant' : 'Financement à préciser',
      },
      calendrier: {
        date_offre: tx.created_at,
        visite_effectuee: tx.visit_completed_at,
        date_limite_validation: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      conditions_suspensives: [
        'Vérification du titre foncier / bail / délibération',
        'Absence de litiges ou hypothèques sur le bien',
        "Obtention de financement (si applicable)",
        'Validation juridique par un notaire',
      ],
    };
  }

  private static generateContratVenteContent(tx: any, property: any, buyer: any, seller: any) {
    return {
      document_type: 'Contrat de Vente',
      date: new Date().toISOString(),
      reference: `CV-${tx.id.slice(0, 8).toUpperCase()}`,
      parties: {
        vendeur: {
          nom: seller.full_name || `${seller.first_name || ''} ${seller.last_name || ''}`.trim(),
          email: seller.email,
          entreprise: seller.company_name,
          adresse_entreprise: seller.company_address,
        },
        acquereur: {
          nom: buyer.full_name || `${buyer.first_name || ''} ${buyer.last_name || ''}`.trim(),
          email: buyer.email,
        },
      },
      designation_bien: {
        type: property.type,
        adresse: property.adresse,
        surface: property.surface,
        chambres: property.chambres,
        salles_bain: property.salles_bain,
        titre_propriete: property.droit,
        secteur: property.secteur,
      },
      prix_et_paiement: {
        prix_vente: tx.offer_amount,
        devise: property.prix_currency,
        modalites: tx.offer_type === 'cash' ? 'Paiement intégral à la signature' : 'Selon échéancier convenu',
        depot_garantie: Math.round((tx.offer_amount || 0) * 0.1),
      },
      articles: [
        "Le vendeur déclare être le propriétaire légitime du bien et avoir pleine capacité à le vendre.",
        "L'acquéreur déclare avoir visité le bien et l'accepter dans son état actuel.",
        "Le transfert de propriété prendra effet à la signature de l'acte définitif chez le notaire.",
        "Les frais de notaire et les droits d'enregistrement sont à la charge de l'acquéreur.",
        "En cas de désistement de l'acquéreur, le dépôt de garantie sera retenu.",
        "En cas de désistement du vendeur, celui-ci restituera le double du dépôt de garantie.",
      ],
      note: 'Ce document est un projet de contrat. Il doit être validé par un notaire pour avoir valeur juridique.',
    };
  }

  private static generateContratLocationContent(tx: any, property: any, buyer: any, seller: any) {
    return {
      document_type: 'Contrat de Location',
      date: new Date().toISOString(),
      reference: `CL-${tx.id.slice(0, 8).toUpperCase()}`,
      parties: {
        bailleur: {
          nom: seller.full_name || `${seller.first_name || ''} ${seller.last_name || ''}`.trim(),
          email: seller.email,
          entreprise: seller.company_name,
        },
        locataire: {
          nom: buyer.full_name || `${buyer.first_name || ''} ${buyer.last_name || ''}`.trim(),
          email: buyer.email,
        },
      },
      designation_bien: {
        type: property.type,
        adresse: property.adresse,
        surface: property.surface,
        chambres: property.chambres,
        salles_bain: property.salles_bain,
      },
      conditions_financieres: {
        loyer_mensuel: tx.offer_amount,
        devise: property.prix_currency,
        caution: Math.round((tx.offer_amount || 0) * 2),
        mois_caution: 2,
        avance: Math.round((tx.offer_amount || 0) * 1),
        mois_avance: 1,
      },
      duree: {
        type: 'Bail professionnel / habitation',
        duree_mois: 12,
        date_debut: 'À définir à la signature',
        renouvellement: 'Tacite reconduction',
      },
      articles: [
        "Le locataire s'engage à utiliser le bien conformément à sa destination.",
        "Le bailleur s'engage à délivrer le bien en bon état d'habitabilité.",
        "Les charges et l'entretien courant sont à la charge du locataire.",
        "Les réparations majeures restent à la charge du bailleur.",
        "Le préavis de résiliation est de 3 mois.",
        "Toute sous-location est interdite sans accord écrit du bailleur.",
      ],
      note: 'Ce document est un projet de bail. Il doit être validé et enregistré conformément à la législation indonésienne.',
    };
  }
}

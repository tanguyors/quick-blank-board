export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      buyer_preferences: {
        Row: {
          budget_currency: string | null
          budget_max: number | null
          budget_min: number | null
          cash_available: string | null
          created_at: string
          custom_sector: string | null
          id: string
          intention: string | null
          is_complete: boolean | null
          payment_knowledge: string | null
          preferred_chambres: number[] | null
          preferred_operation: string | null
          preferred_salles_bain: number[] | null
          preferred_sectors: string[] | null
          preferred_status: string | null
          preferred_types: string[] | null
          receive_alerts: boolean | null
          updated_at: string
          user_id: string
          visit_availability: string[] | null
          wants_advisor: boolean | null
        }
        Insert: {
          budget_currency?: string | null
          budget_max?: number | null
          budget_min?: number | null
          cash_available?: string | null
          created_at?: string
          custom_sector?: string | null
          id?: string
          intention?: string | null
          is_complete?: boolean | null
          payment_knowledge?: string | null
          preferred_chambres?: number[] | null
          preferred_operation?: string | null
          preferred_salles_bain?: number[] | null
          preferred_sectors?: string[] | null
          preferred_status?: string | null
          preferred_types?: string[] | null
          receive_alerts?: boolean | null
          updated_at?: string
          user_id: string
          visit_availability?: string[] | null
          wants_advisor?: boolean | null
        }
        Update: {
          budget_currency?: string | null
          budget_max?: number | null
          budget_min?: number | null
          cash_available?: string | null
          created_at?: string
          custom_sector?: string | null
          id?: string
          intention?: string | null
          is_complete?: boolean | null
          payment_knowledge?: string | null
          preferred_chambres?: number[] | null
          preferred_operation?: string | null
          preferred_salles_bain?: number[] | null
          preferred_sectors?: string[] | null
          preferred_status?: string | null
          preferred_types?: string[] | null
          receive_alerts?: boolean | null
          updated_at?: string
          user_id?: string
          visit_availability?: string[] | null
          wants_advisor?: boolean | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          last_message_at: string
          match_id: string | null
          owner_id: string
          property_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          last_message_at?: string
          match_id?: string | null
          owner_id: string
          property_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          last_message_at?: string
          match_id?: string | null
          owner_id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          body: string
          channel: string
          created_at: string
          id: string
          is_active: boolean | null
          recipient: string
          step: string
          subject: string | null
          updated_at: string
          updated_by: string | null
          variables: Json | null
        }
        Insert: {
          body: string
          channel: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          recipient: string
          step: string
          subject?: string | null
          updated_at?: string
          updated_by?: string | null
          variables?: Json | null
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          recipient?: string
          step?: string
          subject?: string | null
          updated_at?: string
          updated_by?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_templates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          company_address: string | null
          company_name: string | null
          created_at: string
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          nationality: string | null
          notif_email: boolean
          notif_newsletter: boolean
          notif_push: boolean
          notif_whatsapp: boolean
          preferred_currency: string
          preferred_language: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          company_address?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          nationality?: string | null
          notif_email?: boolean
          notif_newsletter?: boolean
          notif_push?: boolean
          notif_whatsapp?: boolean
          preferred_currency?: string
          preferred_language?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          company_address?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          nationality?: string | null
          notif_email?: boolean
          notif_newsletter?: boolean
          notif_push?: boolean
          notif_whatsapp?: boolean
          preferred_currency?: string
          preferred_language?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          adresse: string
          chambres: number
          created_at: string
          description: string | null
          droit: Database["public"]["Enums"]["property_droit"] | null
          equipements: Json | null
          id: string
          is_published: boolean
          latitude: number | null
          longitude: number | null
          operations: Database["public"]["Enums"]["property_operation"]
          owner_id: string
          prix: number
          prix_currency: string
          salles_bain: number
          secteur: string | null
          status: Database["public"]["Enums"]["property_status"]
          surface: number | null
          type: Database["public"]["Enums"]["property_type"]
          updated_at: string
        }
        Insert: {
          adresse: string
          chambres?: number
          created_at?: string
          description?: string | null
          droit?: Database["public"]["Enums"]["property_droit"] | null
          equipements?: Json | null
          id?: string
          is_published?: boolean
          latitude?: number | null
          longitude?: number | null
          operations?: Database["public"]["Enums"]["property_operation"]
          owner_id: string
          prix: number
          prix_currency?: string
          salles_bain?: number
          secteur?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          surface?: number | null
          type: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Update: {
          adresse?: string
          chambres?: number
          created_at?: string
          description?: string | null
          droit?: Database["public"]["Enums"]["property_droit"] | null
          equipements?: Json | null
          id?: string
          is_published?: boolean
          latitude?: number | null
          longitude?: number | null
          operations?: Database["public"]["Enums"]["property_operation"]
          owner_id?: string
          prix?: number
          prix_currency?: string
          salles_bain?: number
          secteur?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          surface?: number | null
          type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Relationships: []
      }
      property_media: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          position: number
          property_id: string
          type: Database["public"]["Enums"]["media_type"]
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          position?: number
          property_id: string
          type?: Database["public"]["Enums"]["media_type"]
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          position?: number
          property_id?: string
          type?: Database["public"]["Enums"]["media_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_media_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      swipes: {
        Row: {
          created_at: string
          direction: Database["public"]["Enums"]["swipe_direction"]
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          direction: Database["public"]["Enums"]["swipe_direction"]
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          direction?: Database["public"]["Enums"]["swipe_direction"]
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          buyer_id: string
          cancel_reason: string | null
          created_at: string
          id: string
          message: string | null
          owner_id: string
          property_id: string
          proposed_date: string
          status: Database["public"]["Enums"]["visit_status"]
          updated_at: string
        }
        Insert: {
          buyer_id: string
          cancel_reason?: string | null
          created_at?: string
          id?: string
          message?: string | null
          owner_id: string
          property_id: string
          proposed_date: string
          status?: Database["public"]["Enums"]["visit_status"]
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          cancel_reason?: string | null
          created_at?: string
          id?: string
          message?: string | null
          owner_id?: string
          property_id?: string
          proposed_date?: string
          status?: Database["public"]["Enums"]["visit_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      wf_documents: {
        Row: {
          buyer_validated: boolean | null
          buyer_validated_at: string | null
          content: Json | null
          created_at: string
          id: string
          is_final: boolean | null
          pdf_url: string | null
          seller_validated: boolean | null
          seller_validated_at: string | null
          title: string
          transaction_id: string
          type: string
          updated_at: string
          version: number | null
        }
        Insert: {
          buyer_validated?: boolean | null
          buyer_validated_at?: string | null
          content?: Json | null
          created_at?: string
          id?: string
          is_final?: boolean | null
          pdf_url?: string | null
          seller_validated?: boolean | null
          seller_validated_at?: string | null
          title: string
          transaction_id: string
          type: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          buyer_validated?: boolean | null
          buyer_validated_at?: string | null
          content?: Json | null
          created_at?: string
          id?: string
          is_final?: boolean | null
          pdf_url?: string | null
          seller_validated?: boolean | null
          seller_validated_at?: string | null
          title?: string
          transaction_id?: string
          type?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wf_documents_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "wf_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      wf_messages: {
        Row: {
          contains_phone_number: boolean | null
          content: string
          created_at: string
          flagged_suspicious: boolean | null
          id: string
          read_at: string | null
          receiver_id: string
          sender_id: string
          transaction_id: string
        }
        Insert: {
          contains_phone_number?: boolean | null
          content: string
          created_at?: string
          flagged_suspicious?: boolean | null
          id?: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
          transaction_id: string
        }
        Update: {
          contains_phone_number?: boolean | null
          content?: string
          created_at?: string
          flagged_suspicious?: boolean | null
          id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wf_messages_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "wf_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      wf_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          data: Json | null
          email_sent: boolean | null
          email_sent_at: string | null
          id: string
          message: string
          push_sent: boolean | null
          push_sent_at: string | null
          read_at: string | null
          title: string
          transaction_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          message: string
          push_sent?: boolean | null
          push_sent_at?: string | null
          read_at?: string | null
          title: string
          transaction_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          message?: string
          push_sent?: boolean | null
          push_sent_at?: string | null
          read_at?: string | null
          title?: string
          transaction_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wf_notifications_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "wf_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      wf_reminders: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          reminder_type: string
          scheduled_at: string
          sent: boolean | null
          sent_at: string | null
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          reminder_type: string
          scheduled_at: string
          sent?: boolean | null
          sent_at?: string | null
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          reminder_type?: string
          scheduled_at?: string
          sent?: boolean | null
          sent_at?: string | null
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wf_reminders_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "wf_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      wf_transaction_logs: {
        Row: {
          action: string
          actor_id: string
          actor_role: string | null
          created_at: string
          details: Json | null
          id: string
          new_status: Database["public"]["Enums"]["transaction_status"] | null
          previous_status:
            | Database["public"]["Enums"]["transaction_status"]
            | null
          transaction_id: string
        }
        Insert: {
          action: string
          actor_id: string
          actor_role?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          new_status?: Database["public"]["Enums"]["transaction_status"] | null
          previous_status?:
            | Database["public"]["Enums"]["transaction_status"]
            | null
          transaction_id: string
        }
        Update: {
          action?: string
          actor_id?: string
          actor_role?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          new_status?: Database["public"]["Enums"]["transaction_status"] | null
          previous_status?:
            | Database["public"]["Enums"]["transaction_status"]
            | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wf_transaction_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "wf_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      wf_transactions: {
        Row: {
          buyer_id: string
          buyer_intention: string | null
          buyer_no_show: boolean | null
          buyer_validated: boolean | null
          buyer_validated_at: string | null
          created_at: string
          deal_finalized_at: string | null
          deposit_amount: number | null
          deposit_paid: boolean | null
          id: string
          matched_at: string
          offer_amount: number | null
          offer_details: string | null
          offer_type: string | null
          previous_status:
            | Database["public"]["Enums"]["transaction_status"]
            | null
          property_id: string
          rejection_details: string | null
          rejection_reason: string | null
          seller_id: string
          seller_no_show: boolean | null
          seller_validated: boolean | null
          seller_validated_at: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          updated_at: string
          visit_completed_at: string | null
          visit_confirmed_by_buyer: boolean | null
          visit_confirmed_by_seller: boolean | null
          visit_confirmed_date: string | null
          visit_proposed_dates: Json | null
          visit_refusal_details: string | null
          visit_refusal_reason: string | null
          visit_requested_at: string | null
        }
        Insert: {
          buyer_id: string
          buyer_intention?: string | null
          buyer_no_show?: boolean | null
          buyer_validated?: boolean | null
          buyer_validated_at?: string | null
          created_at?: string
          deal_finalized_at?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          id?: string
          matched_at?: string
          offer_amount?: number | null
          offer_details?: string | null
          offer_type?: string | null
          previous_status?:
            | Database["public"]["Enums"]["transaction_status"]
            | null
          property_id: string
          rejection_details?: string | null
          rejection_reason?: string | null
          seller_id: string
          seller_no_show?: boolean | null
          seller_validated?: boolean | null
          seller_validated_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
          visit_completed_at?: string | null
          visit_confirmed_by_buyer?: boolean | null
          visit_confirmed_by_seller?: boolean | null
          visit_confirmed_date?: string | null
          visit_proposed_dates?: Json | null
          visit_refusal_details?: string | null
          visit_refusal_reason?: string | null
          visit_requested_at?: string | null
        }
        Update: {
          buyer_id?: string
          buyer_intention?: string | null
          buyer_no_show?: boolean | null
          buyer_validated?: boolean | null
          buyer_validated_at?: string | null
          created_at?: string
          deal_finalized_at?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          id?: string
          matched_at?: string
          offer_amount?: number | null
          offer_details?: string | null
          offer_type?: string | null
          previous_status?:
            | Database["public"]["Enums"]["transaction_status"]
            | null
          property_id?: string
          rejection_details?: string | null
          rejection_reason?: string | null
          seller_id?: string
          seller_no_show?: boolean | null
          seller_validated?: boolean | null
          seller_validated_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
          visit_completed_at?: string | null
          visit_confirmed_by_buyer?: boolean | null
          visit_confirmed_by_seller?: boolean | null
          visit_confirmed_date?: string | null
          visit_proposed_dates?: Json | null
          visit_refusal_details?: string | null
          visit_refusal_reason?: string | null
          visit_requested_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wf_transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      wf_user_scores: {
        Row: {
          cancelled_transactions: number | null
          certified: boolean | null
          certified_at: string | null
          completed_transactions: number | null
          created_at: string
          last_calculated_at: string | null
          no_shows: number | null
          score: number
          total_transactions: number | null
          updated_at: string
          user_id: string
          vip_access: boolean | null
          visit_refusals: number | null
        }
        Insert: {
          cancelled_transactions?: number | null
          certified?: boolean | null
          certified_at?: string | null
          completed_transactions?: number | null
          created_at?: string
          last_calculated_at?: string | null
          no_shows?: number | null
          score?: number
          total_transactions?: number | null
          updated_at?: string
          user_id: string
          vip_access?: boolean | null
          visit_refusals?: number | null
        }
        Update: {
          cancelled_transactions?: number | null
          certified?: boolean | null
          certified_at?: string | null
          completed_transactions?: number | null
          created_at?: string
          last_calculated_at?: string | null
          no_shows?: number | null
          score?: number
          total_transactions?: number | null
          updated_at?: string
          user_id?: string
          vip_access?: boolean | null
          visit_refusals?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      wf_calculate_user_score: { Args: { p_user_id: string }; Returns: number }
    }
    Enums: {
      app_role: "user" | "owner" | "admin" | "notaire" | "agent"
      media_type: "image" | "video"
      property_droit:
        | "titre_foncier"
        | "bail"
        | "deliberation"
        | "freehold"
        | "leasehold"
      property_operation:
        | "vente"
        | "location"
        | "achat"
        | "leasehold"
        | "freehold"
        | "home_exchange"
      property_status: "available" | "sold" | "rented" | "draft"
      property_type:
        | "villa"
        | "appartement"
        | "terrain"
        | "studio"
        | "maison"
        | "bureau"
        | "commerce"
        | "entrepot"
        | "commercial"
        | "construction"
        | "maison_a_renover"
        | "colocation_longue"
        | "colocation_courte"
        | "hebergement_service"
        | "hebergement_animaux"
        | "guesthouse"
      swipe_direction: "left" | "right"
      transaction_status:
        | "matched"
        | "visit_requested"
        | "visit_proposed"
        | "visit_confirmed"
        | "visit_completed"
        | "visit_cancelled"
        | "visit_rescheduled"
        | "intention_expressed"
        | "offer_made"
        | "documents_generated"
        | "in_validation"
        | "deal_finalized"
        | "deal_cancelled"
        | "archived"
      visit_status: "pending" | "confirmed" | "cancelled" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "owner", "admin", "notaire", "agent"],
      media_type: ["image", "video"],
      property_droit: [
        "titre_foncier",
        "bail",
        "deliberation",
        "freehold",
        "leasehold",
      ],
      property_operation: [
        "vente",
        "location",
        "achat",
        "leasehold",
        "freehold",
        "home_exchange",
      ],
      property_status: ["available", "sold", "rented", "draft"],
      property_type: [
        "villa",
        "appartement",
        "terrain",
        "studio",
        "maison",
        "bureau",
        "commerce",
        "entrepot",
        "commercial",
        "construction",
        "maison_a_renover",
        "colocation_longue",
        "colocation_courte",
        "hebergement_service",
        "hebergement_animaux",
        "guesthouse",
      ],
      swipe_direction: ["left", "right"],
      transaction_status: [
        "matched",
        "visit_requested",
        "visit_proposed",
        "visit_confirmed",
        "visit_completed",
        "visit_cancelled",
        "visit_rescheduled",
        "intention_expressed",
        "offer_made",
        "documents_generated",
        "in_validation",
        "deal_finalized",
        "deal_cancelled",
        "archived",
      ],
      visit_status: ["pending", "confirmed", "cancelled", "completed"],
    },
  },
} as const

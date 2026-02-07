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
    }
    Enums: {
      app_role: "user" | "owner" | "admin" | "notaire" | "agent"
      media_type: "image" | "video"
      property_droit: "titre_foncier" | "bail" | "deliberation"
      property_operation: "vente" | "location"
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
      swipe_direction: "left" | "right"
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
      property_droit: ["titre_foncier", "bail", "deliberation"],
      property_operation: ["vente", "location"],
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
      ],
      swipe_direction: ["left", "right"],
      visit_status: ["pending", "confirmed", "cancelled", "completed"],
    },
  },
} as const

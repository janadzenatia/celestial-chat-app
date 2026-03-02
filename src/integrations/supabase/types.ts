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
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      child_reports: {
        Row: {
          blueprint: string
          child_id: string
          created_at: string
          emotional_connection: string
          id: string
          language: string
          parenting_advice: string
          user_id: string
        }
        Insert: {
          blueprint?: string
          child_id: string
          created_at?: string
          emotional_connection?: string
          id?: string
          language?: string
          parenting_advice?: string
          user_id: string
        }
        Update: {
          blueprint?: string
          child_id?: string
          created_at?: string
          emotional_connection?: string
          id?: string
          language?: string
          parenting_advice?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_reports_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          created_at: string
          date_of_birth: string
          id: string
          name: string
          time_of_birth: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth: string
          id?: string
          name: string
          time_of_birth?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string
          id?: string
          name?: string
          time_of_birth?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cosmic_calendars: {
        Row: {
          created_at: string
          days: Json
          id: string
          language: string
          month: number
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          days?: Json
          id?: string
          language?: string
          month: number
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          days?: Json
          id?: string
          language?: string
          month?: number
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      cosmic_matches: {
        Row: {
          birth_years: Json
          compatible_signs: Json
          created_at: string
          id: string
          language: string
          personality_profile: string
          user_id: string
        }
        Insert: {
          birth_years?: Json
          compatible_signs?: Json
          created_at?: string
          id?: string
          language?: string
          personality_profile: string
          user_id: string
        }
        Update: {
          birth_years?: Json
          compatible_signs?: Json
          created_at?: string
          id?: string
          language?: string
          personality_profile?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_insights: {
        Row: {
          content: string
          created_at: string
          id: string
          insight_date: string
          language: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          insight_date?: string
          language?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          insight_date?: string
          language?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          id: string
          is_premium: boolean
          language_preference: string
          name: string | null
          onboarding_completed: boolean
          place_of_birth: string | null
          time_of_birth: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          id?: string
          is_premium?: boolean
          language_preference?: string
          name?: string | null
          onboarding_completed?: boolean
          place_of_birth?: string | null
          time_of_birth?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          id?: string
          is_premium?: boolean
          language_preference?: string
          name?: string | null
          onboarding_completed?: boolean
          place_of_birth?: string | null
          time_of_birth?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      relationship_forecasts: {
        Row: {
          created_at: string
          id: string
          language: string
          partner_dob: string
          periods: Json
          relationship_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          partner_dob: string
          periods?: Json
          relationship_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          partner_dob?: string
          periods?: Json
          relationship_date?: string
          user_id?: string
        }
        Relationships: []
      }
      synastry_reports: {
        Row: {
          communication: Json
          created_at: string
          emotional: Json
          goals: Json
          id: string
          language: string
          overall_score: number
          partner_dob: string
          partner_name: string
          partner_time: string | null
          romantic: Json
          user_id: string
        }
        Insert: {
          communication?: Json
          created_at?: string
          emotional?: Json
          goals?: Json
          id?: string
          language?: string
          overall_score?: number
          partner_dob: string
          partner_name?: string
          partner_time?: string | null
          romantic?: Json
          user_id: string
        }
        Update: {
          communication?: Json
          created_at?: string
          emotional?: Json
          goals?: Json
          id?: string
          language?: string
          overall_score?: number
          partner_dob?: string
          partner_name?: string
          partner_time?: string | null
          romantic?: Json
          user_id?: string
        }
        Relationships: []
      }
      wealth_reports: {
        Row: {
          career_timeline: string
          cosmic_calling: string
          created_at: string
          id: string
          language: string
          user_id: string
          wealth_dna: string
        }
        Insert: {
          career_timeline?: string
          cosmic_calling?: string
          created_at?: string
          id?: string
          language?: string
          user_id: string
          wealth_dna?: string
        }
        Update: {
          career_timeline?: string
          cosmic_calling?: string
          created_at?: string
          id?: string
          language?: string
          user_id?: string
          wealth_dna?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

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
          birth_place: string | null
          birth_place_lat: number | null
          birth_place_lon: number | null
          created_at: string
          date_of_birth: string
          id: string
          name: string
          relationship_type: string
          time_of_birth: string | null
          user_id: string
        }
        Insert: {
          birth_place?: string | null
          birth_place_lat?: number | null
          birth_place_lon?: number | null
          created_at?: string
          date_of_birth: string
          id?: string
          name: string
          relationship_type?: string
          time_of_birth?: string | null
          user_id: string
        }
        Update: {
          birth_place?: string | null
          birth_place_lat?: number | null
          birth_place_lon?: number | null
          created_at?: string
          date_of_birth?: string
          id?: string
          name?: string
          relationship_type?: string
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
      cosmic_hooks: {
        Row: {
          created_at: string
          hook: string
          hook_date: string
          id: string
          language: string
          subject: string
          subject_dob: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          hook: string
          hook_date?: string
          id?: string
          language?: string
          subject?: string
          subject_dob?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          hook?: string
          hook_date?: string
          id?: string
          language?: string
          subject?: string
          subject_dob?: string | null
          user_id?: string
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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_lat: number | null
          birth_lon: number | null
          birth_place_normalized: string | null
          cached_moon_emoji: string | null
          cached_moon_sign: string | null
          cached_rising_emoji: string | null
          cached_rising_sign: string | null
          cached_sun_emoji: string | null
          cached_sun_sign: string | null
          created_at: string
          daily_chat_count: number
          date_of_birth: string | null
          device_id: string | null
          fcm_platform: string | null
          fcm_token: string | null
          fcm_token_updated_at: string | null
          id: string
          is_premium: boolean
          language_preference: string
          last_chat_date: string | null
          name: string | null
          notifications_enabled: boolean
          onboarding_completed: boolean
          partner_birth_date: string | null
          partner_birth_place_lat: number | null
          partner_birth_place_lon: number | null
          partner_birth_place_normalized: string | null
          partner_love_language: string | null
          partner_name: string | null
          partner_place_of_birth: string | null
          partner_time_of_birth: string | null
          place_of_birth: string | null
          relationship_start_date: string | null
          subscription_plan: string
          subscription_status: string
          time_of_birth: string | null
          timezone: string | null
          trial_end_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_lat?: number | null
          birth_lon?: number | null
          birth_place_normalized?: string | null
          cached_moon_emoji?: string | null
          cached_moon_sign?: string | null
          cached_rising_emoji?: string | null
          cached_rising_sign?: string | null
          cached_sun_emoji?: string | null
          cached_sun_sign?: string | null
          created_at?: string
          daily_chat_count?: number
          date_of_birth?: string | null
          device_id?: string | null
          fcm_platform?: string | null
          fcm_token?: string | null
          fcm_token_updated_at?: string | null
          id?: string
          is_premium?: boolean
          language_preference?: string
          last_chat_date?: string | null
          name?: string | null
          notifications_enabled?: boolean
          onboarding_completed?: boolean
          partner_birth_date?: string | null
          partner_birth_place_lat?: number | null
          partner_birth_place_lon?: number | null
          partner_birth_place_normalized?: string | null
          partner_love_language?: string | null
          partner_name?: string | null
          partner_place_of_birth?: string | null
          partner_time_of_birth?: string | null
          place_of_birth?: string | null
          relationship_start_date?: string | null
          subscription_plan?: string
          subscription_status?: string
          time_of_birth?: string | null
          timezone?: string | null
          trial_end_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_lat?: number | null
          birth_lon?: number | null
          birth_place_normalized?: string | null
          cached_moon_emoji?: string | null
          cached_moon_sign?: string | null
          cached_rising_emoji?: string | null
          cached_rising_sign?: string | null
          cached_sun_emoji?: string | null
          cached_sun_sign?: string | null
          created_at?: string
          daily_chat_count?: number
          date_of_birth?: string | null
          device_id?: string | null
          fcm_platform?: string | null
          fcm_token?: string | null
          fcm_token_updated_at?: string | null
          id?: string
          is_premium?: boolean
          language_preference?: string
          last_chat_date?: string | null
          name?: string | null
          notifications_enabled?: boolean
          onboarding_completed?: boolean
          partner_birth_date?: string | null
          partner_birth_place_lat?: number | null
          partner_birth_place_lon?: number | null
          partner_birth_place_normalized?: string | null
          partner_love_language?: string | null
          partner_name?: string | null
          partner_place_of_birth?: string | null
          partner_time_of_birth?: string | null
          place_of_birth?: string | null
          relationship_start_date?: string | null
          subscription_plan?: string
          subscription_status?: string
          time_of_birth?: string | null
          timezone?: string | null
          trial_end_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_send_log: {
        Row: {
          created_at: string
          error: string | null
          fcm_message_id: string | null
          id: string
          kind: string
          send_date: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          fcm_message_id?: string | null
          id?: string
          kind: string
          send_date?: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          fcm_message_id?: string | null
          id?: string
          kind?: string
          send_date?: string
          status?: string
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
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      token_usage: {
        Row: {
          completion_tokens: number
          created_at: string
          function_name: string
          id: string
          model: string | null
          prompt_tokens: number
          total_tokens: number
          user_id: string
        }
        Insert: {
          completion_tokens?: number
          created_at?: string
          function_name: string
          id?: string
          model?: string | null
          prompt_tokens?: number
          total_tokens?: number
          user_id: string
        }
        Update: {
          completion_tokens?: number
          created_at?: string
          function_name?: string
          id?: string
          model?: string | null
          prompt_tokens?: number
          total_tokens?: number
          user_id?: string
        }
        Relationships: []
      }
      trial_history: {
        Row: {
          created_at: string
          device_id: string | null
          email_hash: string
          id: string
          trial_end_date: string | null
          trial_start_date: string | null
          trial_used: boolean
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          email_hash: string
          id?: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          trial_used?: boolean
        }
        Update: {
          created_at?: string
          device_id?: string | null
          email_hash?: string
          id?: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          trial_used?: boolean
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
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

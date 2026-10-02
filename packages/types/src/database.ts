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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_emails: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      applied_migrations: {
        Row: {
          applied_at: string
          name: string
        }
        Insert: {
          applied_at?: string
          name: string
        }
        Update: {
          applied_at?: string
          name?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          cover_url: string | null
          created_at: string
          description_en: string | null
          description_mn: string | null
          id: string
          is_free: boolean
          is_published: boolean
          level: Database["public"]["Enums"]["course_level"]
          rank: number
          slug: string
          summary_en: string | null
          summary_mn: string
          title_en: string | null
          title_mn: string
          topic: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description_en?: string | null
          description_mn?: string | null
          id?: string
          is_free?: boolean
          is_published?: boolean
          level?: Database["public"]["Enums"]["course_level"]
          rank?: number
          slug: string
          summary_en?: string | null
          summary_mn: string
          title_en?: string | null
          title_mn: string
          topic?: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description_en?: string | null
          description_mn?: string | null
          id?: string
          is_free?: boolean
          is_published?: boolean
          level?: Database["public"]["Enums"]["course_level"]
          rank?: number
          slug?: string
          summary_en?: string | null
          summary_mn?: string
          title_en?: string | null
          title_mn?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          course_id: string
          created_at: string
          expires_at: string | null
          id: string
          source: Database["public"]["Enums"]["enrollment_source"]
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          source?: Database["public"]["Enums"]["enrollment_source"]
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          source?: Database["public"]["Enums"]["enrollment_source"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          body: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          lesson_id: string
          quiz_score: number | null
          seconds_watched: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          lesson_id: string
          quiz_score?: number | null
          seconds_watched?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          lesson_id?: string
          quiz_score?: number | null
          seconds_watched?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_outline"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          body_en: string | null
          body_mn: string | null
          code_language: string | null
          course_id: string
          created_at: string
          duration_minutes: number
          id: string
          is_preview: boolean
          kind: Database["public"]["Enums"]["lesson_kind"]
          module_id: string
          rank: number
          slug: string
          solution_code: string | null
          starter_code: string | null
          title_en: string | null
          title_mn: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          body_en?: string | null
          body_mn?: string | null
          code_language?: string | null
          course_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          is_preview?: boolean
          kind?: Database["public"]["Enums"]["lesson_kind"]
          module_id: string
          rank?: number
          slug: string
          solution_code?: string | null
          starter_code?: string | null
          title_en?: string | null
          title_mn: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          body_en?: string | null
          body_mn?: string | null
          code_language?: string | null
          course_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          is_preview?: boolean
          kind?: Database["public"]["Enums"]["lesson_kind"]
          module_id?: string
          rank?: number
          slug?: string
          solution_code?: string | null
          starter_code?: string | null
          title_en?: string | null
          title_mn?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          id: string
          rank: number
          title_en: string | null
          title_mn: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          rank?: number
          title_en?: string | null
          title_mn: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          rank?: number
          title_en?: string | null
          title_mn?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_mnt: number
          course_id: string | null
          created_at: string
          id: string
          invoice_id: string | null
          paid_at: string | null
          provider: string
          raw: Json | null
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Insert: {
          amount_mnt: number
          course_id?: string | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          paid_at?: string | null
          provider?: string
          raw?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Update: {
          amount_mnt?: number
          course_id?: string | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          paid_at?: string | null
          provider?: string
          raw?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          locale: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          locale?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          locale?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_index: number
          created_at: string
          explanation_en: string | null
          explanation_mn: string | null
          id: string
          lesson_id: string
          options_en: string[] | null
          options_mn: string[]
          prompt_en: string | null
          prompt_mn: string
          rank: number
        }
        Insert: {
          correct_index: number
          created_at?: string
          explanation_en?: string | null
          explanation_mn?: string | null
          id?: string
          lesson_id: string
          options_en?: string[] | null
          options_mn: string[]
          prompt_en?: string | null
          prompt_mn: string
          rank?: number
        }
        Update: {
          correct_index?: number
          created_at?: string
          explanation_en?: string | null
          explanation_mn?: string | null
          id?: string
          lesson_id?: string
          options_en?: string[] | null
          options_mn?: string[]
          prompt_en?: string | null
          prompt_mn?: string
          rank?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_outline"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      course_progress: {
        Row: {
          completed_lessons: number | null
          course_id: string | null
          last_activity: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_outline: {
        Row: {
          course_id: string | null
          duration_minutes: number | null
          id: string | null
          is_preview: boolean | null
          kind: Database["public"]["Enums"]["lesson_kind"] | null
          module_id: string | null
          rank: number | null
          slug: string | null
          title_en: string | null
          title_mn: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      project_showcase: {
        Row: {
          author_first_name: string | null
          author_initial: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_mine: boolean | null
          title: string | null
          url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      grant_all_courses: { Args: { p_user: string }; Returns: number }
      has_course_access: { Args: { course: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      revoke_all_courses: { Args: { p_user: string }; Returns: number }
      set_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["user_role"]
          p_user: string
        }
        Returns: undefined
      }
      settle_payment: {
        Args: {
          p_invoice_id: string
          p_provider?: string
          p_raw?: Json
          p_status: Database["public"]["Enums"]["payment_status"]
        }
        Returns: string
      }
    }
    Enums: {
      course_level: "beginner" | "intermediate" | "advanced"
      enrollment_source: "purchase" | "grant" | "free"
      lesson_kind: "video" | "text" | "code" | "quiz"
      payment_status: "pending" | "paid" | "failed" | "expired"
      user_role: "student" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      course_level: ["beginner", "intermediate", "advanced"],
      enrollment_source: ["purchase", "grant", "free"],
      lesson_kind: ["video", "text", "code", "quiz"],
      payment_status: ["pending", "paid", "failed", "expired"],
      user_role: ["student", "admin"],
    },
  },
} as const

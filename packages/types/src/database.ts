/**
 * The database, as TypeScript sees it.
 *
 * Normally generated: `pnpm db:types` overwrites this file from the live schema
 * and **it is never hand-edited afterwards**. This first copy was written by
 * hand from supabase/migrations so the app could be built before the project
 * existed; the moment a real Supabase project is linked, regenerate it and let
 * the generator own the file from then on.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: Database["public"]["Enums"]["user_role"];
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          locale?: string;
          /** Refused by the column grant — go through `set_user_role()`. */
          role?: never;
        };
        Relationships: [];
      };

      courses: {
        Row: {
          id: string;
          slug: string;
          title_mn: string;
          title_en: string | null;
          summary_mn: string;
          summary_en: string | null;
          description_mn: string | null;
          description_en: string | null;
          level: Database["public"]["Enums"]["course_level"];
          topic: string;
          cover_url: string | null;
          price_mnt: number;
          is_published: boolean;
          rank: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title_mn: string;
          title_en?: string | null;
          summary_mn: string;
          summary_en?: string | null;
          description_mn?: string | null;
          description_en?: string | null;
          level?: Database["public"]["Enums"]["course_level"];
          topic?: string;
          cover_url?: string | null;
          price_mnt?: number;
          is_published?: boolean;
          rank?: number;
        };
        Update: Partial<Database["public"]["Tables"]["courses"]["Insert"]>;
        Relationships: [];
      };

      modules: {
        Row: {
          id: string;
          course_id: string;
          title_mn: string;
          title_en: string | null;
          rank: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title_mn: string;
          title_en?: string | null;
          rank?: number;
        };
        Update: Partial<Database["public"]["Tables"]["modules"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };

      lessons: {
        Row: {
          id: string;
          module_id: string;
          course_id: string;
          slug: string;
          title_mn: string;
          title_en: string | null;
          kind: Database["public"]["Enums"]["lesson_kind"];
          video_url: string | null;
          duration_minutes: number;
          body_mn: string | null;
          body_en: string | null;
          code_language: string | null;
          starter_code: string | null;
          solution_code: string | null;
          is_preview: boolean;
          rank: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          /** Set by the `lessons_sync_course` trigger; never sent by the app. */
          course_id?: string;
          slug: string;
          title_mn: string;
          title_en?: string | null;
          kind?: Database["public"]["Enums"]["lesson_kind"];
          video_url?: string | null;
          duration_minutes?: number;
          body_mn?: string | null;
          body_en?: string | null;
          code_language?: string | null;
          starter_code?: string | null;
          solution_code?: string | null;
          is_preview?: boolean;
          rank?: number;
        };
        Update: Partial<Database["public"]["Tables"]["lessons"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey";
            columns: ["module_id"];
            referencedRelation: "modules";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
          {
            foreignKeyName: "lessons_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };

      quiz_questions: {
        Row: {
          id: string;
          lesson_id: string;
          prompt_mn: string;
          prompt_en: string | null;
          options_mn: string[];
          options_en: string[] | null;
          correct_index: number;
          explanation_mn: string | null;
          explanation_en: string | null;
          rank: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          prompt_mn: string;
          prompt_en?: string | null;
          options_mn: string[];
          options_en?: string[] | null;
          correct_index: number;
          explanation_mn?: string | null;
          explanation_en?: string | null;
          rank?: number;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_questions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "quiz_questions_lesson_id_fkey";
            columns: ["lesson_id"];
            referencedRelation: "lessons";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };

      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          source: Database["public"]["Enums"]["enrollment_source"];
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          source?: Database["public"]["Enums"]["enrollment_source"];
          expires_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["enrollments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "enrollments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };

      lesson_progress: {
        Row: {
          user_id: string;
          lesson_id: string;
          course_id: string;
          completed_at: string | null;
          seconds_watched: number;
          quiz_score: number | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          lesson_id: string;
          /** Set by the `progress_sync_course` trigger. */
          course_id?: string;
          completed_at?: string | null;
          seconds_watched?: number;
          quiz_score?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["lesson_progress"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "lesson_progress_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            referencedRelation: "lessons";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };

      payments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          amount_mnt: number;
          provider: string;
          invoice_id: string | null;
          status: Database["public"]["Enums"]["payment_status"];
          raw: Json | null;
          created_at: string;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          amount_mnt: number;
          provider?: string;
          invoice_id?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          raw?: Json | null;
          paid_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
          {
            foreignKeyName: "payments_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };
    };

    Views: {
      /** Lesson metadata for published courses — readable by anyone (000200). */
      lesson_outline: {
        Row: {
          id: string;
          course_id: string;
          module_id: string;
          slug: string;
          title_mn: string;
          title_en: string | null;
          kind: Database["public"]["Enums"]["lesson_kind"];
          duration_minutes: number;
          is_preview: boolean;
          rank: number;
        };
        Relationships: [];
      };
      /** The caller's own progress, one row per course. */
      course_progress: {
        Row: {
          user_id: string;
          course_id: string;
          completed_lessons: number;
          last_activity: string | null;
        };
        Relationships: [];
      };
    };

    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      has_course_access: { Args: { course: string }; Returns: boolean };
      set_user_role: {
        Args: { p_user: string; p_role: Database["public"]["Enums"]["user_role"] };
        Returns: undefined;
      };
      settle_payment: {
        Args: {
          p_invoice_id: string;
          p_status: Database["public"]["Enums"]["payment_status"];
          p_raw?: Json;
          p_provider?: string;
        };
        Returns: string;
      };
    };

    Enums: {
      user_role: "student" | "admin";
      course_level: "beginner" | "intermediate" | "advanced";
      lesson_kind: "video" | "text" | "code" | "quiz";
      enrollment_source: "purchase" | "grant" | "free";
      payment_status: "pending" | "paid" | "failed" | "expired";
    };

    CompositeTypes: Record<never, never>;
  };
};

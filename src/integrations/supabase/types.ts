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
      facilities: {
        Row: {
          activity_type: string
          address: string
          created_at: string
          created_date: string
          description: string | null
          facility_type: string
          gps_coordinates: string | null
          id: string
          jurisdiction_type: Database["public"]["Enums"]["jurisdiction_type"]
          legal_domain: Database["public"]["Enums"]["legal_domain"]
          legal_name: string
          location_accuracy: string | null
          name: string
          ownership: Database["public"]["Enums"]["ownership_type"]
          region: string
          sector: Database["public"]["Enums"]["facility_sector"]
          short_name: string
          status: Database["public"]["Enums"]["facility_status"]
          updated_at: string
        }
        Insert: {
          activity_type: string
          address: string
          created_at?: string
          created_date: string
          description?: string | null
          facility_type: string
          gps_coordinates?: string | null
          id?: string
          jurisdiction_type: Database["public"]["Enums"]["jurisdiction_type"]
          legal_domain: Database["public"]["Enums"]["legal_domain"]
          legal_name: string
          location_accuracy?: string | null
          name: string
          ownership: Database["public"]["Enums"]["ownership_type"]
          region: string
          sector: Database["public"]["Enums"]["facility_sector"]
          short_name: string
          status?: Database["public"]["Enums"]["facility_status"]
          updated_at?: string
        }
        Update: {
          activity_type?: string
          address?: string
          created_at?: string
          created_date?: string
          description?: string | null
          facility_type?: string
          gps_coordinates?: string | null
          id?: string
          jurisdiction_type?: Database["public"]["Enums"]["jurisdiction_type"]
          legal_domain?: Database["public"]["Enums"]["legal_domain"]
          legal_name?: string
          location_accuracy?: string | null
          name?: string
          ownership?: Database["public"]["Enums"]["ownership_type"]
          region?: string
          sector?: Database["public"]["Enums"]["facility_sector"]
          short_name?: string
          status?: Database["public"]["Enums"]["facility_status"]
          updated_at?: string
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
      facility_sector:
        | "صحية"
        | "تعليمية"
        | "صناعية"
        | "زراعية"
        | "رياضية"
        | "ثقافية"
        | "اجتماعية"
        | "دينية"
        | "نقل"
        | "تجارة"
        | "سياحة"
        | "إدارية"
        | "قضائية"
        | "سياسية"
        | "مالية"
        | "كهربائية"
        | "مائية"
        | "تكنولوجية"
        | "بيئية"
      facility_status: "نشط" | "غير نشط" | "قيد الإنشاء" | "معلق"
      jurisdiction_type: "خاص" | "محال" | "تنسيق"
      legal_domain: "مجال عام للجهة" | "مجال خاص للجهة" | "خارج ملكية الجهة"
      ownership_type: "ملكية كاملة" | "إيجار" | "شراكة" | "مملوكة مع جهة أخرى"
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
      facility_sector: [
        "صحية",
        "تعليمية",
        "صناعية",
        "زراعية",
        "رياضية",
        "ثقافية",
        "اجتماعية",
        "دينية",
        "نقل",
        "تجارة",
        "سياحة",
        "إدارية",
        "قضائية",
        "سياسية",
        "مالية",
        "كهربائية",
        "مائية",
        "تكنولوجية",
        "بيئية",
      ],
      facility_status: ["نشط", "غير نشط", "قيد الإنشاء", "معلق"],
      jurisdiction_type: ["خاص", "محال", "تنسيق"],
      legal_domain: ["مجال عام للجهة", "مجال خاص للجهة", "خارج ملكية الجهة"],
      ownership_type: ["ملكية كاملة", "إيجار", "شراكة", "مملوكة مع جهة أخرى"],
    },
  },
} as const

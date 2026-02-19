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
      agri_investments: {
        Row: {
          contact: string
          created_at: string
          district: string
          farmer_name: string
          id: string
          investor_required_amount: number
          land_available: string
          profit_share_percentage: number
          state: string
        }
        Insert: {
          contact: string
          created_at?: string
          district: string
          farmer_name: string
          id?: string
          investor_required_amount: number
          land_available: string
          profit_share_percentage: number
          state: string
        }
        Update: {
          contact?: string
          created_at?: string
          district?: string
          farmer_name?: string
          id?: string
          investor_required_amount?: number
          land_available?: string
          profit_share_percentage?: number
          state?: string
        }
        Relationships: []
      }
      agri_tools: {
        Row: {
          availability: string
          category: string
          created_at: string
          district: string
          id: string
          owner_name: string
          phone: string
          rent_price_per_day: number
          sale_price: number
          state: string
          tool_name: string
        }
        Insert: {
          availability?: string
          category: string
          created_at?: string
          district: string
          id?: string
          owner_name: string
          phone: string
          rent_price_per_day?: number
          sale_price?: number
          state: string
          tool_name: string
        }
        Update: {
          availability?: string
          category?: string
          created_at?: string
          district?: string
          id?: string
          owner_name?: string
          phone?: string
          rent_price_per_day?: number
          sale_price?: number
          state?: string
          tool_name?: string
        }
        Relationships: []
      }
      animal_listings: {
        Row: {
          age: string
          animal_type: string
          breed: string
          created_at: string
          district: string
          health_status: string
          id: string
          phone: string
          price: number
          seller_name: string
          state: string
          vaccinated: boolean
        }
        Insert: {
          age: string
          animal_type: string
          breed: string
          created_at?: string
          district: string
          health_status?: string
          id?: string
          phone: string
          price: number
          seller_name: string
          state: string
          vaccinated?: boolean
        }
        Update: {
          age?: string
          animal_type?: string
          breed?: string
          created_at?: string
          district?: string
          health_status?: string
          id?: string
          phone?: string
          price?: number
          seller_name?: string
          state?: string
          vaccinated?: boolean
        }
        Relationships: []
      }
      crop_rates: {
        Row: {
          avg_price: number
          created_at: string
          crop_name: string
          date: string
          district: string
          id: string
          market_name: string
          max_price: number
          min_price: number
          source: string | null
          state: string
          unit: string
        }
        Insert: {
          avg_price: number
          created_at?: string
          crop_name: string
          date?: string
          district: string
          id?: string
          market_name: string
          max_price: number
          min_price: number
          source?: string | null
          state: string
          unit?: string
        }
        Update: {
          avg_price?: number
          created_at?: string
          crop_name?: string
          date?: string
          district?: string
          id?: string
          market_name?: string
          max_price?: number
          min_price?: number
          source?: string | null
          state?: string
          unit?: string
        }
        Relationships: []
      }
      crop_listings: {
        Row: {
          id: string
          created_at: string
          crop_name: string
          category: string
          quantity: number
          unit: string
          price_per_unit: number
          state: string
          district: string
          location: string
          seller_name: string
          phone: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          crop_name: string
          category?: string
          quantity: number
          unit?: string
          price_per_unit: number
          state: string
          district: string
          location: string
          seller_name: string
          phone: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          crop_name?: string
          category?: string
          quantity?: number
          unit?: string
          price_per_unit?: number
          state?: string
          district?: string
          location?: string
          seller_name?: string
          phone?: string
          notes?: string | null
        }
        Relationships: []
      }
      farm_jobs: {
        Row: {
          contact: string
          created_at: string
          district: string
          id: string
          location: string
          owner_name: string
          state: string
          wage_per_day: number
          work_type: string
        }
        Insert: {
          contact: string
          created_at?: string
          district: string
          id?: string
          location: string
          owner_name: string
          state: string
          wage_per_day: number
          work_type: string
        }
        Update: {
          contact?: string
          created_at?: string
          district?: string
          id?: string
          location?: string
          owner_name?: string
          state?: string
          wage_per_day?: number
          work_type?: string
        }
        Relationships: []
      }
      farmer_guides: {
        Row: {
          category: string
          content_summary: string
          created_at: string
          id: string
          language: string
          title: string
        }
        Insert: {
          category: string
          content_summary: string
          created_at?: string
          id?: string
          language?: string
          title: string
        }
        Update: {
          category?: string
          content_summary?: string
          created_at?: string
          id?: string
          language?: string
          title?: string
        }
        Relationships: []
      }
      farming_classes: {
        Row: {
          class_name: string
          contact: string
          created_at: string
          district: string
          duration: string
          fees: number
          id: string
          mode: string
          state: string
        }
        Insert: {
          class_name: string
          contact: string
          created_at?: string
          district: string
          duration: string
          fees: number
          id?: string
          mode: string
          state: string
        }
        Update: {
          class_name?: string
          contact?: string
          created_at?: string
          district?: string
          duration?: string
          fees?: number
          id?: string
          mode?: string
          state?: string
        }
        Relationships: []
      }
      ff_seeds: {
        Row: {
          available_states: string
          created_at: string
          crop_type: string
          growth_days: number
          id: string
          price_per_kg: number
          refund_policy: string
          seed_name: string
        }
        Insert: {
          available_states: string
          created_at?: string
          crop_type: string
          growth_days: number
          id?: string
          price_per_kg: number
          refund_policy: string
          seed_name: string
        }
        Update: {
          available_states?: string
          created_at?: string
          crop_type?: string
          growth_days?: number
          id?: string
          price_per_kg?: number
          refund_policy?: string
          seed_name?: string
        }
        Relationships: []
      }
      government_schemes: {
        Row: {
          benefit_details: string
          created_at: string
          eligibility: string
          id: string
          official_link: string | null
          scheme_name: string
          scheme_type: string
          state: string
          subsidy_percentage: string | null
        }
        Insert: {
          benefit_details: string
          created_at?: string
          eligibility: string
          id?: string
          official_link?: string | null
          scheme_name: string
          scheme_type: string
          state: string
          subsidy_percentage?: string | null
        }
        Update: {
          benefit_details?: string
          created_at?: string
          eligibility?: string
          id?: string
          official_link?: string | null
          scheme_name?: string
          scheme_type?: string
          state?: string
          subsidy_percentage?: string | null
        }
        Relationships: []
      }
      interest_records: {
        Row: {
          calculated_interest: number
          created_at: string
          farmer_name: string
          id: string
          interest_rate: number
          interest_type: string
          principal_amount: number
          time_period_years: number
        }
        Insert: {
          calculated_interest: number
          created_at?: string
          farmer_name: string
          id?: string
          interest_rate: number
          interest_type?: string
          principal_amount: number
          time_period_years: number
        }
        Update: {
          calculated_interest?: number
          created_at?: string
          farmer_name?: string
          id?: string
          interest_rate?: number
          interest_type?: string
          principal_amount?: number
          time_period_years?: number
        }
        Relationships: []
      }
      land_rentals: {
        Row: {
          contact_number: string
          created_at: string
          district: string
          id: string
          land_size_acres: number
          owner_name: string
          rent_price_per_acre: number
          soil_type: string
          state: string
        }
        Insert: {
          contact_number: string
          created_at?: string
          district: string
          id?: string
          land_size_acres: number
          owner_name: string
          rent_price_per_acre: number
          soil_type: string
          state: string
        }
        Update: {
          contact_number?: string
          created_at?: string
          district?: string
          id?: string
          land_size_acres?: number
          owner_name?: string
          rent_price_per_acre?: number
          soil_type?: string
          state?: string
        }
        Relationships: []
      }
      learning_videos: {
        Row: {
          created_at: string
          feature_name: string
          id: string
          language: string
          title: string
          youtube_url: string
        }
        Insert: {
          created_at?: string
          feature_name: string
          id?: string
          language?: string
          title: string
          youtube_url: string
        }
        Update: {
          created_at?: string
          feature_name?: string
          id?: string
          language?: string
          title?: string
          youtube_url?: string
        }
        Relationships: []
      }
      loan_offers: {
        Row: {
          bank_name: string
          contact_number: string
          created_at: string
          id: string
          interest_rate: number
          loan_type: string
          max_amount: number
          min_amount: number
          state: string
        }
        Insert: {
          bank_name: string
          contact_number: string
          created_at?: string
          id?: string
          interest_rate: number
          loan_type: string
          max_amount: number
          min_amount: number
          state: string
        }
        Update: {
          bank_name?: string
          contact_number?: string
          created_at?: string
          id?: string
          interest_rate?: number
          loan_type?: string
          max_amount?: number
          min_amount?: number
          state?: string
        }
        Relationships: []
      }
      officers: {
        Row: {
          created_at: string
          district: string
          experience_years: number
          id: string
          name: string
          office_address: string
          phone: string
          role: string
          state: string
        }
        Insert: {
          created_at?: string
          district: string
          experience_years?: number
          id?: string
          name: string
          office_address: string
          phone: string
          role: string
          state: string
        }
        Update: {
          created_at?: string
          district?: string
          experience_years?: number
          id?: string
          name?: string
          office_address?: string
          phone?: string
          role?: string
          state?: string
        }
        Relationships: []
      }
      price_predictions: {
        Row: {
          confidence_percentage: number
          created_at: string
          crop_name: string
          current_price: number
          district: string
          id: string
          predicted_price: number
          prediction_date: string
          state: string
        }
        Insert: {
          confidence_percentage?: number
          created_at?: string
          crop_name: string
          current_price: number
          district: string
          id?: string
          predicted_price: number
          prediction_date: string
          state: string
        }
        Update: {
          confidence_percentage?: number
          created_at?: string
          crop_name?: string
          current_price?: number
          district?: string
          id?: string
          predicted_price?: number
          prediction_date?: string
          state?: string
        }
        Relationships: []
      }
      soil_reports: {
        Row: {
          created_at: string
          district: string
          farmer_name: string
          id: string
          nitrogen_level: string
          ph_value: number
          phosphorus_level: string
          potassium_level: string
          recommended_crops: string
          soil_type: string
          state: string
        }
        Insert: {
          created_at?: string
          district: string
          farmer_name: string
          id?: string
          nitrogen_level: string
          ph_value: number
          phosphorus_level: string
          potassium_level: string
          recommended_crops: string
          soil_type: string
          state: string
        }
        Update: {
          created_at?: string
          district?: string
          farmer_name?: string
          id?: string
          nitrogen_level?: string
          ph_value?: number
          phosphorus_level?: string
          potassium_level?: string
          recommended_crops?: string
          soil_type?: string
          state?: string
        }
        Relationships: []
      }
      technicians: {
        Row: {
          availability_status: string
          category: string
          created_at: string
          district: string
          experience: string
          id: string
          name: string
          phone: string
          rating: number
          services: string
          state: string
        }
        Insert: {
          availability_status?: string
          category: string
          created_at?: string
          district: string
          experience: string
          id?: string
          name: string
          phone: string
          rating?: number
          services: string
          state: string
        }
        Update: {
          availability_status?: string
          category?: string
          created_at?: string
          district?: string
          experience?: string
          id?: string
          name?: string
          phone?: string
          rating?: number
          services?: string
          state?: string
        }
        Relationships: []
      }
      weather_forecast: {
        Row: {
          condition: string
          created_at: string
          district: string
          forecast_date: string
          forecast_type: string
          humidity: number
          id: string
          rainfall: number
          state: string
          temperature: number
          wind_speed: number
        }
        Insert: {
          condition?: string
          created_at?: string
          district: string
          forecast_date?: string
          forecast_type?: string
          humidity: number
          id?: string
          rainfall?: number
          state: string
          temperature: number
          wind_speed?: number
        }
        Update: {
          condition?: string
          created_at?: string
          district?: string
          forecast_date?: string
          forecast_type?: string
          humidity?: number
          id?: string
          rainfall?: number
          state?: string
          temperature?: number
          wind_speed?: number
        }
        Relationships: []
      }
      weekend_sessions: {
        Row: {
          contact: string
          created_at: string
          duration_days: number
          fee: number
          id: string
          location: string
          session_name: string
          state: string
        }
        Insert: {
          contact: string
          created_at?: string
          duration_days?: number
          fee: number
          id?: string
          location: string
          session_name: string
          state: string
        }
        Update: {
          contact?: string
          created_at?: string
          duration_days?: number
          fee?: number
          id?: string
          location?: string
          session_name?: string
          state?: string
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

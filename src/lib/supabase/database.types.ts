export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          full_name: string;
          profile: "administracao" | "supervisor" | "at" | "recepcao";
          is_master: boolean;
          professional_council: string | null;
          professional_role: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          profile: "administracao" | "supervisor" | "at" | "recepcao";
          is_master?: boolean;
          professional_council?: string | null;
          professional_role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          profile?: "administracao" | "supervisor" | "at" | "recepcao";
          is_master?: boolean;
          professional_council?: string | null;
          professional_role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clinical_evolution_records: {
        Row: {
          id: string;
          patient_id: string;
          patient_name: string;
          session_date: string;
          content_html: string;
          status: "draft" | "finalized";
          professional_name: string;
          professional_role: string;
          professional_council: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          patient_name: string;
          session_date: string;
          content_html?: string;
          status?: "draft" | "finalized";
          professional_name: string;
          professional_role: string;
          professional_council?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          patient_name?: string;
          session_date?: string;
          content_html?: string;
          status?: "draft" | "finalized";
          professional_name?: string;
          professional_role?: string;
          professional_council?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agenda_audit_logs: {
        Row: {
          id: string;
          performed_at: string;
          user_name: string;
          user_profile: string;
          action_label: string;
          patient_name: string;
          from_description: string;
          to_description: string;
          appointment_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          performed_at?: string;
          user_name: string;
          user_profile: string;
          action_label: string;
          patient_name: string;
          from_description: string;
          to_description: string;
          appointment_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          performed_at?: string;
          user_name?: string;
          user_profile?: string;
          action_label?: string;
          patient_name?: string;
          from_description?: string;
          to_description?: string;
          appointment_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      internal_messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      internal_notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "patient_waiting" | "new_message";
          title: string;
          body: string;
          metadata: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "patient_waiting" | "new_message";
          title: string;
          body: string;
          metadata?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "patient_waiting" | "new_message";
          title?: string;
          body?: string;
          metadata?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_presence: {
        Row: {
          user_id: string;
          last_seen_at: string;
        };
        Insert: {
          user_id: string;
          last_seen_at?: string;
        };
        Update: {
          user_id?: string;
          last_seen_at?: string;
        };
        Relationships: [];
      };
      agenda_events: {
        Row: {
          id: string;
          patient_name: string;
          professional_name: string;
          professional_user_id: string | null;
          event_date: string;
          start_time: string;
          end_time: string;
          status: "confirmado" | "agendado" | "em_espera" | "cancelado";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          patient_name: string;
          professional_name: string;
          professional_user_id?: string | null;
          event_date: string;
          start_time: string;
          end_time: string;
          status?: "confirmado" | "agendado" | "em_espera" | "cancelado";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_name?: string;
          professional_name?: string;
          professional_user_id?: string | null;
          event_date?: string;
          start_time?: string;
          end_time?: string;
          status?: "confirmado" | "agendado" | "em_espera" | "cancelado";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type UserProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];

export type ClinicalEvolutionRecordRow =
  Database["public"]["Tables"]["clinical_evolution_records"]["Row"];

export type AgendaAuditLogRow =
  Database["public"]["Tables"]["agenda_audit_logs"]["Row"];

export type AgendaAuditLogInsert =
  Database["public"]["Tables"]["agenda_audit_logs"]["Insert"];

export type InternalMessageRow =
  Database["public"]["Tables"]["internal_messages"]["Row"];

export type InternalNotificationRow =
  Database["public"]["Tables"]["internal_notifications"]["Row"];

export type UserPresenceRow =
  Database["public"]["Tables"]["user_presence"]["Row"];

export type AgendaEventRow =
  Database["public"]["Tables"]["agenda_events"]["Row"];

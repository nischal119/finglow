export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string;
          description: string;
          amount: number;
          category_id: string;
          date: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          description: string;
          amount: number;
          category_id: string;
          date: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          description?: string;
          amount?: number;
          category_id?: string;
          date?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          color: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

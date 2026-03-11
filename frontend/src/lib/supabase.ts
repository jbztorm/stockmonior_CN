import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (will be generated from Supabase)
export interface Database {
  public: {
    Tables: {
      stocks: {
        Row: {
          id: number;
          symbol: string;
          name: string;
          market: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          symbol: string;
          name: string;
          market: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          symbol?: string;
          name?: string;
          market?: string;
          created_at?: string;
        };
      };
      watchlist: {
        Row: {
          id: number;
          user_id: string;
          stock_id: number;
          added_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          stock_id: number;
          added_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          stock_id?: number;
          added_at?: string;
        };
      };
      price_history: {
        Row: {
          id: number;
          stock_id: number;
          trade_date: string;
          open: number;
          high: number;
          low: number;
          close: number;
          volume: number;
          amount: number;
        };
        Insert: {
          id?: number;
          stock_id: number;
          trade_date: string;
          open: number;
          high: number;
          low: number;
          close: number;
          volume: number;
          amount: number;
        };
        Update: {
          id?: number;
          stock_id?: number;
          trade_date?: string;
          open?: number;
          high?: number;
          low?: number;
          close?: number;
          volume?: number;
          amount?: number;
        };
      };
      alerts: {
        Row: {
          id: number;
          user_id: string;
          stock_id: number;
          threshold: number;
          condition: string;
          triggered: boolean;
          triggered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          stock_id: number;
          threshold: number;
          condition: string;
          triggered?: boolean;
          triggered_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          stock_id?: number;
          threshold?: number;
          condition?: string;
          triggered?: boolean;
          triggered_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

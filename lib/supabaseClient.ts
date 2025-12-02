import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kfmbiqynjlatcjswmmtj.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmbWJpcXluamxhdGNqc3dtbXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NjM2NDUsImV4cCI6MjA4MDEzOTY0NX0.fhpoZkYoerEAqyjDwALtus0YH9iTkPBiGeG6JVyaK0Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
import { createClient } from '@supabase/supabase-js'

// Ganti dengan URL dan Kunci API dari dasbor Supabase Anda
const supabaseUrl = 'https://udputoelhsxzbpsjvixi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcHV0b2VsaHN4emJwc2p2aXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjY0OTUsImV4cCI6MjA4ODg0MjQ5NX0.xCGUnUjlB8SxDpFAbyMvFNRwLlPHQuLaox_DgFGAJzg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// STEP 1: Your Project ID
// ------------------------------------------------------------------
const supabaseUrl = "https://rczwdjbczcxzktsornxk.supabase.co"; 

// ------------------------------------------------------------------
// STEP 2: Your Anon Key (Configured!)
// ------------------------------------------------------------------
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjendkamJjemN4emt0c29ybnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NjA4NjcsImV4cCI6MjA3NTMzNjg2N30.cvPVV6pghsGE405L60CoI09IYMxNobsULjrdjPnJUq0";

// This connects your app to the cloud!
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

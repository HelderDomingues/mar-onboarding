// scripts/get-token.js
// Usage:
// SUPABASE_URL=https://your-project.supabase.co SUPABASE_ANON_KEY=your-anon-key node scripts/get-token.js email password

import { createClient } from '@supabase/supabase-js';

const [,, emailArg, passwordArg] = process.argv;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables');
  process.exit(2);
}

if (!emailArg || !passwordArg) {
  console.error('Usage: SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/get-token.js email@example.com password');
  process.exit(2);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  const email = emailArg;
  const password = passwordArg;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Sign in error:', error);
      process.exit(1);
    }

    // Print full session for debugging; access_token is under data.session.access_token (v2 client)
    console.log(JSON.stringify(data, null, 2));
    const token = data?.session?.access_token || data?.access_token || null;
    if (token) {
      console.log('\nACCESS_TOKEN:', token);
    } else {
      console.warn('No access_token found in response. Check the printed JSON above.');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();

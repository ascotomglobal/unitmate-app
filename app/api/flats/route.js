import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iapgvoyisrjgusktkojh.supabase.co';
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!supabaseKey) {
    return NextResponse.json({ error: 'Missing service key' }, { status: 500 });
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/flats?select=block,flat,monnify_account_number,monnify_bank_name,paid_months`
,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      cache: 'no-store',
    }
  );

  const data = await res.json();
  return NextResponse.json(data);
}

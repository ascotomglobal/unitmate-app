import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iapgvoyisrjgusktkojh.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = process.env.MONNIFY_API_KEY;
  const secretKey = process.env.MONNIFY_SECRET_KEY;
  const contractCode = process.env.MONNIFY_CONTRACT_CODE;

  if (!supabaseKey || !apiKey || !secretKey || !contractCode) {
    return NextResponse.json(
      { error: 'Missing environment variables on server' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Authenticate with Monnify Live
  const credentials = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');
  const authRes = await fetch('https://api.monnify.com/api/v1/auth/login', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  });

  const authData = await authRes.json();
  if (!authData.requestSuccessful) {
    return NextResponse.json({ error: authData.responseMessage }, { status: 400 });
  }
  const token = authData.responseBody.accessToken;

  // 2. Fetch all 42 residential flats missing bank accounts
  const { data: flats, error } = await supabase
    .from('flats')
    .select('*')
    .eq('unit_type', 'residential')
    .is('monnify_account_number', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const updatedFlats = [];

  for (const flat of flats) {
    try {
      const monRes = await fetch(
        'https://api.monnify.com/api/v2/bank-transfer/reserved-accounts',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accountReference: flat.monnify_account_reference,
            accountName: `Action Unit ${flat.block} ${flat.flat}`,
            currencyCode: 'NGN',
            contractCode: contractCode,
            customerEmail: `resident.${flat.block.replace(/\s+/g, '')}${flat.flat.replace(/\s+/g, '')}@unitmate.ng`.toLowerCase(),
            customerName: `${flat.block} ${flat.flat}`,
            getAllAvailableBanks: true,
          }),
        }
      );

      const monData = await monRes.json();
      if (monData.requestSuccessful && monData.responseBody?.accounts?.length) {
        const preferred =
          monData.responseBody.accounts.find((a) =>
            a.bankName.toLowerCase().includes('wema')
          ) || monData.responseBody.accounts[0];

        await supabase
          .from('flats')
          .update({
            monnify_account_number: preferred.accountNumber,
            monnify_bank_name: preferred.bankName,
          })
          .eq('id', flat.id);

        updatedFlats.push({
          unit: `${flat.block} ${flat.flat}`,
          bank: preferred.bankName,
          accountNumber: preferred.accountNumber,
        });
      }
    } catch (err) {
      console.error(`Error on ${flat.block} ${flat.flat}:`, err);
    }
  }

  return NextResponse.json({
    success: true,
    totalAssigned: updatedFlats.length,
    flats: updatedFlats,
  });
}

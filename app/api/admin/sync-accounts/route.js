import { NextResponse } from 'next/server';

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

  // 2. Fetch the 42 residential flats lacking account numbers via Supabase REST API
  const getFlatsRes = await fetch(
    `${supabaseUrl}/rest/v1/flats?unit_type=eq.residential&monnify_account_number=is.null&select=*`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }
  );

  const flats = await getFlatsRes.json();
  if (!Array.isArray(flats)) {
    return NextResponse.json({ error: 'Failed to query Supabase', details: flats }, { status: 500 });
  }

  const updatedFlats = [];

  // 3. Request reserved account for each flat from Monnify
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

        // Update record in Supabase REST API
        await fetch(`${supabaseUrl}/rest/v1/flats?id=eq.${flat.id}`, {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            monnify_account_number: preferred.accountNumber,
            monnify_bank_name: preferred.bankName,
          }),
        });

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

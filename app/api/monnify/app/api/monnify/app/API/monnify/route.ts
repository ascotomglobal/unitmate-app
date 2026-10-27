import { NextResponse } from 'next/server';

const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';

// Generate Monnify Bearer Token
async function getAuthToken() {
  const apiKey = process.env.MONNIFY_API_KEY;
  const secretKey = process.env.MONNIFY_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error('Monnify credentials are not configured in Vercel');
  }

  const credentials = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');

  const response = await fetch(`${MONNIFY_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!data.requestSuccessful) {
    throw new Error(data.responseMessage || 'Failed to authenticate with Monnify');
  }

  return data.responseBody.accessToken;
}

// POST: Create or Reserve Virtual Account for a Flat/Shop
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { unitId, unitName, customerEmail, customerName } = body;

    const token = await getAuthToken();
    const contractCode = process.env.MONNIFY_CONTRACT_CODE || '4HT2DW13YC5P';

    const payload = {
      accountReference: `UNITMATE-${unitId}-${Date.now()}`,
      accountName: `UnitMate - ${unitName}`,
      currencyCode: 'NGN',
      contractCode: contractCode,
      customerEmail: customerEmail || 'payments@ascotomglobal.com',
      customerName: customerName || unitName,
      getAllAvailableBanks: true,
    };

    const response = await fetch(`${MONNIFY_BASE_URL}/api/v2/bank-transfer/reserved-accounts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

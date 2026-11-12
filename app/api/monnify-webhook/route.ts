import crypto from 'crypto';
import { NextResponse } from 'next/server';

const MONTH_QUEUE = [
  'Oct 2025', 'Nov 2025', 'Dec 2025',
  'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026',
  'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026',
  'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026',
  'Jan 2027', 'Feb 2027', 'Mar 2027', 'Apr 2027',
  'May 2027', 'Jun 2027', 'Jul 2027', 'Aug 2027',
  'Sep 2027', 'Oct 2027', 'Nov 2027', 'Dec 2027',
];

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('monnify-signature');
    const secretKey = (process.env.MONNIFY_SECRET_KEY || '').trim();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iapgvoyisrjgusktkojh.supabase.co';
    const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

    if (!secretKey || !supabaseKey) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // 1. Verify HMAC-SHA512 Monnify Signature
    const computedHash = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex');

    if (!signature || computedHash !== signature) {
      return NextResponse.json({ error: 'Invalid Monnify signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // Only process successful collections
    if (payload.eventType !== 'SUCCESSFUL_TRANSACTION') {
      return NextResponse.json({ received: true, ignored: payload.eventType });
    }

    const eventData = payload.eventData;
    const txRef = eventData.transactionReference;
    const amountPaid = Number(eventData.amountPaid || 0);
    const accountRef = eventData.product?.reference; // Matches flats.monnify_account_reference

    // 2. Idempotency Check: Prevent double-crediting if Monnify retries webhook
    const checkTxRes = await fetch(
      `${supabaseUrl}/rest/v1/monnify_transactions?transaction_reference=eq.${encodeURIComponent(txRef)}&select=transaction_reference`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );
    const existingTx = await checkTxRes.json();
    if (Array.isArray(existingTx) && existingTx.length > 0) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    // 3. Log verified transaction in Supabase
    await fetch(`${supabaseUrl}/rest/v1/monnify_transactions`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        transaction_reference: txRef,
        payment_reference: eventData.paymentReference,
        account_reference: accountRef,
        amount_paid: amountPaid,
        customer_name: eventData.customer?.name || 'Resident',
        paid_on: eventData.paidOn || new Date().toISOString(),
      }),
    });

    // 4. Match flat by monnify_account_reference & credit cleared months
    if (accountRef && amountPaid >= 2250) {
      const flatRes = await fetch(
        `${supabaseUrl}/rest/v1/flats?monnify_account_reference=eq.${encodeURIComponent(accountRef)}&select=*`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );
      const flats = await flatRes.json();

      if (Array.isArray(flats) && flats.length > 0) {
        const flat = flats[0];
        const currentPaid = Array.isArray(flat.paid_months) ? flat.paid_months : [];
        const monthsCovered = Math.floor(amountPaid / 2250);

        // Find oldest unpaid months in chronological order
        const unpaidMonths = MONTH_QUEUE.filter((m) => !currentPaid.includes(m));
        const newlyCleared = unpaidMonths.slice(0, monthsCovered);
        const updatedPaidMonths = [...currentPaid, ...newlyCleared];

        await fetch(`${supabaseUrl}/rest/v1/flats?id=eq.${flat.id}`, {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            paid_months: updatedPaidMonths,
          }),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Monnify webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

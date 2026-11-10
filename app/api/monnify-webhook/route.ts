import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    const eventData = body.eventData;
    const paymentStatus = eventData?.paymentStatus;
    const paymentReference = eventData?.paymentReference;
    const amountPaid = eventData?.amountPaid;
    const customerEmail = eventData?.customer?.email;

    if (body.eventType === "SUCCESSFUL_TRANSACTION" && paymentStatus === "PAID") {
      console.log(`Payment confirmed: Ref ${paymentReference}, Amount: ₦${amountPaid}, Customer: ${customerEmail}`);
      
      // Monnify received payment successfully
      return NextResponse.json({ status: "success", message: "Transaction recorded" }, { status: 200 });
    }

    return NextResponse.json({ status: "ignored" }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

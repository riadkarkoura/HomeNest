import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/dal";
import { createPaymentIntent } from "@/lib/payments";

export async function POST(request: Request) {
  const session = await getUser();
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  const { user, supabase } = session;

  const body = await request.json().catch(() => null);
  const orderNumber = body?.orderNumber;
  if (typeof orderNumber !== "string") {
    return NextResponse.json({ error: "Missing orderNumber." }, { status: 400 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, total, currency, payment_status")
    .eq("order_number", orderNumber)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.payment_status !== "unpaid") {
    return NextResponse.json({ error: "This order has already been paid." }, { status: 409 });
  }

  const result = await createPaymentIntent("stripe", Number(order.total), order.currency, {
    orderId: order.id,
    orderNumber,
  });

  if (!result.ok || !result.clientSecret || !result.paymentIntentId) {
    return NextResponse.json({ error: result.error ?? "Failed to initialize payment." }, { status: 502 });
  }

  const { error: rpcError } = await supabase.rpc("record_stripe_payment_intent", {
    p_order_id: order.id,
    p_payment_intent_id: result.paymentIntentId,
  });

  if (rpcError) {
    console.error("[stripe intent] record_stripe_payment_intent failed", rpcError);
  }

  return NextResponse.json({ clientSecret: result.clientSecret });
}

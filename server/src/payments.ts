import { stripe } from "./";

export async function createPaymentIntent(amount: number) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "inr",
  });
  return paymentIntent;
}

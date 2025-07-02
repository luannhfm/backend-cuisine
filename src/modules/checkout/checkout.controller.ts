import { FastifyRequest, FastifyReply } from 'fastify';
import { stripe } from '../../config/stripe';

export async function createCheckoutController(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as {
    customerId: string;
    items: { stripePriceId: string; quantity: number; name: string; price: number; productId: string }[];
  };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: body.items.map(item => ({
        price: item.stripePriceId,
        quantity: item.quantity,
      })),
      success_url: 'http://localhost:4200/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:4200/home',

      metadata: {
        customerId: body.customerId,
        items: JSON.stringify(
          body.items.map(item => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        )
      }
    });

    return reply.send({ url: session.url });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'Failed to create checkout session' });
  }
}

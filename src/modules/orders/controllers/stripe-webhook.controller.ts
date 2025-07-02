import { FastifyRequest, FastifyReply } from 'fastify';
import Stripe from 'stripe';
import { OrderService } from '../services/order.service';
import { CustomerService } from '../../sessions/services/customer.service';
import { sendOrderConfirmationEmail } from '../services/email.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function stripeWebhookController(request: FastifyRequest, reply: FastifyReply) {
  const sig = request.headers['stripe-signature'] as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      (request as any).rawBody, // Garantir uso de rawBody no Fastify
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return reply.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerId = session.metadata?.customerId;
    const items = JSON.parse(session.metadata?.items || '[]');

    const order = await OrderService.create({
      customerId: customerId!,
      items,
      total: Number(session.amount_total) / 100,
      status: 'paid',
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
    });

    // Buscar e-mail do cliente
    const customer = await CustomerService.getById(customerId!);
    
    if (customer?.email) {
        console.log('Enviando e-mail para:', customer.email);

      await sendOrderConfirmationEmail(customer.email, {
        id: order.id,
        items,
        total: order.total,
      });
    }
  }

  return reply.send({ received: true });
}

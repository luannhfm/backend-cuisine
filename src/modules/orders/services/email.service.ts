import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendOrderConfirmationEmail(to: string, order: {
  id: string;
  items: {
    name: string;
    quantity: number;
    price: number | string;
  }[];
  total: number;
}) {
  const formattedRows = order.items.map(item => {
    const priceNumber = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td align="center" style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td align="right" style="padding: 8px; border-bottom: 1px solid #ddd;">$${priceNumber.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://www.braziliancuisinechef.com/cdn/shop/files/Untitled_design_16.png" alt="Brazilian Cuisine Logo" style="max-width: 160px;" />
      </div>

      <h2 style="text-align: center; color: #10B33E;">Thank you for your order!</h2>
      <p>Hello,</p>
      <p>We’ve received your order <strong>#${order.id}</strong> and it’s now being processed.</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th align="left" style="padding: 8px;">Product</th>
            <th align="center" style="padding: 8px;">Qty</th>
            <th align="right" style="padding: 8px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${formattedRows}
        </tbody>
      </table>

      <p style="text-align: right; font-size: 16px; margin-top: 20px;"><strong>Total: $${order.total.toFixed(2)}</strong></p>

      <div style="text-align: center; margin-top: 30px;">
        <a href="https://braziliancuisine.com/account" style="background-color: #10B33E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Your Order</a>
      </div>

      <p style="margin-top: 40px; font-size: 12px; color: #999; text-align: center;">
        Brazilian Cuisine - Do not reply to this email. For support, contact us at support@braziliancuisine.com
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'Brazilian Cuisine <onboarding@resend.dev>',
      to,
      subject: 'Your Order Confirmation',
      html: htmlContent
    });
    console.log('E-mail enviado com sucesso');
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}

import nodemailer from 'nodemailer'

const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

// ── Shared Styles ────────────────────────────────────────────────────────────
const header = `
  <div style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:24px 32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:-0.5px">Jainnext</h1>
    <p style="color:#fca5a5;margin:6px 0 0;font-size:13px">Decoration Lighting</p>
  </div>`

const wrap = (body) => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    ${header}
    <div style="padding:32px">${body}</div>
    <div style="background:#f9fafb;padding:16px 32px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #f3f4f6">
      Jainnext Decoration Lighting &bull; Delhi, India
    </div>
  </div>`

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`

const itemsTable = (items) => `
  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px">
    <thead>
      <tr style="background:#f3f4f6">
        <th style="text-align:left;padding:8px 10px;color:#374151">Product</th>
        <th style="text-align:center;padding:8px 10px;color:#374151">Qty</th>
        <th style="text-align:right;padding:8px 10px;color:#374151">Price</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(item => `
        <tr style="border-top:1px solid #f3f4f6">
          <td style="padding:8px 10px;color:#111">${item.name}</td>
          <td style="padding:8px 10px;text-align:center;color:#374151">${item.quantity}</td>
          <td style="padding:8px 10px;text-align:right;color:#374151">${formatCurrency((item.retailPrice || item.price) * item.quantity)}</td>
        </tr>`).join('')}
    </tbody>
  </table>`

const addressBlock = (address) => `
  <p style="margin:0;font-size:13px;color:#374151;line-height:1.7">
    ${address.firstName} ${address.lastName}<br/>
    ${address.street}, ${address.city}<br/>
    ${address.state} – ${address.zipcode}<br/>
    ${address.country}<br/>
    ${address.phone}
  </p>`

const orderId = (id) => `<span style="font-family:monospace;font-weight:700;color:#dc2626">#${id.toString().slice(-8).toUpperCase()}</span>`

// ── Email Senders ────────────────────────────────────────────────────────────

/**
 * Sent to customer when order is placed (COD or Razorpay paid).
 */
export const sendOrderConfirmationEmail = async (order, customerEmail, customerName) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return

    const html = wrap(`
      <h2 style="margin:0 0 6px;font-size:20px;color:#111">Order Confirmed! 🎉</h2>
      <p style="color:#6b7280;font-size:14px;margin:0 0 20px">Hi ${customerName}, your order has been placed successfully.</p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 18px;margin-bottom:20px">
        <p style="margin:0;font-size:13px;color:#166534">Order ID: ${orderId(order._id)}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#166534">Payment: <strong>${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online (Paid)'}</strong></p>
      </div>

      <h3 style="font-size:14px;color:#374151;margin:0 0 4px">Items Ordered</h3>
      ${itemsTable(order.items)}

      <div style="display:flex;justify-content:flex-end">
        <table style="font-size:13px;color:#374151">
          <tr><td style="padding:3px 16px 3px 0">Subtotal</td><td style="text-align:right">${formatCurrency(order.amount - 10)}</td></tr>
          <tr><td style="padding:3px 16px 3px 0">Delivery</td><td style="text-align:right">${formatCurrency(10)}</td></tr>
          <tr><td style="padding:6px 16px 3px 0;font-weight:700;font-size:14px">Total</td><td style="text-align:right;font-weight:700;font-size:14px">${formatCurrency(order.amount)}</td></tr>
        </table>
      </div>

      <h3 style="font-size:14px;color:#374151;margin:20px 0 6px">Delivery Address</h3>
      ${addressBlock(order.address)}

      <p style="margin:24px 0 0;font-size:13px;color:#6b7280">We'll notify you when your order is shipped. Thank you for shopping with Jainnext!</p>
    `)

    try {
        await createTransporter().sendMail({
            from: `"Jainnext" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `Order Confirmed – ${orderId(order._id).replace(/<[^>]+>/g, '')}`,
            html,
        })
    } catch (err) {
        console.error('Failed to send order confirmation email:', err.message)
    }
}

/**
 * Sent to admin when a new order is placed.
 */
export const sendAdminNewOrderEmail = async (order, customerName, customerEmail) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) return

    const html = wrap(`
      <h2 style="margin:0 0 6px;font-size:20px;color:#111">New Order Received 🛒</h2>
      <p style="color:#6b7280;font-size:14px;margin:0 0 20px">A new order has been placed on Jainnext.</p>

      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;margin-bottom:20px">
        <p style="margin:0;font-size:13px;color:#991b1b">Order ID: ${orderId(order._id)}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#991b1b">Customer: <strong>${customerName}</strong> (${customerEmail})</p>
        <p style="margin:4px 0 0;font-size:13px;color:#991b1b">Payment: <strong>${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online (Paid)'}</strong></p>
        <p style="margin:4px 0 0;font-size:13px;color:#991b1b">Total: <strong>${formatCurrency(order.amount)}</strong></p>
      </div>

      <h3 style="font-size:14px;color:#374151;margin:0 0 4px">Items</h3>
      ${itemsTable(order.items)}

      <h3 style="font-size:14px;color:#374151;margin:20px 0 6px">Delivery Address</h3>
      ${addressBlock(order.address)}
    `)

    try {
        await createTransporter().sendMail({
            from: `"Jainnext Orders" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `New Order ${orderId(order._id).replace(/<[^>]+>/g, '')} – ${formatCurrency(order.amount)}`,
            html,
        })
    } catch (err) {
        console.error('Failed to send admin new-order email:', err.message)
    }
}

/**
 * Sent to customer when admin updates the order status.
 * statusMessages maps status → { subject, headline, body }
 */
const STATUS_CONTENT = {
    Shipped: {
        subject: 'Your order has been shipped! 🚚',
        headline: 'Your Order is on its Way!',
        body: (tracking) => `Your order has been dispatched.${tracking ? ` Your tracking number is <strong>${tracking}</strong>.` : ''} You'll receive it soon!`,
        color: '#ea580c',
    },
    'Out for Delivery': {
        subject: 'Out for delivery today! 📦',
        headline: 'Out for Delivery',
        body: () => 'Great news! Your order is out for delivery today. Please keep your phone handy.',
        color: '#7c3aed',
    },
    Delivered: {
        subject: 'Order delivered! ✅',
        headline: 'Order Delivered Successfully',
        body: () => 'Your order has been delivered. We hope you love your new lights! If you have any issues, feel free to contact us.',
        color: '#16a34a',
    },
    Cancelled: {
        subject: 'Order cancelled',
        headline: 'Order Cancelled',
        body: () => 'Your order has been cancelled. If you did not request this cancellation or have questions, please contact our support.',
        color: '#dc2626',
    },
}

export const sendOrderStatusEmail = async (order, customerEmail, customerName, newStatus, trackingNumber) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return
    const content = STATUS_CONTENT[newStatus]
    if (!content) return // No email for 'New' re-updates etc.

    const html = wrap(`
      <h2 style="margin:0 0 6px;font-size:20px;color:#111">${content.headline}</h2>
      <p style="color:#6b7280;font-size:14px;margin:0 0 20px">Hi ${customerName},</p>

      <div style="background:#f9fafb;border-left:4px solid ${content.color};border-radius:4px;padding:14px 18px;margin-bottom:20px">
        <p style="margin:0;font-size:14px;color:#111">${content.body(trackingNumber)}</p>
      </div>

      <div style="font-size:13px;color:#374151;margin-bottom:20px">
        <p style="margin:0">Order ID: ${orderId(order._id)}</p>
        <p style="margin:4px 0 0">Total: <strong>${formatCurrency(order.amount)}</strong></p>
      </div>

      <h3 style="font-size:14px;color:#374151;margin:0 0 4px">Items</h3>
      ${itemsTable(order.items)}

      <p style="margin:24px 0 0;font-size:13px;color:#6b7280">Thank you for shopping with Jainnext!</p>
    `)

    try {
        await createTransporter().sendMail({
            from: `"Jainnext" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: content.subject,
            html,
        })
    } catch (err) {
        console.error(`Failed to send ${newStatus} status email:`, err.message)
    }
}

import nodemailer from 'nodemailer'

const LOGO_URL = 'https://raw.githubusercontent.com/swapnil2468/forever-full-stack/main/frontend/public/logo.png'

const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

// ── Shared Styles ────────────────────────────────────────────────────────────
const header = `
  <div style="background:#fff;padding:16px 32px;text-align:center;border-bottom:3px solid #dc2626">
    <img src="${LOGO_URL}" alt="Jainnext Logo" style="height:60px;margin:0 auto;display:block" />
    <p style="color:#666;margin:8px 0 0;font-size:12px;letter-spacing:0.5px;font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif">Premium Decoration Lighting</p>
  </div>`

const wrap = (body) => `
  <div style="font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
    ${header}
    <div style="padding:40px 32px;background:#fafafa">
      ${body}
    </div>
    <div style="background:linear-gradient(135deg,#1f2937 0%,#111827 100%);padding:32px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb">
      <p style="margin:0 0 8px;font-weight:500;color:#fff">JAINNEXT DECORATION LIGHTING</p>
      <p style="margin:0;color:#9ca3af">Illuminate Your Space • Delhi, India</p>
      <p style="margin:8px 0 0;font-size:11px">Thank you for choosing premium lighting solutions</p>
    </div>
  </div>`

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`

const itemsTable = (items) => `
  <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif">
    <thead>
      <tr style="background:linear-gradient(90deg,#dc2626 0%,#991b1b 100%);color:#fff">
        <th style="text-align:left;padding:14px 12px;font-weight:600;letter-spacing:0.5px">PRODUCT</th>
        <th style="text-align:center;padding:14px 12px;font-weight:600;letter-spacing:0.5px">QTY</th>
        <th style="text-align:right;padding:14px 12px;font-weight:600;letter-spacing:0.5px">PRICE</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((item, idx) => `
        <tr style="border-bottom:1px solid #e5e7eb;background:${idx % 2 === 0 ? '#fff' : '#f9fafb'}">
          <td style="padding:14px 12px;color:#111;font-weight:500">${item.name}</td>
          <td style="padding:14px 12px;text-align:center;color:#374151">${item.quantity}</td>
          <td style="padding:14px 12px;text-align:right;color:#000;font-weight:600">${formatCurrency((item.retailPrice || item.price) * item.quantity)}</td>
        </tr>`).join('')}
    </tbody>
  </table>`

const addressBlock = (address) => `
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0;font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif">
    <p style="margin:0;font-size:14px;color:#111;font-weight:600;margin-bottom:8px">📍 Delivery Address</p>
    <p style="margin:0;font-size:13px;color:#374151;line-height:1.8">
      <strong>${address.firstName} ${address.lastName}</strong><br/>
      ${address.street}<br/>
      ${address.city}, ${address.state} ${address.zipcode}<br/>
      ${address.country}<br/>
      <strong>☎️ ${address.phone}</strong>
    </p>
  </div>`

const orderId = (id) => `<span style="font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,monospace;font-weight:700;color:#000;letter-spacing:1px">#${id.toString().slice(-8).toUpperCase()}</span>`

// ── Email Senders ────────────────────────────────────────────────────────────

/**
 * Sent to customer when order is placed (COD or Razorpay paid).
 */
export const sendOrderConfirmationEmail = async (order, customerEmail, customerName) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return

    const html = wrap(`
      <div style="text-align:center;margin-bottom:32px">
        <h2 style="margin:0;font-size:28px;color:#111;font-weight:600;letter-spacing:0.5px">Order Confirmed 🎉</h2>
        <p style="color:#6b7280;font-size:15px;margin:12px 0 0;line-height:1.6;font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif">Hi <strong>${customerName}</strong>, your order has been placed successfully. We're preparing your lights with care.</p>
      </div>

      <div style="background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border:2px solid #86efac;border-radius:8px;padding:20px;margin:24px 0;text-align:center">
        <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#166534;font-weight:600">Order ID</p>
        <p style="margin:6px 0 0;font-size:20px;color:#000;font-weight:700;font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif;letter-spacing:2px">${orderId(order._id)}</p>
        <p style="margin:12px 0 0;font-size:13px;color:#333">Payment Method: <strong>${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online (Paid)'}</strong></p>
      </div>

      <h3 style="font-size:16px;color:#111;margin:28px 0 16px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Order Summary</h3>
      ${itemsTable(order.items)}

      <div style="background:#fff;border-radius:8px;padding:20px;margin:20px 0;border-left:4px solid #dc2626">
        <table style="width:100%;font-size:14px;font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif">
          <tr style="border-bottom:1px solid #e5e7eb">
            <td style="padding:10px 0;color:#6b7280">Subtotal</td>
            <td style="padding:10px 0;text-align:right;color:#111;font-weight:600">${formatCurrency(order.amount - 10)}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb">
            <td style="padding:10px 0;color:#6b7280">Delivery Charge</td>
            <td style="padding:10px 0;text-align:right;color:#000;font-weight:600">${formatCurrency(10)}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;color:#111;font-weight:700;font-size:16px">Total Amount</td>
            <td style="padding:12px 0;text-align:right;color:#000;font-weight:700;font-size:18px">${formatCurrency(order.amount)}</td>
          </tr>
        </table>
      </div>

      <h3 style="font-size:16px;color:#111;margin:28px 0 16px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Delivery Details</h3>
      ${addressBlock(order.address)}

      <div style="background:linear-gradient(90deg,#fef2f2 0%,#fce7f3 100%);border-radius:8px;padding:16px;margin:24px 0;border-left:4px solid #dc2626;font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif">
        <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.6">
          <strong>What's Next?</strong> We'll notify you when your order is shipped. The delivery typically takes 3-5 business days depending on your location.
        </p>
      </div>

      <p style="text-align:center;margin:32px 0 0;font-size:12px;color:#6b7280;font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif">Thank you for choosing Jainnext. We're excited to illuminate your space! ✨</p>
    `)

    try {
        const shortOrderId = order._id.toString().slice(-6).toUpperCase()
        await createTransporter().sendMail({
            from: `"Jainnext" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `Order Confirmed #${shortOrderId} | Jainnext`,
            html,
            headers: {
                'Message-ID': `<order-${order._id}-confirmation@jainnext.com>`,
                'X-Priority': '3',
            },
        })
    } catch (err) {
    }
}

/**
 * Sent to admin when a new order is placed.
 */
export const sendAdminNewOrderEmail = async (order, customerName, customerEmail) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) return

    const html = wrap(`
      <div style="background:linear-gradient(90deg,#fef2f2 0%,#fce7f3 100%);border-radius:8px;padding:16px;margin-bottom:24px;text-align:center;border:2px solid #dc2626">
        <h2 style="margin:0;font-size:24px;color:#991b1b;font-weight:600">New Order 🛒</h2>
        <p style="margin:6px 0 0;color:#991b1b;font-size:14px;font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif">A new order has just arrived!</p>
      </div>

      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0;font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif">
        <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;font-weight:600">Order Details</p>
        <table style="width:100%;font-size:14px;color:#111">
          <tr><td style="padding:6px 0">Order ID:</td><td style="text-align:right;font-weight:600;color:#000">${orderId(order._id)}</td></tr>
          <tr><td style="padding:6px 0">Customer:</td><td style="text-align:right;font-weight:500">${customerName}</td></tr>
          <tr><td style="padding:6px 0">Email:</td><td style="text-align:right;font-size:13px;color:#6b7280">${customerEmail}</td></tr>
          <tr style="border-top:1px solid #e5e7eb;padding-top:6px"><td style="padding:6px 0">Payment:</td><td style="text-align:right;font-weight:600;color:#000">${order.paymentMethod === 'COD' ? 'COD' : 'Paid'}</td></tr>
          <tr><td style="padding:6px 0">Amount:</td><td style="text-align:right;font-weight:700;font-size:16px;color:#000">${formatCurrency(order.amount)}</td></tr>
        </table>
      </div>

      <h3 style="font-size:16px;color:#111;margin:24px 0 12px;font-weight:600">Items Ordered</h3>
      ${itemsTable(order.items)}

      <h3 style="font-size:16px;color:#111;margin:24px 0 12px;font-weight:600">Shipping Address</h3>
      ${addressBlock(order.address)}

      <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;padding:14px;margin:20px 0;font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif">
        <p style="margin:0;font-size:13px;color:#92400e">⚡ <strong>Action Required:</strong> Please review and confirm this order in the admin panel.</p>
      </div>
    `)

    try {
        const shortOrderId = order._id.toString().slice(-6).toUpperCase()
        await createTransporter().sendMail({
            from: `"Jainnext Orders" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `🛒 New Order #${shortOrderId} - ${formatCurrency(order.amount)}`,
            html,
            headers: {
                'Message-ID': `<order-${order._id}-neworder@jainnext.com>`,
                'X-Priority': '2',
            },
        })
    } catch (err) {
    }
}

/**
 * Sent to customer when admin updates the order status.
 * statusMessages maps status → { subject, headline, body }
 */
const STATUS_CONTENT = {
    Shipped: {
        subject: 'Shipped',
        headline: 'Your Order is on its Way!',
        body: (tracking) => `Your order has been dispatched.${tracking ? ` Your tracking number is <strong>${tracking}</strong>.` : ''} You'll receive it soon!`,
        color: '#ea580c',
    },
    'Out for Delivery': {
        subject: 'Out for Delivery',
        headline: 'Out for Delivery',
        body: () => 'Great news! Your order is out for delivery today. Please keep your phone handy.',
        color: '#7c3aed',
    },
    Delivered: {
        subject: 'Delivered',
        headline: 'Order Delivered Successfully',
        body: () => 'Your order has been delivered. We hope you love your new lights! If you have any issues, feel free to contact us.',
        color: '#16a34a',
    },
    Cancelled: {
        subject: 'Cancelled',
        headline: 'Order Cancelled',
        body: () => 'Your order has been cancelled. If you did not request this cancellation or have questions, please contact our support.',
        color: '#dc2626',
    },
}

export const sendOrderStatusEmail = async (order, customerEmail, customerName, newStatus, trackingNumber) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return
    const content = STATUS_CONTENT[newStatus]
    if (!content) return // No email for 'New' re-updates etc.

    try {
        const html = wrap(`
          <div style="text-align:center;margin-bottom:28px">
            <h2 style="margin:0;font-size:26px;color:#111;font-weight:600">${content.headline}</h2>
            <p style="color:#6b7280;font-size:15px;margin:12px 0 0;font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif">Hi <strong>${customerName}</strong>,</p>
          </div>

          <div style="background:#fff;border-left:4px solid ${content.color};border-radius:8px;padding:18px;margin:24px 0">
            <p style="margin:0;font-size:14px;color:#111;line-height:1.6;font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif">${content.body(trackingNumber)}</p>
          </div>

          <div style="background:#f9fafb;border-radius:8px;padding:18px;margin:24px 0">
            <table style="width:100%;font-size:13px;font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif">
              <tr>
                <td style="padding:12px 0;color:#111;font-weight:700;font-size:15px">Order ID</td>
                <td style="text-align:right;font-weight:600;color:#000">${orderId(order._id)}</td>
              </tr>
              <tr style="border-top:2px solid #dc2626">
                <td style="padding:12px 0;color:#111;font-weight:700;font-size:15px">Order Total</td>
                <td style="padding:12px 0;text-align:right;color:#000;font-weight:700;font-size:20px;letter-spacing:1px">${formatCurrency(order.amount)}</td>
              </tr>
            </table>
          </div>

          <h3 style="font-size:14px;color:#111;margin:24px 0 14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Order Items</h3>
          ${itemsTable(order.items)}

          <div style="background:linear-gradient(90deg,#f0fdf4 0%,#dcfce7 100%);border-left:4px solid #16a34a;border-radius:8px;padding:16px;margin:24px 0 32px;font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif">
            <p style="margin:0;font-size:13px;color:#166534;line-height:1.6">
              <strong>Need Help?</strong> If you have any questions about your order or delivery, please don't hesitate to contact us. We're here to help!
            </p>
          </div>

          <p style="text-align:center;margin:0;font-size:12px;color:#6b7280;font-family:-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif">Thank you for choosing Jainnext ✨</p>
        `)
        
        const shortOrderId = order._id.toString().slice(-6).toUpperCase()
        const statusSlug = newStatus.toLowerCase().replace(/\s+/g, '-')
        await createTransporter().sendMail({
            from: `"Jainnext" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `Order #${shortOrderId} - ${newStatus} | Jainnext`,
            html,
            headers: {
                'References': `<order-${order._id}-confirmation@jainnext.com>`,
                'In-Reply-To': `<order-${order._id}-confirmation@jainnext.com>`,
                'Message-ID': `<order-${order._id}-${statusSlug}@jainnext.com>`,
                'X-Priority': '3',
            },
        })
    } catch (err) {
        // Silent error handling
    }
}

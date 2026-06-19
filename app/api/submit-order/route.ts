import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface OrderItem {
  itemType: string
  color: string
  size: string
  quantity: number
}

interface OrderPayload {
  // Employee info
  fullName: string
  badgeId: string
  department: string
  email: string
  phone: string
  // Order items
  items: OrderItem[]
  // Delivery
  deliveryMethod: 'pickup' | 'ship'
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  zip?: string
  // Other
  specialInstructions?: string
  supervisorName: string
}

function buildHtmlEmail(order: OrderPayload): string {
  const submittedAt = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  const itemsRows = order.items
    .map(
      (item, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#f8fafc' : '#ffffff'};">
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${idx + 1}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${item.itemType}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${item.color}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${item.size}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: center;">${item.quantity}</td>
      </tr>`
    )
    .join('')

  const deliverySection =
    order.deliveryMethod === 'pickup'
      ? `<p style="margin: 0; font-size: 14px;"><strong>Method:</strong> Office Pickup</p>`
      : `
      <p style="margin: 0 0 6px; font-size: 14px;"><strong>Method:</strong> Ship to Address</p>
      <p style="margin: 0 0 4px; font-size: 14px;"><strong>Address Line 1:</strong> ${order.addressLine1 || ''}</p>
      ${order.addressLine2 ? `<p style="margin: 0 0 4px; font-size: 14px;"><strong>Address Line 2:</strong> ${order.addressLine2}</p>` : ''}
      <p style="margin: 0; font-size: 14px;"><strong>City / State / ZIP:</strong> ${order.city || ''}, ${order.state || ''} ${order.zip || ''}</p>
    `

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Uniform Order Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1a3a5c; padding: 24px 32px;">
              <p style="margin: 0 0 4px; color: #c9a84c; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">Chester County District Attorney's Office</p>
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Uniform Order Request</h1>
            </td>
          </tr>
          <!-- Gold accent -->
          <tr><td style="height: 4px; background-color: #c9a84c;"></td></tr>

          <!-- Submitted timestamp -->
          <tr>
            <td style="padding: 16px 32px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                <strong style="color: #1a3a5c;">Submitted:</strong> ${submittedAt}
              </p>
            </td>
          </tr>

          <!-- Employee Information -->
          <tr>
            <td style="padding: 24px 32px 8px;">
              <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #1a3a5c; border-bottom: 2px solid #c9a84c; padding-bottom: 6px;">Employee Information</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-bottom: 10px; vertical-align: top;">
                    <p style="margin: 0 0 2px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 600;">Full Name</p>
                    <p style="margin: 0; font-size: 14px; color: #1e293b;">${order.fullName}</p>
                  </td>
                  <td width="50%" style="padding-bottom: 10px; vertical-align: top;">
                    <p style="margin: 0 0 2px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 600;">Badge / ID Number</p>
                    <p style="margin: 0; font-size: 14px; color: #1e293b;">${order.badgeId}</p>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding-bottom: 10px; vertical-align: top;">
                    <p style="margin: 0 0 2px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 600;">Department / Unit</p>
                    <p style="margin: 0; font-size: 14px; color: #1e293b;">${order.department}</p>
                  </td>
                  <td width="50%" style="padding-bottom: 10px; vertical-align: top;">
                    <p style="margin: 0 0 2px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 600;">Email Address</p>
                    <p style="margin: 0; font-size: 14px; color: #1e293b;">${order.email}</p>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding-bottom: 10px; vertical-align: top;">
                    <p style="margin: 0 0 2px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 600;">Phone Number</p>
                    <p style="margin: 0; font-size: 14px; color: #1e293b;">${order.phone}</p>
                  </td>
                  <td width="50%" style="padding-bottom: 10px; vertical-align: top;">
                    <p style="margin: 0 0 2px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 600;">Supervisor Name</p>
                    <p style="margin: 0; font-size: 14px; color: #1e293b;">${order.supervisorName}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 8px 32px 8px;">
              <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #1a3a5c; border-bottom: 2px solid #c9a84c; padding-bottom: 6px;">Order Items</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #1a3a5c;">
                    <th style="padding: 10px 14px; text-align: left; color: #c9a84c; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">#</th>
                    <th style="padding: 10px 14px; text-align: left; color: #c9a84c; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Item Type</th>
                    <th style="padding: 10px 14px; text-align: left; color: #c9a84c; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Color</th>
                    <th style="padding: 10px 14px; text-align: left; color: #c9a84c; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Size</th>
                    <th style="padding: 10px 14px; text-align: center; color: #c9a84c; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>
              <p style="margin: 8px 0 0; font-size: 13px; color: #64748b; text-align: right;">
                Total items: <strong>${order.items.reduce((sum, i) => sum + i.quantity, 0)}</strong>
              </p>
            </td>
          </tr>

          <!-- Delivery -->
          <tr>
            <td style="padding: 8px 32px 8px;">
              <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #1a3a5c; border-bottom: 2px solid #c9a84c; padding-bottom: 6px;">Delivery Information</h2>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px;">
                ${deliverySection}
              </div>
            </td>
          </tr>

          ${
            order.specialInstructions
              ? `<!-- Special Instructions -->
          <tr>
            <td style="padding: 8px 32px 8px;">
              <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #1a3a5c; border-bottom: 2px solid #c9a84c; padding-bottom: 6px;">Special Instructions</h2>
              <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 14px 16px;">
                <p style="margin: 0; font-size: 14px; color: #1e293b; white-space: pre-wrap;">${order.specialInstructions}</p>
              </div>
            </td>
          </tr>`
              : ''
          }

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px 0;">
              <div style="height: 4px; background-color: #c9a84c; border-radius: 2px; margin-bottom: 16px;"></div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #1a3a5c; padding: 16px 32px; text-align: center;">
              <p style="margin: 0 0 4px; color: #94a3b8; font-size: 12px;">This order was submitted via the Chester County District Attorney's Office uniform order system.</p>
              <p style="margin: 0; color: #64748b; font-size: 11px;">Fulfilled by <strong style="color: #c9a84c;">McDonald Uniforms</strong></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildPlainTextEmail(order: OrderPayload): string {
  const submittedAt = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
  })

  const itemLines = order.items
    .map(
      (item, idx) =>
        `  ${idx + 1}. ${item.itemType} | ${item.color} | Size: ${item.size} | Qty: ${item.quantity}`
    )
    .join('\n')

  const deliveryText =
    order.deliveryMethod === 'pickup'
      ? 'Office Pickup'
      : `Ship to Address:\n  ${order.addressLine1}${order.addressLine2 ? '\n  ' + order.addressLine2 : ''}\n  ${order.city}, ${order.state} ${order.zip}`

  return `CHESTER COUNTY DISTRICT ATTORNEY'S OFFICE
Uniform Order Request
Submitted: ${submittedAt}

--- EMPLOYEE INFORMATION ---
Full Name:         ${order.fullName}
Badge/ID Number:   ${order.badgeId}
Department/Unit:   ${order.department}
Email Address:     ${order.email}
Phone Number:      ${order.phone}
Supervisor Name:   ${order.supervisorName}

--- ORDER ITEMS ---
${itemLines}

Total quantity: ${order.items.reduce((sum, i) => sum + i.quantity, 0)}

--- DELIVERY ---
${deliveryText}

${order.specialInstructions ? `--- SPECIAL INSTRUCTIONS ---\n${order.specialInstructions}\n` : ''}
---
Fulfilled by McDonald Uniforms
`
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderPayload = await request.json()

    // Basic validation
    if (!body.fullName || !body.badgeId || !body.department || !body.email || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required employee information fields.' },
        { status: 400 }
      )
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one order item is required.' },
        { status: 400 }
      )
    }

    if (!body.supervisorName) {
      return NextResponse.json(
        { success: false, error: 'Supervisor name is required.' },
        { status: 400 }
      )
    }

    if (body.deliveryMethod === 'ship') {
      if (!body.addressLine1 || !body.city || !body.state || !body.zip) {
        return NextResponse.json(
          { success: false, error: 'Complete shipping address is required.' },
          { status: 400 }
        )
      }
    }

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const subject = `Uniform Order Request — ${body.fullName} (${body.department})`

    await transporter.sendMail({
      from: `"McDonald Uniforms — Order System" <${process.env.SMTP_FROM}>`,
      to: process.env.ORDER_EMAIL_TO,
      replyTo: body.email,
      subject,
      text: buildPlainTextEmail(body),
      html: buildHtmlEmail(body),
    })

    return NextResponse.json({ success: true, message: 'Order submitted successfully.' })
  } catch (err) {
    console.error('Order submission error:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to send order. Please try again or contact your administrator.' },
      { status: 500 }
    )
  }
}

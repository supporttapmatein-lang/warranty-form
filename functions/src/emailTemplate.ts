export interface EmailRegistrationData {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  productName: string;
  modelVariant?: string;
  serialNumber?: string;
  purchaseDate: string;
  purchasedFrom: string;
  orderId?: string;
}

export function generateWarrantyEmailHtml(data: EmailRegistrationData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tapmate Warranty Confirmation</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f7f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f7f9;
      padding: 40px 16px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background-color: #0f172a;
      padding: 32px 28px;
      text-align: center;
      border-bottom: 4px solid #399FC5;
    }
    .brand {
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-sub {
      color: #399FC5;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .intro {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .id-card {
      background: linear-gradient(135deg, #eef8fc 0%, #f0f9ff 100%);
      border: 1px solid #bae6fd;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin-bottom: 28px;
    }
    .id-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #0369a1;
      margin-bottom: 6px;
    }
    .id-value {
      font-size: 22px;
      font-weight: 800;
      font-family: 'Courier New', Courier, monospace;
      color: #0f172a;
      letter-spacing: 1px;
    }
    .status-pill {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 12px;
      border-radius: 20px;
      background-color: #fef3c7;
      border: 1px solid #fde68a;
      color: #92400e;
      font-size: 12px;
      font-weight: 700;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    .details-table th, .details-table td {
      padding: 12px 14px;
      text-align: left;
      font-size: 13px;
      border-bottom: 1px solid #f1f5f9;
    }
    .details-table th {
      color: #64748b;
      font-weight: 600;
      width: 40%;
      background-color: #f8fafc;
    }
    .details-table td {
      color: #0f172a;
      font-weight: 600;
    }
    .policy-box {
      background-color: #f8fafc;
      border-left: 4px solid #399FC5;
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 24px;
    }
    .policy-title {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .policy-text {
      font-size: 13px;
      line-height: 1.5;
      color: #334155;
      font-style: italic;
      margin: 0;
    }
    .footer {
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px 28px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }
    .footer a {
      color: #399FC5;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1 class="brand">TAPMATE</h1>
        <div class="brand-sub">Lifetime Warranty Registry</div>
      </div>

      <!-- Main Content -->
      <div class="content">
        <h2 class="greeting">Hello ${escapeHtml(data.fullName)},</h2>
        <p class="intro">
          Thank you for registering your Tapmate product. We have successfully logged your registration details in our central warranty registry. Please retain this confirmation email and your Registration ID for any future warranty service or inquiry.
        </p>

        <!-- Registration ID Banner -->
        <div class="id-card">
          <div class="id-label">Warranty Registration ID</div>
          <div class="id-value">${escapeHtml(data.id)}</div>
          <div class="status-pill">Status: Pending Verification</div>
        </div>

        <!-- Product Details Table -->
        <table class="details-table">
          <tr>
            <th>Product Name</th>
            <td>${escapeHtml(data.productName)}</td>
          </tr>
          ${data.modelVariant ? `
          <tr>
            <th>Model / Variant</th>
            <td>${escapeHtml(data.modelVariant)}</td>
          </tr>` : ''}
          ${data.serialNumber ? `
          <tr>
            <th>Serial / Batch Number</th>
            <td>${escapeHtml(data.serialNumber)}</td>
          </tr>` : ''}
          <tr>
            <th>Purchase Date</th>
            <td>${escapeHtml(data.purchaseDate)}</td>
          </tr>
          <tr>
            <th>Purchased From</th>
            <td>${escapeHtml(data.purchasedFrom)}</td>
          </tr>
          ${data.orderId ? `
          <tr>
            <th>Order ID / Invoice #</th>
            <td>${escapeHtml(data.orderId)}</td>
          </tr>` : ''}
        </table>

        <!-- Official Policy Box -->
        <div class="policy-box">
          <div class="policy-title">Official Warranty Policy Notice</div>
          <p class="policy-text">
            &ldquo;Every Tapmate product is built to last. Functional damage may be covered under Tapmate&apos;s applicable lifetime warranty terms and conditions. Warranty eligibility is subject to verification and the official warranty policy.&rdquo;
          </p>
        </div>

        <p class="intro" style="margin-bottom: 0;">
          <strong>Next Steps:</strong> When requesting assistance or filing a functional claim, email our support team at <a href="mailto:help@tapmate.in" style="color: #399FC5; font-weight: 600;">help@tapmate.in</a> with your Registration ID (<strong>${escapeHtml(data.id)}</strong>).
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 6px 0;">
          <strong>Tapmate Customer Support</strong> · Email: <a href="mailto:help@tapmate.in">help@tapmate.in</a> · Web: <a href="https://tapmate.in">https://tapmate.in</a>
        </p>
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">
          This is an automated confirmation of your warranty product submission. Tapmate Technologies. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function generateWarrantyEmailText(data: EmailRegistrationData): string {
  return `TAPMATE LIFETIME WARRANTY REGISTRATION CONFIRMATION

Hello ${data.fullName},

Thank you for registering your Tapmate product. Your registration details have been securely recorded in our central warranty registry.

=======================================================
REGISTRATION ID: ${data.id}
CURRENT STATUS: Pending Verification
=======================================================

REGISTRATION SUMMARY:
- Customer Name: ${data.fullName}
- Email: ${data.email}
- Mobile: ${data.mobile}
- Product: ${data.productName}
${data.modelVariant ? `- Variant: ${data.modelVariant}\n` : ''}${data.serialNumber ? `- Serial Number: ${data.serialNumber}\n` : ''}- Purchase Date: ${data.purchaseDate}
- Purchased From: ${data.purchasedFrom}
${data.orderId ? `- Order ID: ${data.orderId}\n` : ''}

OFFICIAL WARRANTY NOTICE:
"Every Tapmate product is built to last. Functional damage may be covered under Tapmate's applicable lifetime warranty terms and conditions. Warranty eligibility is subject to verification and the official warranty policy."

For warranty support or claims, please contact our support team at help@tapmate.in with your Registration ID (${data.id}).

Website: https://tapmate.in
Email: help@tapmate.in
`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

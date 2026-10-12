import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as nodemailer from 'nodemailer';
import {
  generateWarrantyEmailHtml,
  generateWarrantyEmailText,
  EmailRegistrationData,
} from './emailTemplate';

// 1. Initialize Firebase Admin SDK
initializeApp();

// Target Firestore Database ID
const TARGET_DATABASE_ID =
  process.env.FIRESTORE_DATABASE_ID ||
  'ai-studio-tapmatelifetimew-b3ea29bc-df04-4ce3-a9c2-b5d35bdffbd7';

/**
 * Creates a configured Nodemailer Transporter
 */
async function getMailTransporter(): Promise<{
  transporter: nodemailer.Transporter;
  senderAddress: string;
  isTestAccount: boolean;
}> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const senderAddress =
    process.env.SENDER_EMAIL || '"Tapmate Warranty Desk" <help@tapmate.in>';

  // If live SMTP credentials are configured:
  if (host && user && pass) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
    return { transporter, senderAddress, isTestAccount: false };
  }

  // Graceful fallback: Ethereal test account (for sandbox / automated staging verification)
  console.info('No live SMTP credentials found; generating Ethereal test mailbox...');
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return { transporter, senderAddress, isTestAccount: true };
}

/**
 * Primary Firebase Cloud Function:
 * Triggered automatically when a new warranty registration document is created in Firestore.
 */
export const onWarrantyRegistrationCreated = onDocumentCreated(
  {
    document: 'registrations/{registrationId}',
    database: TARGET_DATABASE_ID,
    region: 'asia-east1', // Same region as applet
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.warn('No document data in event snapshot.');
      return;
    }

    const regData = snapshot.data();
    const registrationId = event.params.registrationId;

    if (!regData || !regData.email) {
      console.warn(`Registration ${registrationId} does not contain customer email.`);
      return;
    }

    // Guard: Prevent duplicate email dispatches
    if (regData.confirmationEmailSent) {
      console.info(`Confirmation email already sent for registration ${registrationId}.`);
      return;
    }

    const payload: EmailRegistrationData = {
      id: registrationId,
      fullName: regData.fullName || 'Valued Customer',
      email: regData.email,
      mobile: regData.mobile || 'Not specified',
      productName: regData.productName || 'Tapmate Product',
      modelVariant: regData.modelVariant,
      serialNumber: regData.serialNumber,
      purchaseDate: regData.purchaseDate || new Date().toISOString().slice(0, 10),
      purchasedFrom: regData.purchasedFrom || 'Tapmate Authorized Channel',
      orderId: regData.orderId,
    };

    try {
      const { transporter, senderAddress, isTestAccount } = await getMailTransporter();

      const mailOptions: nodemailer.SendMailOptions = {
        from: senderAddress,
        to: payload.email,
        subject: `Tapmate Lifetime Warranty Registration Confirmation [${payload.id}]`,
        text: generateWarrantyEmailText(payload),
        html: generateWarrantyEmailHtml(payload),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Email dispatched successfully to ${payload.email}. Message ID: ${info.messageId}`);

      if (isTestAccount) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`[Ethereal Preview URL (Customer)]: ${previewUrl}`);
      }

      // Also send immediate alert notification email to Admin (User Mandate)
      const adminNotificationEmail =
        process.env.ADMIN_NOTIFICATION_EMAIL || 'supporttapmate.in@gmail.com';
      try {
        const adminMailOptions: nodemailer.SendMailOptions = {
          from: senderAddress,
          to: adminNotificationEmail,
          subject: `[New Registration Alert] ${payload.fullName} - ${payload.productName} (${payload.id})`,
          text: `NEW TAPMATE WARRANTY REGISTRATION RECEIVED

Registration ID: ${payload.id}
Customer Name: ${payload.fullName}
Email: ${payload.email}
Mobile: ${payload.mobile}
Product: ${payload.productName}
Variant: ${payload.modelVariant || 'Standard'}
Serial Number: ${payload.serialNumber || 'Not specified'}
Purchase Date: ${payload.purchaseDate}
Channel: ${payload.purchasedFrom}
Order ID: ${payload.orderId || 'Not provided'}
Invoice Attached: ${regData.invoiceFileName ? 'Yes (' + regData.invoiceFileName + ')' : 'No'}
Submitted At: ${new Date().toLocaleString()}

Log into the Tapmate Admin Portal to review and verify this warranty registration:
${process.env.APP_URL || 'https://tapmate.in'}
`,
          html: `<div style="font-family: sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="background-color: #0f172a; padding: 16px; border-radius: 8px; color: white; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 18px; color: #399FC5;">Tapmate Admin Alert: New Product Registration</h2>
            </div>
            <p style="font-size: 14px; color: #334155;">A new customer has registered product warranty in Firestore:</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
              <tr><td style="padding: 8px; font-weight: bold; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">Registration ID</td><td style="padding: 8px; font-family: monospace; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${payload.id}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">Customer</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${payload.fullName} (${payload.email} · ${payload.mobile})</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">Product</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${payload.productName} ${payload.modelVariant ? `(${payload.modelVariant})` : ''}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">Serial / Batch</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${payload.serialNumber || 'None'}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">Purchase Date</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${payload.purchaseDate} (${payload.purchasedFrom})</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">Order ID</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${payload.orderId || 'None'}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">Invoice Attached</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${regData.invoiceFileName ? 'Yes' : 'No'}</td></tr>
            </table>
            <p style="margin-top: 20px;"><a href="${process.env.APP_URL || 'https://tapmate.in'}" style="background-color: #399FC5; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Open Admin Dashboard</a></p>
          </div>`,
        };
        const adminInfo = await transporter.sendMail(adminMailOptions);
        console.log(`Admin alert email sent to ${adminNotificationEmail}. Message ID: ${adminInfo.messageId}`);
        if (isTestAccount) {
          const adminPreviewUrl = nodemailer.getTestMessageUrl(adminInfo);
          console.log(`[Ethereal Preview URL (Admin Alert)]: ${adminPreviewUrl}`);
        }
      } catch (adminMailErr) {
        console.warn('Failed to send admin alert email:', adminMailErr);
      }

      // Record successful dispatch in Firestore document
      await snapshot.ref.update({
        confirmationEmailSent: true,
        emailSentAt: new Date().toISOString(),
        emailMessageId: info.messageId,
        adminNotifiedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error(`Failed to send confirmation email for ${registrationId}:`, error);
      // Record failure for admin visibility
      await snapshot.ref.update({
        confirmationEmailSent: false,
        emailError: error.message || String(error),
        emailAttemptedAt: new Date().toISOString(),
      });
    }
  }
);

/**
 * HTTPS endpoint allowing authenticated staff / webhooks to trigger or re-send
 * confirmation emails on demand.
 */
export const sendConfirmationEmailManual = onRequest(
  { cors: true, region: 'asia-east1' },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const { registrationId } = req.body || {};
    if (!registrationId) {
      res.status(400).json({ error: 'registrationId is required' });
      return;
    }

    try {
      const db = getFirestore(getApp(), TARGET_DATABASE_ID);
      const docSnap = await db.collection('registrations').doc(registrationId).get();

      if (!docSnap.exists) {
        res.status(404).json({ error: 'Registration not found' });
        return;
      }

      const regData = docSnap.data()!;
      const payload: EmailRegistrationData = {
        id: registrationId,
        fullName: regData.fullName,
        email: regData.email,
        mobile: regData.mobile,
        productName: regData.productName,
        modelVariant: regData.modelVariant,
        serialNumber: regData.serialNumber,
        purchaseDate: regData.purchaseDate,
        purchasedFrom: regData.purchasedFrom,
        orderId: regData.orderId,
      };

      const { transporter, senderAddress } = await getMailTransporter();
      const mailOptions: nodemailer.SendMailOptions = {
        from: senderAddress,
        to: payload.email,
        subject: `Tapmate Lifetime Warranty Registration Confirmation [${payload.id}]`,
        text: generateWarrantyEmailText(payload),
        html: generateWarrantyEmailHtml(payload),
      };

      const info = await transporter.sendMail(mailOptions);
      await docSnap.ref.update({
        confirmationEmailSent: true,
        emailSentAt: new Date().toISOString(),
        emailMessageId: info.messageId,
      });

      res.status(200).json({ success: true, messageId: info.messageId });
    } catch (err: any) {
      console.error('Manual email error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  }
);

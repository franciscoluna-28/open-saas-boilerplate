import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

/** Example email sender from Resend
 *
 * Check out the official documentation to send test emails:
 *
 * https://resend.com/docs/dashboard/emails/send-test-emails
 */
const FROM = "delivered@resend.dev";

export async function sendPasswordResetEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your password",
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family: sans-serif; padding: 24px;">
          <h2>Reset your password</h2>
          <p>Click the link below to reset your password. This link expires in 1 hour.</p>
          <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 14px;">If you didn't request this, you can ignore this email.</p>
        </body>
      </html>
    `,
  });

  if (error) throw new Error(typeof error === "string" ? error : error.message ?? JSON.stringify(error));
}

export async function sendAdminInviteEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "You've been invited as an admin",
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family: sans-serif; padding: 24px;">
          <h2>Admin Invitation</h2>
          <p>You've been invited to join as an admin.</p>
          <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Accept Invitation
          </a>
          <p style="color: #666; font-size: 14px;">This link expires in 7 days. If you weren't expecting this, you can ignore this email.</p>
        </body>
      </html>
    `,
  });

  if (error) throw new Error(typeof error === "string" ? error : error.message ?? JSON.stringify(error));
}

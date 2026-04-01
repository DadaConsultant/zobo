import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP credentials on first use to surface misconfiguration early
let smtpVerified = false;
async function ensureSmtpReady() {
  if (smtpVerified) return;
  try {
    await transporter.verify();
    smtpVerified = true;
    console.log("[email] SMTP connection verified OK");
  } catch (err) {
    console.error("[email] SMTP verification failed — emails will not send.", err);
    throw new Error(`SMTP configuration error: ${(err as Error).message}`);
  }
}

interface SendInterviewInviteParams {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  companyName: string;
  interviewLink: string;
}

export async function sendInterviewInvite({
  candidateName,
  candidateEmail,
  jobTitle,
  companyName,
  interviewLink,
}: SendInterviewInviteParams) {
  await ensureSmtpReady();
  const fullLink = `${process.env.NEXT_PUBLIC_APP_URL}/interview/${interviewLink}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: candidateEmail,
    subject: `Interview Invitation: ${jobTitle} at ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Inter, Arial, sans-serif; background-color: #F5F7FA; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <!-- Header -->
            <div style="background: #1F2937; padding: 32px; text-align: center;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding-right: 10px; vertical-align: middle;">
                    <div style="width:32px;height:32px;background:#1F2937;border-radius:8px;border:2px solid rgba(255,255,255,0.2);display:inline-block;"></div>
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #FFFFFF; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Zobo Jobs</span>
                  </td>
                </tr>
              </table>
              <div style="width:12px;height:12px;border-radius:50%;background:#4FD1C7;margin:12px auto 0;"></div>
            </div>

            <!-- Body -->
            <div style="padding: 40px 48px;">
              <h2 style="font-size: 22px; font-weight: 700; color: #1A1A1A; margin: 0 0 16px;">Hi ${candidateName},</h2>

              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 16px;">
                You've been invited to complete a first-round AI video interview for the
                <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.
              </p>

              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 32px;">
                The interview takes approximately <strong>10–15 minutes</strong> and is conducted by our AI assistant.
                You'll need a <strong>camera, microphone</strong> and a quiet space.
              </p>

              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${fullLink}"
                   style="background-color: #1F2937; color: #FFFFFF; padding: 16px 40px; border-radius: 8px;
                          text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block;">
                  Start Your Interview →
                </a>
              </div>

              <p style="font-size: 14px; color: #6B7280; margin: 0;">
                Or copy this link: <a href="${fullLink}" style="color: #0D9488; word-break: break-all;">${fullLink}</a>
              </p>

              <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;" />

              <p style="font-size: 13px; color: #9CA3AF; margin: 0;">
                This interview link is unique to you — please don't share it.<br/>
                Good luck! — <strong style="color: #374151;">Zobo Jobs</strong>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendInterviewReminder({
  candidateName,
  candidateEmail,
  jobTitle,
  companyName,
  interviewLink,
}: SendInterviewInviteParams) {
  await ensureSmtpReady();
  const fullLink = `${process.env.NEXT_PUBLIC_APP_URL}/interview/${interviewLink}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: candidateEmail,
    subject: `Reminder: Complete your interview for ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Inter, Arial, sans-serif; background-color: #F5F7FA; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <!-- Header -->
            <div style="background: #1F2937; padding: 32px; text-align: center;">
              <span style="color: #FFFFFF; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Zobo Jobs</span>
              <div style="width:12px;height:12px;border-radius:50%;background:#4FD1C7;margin:12px auto 0;"></div>
            </div>

            <!-- Body -->
            <div style="padding: 40px 48px;">
              <h2 style="font-size: 22px; font-weight: 700; color: #1A1A1A; margin: 0 0 16px;">Hi ${candidateName},</h2>

              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 32px;">
                Just a friendly reminder — you haven't completed your AI interview for
                <strong>${jobTitle}</strong> at <strong>${companyName}</strong> yet.
                Your interview link is still active and ready when you are.
              </p>

              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${fullLink}"
                   style="background-color: #1F2937; color: #FFFFFF; padding: 16px 40px; border-radius: 8px;
                          text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block;">
                  Complete Interview Now →
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;" />

              <p style="font-size: 13px; color: #9CA3AF; margin: 0;">
                — <strong style="color: #374151;">Zobo Jobs</strong> AI Interview Platform
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

import nodemailer from "nodemailer";

function requireSmtpEnv(): void {
  const missing: string[] = [];
  if (!process.env.SMTP_HOST?.trim()) missing.push("SMTP_HOST");
  if (!process.env.SMTP_USER?.trim()) missing.push("SMTP_USER");
  if (!process.env.SMTP_PASS?.trim()) missing.push("SMTP_PASS");
  if (!process.env.EMAIL_FROM?.trim()) missing.push("EMAIL_FROM");
  if (missing.length) {
    throw new Error(
      `Missing email environment variables: ${missing.join(", ")}. Set them in production (e.g. host, credentials, verified from-address).`
    );
  }
}

const smtpPort = Number(process.env.SMTP_PORT) || 587;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  // port 465 uses implicit TLS; 587 uses STARTTLS
  secure: smtpPort === 465,
  requireTLS: smtpPort !== 465,
  connectionTimeout: 10000,  // fail fast — 10 s instead of OS default ~90 s
  greetingTimeout: 8000,
  socketTimeout: 10000,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP credentials on first use to surface misconfiguration early
let smtpVerified = false;
async function ensureSmtpReady() {
  if (smtpVerified) return;
  requireSmtpEnv();
  try {
    await transporter.verify();
    smtpVerified = true;
    console.log("[email] SMTP connection verified OK");
  } catch (err) {
    smtpVerified = false; // allow retry on next request
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

export async function sendPasswordResetOTP({
  toEmail,
  otp,
  resetLink,
}: {
  toEmail: string;
  otp: string;
  resetLink: string;
}) {
  await ensureSmtpReady();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: "Your Zobo Jobs password reset code",
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
              <h2 style="font-size: 22px; font-weight: 700; color: #1A1A1A; margin: 0 0 12px;">Reset your password</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 32px;">
                We received a request to reset your Zobo Jobs password. Use the code below — it expires in <strong>15 minutes</strong>.
              </p>

              <!-- OTP display -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; background: #F5F7FA; border: 2px dashed #4FD1C7; border-radius: 16px; padding: 24px 40px;">
                  <p style="font-size: 13px; font-weight: 600; color: #6B7280; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 12px;">Your reset code</p>
                  <p style="font-size: 42px; font-weight: 800; color: #1F2937; letter-spacing: 12px; margin: 0; font-family: 'Courier New', monospace;">${otp}</p>
                </div>
              </div>

              <!-- CTA -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${resetLink}"
                   style="background-color: #0D9488; color: #FFFFFF; padding: 14px 36px; border-radius: 8px;
                          text-decoration: none; font-size: 15px; font-weight: 600; display: inline-block;">
                  Reset Password →
                </a>
              </div>

              <p style="font-size: 14px; color: #6B7280; margin: 0 0 8px;">
                Or paste this link into your browser:
              </p>
              <p style="font-size: 13px; color: #9CA3AF; word-break: break-all; margin: 0 0 24px;">
                <a href="${resetLink}" style="color: #0D9488;">${resetLink}</a>
              </p>

              <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />

              <p style="font-size: 13px; color: #9CA3AF; margin: 0;">
                If you did not request a password reset, you can safely ignore this email.<br/>
                — <strong style="color: #374151;">Zobo Jobs</strong>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendAdminNewUserNotification({
  userName,
  userEmail,
  company,
  userId,
}: {
  userName: string;
  userEmail: string;
  company?: string;
  userId: string;
}) {
  await ensureSmtpReady();
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/users/${userId}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: "support@zobojobs.com",
    subject: `New company registered: ${company || userName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Inter, Arial, sans-serif; background-color: #F5F7FA; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <div style="background: #1F2937; padding: 32px; text-align: center;">
              <span style="color: #FFFFFF; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Zobo Jobs</span>
              <div style="width:12px;height:12px;border-radius:50%;background:#4FD1C7;margin:12px auto 0;"></div>
            </div>
            <div style="padding: 40px 48px;">
              <div style="display:inline-block;background:#FEF3C7;border:1px solid #FDE68A;border-radius:8px;padding:6px 14px;margin-bottom:20px;">
                <span style="font-size:13px;font-weight:700;color:#92400E;">ACTION REQUIRED — NEW REGISTRATION</span>
              </div>
              <h2 style="font-size: 22px; font-weight: 700; color: #1A1A1A; margin: 0 0 20px;">A new company has signed up</h2>
              <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
                <tr><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-size:14px;color:#6B7280;width:120px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-size:14px;font-weight:600;color:#1A1A1A;">${userName}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-size:14px;color:#6B7280;">Email</td><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-size:14px;font-weight:600;color:#1A1A1A;">${userEmail}</td></tr>
                <tr><td style="padding:10px 0;font-size:14px;color:#6B7280;">Company</td><td style="padding:10px 0;font-size:14px;font-weight:600;color:#1A1A1A;">${company || "—"}</td></tr>
              </table>
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${adminUrl}" style="background-color:#0D9488;color:#FFFFFF;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">
                  Review &amp; Approve Account →
                </a>
              </div>
              <p style="font-size:13px;color:#9CA3AF;text-align:center;margin:0;">
                Or visit: <a href="${adminUrl}" style="color:#0D9488;">${adminUrl}</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendAccountApprovedEmail({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  await ensureSmtpReady();
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: "Your Zobo Jobs account has been approved",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Inter, Arial, sans-serif; background-color: #F5F7FA; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <div style="background: #1F2937; padding: 32px; text-align: center;">
              <span style="color: #FFFFFF; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Zobo Jobs</span>
              <div style="width:12px;height:12px;border-radius:50%;background:#4FD1C7;margin:12px auto 0;"></div>
            </div>
            <div style="padding: 40px 48px;">
              <div style="width:56px;height:56px;background:#ECFDF5;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">
                <span style="font-size:28px;">✓</span>
              </div>
              <h2 style="font-size: 22px; font-weight: 700; color: #1A1A1A; margin: 0 0 16px; text-align:center;">You&apos;re approved!</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 32px; text-align:center;">
                Hi ${userName}, your Zobo Jobs account has been reviewed and approved.<br/>
                You can now create jobs and start interviewing candidates.
              </p>
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${loginUrl}" style="background-color:#0D9488;color:#FFFFFF;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">
                  Go to Dashboard →
                </a>
              </div>
              <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;" />
              <p style="font-size:13px;color:#9CA3AF;text-align:center;margin:0;">— Zobo Jobs Team</p>
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

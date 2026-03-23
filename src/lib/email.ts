import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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
  const fullLink = `${process.env.NEXT_PUBLIC_APP_URL}/interview/${interviewLink}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: candidateEmail,
    subject: `Interview Invitation: ${jobTitle} at ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #6366f1; font-size: 28px; font-weight: 800; margin: 0;">Zobo Jobs</h1>
          </div>
          
          <h2 style="font-size: 22px; font-weight: 700;">Hi ${candidateName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            You've been invited to complete a first-round AI interview for the 
            <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            The interview takes approximately <strong>10–15 minutes</strong> and is conducted by our AI assistant. 
            You'll need a microphone and a quiet space.
          </p>

          <div style="text-align: center; margin: 36px 0;">
            <a href="${fullLink}" 
               style="background-color: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; 
                      text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block;">
              Start Your Interview
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280;">
            Or copy this link: <a href="${fullLink}" style="color: #6366f1;">${fullLink}</a>
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          
          <p style="font-size: 13px; color: #9ca3af;">
            This interview link is unique to you. Good luck!<br/>
            — Zobo Jobs AI Interview Platform
          </p>
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
  const fullLink = `${process.env.NEXT_PUBLIC_APP_URL}/interview/${interviewLink}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: candidateEmail,
    subject: `Reminder: Complete your interview for ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #6366f1; font-size: 28px; font-weight: 800; margin: 0;">Zobo Jobs</h1>
          </div>
          
          <h2 style="font-size: 22px; font-weight: 700;">Hi ${candidateName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Just a reminder — you haven't completed your AI interview for 
            <strong>${jobTitle}</strong> at <strong>${companyName}</strong> yet.
          </p>

          <div style="text-align: center; margin: 36px 0;">
            <a href="${fullLink}" 
               style="background-color: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; 
                      text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block;">
              Complete Interview Now
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          
          <p style="font-size: 13px; color: #9ca3af;">
            — Zobo Jobs AI Interview Platform
          </p>
        </body>
      </html>
    `,
  });
}

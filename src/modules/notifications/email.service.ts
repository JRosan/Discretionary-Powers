import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "localhost",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT ?? 587) === 465,
  ...(process.env.SMTP_USER && process.env.SMTP_PASS
    ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }
    : {}),
});

const FROM = process.env.SMTP_FROM ?? "noreply@bvi.gov.vg";

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
          <td style="background:#1a365d;padding:24px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">DPMS</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:12px;">Government of the Virgin Islands</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 16px;color:#1a365d;font-size:18px;font-weight:600;">${title}</h2>
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fa;padding:16px 32px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#718096;font-size:12px;">This is an automated message from the Discretionary Powers Management System. Please do not reply directly to this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export const emailService = {
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    await transporter.sendMail({ from: FROM, to, subject, html });
  },

  async sendDecisionAssigned(to: string, decisionTitle: string, referenceNumber: string): Promise<void> {
    const html = layout(
      "Decision Assigned to You",
      `<p style="margin:0 0 12px;color:#2d3748;font-size:14px;line-height:1.6;">You have been assigned a new decision that requires your attention.</p>
       <table style="width:100%;border-collapse:collapse;margin:16px 0;">
         <tr><td style="padding:8px 12px;background:#edf2f7;color:#4a5568;font-size:13px;font-weight:600;width:140px;">Decision</td><td style="padding:8px 12px;background:#edf2f7;color:#2d3748;font-size:14px;">${decisionTitle}</td></tr>
         <tr><td style="padding:8px 12px;color:#4a5568;font-size:13px;font-weight:600;">Reference</td><td style="padding:8px 12px;color:#2d3748;font-size:14px;">${referenceNumber}</td></tr>
       </table>
       <p style="margin:16px 0 0;color:#2d3748;font-size:14px;">Please log in to the DPMS portal to review and begin processing this decision.</p>`
    );
    await this.sendEmail(to, `Decision Assigned: ${referenceNumber}`, html);
  },

  async sendStepCompleted(to: string, decisionTitle: string, stepNumber: number, stepName: string): Promise<void> {
    const html = layout(
      "Workflow Step Completed",
      `<p style="margin:0 0 12px;color:#2d3748;font-size:14px;line-height:1.6;">A workflow step has been completed for the following decision.</p>
       <table style="width:100%;border-collapse:collapse;margin:16px 0;">
         <tr><td style="padding:8px 12px;background:#edf2f7;color:#4a5568;font-size:13px;font-weight:600;width:140px;">Decision</td><td style="padding:8px 12px;background:#edf2f7;color:#2d3748;font-size:14px;">${decisionTitle}</td></tr>
         <tr><td style="padding:8px 12px;color:#4a5568;font-size:13px;font-weight:600;">Step ${stepNumber}</td><td style="padding:8px 12px;color:#2d3748;font-size:14px;">${stepName}</td></tr>
         <tr><td style="padding:8px 12px;background:#edf2f7;color:#4a5568;font-size:13px;font-weight:600;">Status</td><td style="padding:8px 12px;background:#edf2f7;color:#38a169;font-size:14px;font-weight:600;">Completed</td></tr>
       </table>
       <p style="margin:16px 0 0;color:#2d3748;font-size:14px;">Log in to the DPMS portal to continue with the next step.</p>`
    );
    await this.sendEmail(to, `Step ${stepNumber} Completed: ${decisionTitle}`, html);
  },

  async sendDeadlineReminder(to: string, decisionTitle: string, deadline: string, daysRemaining: number): Promise<void> {
    const urgencyColor = daysRemaining <= 1 ? "#e53e3e" : daysRemaining <= 3 ? "#dd6b20" : "#d69e2e";
    const html = layout(
      "Deadline Reminder",
      `<p style="margin:0 0 12px;color:#2d3748;font-size:14px;line-height:1.6;">A decision deadline is approaching and requires your attention.</p>
       <table style="width:100%;border-collapse:collapse;margin:16px 0;">
         <tr><td style="padding:8px 12px;background:#edf2f7;color:#4a5568;font-size:13px;font-weight:600;width:140px;">Decision</td><td style="padding:8px 12px;background:#edf2f7;color:#2d3748;font-size:14px;">${decisionTitle}</td></tr>
         <tr><td style="padding:8px 12px;color:#4a5568;font-size:13px;font-weight:600;">Deadline</td><td style="padding:8px 12px;color:#2d3748;font-size:14px;">${deadline}</td></tr>
         <tr><td style="padding:8px 12px;background:#edf2f7;color:#4a5568;font-size:13px;font-weight:600;">Days Remaining</td><td style="padding:8px 12px;background:#edf2f7;color:${urgencyColor};font-size:14px;font-weight:700;">${daysRemaining} day${daysRemaining === 1 ? "" : "s"}</td></tr>
       </table>
       <p style="margin:16px 0 0;color:#2d3748;font-size:14px;">Please ensure all required steps are completed before the deadline.</p>`
    );
    await this.sendEmail(to, `Deadline Reminder: ${decisionTitle} (${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining)`, html);
  },

  async sendDecisionApproved(to: string, decisionTitle: string, referenceNumber: string): Promise<void> {
    const html = layout(
      "Decision Approved",
      `<p style="margin:0 0 12px;color:#2d3748;font-size:14px;line-height:1.6;">A decision has been approved and is ready for the next stage.</p>
       <table style="width:100%;border-collapse:collapse;margin:16px 0;">
         <tr><td style="padding:8px 12px;background:#edf2f7;color:#4a5568;font-size:13px;font-weight:600;width:140px;">Decision</td><td style="padding:8px 12px;background:#edf2f7;color:#2d3748;font-size:14px;">${decisionTitle}</td></tr>
         <tr><td style="padding:8px 12px;color:#4a5568;font-size:13px;font-weight:600;">Reference</td><td style="padding:8px 12px;color:#2d3748;font-size:14px;">${referenceNumber}</td></tr>
         <tr><td style="padding:8px 12px;background:#edf2f7;color:#4a5568;font-size:13px;font-weight:600;">Status</td><td style="padding:8px 12px;background:#edf2f7;color:#38a169;font-size:14px;font-weight:600;">Approved</td></tr>
       </table>
       <p style="margin:16px 0 0;color:#2d3748;font-size:14px;">Log in to the DPMS portal for full details.</p>`
    );
    await this.sendEmail(to, `Decision Approved: ${referenceNumber}`, html);
  },
};

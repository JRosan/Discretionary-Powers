namespace DiscretionaryPowers.Infrastructure.Email;

public static class EmailTemplates
{
    private static string WrapInLayout(string title, string body)
    {
        return $@"<!DOCTYPE html>
<html>
<head><meta charset='utf-8'><meta name='viewport' content='width=device-width'></head>
<body style='margin:0;padding:0;background:#F8F9FA;font-family:Inter,system-ui,sans-serif;'>
  <div style='max-width:600px;margin:0 auto;background:#fff;'>
    <!-- Header -->
    <div style='background:#1D3557;padding:24px 32px;text-align:center;'>
      <h1 style='margin:0;color:#fff;font-size:18px;font-weight:600;'>Government of the Virgin Islands</h1>
      <p style='margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:12px;'>Discretionary Powers Management System</p>
    </div>
    <!-- Content -->
    <div style='padding:32px;'>
      <h2 style='margin:0 0 16px;color:#212529;font-size:20px;'>{title}</h2>
      {body}
    </div>
    <!-- Footer -->
    <div style='padding:16px 32px;border-top:1px solid #DEE2E6;text-align:center;'>
      <p style='margin:0;color:#ADB5BD;font-size:11px;'>&copy; {DateTime.UtcNow.Year} Government of the Virgin Islands. All rights reserved.</p>
      <p style='margin:4px 0 0;color:#ADB5BD;font-size:11px;'>This is an automated message from the DPMS.</p>
    </div>
  </div>
</body>
</html>";
    }

    public static string DecisionAssigned(string decisionTitle, string referenceNumber, string assigneeName)
    {
        return WrapInLayout("Decision Assigned to You", $@"
            <p style='color:#6C757D;font-size:14px;line-height:1.6;'>You have been assigned a new discretionary power decision:</p>
            <div style='background:#F8F9FA;border-left:4px solid #2A9D8F;padding:16px;margin:16px 0;border-radius:4px;'>
              <p style='margin:0;font-family:JetBrains Mono,monospace;font-size:12px;color:#6C757D;'>{referenceNumber}</p>
              <p style='margin:4px 0 0;font-size:16px;font-weight:600;color:#212529;'>{decisionTitle}</p>
            </div>
            <p style='color:#6C757D;font-size:14px;'>Please begin Step 1 (Confirm Authority) of the 10-step framework at your earliest convenience.</p>
            <a href='#' style='display:inline-block;background:#2A9D8F;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;margin-top:8px;'>View Decision</a>");
    }

    public static string StepCompleted(string decisionTitle, int stepNumber, string stepName, string completedBy)
    {
        return WrapInLayout($"Step {stepNumber} Completed", $@"
            <p style='color:#6C757D;font-size:14px;line-height:1.6;'>A step has been completed on a decision you are involved with:</p>
            <div style='background:#F8F9FA;border-left:4px solid #2A9D8F;padding:16px;margin:16px 0;border-radius:4px;'>
              <p style='margin:0;font-size:14px;color:#212529;'><strong>Decision:</strong> {decisionTitle}</p>
              <p style='margin:4px 0 0;font-size:14px;color:#212529;'><strong>Step {stepNumber}:</strong> {stepName}</p>
              <p style='margin:4px 0 0;font-size:14px;color:#6C757D;'>Completed by: {completedBy}</p>
            </div>");
    }

    public static string ApprovalNeeded(string decisionTitle, string referenceNumber)
    {
        return WrapInLayout("Decision Ready for Approval", $@"
            <p style='color:#6C757D;font-size:14px;line-height:1.6;'>A decision is ready for your review and approval:</p>
            <div style='background:#F8F9FA;border-left:4px solid #2A9D8F;padding:16px;margin:16px 0;border-radius:4px;'>
              <p style='margin:0;font-family:JetBrains Mono,monospace;font-size:12px;color:#6C757D;'>{referenceNumber}</p>
              <p style='margin:4px 0 0;font-size:16px;font-weight:600;color:#212529;'>{decisionTitle}</p>
            </div>
            <a href='#' style='display:inline-block;background:#1D3557;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;margin-top:8px;'>Review Decision</a>");
    }

    public static string DecisionPublished(string decisionTitle, string referenceNumber)
    {
        return WrapInLayout("Decision Published", $@"
            <p style='color:#6C757D;font-size:14px;line-height:1.6;'>Your decision has been published to the public transparency portal:</p>
            <div style='background:#F8F9FA;border-left:4px solid #1D3557;padding:16px;margin:16px 0;border-radius:4px;'>
              <p style='margin:0;font-family:JetBrains Mono,monospace;font-size:12px;color:#6C757D;'>{referenceNumber}</p>
              <p style='margin:4px 0 0;font-size:16px;font-weight:600;color:#212529;'>{decisionTitle}</p>
            </div>
            <p style='color:#6C757D;font-size:14px;'>The decision is now publicly available on the BVI Transparency Portal.</p>");
    }

    public static string JudicialReviewFiled(string decisionTitle, string referenceNumber)
    {
        return WrapInLayout("Judicial Review Filed", $@"
            <p style='color:#6C757D;font-size:14px;line-height:1.6;'>A judicial review has been filed against a decision:</p>
            <div style='background:#F8F9FA;border-left:4px solid #E76F51;padding:16px;margin:16px 0;border-radius:4px;'>
              <p style='margin:0;font-family:JetBrains Mono,monospace;font-size:12px;color:#6C757D;'>{referenceNumber}</p>
              <p style='margin:4px 0 0;font-size:16px;font-weight:600;color:#212529;'>{decisionTitle}</p>
            </div>
            <p style='color:#E76F51;font-size:14px;font-weight:500;'>Immediate attention is required.</p>");
    }

    public static string DeadlineReminder(string decisionTitle, string referenceNumber, int daysRemaining)
    {
        var urgencyColor = daysRemaining <= 1 ? "#E76F51" : "#E9C46A";
        return WrapInLayout("Deadline Approaching", $@"
            <p style='color:#6C757D;font-size:14px;line-height:1.6;'>A decision deadline is approaching:</p>
            <div style='background:#F8F9FA;border-left:4px solid {urgencyColor};padding:16px;margin:16px 0;border-radius:4px;'>
              <p style='margin:0;font-family:JetBrains Mono,monospace;font-size:12px;color:#6C757D;'>{referenceNumber}</p>
              <p style='margin:4px 0 0;font-size:16px;font-weight:600;color:#212529;'>{decisionTitle}</p>
              <p style='margin:8px 0 0;font-size:14px;font-weight:600;color:{urgencyColor};'>{daysRemaining} {(daysRemaining == 1 ? "day" : "days")} remaining</p>
            </div>");
    }

    public static string DecisionApproved(string decisionTitle, string referenceNumber)
    {
        return WrapInLayout("Decision Approved", $@"
            <p style='color:#6C757D;font-size:14px;line-height:1.6;'>Your decision has been approved and is ready for publication:</p>
            <div style='background:#F8F9FA;border-left:4px solid #2A9D8F;padding:16px;margin:16px 0;border-radius:4px;'>
              <p style='margin:0;font-family:JetBrains Mono,monospace;font-size:12px;color:#6C757D;'>{referenceNumber}</p>
              <p style='margin:4px 0 0;font-size:16px;font-weight:600;color:#212529;'>{decisionTitle}</p>
            </div>
            <a href='#' style='display:inline-block;background:#1D3557;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;margin-top:8px;'>Publish Decision</a>");
    }
}

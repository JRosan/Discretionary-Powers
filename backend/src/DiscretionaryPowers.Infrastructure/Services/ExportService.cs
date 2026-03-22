using System.Text;
using System.Text.Json;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Infrastructure.Services;

public class ExportService(AppDbContext db)
{
    private static readonly string[] StepNames =
    [
        "Identify Legal Authority & Scope",
        "Determine Applicable Procedures",
        "Gather Relevant Information",
        "Assess Evidence",
        "Apply Standard of Proof",
        "Address Bias & Conflicts",
        "Right to Be Heard",
        "Consider Relevant Factors",
        "Communicate Decision",
        "Record & Document",
    ];

    public async Task<object?> GetDecisionExportData(Guid decisionId)
    {
        var decision = await db.Decisions
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == decisionId);

        if (decision is null) return null;

        var ministry = await db.Ministries
            .AsNoTracking()
            .Where(m => m.Id == decision.MinistryId)
            .Select(m => new { m.Name, m.Code })
            .FirstOrDefaultAsync();

        var creator = await db.Users
            .AsNoTracking()
            .Where(u => u.Id == decision.CreatedBy)
            .Select(u => new { u.Name, u.Email })
            .FirstOrDefaultAsync();

        var steps = await db.DecisionSteps
            .AsNoTracking()
            .Where(s => s.DecisionId == decisionId)
            .OrderBy(s => s.StepNumber)
            .ToListAsync();

        var audit = await db.AuditEntries
            .AsNoTracking()
            .Where(a => a.DecisionId == decisionId)
            .OrderBy(a => a.CreatedAt)
            .ToListAsync();

        return new
        {
            decision = new
            {
                decision.ReferenceNumber,
                decision.Title,
                decision.Description,
                Status = decision.Status.ToString().ToLowerInvariant(),
                DecisionType = decision.DecisionType.ToString().ToLowerInvariant(),
                decision.CurrentStep,
                decision.CreatedAt,
                decision.UpdatedAt,
                decision.Deadline,
            },
            ministry = ministry is not null ? new { ministry.Name, ministry.Code } : null,
            createdByUser = creator is not null ? new { creator.Name, creator.Email } : null,
            steps = steps.Select(s => new
            {
                s.StepNumber,
                StepName = s.StepNumber <= StepNames.Length ? StepNames[s.StepNumber - 1] : $"Step {s.StepNumber}",
                Status = s.Status.ToString().ToLowerInvariant(),
                s.CompletedAt,
                s.Notes,
                Data = s.Data is not null ? JsonSerializer.Deserialize<object>(s.Data.RootElement.GetRawText()) : null,
            }),
            auditTrail = audit.Select(a => new
            {
                a.Action,
                Detail = a.Detail is not null ? JsonSerializer.Deserialize<object>(a.Detail.RootElement.GetRawText()) : null,
                a.CreatedAt,
            }),
        };
    }

    public async Task<byte[]> ExportAsJson(Guid decisionId)
    {
        var data = await GetDecisionExportData(decisionId);
        var json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
        return Encoding.UTF8.GetBytes(json);
    }

    public async Task<byte[]> ExportAsCsv(Guid decisionId)
    {
        var decision = await db.Decisions.AsNoTracking().FirstOrDefaultAsync(d => d.Id == decisionId);
        if (decision is null) return Encoding.UTF8.GetBytes("Decision not found");

        var ministry = await db.Ministries.AsNoTracking().FirstOrDefaultAsync(m => m.Id == decision.MinistryId);
        var steps = await db.DecisionSteps.AsNoTracking().Where(s => s.DecisionId == decisionId).OrderBy(s => s.StepNumber).ToListAsync();
        var audit = await db.AuditEntries.AsNoTracking().Where(a => a.DecisionId == decisionId).OrderBy(a => a.CreatedAt).ToListAsync();

        var rows = new List<string[]>();
        rows.Add(["Decision Report"]);
        rows.Add(["Reference", decision.ReferenceNumber]);
        rows.Add(["Title", decision.Title]);
        rows.Add(["Ministry", ministry?.Name ?? "N/A"]);
        rows.Add(["Type", decision.DecisionType.ToString()]);
        rows.Add(["Status", decision.Status.ToString()]);
        rows.Add(["Created", decision.CreatedAt.ToString("O")]);
        rows.Add(["Deadline", decision.Deadline?.ToString("O") ?? "None"]);
        rows.Add([]);

        rows.Add(["Step", "Name", "Status", "Completed", "Notes"]);
        foreach (var s in steps)
        {
            var name = s.StepNumber <= StepNames.Length ? StepNames[s.StepNumber - 1] : $"Step {s.StepNumber}";
            rows.Add([s.StepNumber.ToString(), name, s.Status.ToString(), s.CompletedAt?.ToString("O") ?? "", s.Notes ?? ""]);
        }
        rows.Add([]);

        rows.Add(["Audit Trail"]);
        rows.Add(["Action", "Timestamp", "Detail"]);
        foreach (var a in audit)
        {
            var detail = a.Detail is not null ? a.Detail.RootElement.GetRawText() : "";
            rows.Add([a.Action, a.CreatedAt.ToString("O"), detail]);
        }

        var csv = string.Join("\n", rows.Select(row =>
            string.Join(",", row.Select(cell => $"\"{cell.Replace("\"", "\"\"")}\""))));

        return Encoding.UTF8.GetBytes(csv);
    }

    public async Task<byte[]> ExportAsHtml(Guid decisionId)
    {
        var decision = await db.Decisions.AsNoTracking().FirstOrDefaultAsync(d => d.Id == decisionId);
        if (decision is null) return Encoding.UTF8.GetBytes("<p>Decision not found</p>");

        var ministry = await db.Ministries.AsNoTracking().FirstOrDefaultAsync(m => m.Id == decision.MinistryId);
        var creator = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == decision.CreatedBy);
        var steps = await db.DecisionSteps.AsNoTracking().Where(s => s.DecisionId == decisionId).OrderBy(s => s.StepNumber).ToListAsync();
        var audit = await db.AuditEntries.AsNoTracking().Where(a => a.DecisionId == decisionId).OrderBy(a => a.CreatedAt).ToListAsync();

        static string FormatStatus(string s) =>
            string.Join(" ", s.Replace("_", " ").Split(' ').Select(w =>
                w.Length > 0 ? char.ToUpper(w[0]) + w[1..] : w));

        var stepRows = new StringBuilder();
        foreach (var s in steps)
        {
            var name = s.StepNumber <= StepNames.Length ? StepNames[s.StepNumber - 1] : $"Step {s.StepNumber}";
            var statusClass = s.Status.ToString() == "Completed" ? "step-complete" : "step-pending";
            stepRows.AppendLine($"""
              <tr>
                <td>{s.StepNumber}</td>
                <td>{System.Net.WebUtility.HtmlEncode(name)}</td>
                <td class="{statusClass}">{FormatStatus(s.Status.ToString())}</td>
                <td>{(s.CompletedAt.HasValue ? s.CompletedAt.Value.ToString("d") : "\u2014")}</td>
                <td>{System.Net.WebUtility.HtmlEncode(s.Notes ?? "\u2014")}</td>
              </tr>
            """);
        }

        var auditRows = new StringBuilder();
        foreach (var a in audit)
        {
            auditRows.AppendLine($"""
              <tr>
                <td>{System.Net.WebUtility.HtmlEncode(a.Action)}</td>
                <td>{a.CreatedAt:g}</td>
              </tr>
            """);
        }

        var html = $$"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <title>{{System.Net.WebUtility.HtmlEncode(decision.ReferenceNumber)}} — Decision Report</title>
              <style>
                body { font-family: Inter, system-ui, sans-serif; color: #212529; margin: 40px; line-height: 1.6; }
                .header { background: #1D3557; color: white; padding: 24px 32px; margin: -40px -40px 32px; }
                .header h1 { margin: 0; font-size: 18px; font-weight: 600; }
                .header p { margin: 4px 0 0; font-size: 12px; opacity: 0.8; }
                h2 { font-size: 16px; color: #1D3557; border-bottom: 2px solid #DEE2E6; padding-bottom: 8px; margin-top: 32px; }
                table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px; }
                th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #DEE2E6; }
                th { background: #F8F9FA; font-weight: 600; color: #6C757D; font-size: 11px; text-transform: uppercase; }
                .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
                .meta-item label { display: block; font-size: 11px; color: #6C757D; text-transform: uppercase; font-weight: 600; }
                .meta-item span { font-size: 14px; }
                .status { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; background: #2A9D8F20; color: #1F7A6F; }
                .step-complete { color: #2A9D8F; }
                .step-pending { color: #ADB5BD; }
                .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #DEE2E6; font-size: 11px; color: #ADB5BD; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Government of the Virgin Islands</h1>
                <p>Discretionary Powers Management System — Decision Report</p>
              </div>
              <p style="font-family: monospace; font-size: 12px; color: #6C757D;">{{System.Net.WebUtility.HtmlEncode(decision.ReferenceNumber)}}</p>
              <h1 style="font-size: 22px; margin: 8px 0 16px;">{{System.Net.WebUtility.HtmlEncode(decision.Title)}}</h1>
              {{(decision.Description is not null ? $"<p style=\"color: #6C757D;\">{System.Net.WebUtility.HtmlEncode(decision.Description)}</p>" : "")}}
              <div class="meta-grid">
                <div class="meta-item"><label>Ministry</label><span>{{System.Net.WebUtility.HtmlEncode(ministry?.Name ?? "N/A")}}</span></div>
                <div class="meta-item"><label>Type</label><span>{{FormatStatus(decision.DecisionType.ToString())}}</span></div>
                <div class="meta-item"><label>Status</label><span class="status">{{FormatStatus(decision.Status.ToString())}}</span></div>
                <div class="meta-item"><label>Created By</label><span>{{System.Net.WebUtility.HtmlEncode(creator?.Name ?? "N/A")}}</span></div>
                <div class="meta-item"><label>Created</label><span>{{decision.CreatedAt:d}}</span></div>
                <div class="meta-item"><label>Deadline</label><span>{{(decision.Deadline.HasValue ? decision.Deadline.Value.ToString("d") : "None")}}</span></div>
              </div>
              <h2>10-Step Framework Progress</h2>
              <table>
                <thead><tr><th>Step</th><th>Name</th><th>Status</th><th>Completed</th><th>Notes</th></tr></thead>
                <tbody>{{stepRows}}</tbody>
              </table>
              <h2>Audit Trail</h2>
              <table>
                <thead><tr><th>Action</th><th>Timestamp</th></tr></thead>
                <tbody>{{auditRows}}</tbody>
              </table>
              <div class="footer">
                <p>Generated on {{DateTime.UtcNow:g}} by the Discretionary Powers Management System</p>
                <p>&copy; {{DateTime.UtcNow.Year}} Government of the Virgin Islands. All rights reserved.</p>
              </div>
            </body>
            </html>
            """;

        return Encoding.UTF8.GetBytes(html);
    }
}

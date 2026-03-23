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

        static string ExtractKeyData(System.Text.Json.JsonDocument? data)
        {
            if (data is null) return "\u2014";
            try
            {
                var items = new List<string>();
                foreach (var prop in data.RootElement.EnumerateObject())
                {
                    var val = prop.Value.ValueKind switch
                    {
                        System.Text.Json.JsonValueKind.String => prop.Value.GetString(),
                        System.Text.Json.JsonValueKind.True => "Yes",
                        System.Text.Json.JsonValueKind.False => "No",
                        System.Text.Json.JsonValueKind.Number => prop.Value.GetRawText(),
                        _ => null,
                    };
                    if (val is not null)
                    {
                        var label = string.Join(" ", System.Text.RegularExpressions.Regex.Split(prop.Name, "(?=[A-Z])")).Trim();
                        items.Add($"{label}: {val}");
                    }
                }
                return items.Count > 0 ? string.Join("; ", items.Take(3)) : "\u2014";
            }
            catch
            {
                return "\u2014";
            }
        }

        var stepRows = new StringBuilder();
        foreach (var s in steps)
        {
            var name = s.StepNumber <= StepNames.Length ? StepNames[s.StepNumber - 1] : $"Step {s.StepNumber}";
            var statusRaw = s.Status.ToString();
            var statusClass = statusRaw == "Completed" ? "step-complete"
                : statusRaw == "InProgress" ? "step-in-progress"
                : "step-pending";
            stepRows.AppendLine($"""
              <tr>
                <td class="step-num">{s.StepNumber}</td>
                <td>{System.Net.WebUtility.HtmlEncode(name)}</td>
                <td class="{statusClass}">{FormatStatus(statusRaw)}</td>
                <td>{(s.CompletedAt.HasValue ? s.CompletedAt.Value.ToString("d MMM yyyy") : "\u2014")}</td>
                <td class="key-data">{System.Net.WebUtility.HtmlEncode(ExtractKeyData(s.Data))}</td>
              </tr>
            """);
        }

        var auditRows = new StringBuilder();
        foreach (var a in audit)
        {
            auditRows.AppendLine($"""
              <tr>
                <td class="audit-date">{a.CreatedAt:d MMM yyyy HH:mm}</td>
                <td>
                  <span class="audit-action">{System.Net.WebUtility.HtmlEncode(a.Action)}</span>
                </td>
              </tr>
            """);
        }

        var completedCount = steps.Count(s => s.Status.ToString() is "Completed" or "SkippedWithReason");
        var progressPct = completedCount * 10;

        var html = $$"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <title>{{System.Net.WebUtility.HtmlEncode(decision.ReferenceNumber)}} — Decision Report</title>
              <style>
                /* Print-friendly base */
                body {
                  font-family: Georgia, "Times New Roman", Times, serif;
                  font-size: 12pt;
                  color: #1a1a1a;
                  margin: 0;
                  padding: 40px;
                  line-height: 1.5;
                }

                /* Header */
                .header {
                  display: flex;
                  align-items: center;
                  gap: 20px;
                  border-bottom: 3px solid #1D3557;
                  padding-bottom: 16px;
                  margin-bottom: 24px;
                }
                .crest {
                  width: 60px;
                  height: 60px;
                  border: 2px solid #1D3557;
                  border-radius: 4px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 8px;
                  color: #1D3557;
                  text-align: center;
                  flex-shrink: 0;
                }
                .header-text h1 {
                  margin: 0;
                  font-size: 16pt;
                  font-weight: 700;
                  color: #1D3557;
                  letter-spacing: 0.5px;
                }
                .header-text p {
                  margin: 2px 0 0;
                  font-size: 9pt;
                  color: #6C757D;
                  font-family: sans-serif;
                }

                /* Report title */
                .report-title {
                  text-align: center;
                  margin: 32px 0 8px;
                  font-size: 18pt;
                  font-weight: 700;
                  color: #1D3557;
                }
                .report-ref {
                  text-align: center;
                  font-family: "Courier New", Courier, monospace;
                  font-size: 10pt;
                  color: #6C757D;
                  margin: 0 0 28px;
                }

                /* Section headings */
                h2 {
                  font-size: 13pt;
                  color: #1D3557;
                  border-bottom: 2px solid #1D3557;
                  padding-bottom: 6px;
                  margin: 28px 0 12px;
                  font-weight: 700;
                }

                /* Metadata grid */
                .meta-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr;
                  gap: 14px;
                  margin-bottom: 8px;
                }
                .meta-item {
                  border: 1px solid #DEE2E6;
                  border-radius: 4px;
                  padding: 10px 14px;
                }
                .meta-item label {
                  display: block;
                  font-size: 8pt;
                  color: #6C757D;
                  text-transform: uppercase;
                  font-weight: 700;
                  font-family: sans-serif;
                  letter-spacing: 0.5px;
                  margin-bottom: 2px;
                }
                .meta-item span {
                  font-size: 11pt;
                }
                .status-badge {
                  display: inline-block;
                  padding: 2px 12px;
                  border-radius: 12px;
                  font-size: 10pt;
                  font-weight: 600;
                  border: 1px solid #1D3557;
                  color: #1D3557;
                }

                /* Summary */
                .summary {
                  background: #F8F9FA;
                  border-left: 4px solid #1D3557;
                  padding: 14px 18px;
                  margin: 12px 0;
                  font-size: 11pt;
                  color: #333;
                }

                /* Progress bar */
                .progress-bar {
                  background: #E9ECEF;
                  border-radius: 4px;
                  height: 10px;
                  margin: 8px 0 4px;
                  overflow: hidden;
                }
                .progress-fill {
                  height: 100%;
                  background: #2A9D8F;
                  border-radius: 4px;
                }
                .progress-label {
                  font-size: 9pt;
                  color: #6C757D;
                  font-family: sans-serif;
                  margin-bottom: 16px;
                }

                /* Tables */
                table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 10pt;
                  margin-top: 8px;
                }
                th, td {
                  padding: 8px 10px;
                  text-align: left;
                  border-bottom: 1px solid #DEE2E6;
                }
                th {
                  background: #F8F9FA;
                  font-weight: 700;
                  color: #495057;
                  font-size: 8pt;
                  text-transform: uppercase;
                  font-family: sans-serif;
                  letter-spacing: 0.3px;
                }
                .step-num { font-weight: 700; text-align: center; width: 40px; }
                .step-complete { color: #2A9D8F; font-weight: 600; }
                .step-in-progress { color: #E9C46A; font-weight: 600; }
                .step-pending { color: #ADB5BD; }
                .key-data { font-size: 9pt; color: #6C757D; max-width: 200px; }

                /* Audit timeline */
                .audit-date {
                  white-space: nowrap;
                  color: #6C757D;
                  font-family: "Courier New", Courier, monospace;
                  font-size: 9pt;
                  width: 140px;
                }
                .audit-action {
                  font-weight: 600;
                }

                /* Footer */
                .footer {
                  margin-top: 48px;
                  padding-top: 14px;
                  border-top: 2px solid #1D3557;
                  font-size: 8pt;
                  color: #6C757D;
                  font-family: sans-serif;
                  display: flex;
                  justify-content: space-between;
                }
                .footer p { margin: 0; }

                /* Print styles */
                @media print {
                  body { padding: 20px; margin: 0; }
                  .header { border-bottom-color: #000; }
                  .meta-item { border-color: #ccc; }
                  .summary { background: none; border-left-color: #000; }
                  .progress-bar { border: 1px solid #ccc; }
                  .progress-fill { background: #333 !important; }
                  .status-badge { border-color: #000; }
                  th { background: none !important; border-bottom: 2px solid #000; }
                  h2 { border-bottom-color: #000; page-break-after: avoid; }
                  table { page-break-inside: auto; }
                  tr { page-break-inside: avoid; }
                  .footer { border-top-color: #000; position: fixed; bottom: 0; left: 20px; right: 20px; }
                  @page { margin: 15mm; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="crest">BVI<br/>Crest</div>
                <div class="header-text">
                  <h1>Government of the Virgin Islands</h1>
                  <p>Discretionary Powers Management System</p>
                </div>
              </div>

              <div class="report-title">Decision Report</div>
              <div class="report-ref">{{System.Net.WebUtility.HtmlEncode(decision.ReferenceNumber)}}</div>

              <h2>Decision Details</h2>
              <div class="meta-grid">
                <div class="meta-item"><label>Ministry</label><span>{{System.Net.WebUtility.HtmlEncode(ministry?.Name ?? "N/A")}}</span></div>
                <div class="meta-item"><label>Decision Type</label><span>{{FormatStatus(decision.DecisionType.ToString())}}</span></div>
                <div class="meta-item"><label>Status</label><span class="status-badge">{{FormatStatus(decision.Status.ToString())}}</span></div>
                <div class="meta-item"><label>Created By</label><span>{{System.Net.WebUtility.HtmlEncode(creator?.Name ?? "N/A")}}</span></div>
                <div class="meta-item"><label>Created Date</label><span>{{decision.CreatedAt:d MMMM yyyy}}</span></div>
                <div class="meta-item"><label>Deadline</label><span>{{(decision.Deadline.HasValue ? decision.Deadline.Value.ToString("d MMMM yyyy") : "None set")}}</span></div>
              </div>

              {{(decision.Description is not null ? $"""
              <h2>Executive Summary</h2>
              <div class="summary">{System.Net.WebUtility.HtmlEncode(decision.Description)}</div>
              """ : "")}}

              <h2>10-Step Framework Progress</h2>
              <div class="progress-bar"><div class="progress-fill" style="width: {{progressPct}}%;"></div></div>
              <div class="progress-label">{{completedCount}} of 10 steps completed ({{progressPct}}%)</div>
              <table>
                <thead><tr><th>Step</th><th>Name</th><th>Status</th><th>Completed</th><th>Key Data</th></tr></thead>
                <tbody>{{stepRows}}</tbody>
              </table>

              <h2>Audit Trail</h2>
              <table>
                <thead><tr><th>Timestamp</th><th>Event</th></tr></thead>
                <tbody>{{auditRows}}</tbody>
              </table>

              <div class="footer">
                <p>Generated {{DateTime.UtcNow:d MMMM yyyy}} at {{DateTime.UtcNow:HH:mm}} UTC</p>
                <p>Crown Copyright &copy; {{DateTime.UtcNow.Year}} Government of the Virgin Islands</p>
              </div>
            </body>
            </html>
            """;

        return Encoding.UTF8.GetBytes(html);
    }
}

import { db } from "@/db";
import { decisions, decisionSteps, auditEntries, ministries, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DECISION_STEPS } from "@/lib/constants";

export interface DecisionExportData {
  decision: {
    referenceNumber: string;
    title: string;
    description: string | null;
    status: string;
    decisionType: string;
    currentStep: number;
    createdAt: Date;
    updatedAt: Date;
    deadline: Date | null;
  };
  ministry: { name: string; code: string } | null;
  createdByUser: { name: string; email: string } | null;
  steps: Array<{
    stepNumber: number;
    stepName: string;
    status: string;
    completedAt: Date | null;
    notes: string | null;
    data: unknown;
  }>;
  auditTrail: Array<{
    action: string;
    detail: unknown;
    createdAt: Date;
  }>;
}

/**
 * Gather all data needed to export a decision.
 */
export async function getDecisionExportData(
  decisionId: string
): Promise<DecisionExportData | null> {
  const [decision] = await db
    .select()
    .from(decisions)
    .where(eq(decisions.id, decisionId))
    .limit(1);

  if (!decision) return null;

  const [ministry] = await db
    .select({ name: ministries.name, code: ministries.code })
    .from(ministries)
    .where(eq(ministries.id, decision.ministryId))
    .limit(1);

  const [createdByUser] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, decision.createdBy))
    .limit(1);

  const steps = await db
    .select()
    .from(decisionSteps)
    .where(eq(decisionSteps.decisionId, decisionId))
    .orderBy(decisionSteps.stepNumber);

  const audit = await db
    .select({
      action: auditEntries.action,
      detail: auditEntries.detail,
      createdAt: auditEntries.createdAt,
    })
    .from(auditEntries)
    .where(eq(auditEntries.decisionId, decisionId))
    .orderBy(auditEntries.createdAt);

  return {
    decision: {
      referenceNumber: decision.referenceNumber,
      title: decision.title,
      description: decision.description,
      status: decision.status,
      decisionType: decision.decisionType,
      currentStep: decision.currentStep,
      createdAt: decision.createdAt ?? new Date(),
      updatedAt: decision.updatedAt ?? new Date(),
      deadline: decision.deadline,
    },
    ministry: ministry ?? null,
    createdByUser: createdByUser ?? null,
    steps: steps.map((s) => ({
      stepNumber: s.stepNumber,
      stepName:
        DECISION_STEPS.find((d) => d.number === s.stepNumber)?.name ??
        `Step ${s.stepNumber}`,
      status: s.status,
      completedAt: s.completedAt,
      notes: s.notes,
      data: s.data,
    })),
    auditTrail: audit,
  };
}

/**
 * Export decision data as JSON.
 */
export function exportAsJson(data: DecisionExportData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Export decision data as CSV.
 */
export function exportAsCsv(data: DecisionExportData): string {
  const rows: string[][] = [];

  // Header info
  rows.push(["Decision Report"]);
  rows.push(["Reference", data.decision.referenceNumber]);
  rows.push(["Title", data.decision.title]);
  rows.push(["Ministry", data.ministry?.name ?? "N/A"]);
  rows.push(["Type", data.decision.decisionType]);
  rows.push(["Status", data.decision.status]);
  rows.push(["Created", data.decision.createdAt.toISOString()]);
  rows.push(["Deadline", data.decision.deadline?.toISOString() ?? "None"]);
  rows.push([]);

  // Steps
  rows.push(["Step", "Name", "Status", "Completed", "Notes"]);
  for (const step of data.steps) {
    rows.push([
      String(step.stepNumber),
      step.stepName,
      step.status,
      step.completedAt?.toISOString() ?? "",
      step.notes ?? "",
    ]);
  }
  rows.push([]);

  // Audit trail
  rows.push(["Audit Trail"]);
  rows.push(["Action", "Timestamp", "Detail"]);
  for (const entry of data.auditTrail) {
    rows.push([
      entry.action,
      entry.createdAt.toISOString(),
      JSON.stringify(entry.detail),
    ]);
  }

  return rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
}

/**
 * Export decision as HTML (for PDF rendering).
 */
export function exportAsHtml(data: DecisionExportData): string {
  const formatStatus = (s: string) =>
    s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${data.decision.referenceNumber} — Decision Report</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; color: #212529; margin: 40px; line-height: 1.6; }
    .header { background: #1D3557; color: white; padding: 24px 32px; margin: -40px -40px 32px; }
    .header h1 { margin: 0; font-size: 18px; font-weight: 600; }
    .header p { margin: 4px 0 0; font-size: 12px; opacity: 0.8; }
    .ref { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #6C757D; }
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

  <p class="ref">${data.decision.referenceNumber}</p>
  <h1 style="font-size: 22px; margin: 8px 0 16px;">${data.decision.title}</h1>
  ${data.decision.description ? `<p style="color: #6C757D;">${data.decision.description}</p>` : ""}

  <div class="meta-grid">
    <div class="meta-item"><label>Ministry</label><span>${data.ministry?.name ?? "N/A"}</span></div>
    <div class="meta-item"><label>Type</label><span>${formatStatus(data.decision.decisionType)}</span></div>
    <div class="meta-item"><label>Status</label><span class="status">${formatStatus(data.decision.status)}</span></div>
    <div class="meta-item"><label>Created By</label><span>${data.createdByUser?.name ?? "N/A"}</span></div>
    <div class="meta-item"><label>Created</label><span>${data.decision.createdAt.toLocaleDateString()}</span></div>
    <div class="meta-item"><label>Deadline</label><span>${data.decision.deadline?.toLocaleDateString() ?? "None"}</span></div>
  </div>

  <h2>10-Step Framework Progress</h2>
  <table>
    <thead><tr><th>Step</th><th>Name</th><th>Status</th><th>Completed</th><th>Notes</th></tr></thead>
    <tbody>
      ${data.steps
        .map(
          (s) => `<tr>
        <td>${s.stepNumber}</td>
        <td>${s.stepName}</td>
        <td class="${s.status === "completed" ? "step-complete" : "step-pending"}">${formatStatus(s.status)}</td>
        <td>${s.completedAt ? new Date(s.completedAt).toLocaleDateString() : "—"}</td>
        <td>${s.notes ?? "—"}</td>
      </tr>`
        )
        .join("\n")}
    </tbody>
  </table>

  <h2>Audit Trail</h2>
  <table>
    <thead><tr><th>Action</th><th>Timestamp</th></tr></thead>
    <tbody>
      ${data.auditTrail
        .map(
          (a) => `<tr>
        <td>${a.action}</td>
        <td>${new Date(a.createdAt).toLocaleString()}</td>
      </tr>`
        )
        .join("\n")}
    </tbody>
  </table>

  <div class="footer">
    <p>Generated on ${new Date().toLocaleString()} by the Discretionary Powers Management System</p>
    <p>&copy; ${new Date().getFullYear()} Government of the Virgin Islands. All rights reserved.</p>
  </div>
</body>
</html>`;
}

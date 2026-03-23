import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | DPMS — Government of the Virgin Islands",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold text-text mb-6">Privacy Policy</h1>

      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        <p>
          The Government of the Virgin Islands respects your privacy and is committed
          to protecting personal data processed through the Discretionary Powers
          Management System (DPMS).
        </p>

        <div className="rounded-lg border border-border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text">Data We Collect</h2>
          <p>The DPMS processes the following categories of data:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Staff accounts:</strong> Name, email address, role, and ministry affiliation</li>
            <li><strong>Decision records:</strong> Decision titles, descriptions, supporting evidence, legal opinions, and correspondence</li>
            <li><strong>Audit trail:</strong> System actions, timestamps, and user identifiers for accountability purposes</li>
            <li><strong>Public portal:</strong> No personal data is collected from public visitors. Published decisions are redacted to remove sensitive personal information.</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text">Legal Basis for Processing</h2>
          <p>
            Personal data is processed under the legal authority of the Government of the
            Virgin Islands for the administration of public functions, in accordance with:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>The Virgin Islands Constitution Order 2007</li>
            <li>The Public Service Management Act 2024</li>
            <li>Commission of Inquiry recommendations (2022)</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text">Data Security</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
            <li>Access is restricted by role-based permissions</li>
            <li>An immutable, cryptographically chained audit trail records all system actions</li>
            <li>Passwords are hashed using bcrypt with a cost factor of 12</li>
            <li>Multi-factor authentication is available for elevated roles</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text">Data Retention</h2>
          <p>
            Decision records and audit trails are retained for a minimum of 7 years in
            accordance with government records management policy. Personal account data
            is retained for the duration of employment and archived thereafter.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Request access to your personal data held in the system</li>
            <li>Request correction of inaccurate personal data</li>
            <li>Request information about how your data is used</li>
          </ul>
          <p>
            To exercise these rights, contact the Data Protection Officer at{" "}
            <strong>privacy@gov.vg</strong>.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text">Contact</h2>
          <ul className="space-y-1">
            <li><strong>Data Protection Officer:</strong> privacy@gov.vg</li>
            <li><strong>Government Information Office:</strong> Central Administration Complex, Road Town, Tortola, BVI</li>
          </ul>
        </div>

        <p className="text-xs text-text-muted">
          This policy was last updated on {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
        </p>
      </div>
    </div>
  );
}

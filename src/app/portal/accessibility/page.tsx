import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Statement | DPMS — Government of the Virgin Islands",
};

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold text-text mb-6">Accessibility Statement</h1>

      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        <p>
          The Government of the Virgin Islands is committed to ensuring the Discretionary
          Powers Management System (DPMS) is accessible to all users, including people
          with disabilities.
        </p>

        <div className="rounded-lg border border-border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text">Compliance Standard</h2>
          <p>
            This system is designed to meet the <strong>Web Content Accessibility Guidelines
            (WCAG) 2.2 Level AA</strong> standard. We continuously work to improve the
            accessibility of the platform.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text">Accessibility Features</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Keyboard navigation throughout all pages and interactive elements</li>
            <li>Screen reader compatibility with proper ARIA labels and landmarks</li>
            <li>Skip navigation link to bypass repeated content</li>
            <li>Sufficient colour contrast ratios (minimum 4.5:1 for text)</li>
            <li>Clear focus indicators on all interactive elements</li>
            <li>Semantic HTML structure with proper heading hierarchy</li>
            <li>Form fields with associated labels and error descriptions</li>
            <li>Responsive design that works on all screen sizes</li>
            <li>No content that relies solely on colour to convey meaning</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text">Known Limitations</h2>
          <p>
            While we strive for full accessibility, some areas may have limitations:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Some chart visualisations on the reports dashboard may not be fully accessible to screen readers — data is also available in table format</li>
            <li>PDF and HTML document exports may require additional accessibility review</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text">Feedback and Contact</h2>
          <p>
            If you experience any accessibility barriers while using this system, please contact:
          </p>
          <ul className="space-y-1">
            <li><strong>Email:</strong> accessibility@gov.vg</li>
            <li><strong>Phone:</strong> +1 (284) 468-3701</li>
            <li><strong>Address:</strong> Government Information Office, Central Administration Complex, Road Town, Tortola, BVI</li>
          </ul>
          <p>
            We aim to respond to accessibility feedback within 5 working days.
          </p>
        </div>

        <p className="text-xs text-text-muted">
          This statement was last updated on {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
        </p>
      </div>
    </div>
  );
}

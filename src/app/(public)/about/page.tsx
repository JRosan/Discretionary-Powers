import { DECISION_STEPS } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold text-text mb-4">
        About the Discretionary Powers Management System
      </h1>

      <div className="prose prose-sm max-w-none text-text-secondary space-y-6">
        <p className="text-base">
          The Discretionary Powers Management System (DPMS) is a digital
          platform operated by the Government of the Virgin Islands to ensure
          transparent, accountable, and lawful exercise of discretionary powers
          by Ministers and public officials.
        </p>

        <div className="rounded-lg border border-border bg-white p-6">
          <h2 className="text-xl font-semibold text-text mb-3">
            The 10-Step Framework
          </h2>
          <p className="mb-4 text-sm">
            Every discretionary decision follows a structured 10-step process,
            as established in the Government&apos;s Guide to the Proper and
            Lawful Exercise of Discretionary Powers:
          </p>
          <ol className="space-y-3">
            {DECISION_STEPS.map((step) => (
              <li key={step.number} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                  {step.number}
                </span>
                <div>
                  <p className="text-sm font-medium text-text">{step.name}</p>
                  <p className="text-xs text-text-muted">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg border border-border bg-white p-6">
          <h2 className="text-xl font-semibold text-text mb-3">
            Governance Reform
          </h2>
          <p className="text-sm">
            This system supports the Government&apos;s commitment to governance
            reform following the 2022 Commission of Inquiry. It ensures that all
            discretionary decisions are documented, auditable, and subject to
            proper scrutiny — strengthening public trust in government
            decision-making.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-6">
          <h2 className="text-xl font-semibold text-text mb-3">
            Judicial Review
          </h2>
          <p className="text-sm">
            Decisions recorded in this system can be challenged through judicial
            review on the grounds of illegality, irrationality, procedural
            impropriety, or proportionality. The complete audit trail maintained
            by the system supports transparent judicial oversight.
          </p>
        </div>
      </div>
    </div>
  );
}

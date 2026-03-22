import { DECISION_STEPS } from "@/lib/constants";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-text mb-4">
        About the Discretionary Powers Management System
      </h1>

      <div className="space-y-8">
        {/* Introduction */}
        <p className="text-base text-text-secondary">
          The Discretionary Powers Management System (DPMS) is a digital
          platform operated by the Government of the Virgin Islands to ensure
          transparent, accountable, and lawful exercise of discretionary powers
          by Ministers and public officials.
        </p>

        {/* Why This System Exists */}
        <section className="rounded-lg border border-border bg-white p-6">
          <h2 className="text-xl font-semibold text-text mb-3">
            Why This System Exists
          </h2>
          <div className="space-y-3 text-sm text-text-secondary">
            <p>
              In 2022, the Commission of Inquiry into Governance in the British
              Virgin Islands identified significant weaknesses in how
              discretionary powers were being exercised. The Commission&apos;s
              report highlighted a lack of structured processes, insufficient
              documentation, and limited public oversight of ministerial
              decisions.
            </p>
            <p>
              In response, the Government committed to comprehensive governance
              reforms, including the development of this Discretionary Powers
              Management System. The DPMS provides a standardised framework for
              recording, tracking, and publishing discretionary decisions,
              ensuring that every exercise of power is documented, justified, and
              subject to appropriate scrutiny.
            </p>
            <p>
              This system represents the BVI&apos;s commitment to rebuilding
              public trust through transparency, accountability, and the rule of
              law.
            </p>
          </div>
        </section>

        {/* The 10-Step Framework */}
        <section className="rounded-lg border border-border bg-white p-6">
          <h2 className="text-xl font-semibold text-text mb-3">
            The 10-Step Framework
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
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
        </section>

        {/* Your Rights */}
        <section id="rights" className="rounded-lg border border-border bg-white p-6">
          <h2 className="text-xl font-semibold text-text mb-3">
            Your Rights
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Decisions recorded in this system can be challenged through judicial
            review. The courts may review a discretionary decision on the
            following grounds:
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Illegality</h3>
              <p className="text-xs text-text-secondary">
                The decision-maker did not have the legal power to make the
                decision, or misunderstood or misapplied the law.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Irrationality</h3>
              <p className="text-xs text-text-secondary">
                The decision was so unreasonable that no reasonable
                decision-maker could have reached it (Wednesbury
                unreasonableness).
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">
                Procedural Impropriety
              </h3>
              <p className="text-xs text-text-secondary">
                Required procedures were not followed, or the rules of natural
                justice (such as the right to be heard) were breached.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Proportionality</h3>
              <p className="text-xs text-text-secondary">
                The decision imposed a burden or restriction that was
                disproportionate to the aim being pursued.
              </p>
            </div>
          </div>
          <p className="text-sm text-text-secondary mt-4">
            The complete audit trail maintained by the DPMS supports transparent
            judicial oversight by providing an authoritative record of how each
            decision was made.
          </p>
        </section>

        {/* How to Request Information */}
        <section id="contact" className="rounded-lg border border-border bg-white p-6">
          <h2 className="text-xl font-semibold text-text mb-3">
            How to Request Information
          </h2>
          <div className="space-y-3 text-sm text-text-secondary">
            <p>
              Members of the public may request additional information about
              published decisions or the decision-making process. Requests can be
              made through the following channels:
            </p>
            <div className="rounded-md border border-border p-4 space-y-2">
              <p>
                <span className="font-medium text-text">Email:</span>{" "}
                transparency@gov.vg
              </p>
              <p>
                <span className="font-medium text-text">Post:</span>{" "}
                Government Information Office, Central Administration Complex,
                Road Town, Tortola, British Virgin Islands
              </p>
              <p>
                <span className="font-medium text-text">Telephone:</span>{" "}
                +1 (284) 468-2000
              </p>
            </div>
            <p>
              Information requests are processed in accordance with applicable
              freedom of information legislation. Please allow up to 20 working
              days for a response.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="rounded-lg border border-border bg-white p-6">
          <h2 className="text-xl font-semibold text-text mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-text mb-1">
                What is a discretionary power?
              </h3>
              <p className="text-xs text-text-secondary">
                A discretionary power is the authority given to a Minister or
                public official to make decisions based on their judgement, within
                the bounds of the law. These decisions affect individuals,
                businesses, or communities and must be exercised fairly and
                lawfully.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text mb-1">
                Why are decisions published on this portal?
              </h3>
              <p className="text-xs text-text-secondary">
                Publishing decisions promotes transparency and accountability.
                It allows the public to see how discretionary powers are being
                exercised and to verify that proper processes were followed.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text mb-1">
                Are all government decisions published here?
              </h3>
              <p className="text-xs text-text-secondary">
                No. Only decisions involving the exercise of discretionary powers
                that have completed the 10-step framework and been approved for
                publication are shown on this portal. Some decisions may be
                withheld for reasons of national security, personal privacy, or
                ongoing legal proceedings.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text mb-1">
                Can I challenge a decision shown on this portal?
              </h3>
              <p className="text-xs text-text-secondary">
                Yes. If you are directly affected by a decision, you may be able
                to seek judicial review through the Eastern Caribbean Supreme
                Court. Legal advice should be sought before commencing any
                proceedings. See the{" "}
                <a href="#rights" className="text-accent hover:text-accent/80">
                  Your Rights
                </a>{" "}
                section above for more information.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text mb-1">
                What does each step in the framework involve?
              </h3>
              <p className="text-xs text-text-secondary">
                Each step ensures a different aspect of lawful decision-making is
                addressed — from confirming the legal authority to act, through
                gathering and evaluating evidence, to communicating the outcome
                and maintaining records. The full framework is described above.
              </p>
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="rounded-lg border border-border bg-white p-6">
          <h2 className="text-xl font-semibold text-text mb-3">
            Related Resources
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="text-text-secondary">
                Government of the Virgin Islands Official Website — gov.vg
              </span>
            </li>
            <li>
              <span className="text-text-secondary">
                BVI Commission of Inquiry Report (2022)
              </span>
            </li>
            <li>
              <span className="text-text-secondary">
                Guide to the Proper and Lawful Exercise of Discretionary Powers
              </span>
            </li>
            <li>
              <span className="text-text-secondary">
                Eastern Caribbean Supreme Court — eccourts.org
              </span>
            </li>
            <li>
              <Link
                href="/decisions"
                className="text-accent hover:text-accent/80 transition-colors"
              >
                Browse Published Decisions
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

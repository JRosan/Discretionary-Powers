import type { Metadata } from "next";
import { DECISION_STEPS } from "@/lib/constants";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About the DPMS | Government of the Virgin Islands",
  description:
    "Learn about the Discretionary Powers Management System, the 10-step decision framework, your rights to judicial review, and how to request information.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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

        {/* Published Decision-Making Guidelines */}
        <section className="rounded-lg border border-border bg-white p-6">
          <h2 className="text-xl font-semibold text-text mb-3">
            Published Decision-Making Guidelines
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            The following criteria are applied when exercising discretionary
            powers across different decision types. These guidelines ensure
            consistency, transparency, and lawfulness in all government
            decisions.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Regulatory</h3>
              <p className="text-xs text-text-secondary">
                Health, safety, and environmental standards. Decisions must
                demonstrate compliance with applicable regulatory frameworks and
                consider public welfare impacts.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Licensing</h3>
              <p className="text-xs text-text-secondary">
                Qualification requirements and the public interest test.
                Applicants must meet prescribed criteria and licensing decisions
                must weigh individual merit against community benefit.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Planning</h3>
              <p className="text-xs text-text-secondary">
                Land use policy and environmental impact. Planning decisions
                consider zoning requirements, environmental assessments, and
                community consultation outcomes.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Financial</h3>
              <p className="text-xs text-text-secondary">
                Value for money and budget constraints. Financial decisions must
                demonstrate fiscal responsibility and alignment with approved
                budgetary allocations.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Appointment</h3>
              <p className="text-xs text-text-secondary">
                Merit-based selection and equal opportunity. Appointments must
                follow transparent selection processes and demonstrate that
                candidates were assessed on merit.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Policy</h3>
              <p className="text-xs text-text-secondary">
                Evidence-based analysis and public consultation. Policy decisions
                must be grounded in research, stakeholder engagement, and
                consideration of alternatives.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Enforcement</h3>
              <p className="text-xs text-text-secondary">
                Proportionality and consistency. Enforcement actions must be
                proportionate to the offence and applied consistently across
                similar cases.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Crown Land</h3>
              <p className="text-xs text-text-secondary">
                Allocation and management of Crown land under the Crown Lands
                Ordinance. Decisions must consider land use policy, community
                benefit, and environmental impact.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Belongership</h3>
              <p className="text-xs text-text-secondary">
                Grants of Belonger status under the Immigration and Passport Act.
                Applications must be assessed on individual merit with consistent
                application of statutory criteria.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Immigration</h3>
              <p className="text-xs text-text-secondary">
                Residency permits, visa approvals, and immigration status
                decisions. Must comply with immigration legislation and consider
                individual circumstances and public interest.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Trade Licence</h3>
              <p className="text-xs text-text-secondary">
                Business and trade licence approvals. Applicants must meet
                prescribed requirements and decisions must consider economic
                impact and regulatory compliance.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Work Permit</h3>
              <p className="text-xs text-text-secondary">
                Work permit grants and renewals under the Labour Code. Decisions
                must balance labour market needs with protection of local
                employment opportunities.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Customs Exemption</h3>
              <p className="text-xs text-text-secondary">
                Customs duty exemptions and waivers. Decisions must demonstrate
                clear policy justification, fiscal responsibility, and equitable
                treatment of applicants.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Environmental</h3>
              <p className="text-xs text-text-secondary">
                Environmental permits, conservation orders, and impact
                assessments. Decisions must consider ecological sustainability,
                public health, and compliance with environmental legislation.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-1">Maritime</h3>
              <p className="text-xs text-text-secondary">
                Vessel registration, port authority decisions, and maritime
                permits. Decisions must comply with maritime legislation and
                international conventions applicable to the BVI.
              </p>
            </div>
          </div>
        </section>

        {/* Governance Reform Compliance */}
        <section className="rounded-lg border border-border bg-white p-6">
          <h2 className="text-xl font-semibold text-text mb-3">
            Governance Reform Compliance
          </h2>
          <div className="space-y-3 text-sm text-text-secondary">
            <p>
              This system implements key recommendations from the 2022
              Commission of Inquiry into Governance in the British Virgin
              Islands. The Commission&apos;s report identified the need for
              systematic oversight of discretionary powers and recommended
              comprehensive reforms to restore public confidence.
            </p>
            <p>
              The DPMS directly addresses the following Commission
              recommendations:
            </p>
            <div className="space-y-3">
              <div className="rounded-md border border-border p-4">
                <h3 className="text-sm font-semibold text-text mb-1">
                  Recommendation A3: Published Guidelines
                </h3>
                <p className="text-xs text-text-secondary">
                  The government shall publish clear guidelines for the exercise
                  of discretionary powers. This system serves as the primary
                  mechanism for publishing and enforcing those guidelines through
                  the 10-step decision-making framework.
                </p>
              </div>
              <div className="rounded-md border border-border p-4">
                <h3 className="text-sm font-semibold text-text mb-1">
                  Documented Reasoning
                </h3>
                <p className="text-xs text-text-secondary">
                  Every discretionary decision recorded in the DPMS includes a
                  complete account of the reasoning process, the evidence
                  considered, and the factors that led to the final outcome.
                </p>
              </div>
              <div className="rounded-md border border-border p-4">
                <h3 className="text-sm font-semibold text-text mb-1">
                  Complete Audit Trail
                </h3>
                <p className="text-xs text-text-secondary">
                  The system maintains a cryptographically secured,
                  tamper-evident audit trail using SHA-256 hash chaining. Every
                  action taken on a decision is permanently recorded and
                  verifiable.
                </p>
              </div>
              <div className="rounded-md border border-border p-4">
                <h3 className="text-sm font-semibold text-text mb-1">
                  Public Transparency Portal
                </h3>
                <p className="text-xs text-text-secondary">
                  Approved decisions are published on this public portal,
                  allowing citizens to review how discretionary powers are being
                  exercised across government.
                </p>
              </div>
              <div className="rounded-md border border-border p-4">
                <h3 className="text-sm font-semibold text-text mb-1">
                  Judicial Review Mechanisms
                </h3>
                <p className="text-xs text-text-secondary">
                  The system supports judicial oversight by providing
                  authoritative records that can be examined by the Eastern
                  Caribbean Supreme Court when decisions are challenged.
                </p>
              </div>
            </div>
            <p>
              The BVI Government has implemented 46 of the Commission&apos;s 48
              recommendations. The DPMS is a central component of the
              governance reform programme, demonstrating the Territory&apos;s
              commitment to transparency, accountability, and the rule of law.
            </p>
          </div>
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
                href="/portal/decisions"
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

import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Government Links */}
          <div>
            <h3 className="text-sm font-semibold text-text mb-3">
              Government Links
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/portal/about" className="hover:text-accent transition-colors">
                  About the Framework
                </Link>
              </li>
              <li>
                <Link href="/portal/decisions" className="hover:text-accent transition-colors">
                  Published Decisions
                </Link>
              </li>
              <li>
                <Link href="/portal/ministries" className="hover:text-accent transition-colors">
                  Government Ministries
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-text mb-3">
              Contact Information
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>Government Information Office</li>
              <li>Central Administration Complex</li>
              <li>Road Town, Tortola, BVI</li>
              <li>Email: transparency@gov.vg</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-text mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/portal/about#rights" className="hover:text-accent transition-colors">
                  Your Rights
                </Link>
              </li>
              <li>
                <Link href="/portal/accessibility" className="hover:text-accent transition-colors">
                  Accessibility Statement
                </Link>
              </li>
              <li>
                <Link href="/portal/privacy" className="hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <p className="text-center text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Government of the Virgin Islands.
            Crown Copyright. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

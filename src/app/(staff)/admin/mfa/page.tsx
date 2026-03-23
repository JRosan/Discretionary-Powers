"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UpgradePrompt } from "@/components/common/upgrade-prompt";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Shield, ShieldCheck, ShieldOff } from "lucide-react";

export default function MfaSetupPage() {
  const { user } = useAuth();
  const [secret, setSecret] = useState<string | null>(null);
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [setupStarted, setSetupStarted] = useState(false);

  const { data: usage } = useQuery({
    queryKey: ["billing", "usage"],
    queryFn: () => api.billing.getUsage(),
  });

  const isGated = usage?.plan === "starter";

  async function handleSetup() {
    setLoading(true);
    setMessage(null);
    try {
      const result = await api.mfa.setup();
      setSecret(result.secret);
      setQrCodeUri(result.qrCodeUri);
      setSetupStarted(true);
    } catch {
      setMessage({ text: "Failed to set up MFA. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleEnable(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6 || !secret) return;
    setLoading(true);
    setMessage(null);
    try {
      await api.mfa.enable(code, secret);
      setMfaEnabled(true);
      setSetupStarted(false);
      setSecret(null);
      setQrCodeUri(null);
      setCode("");
      setMessage({ text: "MFA has been enabled successfully.", type: "success" });
    } catch {
      setMessage({ text: "Invalid verification code. Please try again.", type: "error" });
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    if (disableCode.length !== 6) return;
    setLoading(true);
    setMessage(null);
    try {
      await api.mfa.disable(disableCode);
      setMfaEnabled(false);
      setDisableCode("");
      setMessage({ text: "MFA has been disabled.", type: "success" });
    } catch {
      setMessage({ text: "Invalid verification code.", type: "error" });
      setDisableCode("");
    } finally {
      setLoading(false);
    }
  }

  if (isGated) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-text">
            Two-Factor Authentication
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Add an extra layer of security to your account using an authenticator app.
          </p>
        </div>
        <UpgradePrompt feature="multi-factor authentication" requiredPlan="professional" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">
          Two-Factor Authentication
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Add an extra layer of security to your account using an authenticator
          app.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-md px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-success/10 text-success"
              : "bg-error/10 text-error"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-lg border border-border bg-background p-6">
        {mfaEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <ShieldCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <h2 className="font-semibold text-text">MFA is Enabled</h2>
                <p className="text-sm text-text-muted">
                  Your account is protected with two-factor authentication.
                </p>
              </div>
            </div>

            <hr className="border-border" />

            <form onSubmit={handleDisable} className="space-y-3">
              <p className="text-sm text-text-muted">
                To disable MFA, enter a code from your authenticator app.
              </p>
              <Input
                label="Verification Code"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={disableCode}
                onChange={(e) =>
                  setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                autoComplete="one-time-code"
              />
              <Button
                type="submit"
                variant="destructive"
                loading={loading}
                disabled={disableCode.length !== 6}
              >
                <ShieldOff className="mr-2 h-4 w-4" />
                Disable MFA
              </Button>
            </form>
          </div>
        ) : setupStarted && secret ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Shield className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h2 className="font-semibold text-text">Set Up Authenticator</h2>
                <p className="text-sm text-text-muted">
                  Scan the QR code or enter the secret key in your authenticator
                  app.
                </p>
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-text mb-1">
                  Secret Key
                </p>
                <code className="block rounded bg-surface px-3 py-2 font-mono text-sm text-text break-all select-all">
                  {secret}
                </code>
              </div>

              {qrCodeUri && (
                <div>
                  <p className="text-sm font-medium text-text mb-1">
                    QR Code URI
                  </p>
                  <code className="block rounded bg-surface px-3 py-2 font-mono text-xs text-text-muted break-all select-all">
                    {qrCodeUri}
                  </code>
                  <p className="mt-1 text-xs text-text-muted">
                    Copy this URI into your authenticator app if QR scanning is
                    not available.
                  </p>
                </div>
              )}
            </div>

            <hr className="border-border" />

            <form onSubmit={handleEnable} className="space-y-3">
              <p className="text-sm text-text-muted">
                Enter the 6-digit code from your authenticator app to verify
                setup.
              </p>
              <Input
                label="Verification Code"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                autoFocus
                autoComplete="one-time-code"
              />
              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="accent"
                  loading={loading}
                  disabled={code.length !== 6}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Enable MFA
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSetupStarted(false);
                    setSecret(null);
                    setQrCodeUri(null);
                    setCode("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-text">MFA is Not Enabled</h2>
                <p className="text-sm text-text-muted">
                  Protect your account by adding two-factor authentication.
                </p>
              </div>
            </div>

            <Button onClick={handleSetup} variant="accent" loading={loading}>
              <Shield className="mr-2 h-4 w-4" />
              Set Up MFA
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-surface/50 p-4">
        <h3 className="text-sm font-medium text-text">
          Recommended Authenticator Apps
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-text-muted">
          <li>Microsoft Authenticator</li>
          <li>Google Authenticator</li>
          <li>Authy</li>
        </ul>
      </div>
    </div>
  );
}

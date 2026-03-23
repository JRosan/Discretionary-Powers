"use client";

import { useEffect, useState, useCallback } from "react";
import { api, ApiPlatformSettings } from "@/lib/api";
import {
  Settings,
  CreditCard,
  Mail,
  Package,
  Loader2,
  CheckCircle2,
  XCircle,
  Save,
  TestTube,
  Eye,
  EyeOff,
} from "lucide-react";

const MASKED = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";

type TabId = "payment" | "email" | "general";

interface ConfigValues {
  [key: string]: string;
}

export default function PlatformSettingsPage() {
  const [categories, setCategories] = useState<ApiPlatformSettings["categories"]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("payment");
  const [values, setValues] = useState<ConfigValues>({});
  const [originalValues, setOriginalValues] = useState<ConfigValues>({});
  const [secretMeta, setSecretMeta] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [testingPayment, setTestingPayment] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailProvider, setEmailProvider] = useState<"smtp" | "msgraph">("smtp");
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.superAdmin.getSettings();
        setCategories(result.categories);
        const vals: ConfigValues = {};
        const origVals: ConfigValues = {};
        const secrets: Record<string, boolean> = {};
        for (const cat of result.categories) {
          for (const s of cat.settings) {
            vals[s.key] = s.value;
            origVals[s.key] = s.value;
            if (s.isSecret) secrets[s.key] = true;
          }
        }
        setValues(vals);
        setOriginalValues(origVals);
        setSecretMeta(secrets);

        // Detect email provider from existing config
        const graphTenant = vals["msgraph:tenant_id"] || "";
        const graphClient = vals["msgraph:client_id"] || "";
        if ((graphTenant && graphTenant !== MASKED && graphTenant.length > 0) ||
            (graphClient && graphClient !== MASKED && graphClient.length > 0)) {
          setEmailProvider("msgraph");
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSecretFocus = (key: string) => {
    // If the value is still the masked placeholder, clear it so user can type
    if (values[key] === MASKED) {
      setValues((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleSecretBlur = (key: string) => {
    // If user cleared the field and the original was masked, restore the mask
    if (values[key] === "" && originalValues[key] === MASKED) {
      setValues((prev) => ({ ...prev, [key]: MASKED }));
    }
  };

  const toggleReveal = (key: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getChangedSettings = (category: string): Array<{ key: string; value: string }> => {
    const changes: Array<{ key: string; value: string }> = [];
    const cat = categories.find((c) => c.name === category);
    if (!cat) return changes;
    for (const s of cat.settings) {
      if (values[s.key] !== originalValues[s.key]) {
        changes.push({ key: s.key, value: values[s.key] });
      }
    }
    return changes;
  };

  const handleSave = async (category: string) => {
    const changes = getChangedSettings(category);
    if (changes.length === 0) {
      showToast("success", "No changes to save.");
      return;
    }
    setSaving(true);
    try {
      await api.superAdmin.updateSettings(changes);
      // Update original values to reflect saved state
      const newOriginals = { ...originalValues };
      for (const c of changes) {
        newOriginals[c.key] = secretMeta[c.key] ? MASKED : c.value;
        if (secretMeta[c.key] && c.value !== MASKED && c.value !== "") {
          setValues((prev) => ({ ...prev, [c.key]: MASKED }));
        }
      }
      setOriginalValues(newOriginals);
      showToast("success", `${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully.`);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestPayment = async () => {
    setTestingPayment(true);
    try {
      const result = await api.superAdmin.testPayment();
      showToast(result.success ? "success" : "error", result.message);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Payment test failed.");
    } finally {
      setTestingPayment(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      const result = await api.superAdmin.testEmail();
      showToast(result.success ? "success" : "error", result.message);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Email test failed.");
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: typeof CreditCard }[] = [
    { id: "payment", label: "Payment Gateway", icon: CreditCard },
    { id: "email", label: "Email", icon: Mail },
    { id: "general", label: "General", icon: Settings },
  ];

  const getVal = (key: string) => values[key] ?? "";
  const isSecret = (key: string) => !!secretMeta[key];
  const getDesc = (key: string) => {
    for (const cat of categories) {
      const s = cat.settings.find((s) => s.key === key);
      if (s) return s.description;
    }
    return "";
  };

  const renderField = (key: string, label: string, opts?: { type?: string; placeholder?: string }) => {
    const secret = isSecret(key);
    const val = getVal(key);
    const desc = getDesc(key);
    const isEmpty = !val || val === "";
    const inputType = secret && !revealedSecrets[key] ? "password" : (opts?.type ?? "text");

    return (
      <div key={key}>
        <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
          {label}
          {secret && isEmpty && (
            <span className="ml-2 text-warning-dark font-normal normal-case">Not configured</span>
          )}
        </label>
        <div className="relative">
          <input
            type={inputType}
            value={val}
            onChange={(e) => handleChange(key, e.target.value)}
            onFocus={() => secret && handleSecretFocus(key)}
            onBlur={() => secret && handleSecretBlur(key)}
            placeholder={opts?.placeholder ?? ""}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent pr-10"
          />
          {secret && val && val !== "" && (
            <button
              type="button"
              onClick={() => toggleReveal(key)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
            >
              {revealedSecrets[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {desc && <p className="text-xs text-text-muted mt-1">{desc}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md border px-4 py-3 shadow-lg text-sm ${
            toast.type === "success"
              ? "bg-accent/10 border-accent/30 text-accent"
              : "bg-error/10 border-error/30 text-error"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-text">Platform Settings</h1>
        <p className="text-text-muted text-sm mt-1">
          Configure payment gateway, email, and platform settings
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6" aria-label="Settings tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-accent text-accent"
                    : "border-transparent text-text-muted hover:text-text hover:border-border"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Payment Gateway Tab */}
      {activeTab === "payment" && (
        <div className="rounded-lg border border-border bg-background p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-text-muted" />
            <h2 className="text-base font-semibold text-text">PlaceToPay Configuration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {renderField("placetopay:login", "API Login")}
            {renderField("placetopay:secret_key", "API Secret Key")}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
              API Endpoint
            </label>
            <select
              value={getVal("placetopay:endpoint")}
              onChange={(e) => handleChange("placetopay:endpoint", e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            >
              <option value="https://checkout-test.placetopay.com">Sandbox (checkout-test.placetopay.com)</option>
              <option value="https://checkout.placetopay.com">Production (checkout.placetopay.com)</option>
            </select>
            <p className="text-xs text-text-muted mt-1">{getDesc("placetopay:endpoint")}</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleSave("payment")}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Payment Settings
            </button>
            <button
              onClick={handleTestPayment}
              disabled={testingPayment}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-text hover:bg-background-alt disabled:opacity-50"
            >
              {testingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
              Test Connection
            </button>
          </div>
        </div>
      )}

      {/* Email Tab */}
      {activeTab === "email" && (
        <div className="rounded-lg border border-border bg-background p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-5 w-5 text-text-muted" />
            <h2 className="text-base font-semibold text-text">Email Configuration</h2>
          </div>

          {/* Provider Toggle */}
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
              Email Provider
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setEmailProvider("smtp")}
                className={`rounded-md px-4 py-2 text-sm font-medium border transition-colors ${
                  emailProvider === "smtp"
                    ? "bg-accent/10 border-accent text-accent"
                    : "border-border text-text-muted hover:text-text"
                }`}
              >
                SMTP
              </button>
              <button
                onClick={() => setEmailProvider("msgraph")}
                className={`rounded-md px-4 py-2 text-sm font-medium border transition-colors ${
                  emailProvider === "msgraph"
                    ? "bg-accent/10 border-accent text-accent"
                    : "border-border text-text-muted hover:text-text"
                }`}
              >
                Microsoft Graph
              </button>
            </div>
          </div>

          {emailProvider === "smtp" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {renderField("smtp:host", "SMTP Host", { placeholder: "localhost" })}
              {renderField("smtp:port", "SMTP Port", { type: "text", placeholder: "1025" })}
              {renderField("smtp:from", "From Address", { type: "email", placeholder: "noreply@govdecision.com" })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {renderField("msgraph:tenant_id", "Tenant ID")}
              {renderField("msgraph:client_id", "Client ID")}
              {renderField("msgraph:client_secret", "Client Secret")}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleSave("email")}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Email Settings
            </button>
            <button
              onClick={handleTestEmail}
              disabled={testingEmail}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-text hover:bg-background-alt disabled:opacity-50"
            >
              {testingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
              Send Test Email
            </button>
          </div>
        </div>
      )}

      {/* General Tab */}
      {activeTab === "general" && (
        <div className="rounded-lg border border-border bg-background p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-text-muted" />
            <h2 className="text-base font-semibold text-text">General Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {renderField("general:platform_name", "Platform Name", { placeholder: "GovDecision" })}
            {renderField("general:support_email", "Support Email", { type: "email", placeholder: "support@govdecision.com" })}
            {renderField("general:default_trial_days", "Default Trial Days", { type: "number", placeholder: "14" })}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleSave("general")}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save General Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useTenant } from "@/lib/tenant-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OrganizationSettingsPage() {
  const { user } = useAuth();
  const tenant = useTenant();

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1D3557");
  const [accentColor, setAccentColor] = useState("#2A9D8F");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tenant.isLoading) {
      setName(tenant.name);
      setLogoUrl(tenant.logoUrl ?? "");
      setPrimaryColor(tenant.primaryColor);
      setAccentColor(tenant.accentColor);
      setHeroImageUrl(tenant.heroImageUrl ?? "");
    }
  }, [tenant]);

  if (user?.role !== "permanent_secretary") {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-text-muted">You do not have permission to access this page.</p>
      </div>
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await api.tenant.updateBranding({
        name: name || undefined,
        logoUrl: logoUrl || undefined,
        primaryColor,
        accentColor,
        heroImageUrl: heroImageUrl || undefined,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save branding");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Organization Branding</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Customize your organization&apos;s appearance across the platform.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-lg border border-border bg-white p-6 space-y-5">
          <h2 className="text-lg font-semibold text-text">General</h2>

          <Input
            label="Organization Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Government of the Virgin Islands"
          />

          <Input
            label="Logo URL"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="/images/logos/crest-white.png"
          />

          <Input
            label="Hero Image URL"
            value={heroImageUrl}
            onChange={(e) => setHeroImageUrl(e.target.value)}
            placeholder="/images/hero-bg.jpg"
          />
        </div>

        <div className="rounded-lg border border-border bg-white p-6 space-y-5">
          <h2 className="text-lg font-semibold text-text">Colors</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border border-border"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 rounded-md border border-border px-3 py-2 text-sm font-mono"
                  placeholder="#1D3557"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border border-border"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 rounded-md border border-border px-3 py-2 text-sm font-mono"
                  placeholder="#2A9D8F"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-lg border border-border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text">Preview</h2>
          <div
            className="rounded-lg p-6 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-3 mb-4">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="h-10 w-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div>
                <p className="font-bold">{name || "Organization Name"}</p>
                <p className="text-sm text-white/70">DPMS</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-md px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: accentColor }}
            >
              Accent Button Preview
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {saved && (
          <div className="rounded-md bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent-dark">
            Branding saved successfully. Refresh the page to see changes.
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="accent" loading={saving}>
            {saving ? "Saving..." : "Save Branding"}
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

interface TenantBranding {
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  heroImageUrl: string | null;
  isLoading: boolean;
}

const defaultBranding: TenantBranding = {
  name: "Government of the Virgin Islands",
  slug: "bvi",
  logoUrl: "/images/logos/crest-white.png",
  primaryColor: "#1D3557",
  accentColor: "#2A9D8F",
  heroImageUrl: "/images/hero-bg.jpg",
  isLoading: true,
};

const TenantContext = createContext<TenantBranding>(defaultBranding);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<TenantBranding>(defaultBranding);

  useEffect(() => {
    api.tenant
      .getBranding()
      .then((data) => {
        setBranding({
          name: data.name ?? defaultBranding.name,
          slug: data.slug ?? defaultBranding.slug,
          logoUrl: data.logoUrl ?? defaultBranding.logoUrl,
          primaryColor: data.primaryColor ?? defaultBranding.primaryColor,
          accentColor: data.accentColor ?? defaultBranding.accentColor,
          heroImageUrl: data.heroImageUrl ?? defaultBranding.heroImageUrl,
          isLoading: false,
        });
      })
      .catch(() => {
        setBranding({ ...defaultBranding, isLoading: false });
      });
  }, []);

  useEffect(() => {
    if (!branding.isLoading) {
      document.documentElement.style.setProperty("--color-primary", branding.primaryColor);
      document.documentElement.style.setProperty("--color-accent", branding.accentColor);
    }
  }, [branding]);

  return (
    <TenantContext.Provider value={branding}>{children}</TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}

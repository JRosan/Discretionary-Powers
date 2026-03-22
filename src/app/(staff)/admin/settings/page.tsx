"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          System configuration and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>
            Basic system configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              System Name
            </label>
            <input
              type="text"
              defaultValue="Discretionary Powers Management System"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Default Decision Deadline (days)
            </label>
            <input
              type="number"
              defaultValue={30}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>
            Configure email notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Email notifications for new decisions", defaultChecked: true },
            { label: "Email notifications for step completions", defaultChecked: true },
            { label: "Overdue deadline reminders", defaultChecked: true },
            { label: "Judicial review flag alerts", defaultChecked: true },
            { label: "Weekly summary reports", defaultChecked: false },
          ].map((item) => (
            <label key={item.label} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={item.defaultChecked}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-sm text-text">{item.label}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit Trail</CardTitle>
          <CardDescription>
            Configure audit trail retention and export settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Retention Period
            </label>
            <select className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent">
              <option value="5">5 years</option>
              <option value="7" selected>7 years</option>
              <option value="10">10 years</option>
              <option value="indefinite">Indefinite</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="accent">Save Settings</Button>
        <Button variant="outline">Reset to Defaults</Button>
      </div>
    </div>
  );
}

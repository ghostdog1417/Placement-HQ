import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, logout } from "@/lib/auth";
import { useLocalStorage } from "@/lib/storage";
import type { Settings } from "@/lib/types";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings · placement.os" }],
  }),
  component: SettingsPage,
});

const defaultSettings: Settings = { leetcodeUsername: "", githubUsername: "" };

function SettingsPage() {
  const [settings, setSettings] = useLocalStorage<Settings>("pt.settings", defaultSettings);
  const [draft, setDraft] = useState<Settings>(settings);

  const saveSettings = () => {
    setSettings(draft);
    toast.success("Settings saved");
  };

  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to sign out";
      toast.error(message);
    }
  };

  return (
    <PageShell title="Settings">
      <div className="grid gap-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">LeetCode username</Label>
              <Input
                value={draft.leetcodeUsername}
                onChange={(e) => setDraft((p) => ({ ...p, leetcodeUsername: e.target.value }))}
                placeholder="e.g. neetcode"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">GitHub username</Label>
              <Input
                value={draft.githubUsername}
                onChange={(e) => setDraft((p) => ({ ...p, githubUsername: e.target.value }))}
                placeholder="e.g. torvalds"
              />
            </div>
            <Button onClick={saveSettings} size="sm">
              Save
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Your placement data is now saved and is accessible across devices when signed in.
            </p>
            {user?.email && (
              <div className="text-xs text-muted-foreground">
                Signed in as <span className="font-mono">{user.email}</span>
              </div>
            )}
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

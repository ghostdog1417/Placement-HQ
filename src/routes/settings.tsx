import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useLocalStorage } from "@/lib/storage";
import type { Settings } from "@/lib/types";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings · placement.os" }],
  }),
  component: SettingsPage,
});

const KEYS = ["pt.companies", "pt.resumes", "pt.offers", "pt.notes", "pt.settings", "pt.lc", "pt.gh"];
const defaultSettings: Settings = { leetcodeUsername: "", githubUsername: "" };

function SettingsPage() {
  const [settings, setSettings] = useLocalStorage<Settings>("pt.settings", defaultSettings);
  const [draft, setDraft] = useState<Settings>(settings);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveSettings = () => {
    setSettings(draft);
    toast.success("Settings saved");
  };

  const exportAll = () => {
    const dump: Record<string, unknown> = {};
    for (const k of KEYS) {
      const v = window.localStorage.getItem(k);
      if (v) dump[k] = JSON.parse(v);
    }
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `placement-os-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported");
  };

  const importAll = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        for (const k of KEYS) {
          if (parsed[k] !== undefined) {
            window.localStorage.setItem(k, JSON.stringify(parsed[k]));
          }
        }
        toast.success("Imported — reloading…");
        setTimeout(() => window.location.reload(), 500);
      } catch {
        toast.error("Invalid JSON");
      }
    };
    reader.readAsText(file);
  };

  const wipe = () => {
    if (!confirm("Delete ALL local data? This cannot be undone.")) return;
    for (const k of KEYS) window.localStorage.removeItem(k);
    toast.success("Wiped — reloading…");
    setTimeout(() => window.location.reload(), 500);
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
              All your data lives in browser localStorage. Export regularly so you don't lose it.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={exportAll} className="gap-1">
                <Download className="h-3 w-3" /> Export JSON
              </Button>
              <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} className="gap-1">
                <Upload className="h-3 w-3" /> Import JSON
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && importAll(e.target.files[0])}
              />
              <Button variant="destructive" size="sm" onClick={wipe} className="gap-1">
                <Trash2 className="h-3 w-3" /> Wipe all
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

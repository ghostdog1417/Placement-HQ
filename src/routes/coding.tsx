import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@/lib/storage";
import type { GitHubStats, LeetCodeStats, Settings } from "@/lib/types";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Code2, Github, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/coding")({
  head: () => ({
    meta: [
      { title: "Coding · placement.os" },
      { name: "description", content: "LeetCode + GitHub stats and streaks." },
    ],
  }),
  component: CodingPage,
});

const defaultSettings: Settings = { leetcodeUsername: "", githubUsername: "" };

function CodingPage() {
  const [settings] = useLocalStorage<Settings>("pt.settings", defaultSettings);
  const [lc, setLc] = useLocalStorage<LeetCodeStats>("pt.lc", null);
  const [gh, setGh] = useLocalStorage<GitHubStats>("pt.gh", null);
  const [loadingLc, setLoadingLc] = useState(false);
  const [loadingGh, setLoadingGh] = useState(false);

  const syncLc = async () => {
    if (!settings.leetcodeUsername) {
      toast.error("Set your LeetCode username in Settings first.");
      return;
    }
    setLoadingLc(true);
    try {
      const res = await fetch(
        `https://leetcode-api-faisalshohag.vercel.app/${encodeURIComponent(settings.leetcodeUsername)}`,
      );
      if (!res.ok) throw new Error("LeetCode API error");
      const d = await res.json();
      setLc({
        totalSolved: d.totalSolved ?? 0,
        easy: d.easySolved ?? 0,
        medium: d.mediumSolved ?? 0,
        hard: d.hardSolved ?? 0,
        ranking: d.ranking,
        fetchedAt: new Date().toISOString(),
      });
      toast.success("LeetCode synced");
    } catch (e) {
      toast.error("Couldn't reach LeetCode. Try again later.");
    } finally {
      setLoadingLc(false);
    }
  };

  const syncGh = async () => {
    if (!settings.githubUsername) {
      toast.error("Set your GitHub username in Settings first.");
      return;
    }
    setLoadingGh(true);
    try {
      const res = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(settings.githubUsername)}?y=last`,
      );
      if (!res.ok) throw new Error("GH API error");
      const d = await res.json();
      const contribs: { date: string; count: number }[] = (d.contributions || []).map((c: any) => ({
        date: c.date,
        count: c.count,
      }));
      const last = contribs.slice(-84); // 12 weeks
      // streak = consecutive days from most recent with count > 0
      let streak = 0;
      for (let i = contribs.length - 1; i >= 0; i--) {
        if (contribs[i].count > 0) streak++;
        else break;
      }
      const total = d.total?.lastYear ?? contribs.reduce((s, c) => s + c.count, 0);
      setGh({
        totalContributions: total,
        streak,
        last12Weeks: last,
        fetchedAt: new Date().toISOString(),
      });
      toast.success("GitHub synced");
    } catch {
      toast.error("Couldn't reach GitHub.");
    } finally {
      setLoadingGh(false);
    }
  };

  useEffect(() => {
    // auto-sync on first load if usernames set and no data yet
    if (settings.leetcodeUsername && !lc) syncLc();
    if (settings.githubUsername && !gh) syncGh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell title="Coding Progress" subtitle="leetcode · github">
      {!settings.leetcodeUsername && !settings.githubUsername && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm">
          <AlertCircle className="h-4 w-4 text-warning" />
          <span>Add your LeetCode and GitHub usernames in Settings to sync stats.</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">LeetCode</CardTitle>
              {settings.leetcodeUsername && (
                <span className="text-xs text-muted-foreground font-mono">
                  @{settings.leetcodeUsername}
                </span>
              )}
            </div>
            <Button size="sm" variant="secondary" onClick={syncLc} disabled={loadingLc} className="gap-1">
              <RefreshCw className={`h-3 w-3 ${loadingLc ? "animate-spin" : ""}`} /> Sync
            </Button>
          </CardHeader>
          <CardContent>
            {lc ? (
              <>
                <div className="num text-4xl font-semibold">{lc.totalSolved}</div>
                <p className="text-xs text-muted-foreground">Total problems solved</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Stat label="Easy" value={lc.easy} color="text-success" />
                  <Stat label="Medium" value={lc.medium} color="text-warning" />
                  <Stat label="Hard" value={lc.hard} color="text-destructive" />
                </div>
                {lc.ranking ? (
                  <p className="mt-4 text-xs text-muted-foreground font-mono">
                    Global rank: <span className="text-foreground">#{lc.ranking.toLocaleString()}</span>
                  </p>
                ) : null}
                <p className="mt-2 text-[10px] text-muted-foreground font-mono">
                  Synced {new Date(lc.fetchedAt).toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">No data yet — hit sync.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">GitHub</CardTitle>
              {settings.githubUsername && (
                <span className="text-xs text-muted-foreground font-mono">
                  @{settings.githubUsername}
                </span>
              )}
            </div>
            <Button size="sm" variant="secondary" onClick={syncGh} disabled={loadingGh} className="gap-1">
              <RefreshCw className={`h-3 w-3 ${loadingGh ? "animate-spin" : ""}`} /> Sync
            </Button>
          </CardHeader>
          <CardContent>
            {gh ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="num text-4xl font-semibold">{gh.totalContributions}</div>
                    <p className="text-xs text-muted-foreground">Contributions this year</p>
                  </div>
                  <Badge className="gap-1 bg-primary text-primary-foreground">
                    🔥 {gh.streak} day streak
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">Last 12 weeks</p>
                  <Heatmap data={gh.last12Weeks} />
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground font-mono">
                  Synced {new Date(gh.fetchedAt).toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">No data yet — hit sync.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-md bg-secondary/40 p-2 text-center">
      <p className={`num text-lg font-semibold ${color}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function Heatmap({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < data.length; i += 7) weeks.push(data.slice(i, i + 7));
  return (
    <div className="flex gap-1">
      {weeks.map((w, i) => (
        <div key={i} className="flex flex-col gap-1">
          {w.map((d) => {
            const intensity = d.count === 0 ? 0 : Math.max(0.15, d.count / max);
            return (
              <div
                key={d.date}
                title={`${d.date}: ${d.count}`}
                className="h-3 w-3 rounded-sm"
                style={{
                  backgroundColor:
                    intensity === 0
                      ? "var(--color-secondary)"
                      : `color-mix(in oklab, var(--color-primary) ${Math.round(intensity * 100)}%, var(--color-secondary))`,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

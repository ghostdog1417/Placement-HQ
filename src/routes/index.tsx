import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useUserCollection } from "@/lib/firestore";
import type { Company, Offer, Resume } from "@/lib/types";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, Calendar, Flame, Target, TrendingUp } from "lucide-react";
import { statusColor } from "@/lib/status-color";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · placement.os" },
      { name: "description", content: "Overview of your placement season at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { items: companies } = useUserCollection<Company>(user?.uid ?? null, "companies");
  const { items: resumes } = useUserCollection<Resume>(user?.uid ?? null, "resumes");
  const { items: offers } = useUserCollection<Offer>(user?.uid ?? null, "offers");

  const stats = useMemo(() => {
    const applied = companies.filter((c) =>
      ["Applied", "OA Scheduled", "OA Cleared", "Interview", "HR Round", "Selected", "Offer Received"].includes(c.status),
    ).length;
    const interviews = companies.filter((c) => ["Interview", "HR Round"].includes(c.status)).length;
    const oa = companies.filter((c) => c.status === "OA Scheduled").length;
    const selected = companies.filter((c) => ["Selected", "Offer Received"].includes(c.status)).length;
    const rejected = companies.filter((c) => c.status === "Rejected").length;
    const responseRate = applied ? Math.round(((interviews + selected) / applied) * 100) : 0;
    const conversion = interviews ? Math.round((selected / interviews) * 100) : 0;
    return { applied, interviews, oa, selected, rejected, responseRate, conversion };
  }, [companies]);

  const upcoming = useMemo(() => {
    const today = new Date();
    return [...companies]
      .filter((c) => new Date(c.deadline) >= new Date(today.toDateString()))
      .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline))
      .slice(0, 5);
  }, [companies]);

  const scheduled = useMemo(
    () =>
      companies
        .filter((c) => c.interviewDate)
        .sort((a, b) => +new Date(a.interviewDate!) - +new Date(b.interviewDate!))
        .slice(0, 5),
    [companies],
  );

  const activeResume = resumes[0];

  return (
    <PageShell title="Dashboard" subtitle="~/placement.os">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications" value={stats.applied} icon={<Target className="h-4 w-4" />} hint={`${companies.length} tracked`} />
        <StatCard label="Interviews" value={stats.interviews} icon={<Calendar className="h-4 w-4" />} hint={`${stats.oa} OA scheduled`} />
        <StatCard label="Response rate" value={`${stats.responseRate}%`} icon={<TrendingUp className="h-4 w-4" />} hint={`${stats.selected} selected`} />
        <StatCard label="Offers" value={offers.length} icon={<Flame className="h-4 w-4" />} hint={`${stats.conversion}% conversion`} accent />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Upcoming deadlines</CardTitle>
            <Link to="/companies" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.length === 0 && <Empty text="No upcoming deadlines." />}
            {upcoming.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-md border bg-secondary/30 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.name} · <span className="text-muted-foreground">{c.role}</span></p>
                  <p className="text-xs text-muted-foreground font-mono">{new Date(c.deadline).toDateString()}</p>
                </div>
                <Badge variant="outline" className={statusColor(c.status)}>{c.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Interviews scheduled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {scheduled.length === 0 && <Empty text="Nothing scheduled." />}
            {scheduled.map((c) => (
              <div key={c.id} className="rounded-md border bg-secondary/30 px-3 py-2">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {c.interviewDate ? new Date(c.interviewDate).toDateString() : "—"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pipeline funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FunnelRow label="Applied" value={stats.applied} total={Math.max(stats.applied, 1)} />
            <FunnelRow label="OA" value={stats.oa + stats.interviews + stats.selected} total={Math.max(stats.applied, 1)} />
            <FunnelRow label="Interview" value={stats.interviews + stats.selected} total={Math.max(stats.applied, 1)} />
            <FunnelRow label="Selected" value={stats.selected} total={Math.max(stats.applied, 1)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active resume</CardTitle>
          </CardHeader>
          <CardContent>
            {activeResume ? (
              <div>
                <p className="text-sm font-medium">{activeResume.label}</p>
                <p className="text-xs text-muted-foreground font-mono mb-3">
                  {activeResume.version} · {activeResume.targetRole}
                </p>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs text-muted-foreground">ATS score</span>
                  <span className="num text-2xl font-semibold">{activeResume.atsScore}</span>
                </div>
                <Progress value={activeResume.atsScore} />
                <Link to="/resumes" className="mt-3 inline-flex text-xs text-muted-foreground hover:text-foreground">
                  Manage resumes →
                </Link>
              </div>
            ) : (
              <Empty text="No resume yet." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...companies]
              .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
              .slice(0, 5)
              .map((c) => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <span className="truncate">{c.name}</span>
                  <span className="text-muted-foreground font-mono">
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            {companies.length === 0 && <Empty text="No activity yet." />}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

function StatCard({
  label,
  value,
  icon,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? "border-primary/40 bg-gradient-to-br from-primary/10 to-transparent" : ""}>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs uppercase tracking-wider">{label}</span>
          <span className={accent ? "text-primary" : ""}>{icon}</span>
        </div>
        <div className="num mt-2 text-3xl font-semibold">{value}</div>
        {hint && <p className="text-xs text-muted-foreground mt-1 font-mono">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function FunnelRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = Math.round((value / total) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="num">{value} · {pct}%</span>
      </div>
      <Progress value={pct} />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-xs text-muted-foreground py-4 text-center">{text}</p>;
}

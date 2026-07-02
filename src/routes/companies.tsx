import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { uid } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { useUserCollection } from "@/lib/firestore";
import { COMPANY_STATUSES, type Company, type CompanyStatus } from "@/lib/types";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Trash2, Pencil, ExternalLink } from "lucide-react";
import { statusColor } from "@/lib/status-color";
import { toast } from "sonner";

export const Route = createFileRoute("/companies")({
  head: () => ({
    meta: [
      { title: "Companies · placement.os" },
      { name: "description", content: "Track every company from Interested to Offer." },
    ],
  }),
  component: CompaniesPage,
});

const emptyCompany = (): Company => ({
  id: uid(),
  name: "",
  role: "",
  ctc: "",
  location: "",
  eligibility: "",
  deadline: new Date().toISOString(),
  status: "Interested",
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

function CompaniesPage() {
  const { user } = useAuth();
  const { items: companies, saveItem, deleteItem } = useUserCollection<Company>(user?.uid ?? null, "companies");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | "all">("all");
  const [editing, setEditing] = useState<Company | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      companies.filter((c) => {
        const q = query.toLowerCase();
        const matchesQ =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q);
        const matchesS = statusFilter === "all" || c.status === statusFilter;
        return matchesQ && matchesS;
      }),
    [companies, query, statusFilter],
  );

  const save = async (c: Company) => {
    await saveItem({
      ...c,
      updatedAt: new Date().toISOString(),
      createdAt: c.createdAt || new Date().toISOString(),
    });
    toast.success(`Saved ${c.name || "company"}`);
    setOpen(false);
    setEditing(null);
  };

  const remove = async (id: string) => {
    await deleteItem(id);
    toast.success("Deleted");
  };

  const openNew = () => {
    setEditing(emptyCompany());
    setOpen(true);
  };

  return (
    <PageShell
      title="Companies"
      subtitle={`${companies.length} tracked`}
      actions={
        <Button size="sm" onClick={openNew} className="gap-1">
          <Plus className="h-4 w-4" /> Add company
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search company, role, location…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {COMPANY_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-4">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>CTC</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{c.location}</div>
                    </TableCell>
                    <TableCell>{c.role}</TableCell>
                    <TableCell className="font-mono text-sm">{c.ctc}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {new Date(c.deadline).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColor(c.status)}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {c.link && (
                        <Button asChild size="icon" variant="ghost">
                          <a href={c.link} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(c);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(c.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                      No companies match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="kanban" className="mt-4">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
            {COMPANY_STATUSES.map((s) => {
              const items = filtered.filter((c) => c.status === s);
              return (
                <div key={s} className="rounded-md border bg-secondary/20 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className={statusColor(s)}>
                      {s}
                    </Badge>
                    <span className="num text-xs text-muted-foreground">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setEditing(c);
                          setOpen(true);
                        }}
                        className="w-full text-left rounded-md border bg-card p-2 hover:border-primary/60 transition"
                      >
                        <div className="text-sm font-medium truncate">{c.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{c.role}</div>
                        <div className="mt-1 text-[10px] font-mono text-muted-foreground">
                          {c.ctc}
                        </div>
                      </button>
                    ))}
                    {items.length === 0 && (
                      <p className="text-[11px] text-muted-foreground text-center py-2">—</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        {editing && (
          <CompanyForm
            key={editing.id}
            initial={editing}
            onSave={save}
            onCancel={() => setOpen(false)}
          />
        )}
      </Dialog>
    </PageShell>
  );
}

function CompanyForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Company;
  onSave: (c: Company) => void;
  onCancel: () => void;
}) {
  const [c, setC] = useState<Company>(initial);
  const set = <K extends keyof Company>(k: K, v: Company[K]) => setC((p) => ({ ...p, [k]: v }));

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{initial.name ? "Edit company" : "New company"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Company">
            <Input value={c.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Role">
            <Input value={c.role} onChange={(e) => set("role", e.target.value)} />
          </Field>
          <Field label="CTC">
            <Input value={c.ctc} onChange={(e) => set("ctc", e.target.value)} placeholder="₹12 LPA" />
          </Field>
          <Field label="Location">
            <Input value={c.location} onChange={(e) => set("location", e.target.value)} />
          </Field>
          <Field label="Eligibility">
            <Input value={c.eligibility} onChange={(e) => set("eligibility", e.target.value)} />
          </Field>
          <Field label="Deadline">
            <Input
              type="date"
              value={c.deadline.slice(0, 10)}
              onChange={(e) => set("deadline", new Date(e.target.value).toISOString())}
            />
          </Field>
          <Field label="Interview date">
            <Input
              type="date"
              value={c.interviewDate ? c.interviewDate.slice(0, 10) : ""}
              onChange={(e) =>
                set("interviewDate", e.target.value ? new Date(e.target.value).toISOString() : undefined)
              }
            />
          </Field>
          <Field label="Status">
            <Select value={c.status} onValueChange={(v) => set("status", v as CompanyStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Link">
          <Input value={c.link || ""} onChange={(e) => set("link", e.target.value)} placeholder="https://…" />
        </Field>
        <Field label="Notes">
          <Textarea rows={3} value={c.notes || ""} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(c)}>Save</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

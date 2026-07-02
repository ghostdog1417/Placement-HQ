import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLocalStorage, uid } from "@/lib/storage";
import { seedResumes } from "@/lib/seed";
import type { Resume } from "@/lib/types";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Download, Trash2, Pencil, FileText, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/resumes")({
  head: () => ({
    meta: [
      { title: "Resumes · placement.os" },
      { name: "description", content: "Manage resume versions and ATS scores." },
    ],
  }),
  component: ResumesPage,
});

const empty = (): Resume => ({
  id: uid(),
  label: "",
  version: "v1",
  targetRole: "",
  atsScore: 70,
  notes: "",
  updatedAt: new Date().toISOString(),
});

function ResumesPage() {
  const [resumes, setResumes] = useLocalStorage<Resume[]>("pt.resumes", seedResumes);
  const [editing, setEditing] = useState<Resume | null>(null);
  const [open, setOpen] = useState(false);

  const save = (r: Resume) => {
    setResumes((prev) => {
      const i = prev.findIndex((p) => p.id === r.id);
      const updated = { ...r, updatedAt: new Date().toISOString() };
      if (i === -1) return [updated, ...prev];
      const next = [...prev];
      next[i] = updated;
      return next;
    });
    toast.success("Resume saved");
    setOpen(false);
    setEditing(null);
  };

  const remove = (id: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== id));
    toast.success("Deleted");
  };

  return (
    <PageShell
      title="Resume Manager"
      subtitle={`${resumes.length} versions`}
      actions={
        <Button
          size="sm"
          className="gap-1"
          onClick={() => {
            setEditing(empty());
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New resume
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resumes.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{r.label || "Untitled"}</CardTitle>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {r.version} · {r.targetRole || "no target"}
                  </p>
                </div>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                <span>ATS score</span>
                <span className="num text-2xl font-semibold text-foreground">{r.atsScore}</span>
              </div>
              <Progress value={r.atsScore} className="mt-1" />
              {r.notes && (
                <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{r.notes}</p>
              )}
              <p className="text-[10px] text-muted-foreground font-mono mt-3">
                Updated {new Date(r.updatedAt).toLocaleDateString()}
              </p>
              <div className="mt-3 flex gap-1">
                {r.fileDataUrl && (
                  <Button asChild size="sm" variant="secondary" className="gap-1">
                    <a href={r.fileDataUrl} download={r.fileName || "resume.pdf"}>
                      <Download className="h-3 w-3" /> PDF
                    </a>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(r);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {resumes.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">
            No resumes yet.
          </p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        {editing && (
          <ResumeForm key={editing.id} initial={editing} onSave={save} onCancel={() => setOpen(false)} />
        )}
      </Dialog>
    </PageShell>
  );
}

function ResumeForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Resume;
  onSave: (r: Resume) => void;
  onCancel: () => void;
}) {
  const [r, setR] = useState<Resume>(initial);
  const set = <K extends keyof Resume>(k: K, v: Resume[K]) => setR((p) => ({ ...p, [k]: v }));

  const onFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) {
      toast.error("PDF over 3MB — try compressing first.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      set("fileDataUrl", reader.result as string);
      set("fileName", f.name);
    };
    reader.readAsDataURL(f);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{initial.label ? "Edit resume" : "New resume"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Label</Label>
            <Input value={r.label} onChange={(e) => set("label", e.target.value)} placeholder="SWE — General" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Version</Label>
            <Input value={r.version} onChange={(e) => set("version", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Target role</Label>
            <Input value={r.targetRole} onChange={(e) => set("targetRole", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">ATS score</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={r.atsScore}
              onChange={(e) => set("atsScore", Number(e.target.value))}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Notes</Label>
          <Textarea rows={3} value={r.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">PDF file (≤3MB)</Label>
          <label className="flex items-center gap-2 border border-dashed rounded-md px-3 py-2 cursor-pointer hover:bg-accent">
            <Upload className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
              {r.fileName || "Click to upload"}
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(r)}>Save</Button>
      </DialogFooter>
    </DialogContent>
  );
}

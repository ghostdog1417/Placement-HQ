import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUserCollection } from "@/lib/firestore";
import { uid } from "@/lib/storage";
import type { Note } from "@/lib/types";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Notes · placement.os" },
      { name: "description", content: "Interview experiences, company research, salary intel." },
    ],
  }),
  component: NotesPage,
});

const empty = (): Note => ({
  id: uid(),
  type: "Interview Experience",
  title: "",
  company: "",
  body: "",
  createdAt: new Date().toISOString(),
});

function NotesPage() {
  const { user } = useAuth();
  const { items: notes, saveItem, deleteItem } = useUserCollection<Note>(user?.uid ?? null, "notes");
  const [editing, setEditing] = useState<Note | null>(null);
  const [open, setOpen] = useState(false);

  const save = async (n: Note) => {
    await saveItem({ ...n });
    toast.success("Note saved");
    setOpen(false);
    setEditing(null);
  };
  const remove = async (id: string) => {
    await deleteItem(id);
    toast.success("Deleted");
  };

  return (
    <PageShell
      title="Notes"
      subtitle={`${notes.length} entries`}
      actions={
        <Button
          size="sm"
          className="gap-1"
          onClick={() => {
            setEditing(empty());
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New note
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {notes.map((n) => (
          <Card key={n.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{n.title || "Untitled"}</CardTitle>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{n.company}</p>
                </div>
                <Badge variant="outline">{n.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">
                {n.body}
              </p>
              <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditing(n);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(n.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {notes.length === 0 && (
          <p className="col-span-full text-center text-sm text-muted-foreground py-12">
            No notes yet.
          </p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        {editing && (
          <NoteForm key={editing.id} initial={editing} onSave={save} onCancel={() => setOpen(false)} />
        )}
      </Dialog>
    </PageShell>
  );
}

function NoteForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Note;
  onSave: (n: Note) => void;
  onCancel: () => void;
}) {
  const [n, setN] = useState<Note>(initial);
  const set = <K extends keyof Note>(k: K, v: Note[K]) => setN((p) => ({ ...p, [k]: v }));
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{initial.title ? "Edit note" : "New note"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select value={n.type} onValueChange={(v) => set("type", v as Note["type"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Interview Experience">Interview Experience</SelectItem>
                <SelectItem value="Company Notes">Company Notes</SelectItem>
                <SelectItem value="Salary Notes">Salary Notes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Company</Label>
            <Input value={n.company} onChange={(e) => set("company", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Title</Label>
          <Input value={n.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Body</Label>
          <Textarea rows={8} value={n.body} onChange={(e) => set("body", e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(n)}>Save</Button>
      </DialogFooter>
    </DialogContent>
  );
}

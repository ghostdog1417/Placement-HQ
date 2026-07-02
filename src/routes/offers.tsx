import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useLocalStorage, uid } from "@/lib/storage";
import { seedOffers } from "@/lib/seed";
import type { Offer } from "@/lib/types";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Trophy, Star } from "lucide-react";
import { formatINR } from "@/lib/status-color";
import { toast } from "sonner";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers · placement.os" },
      { name: "description", content: "Compare offers side-by-side and decide." },
    ],
  }),
  component: OffersPage,
});

const empty = (): Offer => ({
  id: uid(),
  companyName: "",
  role: "",
  base: 0,
  bonus: 0,
  stock: 0,
  location: "",
  joiningDate: new Date().toISOString(),
  status: "Pending",
  createdAt: new Date().toISOString(),
});

function OffersPage() {
  const [offers, setOffers] = useLocalStorage<Offer[]>("pt.offers", seedOffers);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [open, setOpen] = useState(false);

  const best = useMemo(() => {
    if (!offers.length) return null;
    return offers.reduce((a, b) => (b.base + b.bonus + b.stock > a.base + a.bonus + a.stock ? b : a));
  }, [offers]);

  const save = (o: Offer) => {
    setOffers((prev) => {
      const i = prev.findIndex((p) => p.id === o.id);
      if (i === -1) return [o, ...prev];
      const next = [...prev];
      next[i] = o;
      return next;
    });
    toast.success("Offer saved");
    setOpen(false);
    setEditing(null);
  };

  const remove = (id: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
    toast.success("Deleted");
  };

  return (
    <PageShell
      title="Offer Tracker"
      subtitle={`${offers.length} offers`}
      actions={
        <Button
          size="sm"
          className="gap-1"
          onClick={() => {
            setEditing(empty());
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add offer
        </Button>
      }
    >
      {offers.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <Trophy className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No offers yet — keep grinding.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((o) => {
            const total = o.base + o.bonus + o.stock;
            const isBest = best?.id === o.id && offers.length > 1;
            return (
              <Card
                key={o.id}
                className={isBest ? "border-primary/60 bg-gradient-to-br from-primary/10 to-transparent" : ""}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{o.companyName}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{o.role}</p>
                    </div>
                    {isBest && (
                      <Badge className="gap-1 bg-primary text-primary-foreground">
                        <Star className="h-3 w-3" /> Best
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Total package</p>
                    <p className="num text-2xl font-semibold">{formatINR(total)}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <Metric label="Base" value={formatINR(o.base)} />
                    <Metric label="Bonus" value={formatINR(o.bonus)} />
                    <Metric label="Stock" value={formatINR(o.stock)} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                    <span>{o.location || "—"}</span>
                    <span>Join {new Date(o.joiningDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{o.status}</Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing(o);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(o.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        {editing && (
          <OfferForm key={editing.id} initial={editing} onSave={save} onCancel={() => setOpen(false)} />
        )}
      </Dialog>
    </PageShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary/40 p-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="num text-sm font-medium">{value}</p>
    </div>
  );
}

function OfferForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Offer;
  onSave: (o: Offer) => void;
  onCancel: () => void;
}) {
  const [o, setO] = useState<Offer>(initial);
  const set = <K extends keyof Offer>(k: K, v: Offer[K]) => setO((p) => ({ ...p, [k]: v }));

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{initial.companyName ? "Edit offer" : "New offer"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <F label="Company">
            <Input value={o.companyName} onChange={(e) => set("companyName", e.target.value)} />
          </F>
          <F label="Role">
            <Input value={o.role} onChange={(e) => set("role", e.target.value)} />
          </F>
          <F label="Base (₹/year)">
            <Input type="number" value={o.base} onChange={(e) => set("base", Number(e.target.value))} />
          </F>
          <F label="Bonus">
            <Input type="number" value={o.bonus} onChange={(e) => set("bonus", Number(e.target.value))} />
          </F>
          <F label="Stock">
            <Input type="number" value={o.stock} onChange={(e) => set("stock", Number(e.target.value))} />
          </F>
          <F label="Location">
            <Input value={o.location} onChange={(e) => set("location", e.target.value)} />
          </F>
          <F label="Joining date">
            <Input
              type="date"
              value={o.joiningDate.slice(0, 10)}
              onChange={(e) => set("joiningDate", new Date(e.target.value).toISOString())}
            />
          </F>
          <F label="Status">
            <Select value={o.status} onValueChange={(v) => set("status", v as Offer["status"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </F>
        </div>
        <F label="Notes">
          <Textarea rows={3} value={o.notes || ""} onChange={(e) => set("notes", e.target.value)} />
        </F>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(o)}>Save</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

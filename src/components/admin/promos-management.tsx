"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  XCircle,
  Calendar,
  Tag,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Provider {
  id: string;
  name: string;
  slug: string;
}

interface Promo {
  id: string;
  title: string;
  subtitle: string | null;
  code: string | null;
  ctaLabel: string;
  ctaUrl: string;
  emoji: string | null;
  bgGradient: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  priority: number;
  providerId: string | null;
}

interface Props {
  promos: Promo[];
  providers: Provider[];
}

const GRADIENT_OPTIONS = [
  { value: "from-[#1a365d] via-[#2a4a7f] to-[#38a169]", label: "Brand (default)" },
  { value: "from-orange-500 via-red-500 to-pink-500", label: "Sunset 🌅" },
  { value: "from-purple-600 via-pink-500 to-orange-400", label: "Sunrise" },
  { value: "from-emerald-500 via-teal-500 to-cyan-500", label: "Forest" },
  { value: "from-blue-600 via-indigo-600 to-purple-600", label: "Ocean" },
  { value: "from-amber-500 via-orange-500 to-red-600", label: "Hot deal 🔥" },
  { value: "from-pink-500 via-rose-500 to-red-500", label: "Romance" },
  { value: "from-slate-800 via-slate-700 to-slate-900", label: "Premium" },
];

function emptyForm(): Partial<Promo> {
  const now = new Date();
  const inAWeek = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
  return {
    title: "",
    subtitle: "",
    code: "",
    ctaLabel: "Shop now",
    ctaUrl: "",
    emoji: "🎉",
    bgGradient: GRADIENT_OPTIONS[0].value,
    startsAt: now.toISOString().slice(0, 16),
    endsAt: inAWeek.toISOString().slice(0, 16),
    isActive: true,
    priority: 0,
    providerId: null,
  };
}

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function PromosManagement({ promos, providers }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<Partial<Promo> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const now = Date.now();
  const live = promos.filter(
    (p) =>
      p.isActive &&
      new Date(p.startsAt).getTime() <= now &&
      new Date(p.endsAt).getTime() >= now
  );

  async function save() {
    if (!editing) return;
    setSubmitting(true);
    try {
      const isUpdate = Boolean(editing.id);
      const res = await fetch("/api/admin/promos", {
        method: isUpdate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editing,
          startsAt: editing.startsAt
            ? new Date(editing.startsAt).toISOString()
            : undefined,
          endsAt: editing.endsAt
            ? new Date(editing.endsAt).toISOString()
            : undefined,
          providerId: editing.providerId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(isUpdate ? "Promo updated" : "Promo created");
      setEditing(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
    setSubmitting(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this promo?")) return;
    try {
      const res = await fetch("/api/admin/promos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Promo deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function toggleActive(p: Promo) {
    try {
      const res = await fetch("/api/admin/promos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(p.isActive ? "Promo paused" : "Promo activated");
      router.refresh();
    } catch {
      toast.error("Failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promo Banners</h1>
          <p className="text-muted-foreground mt-1">
            Sitewide top banners. {live.length} live now · {promos.length} total
          </p>
        </div>
        <Button
          onClick={() => setEditing(emptyForm())}
          className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white"
        >
          <Plus className="size-4" />
          New promo
        </Button>
      </div>

      {/* Live banner preview hint */}
      {live.length > 0 && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">
                {live.length} promo{live.length === 1 ? "" : "s"} live on the site right now
              </p>
              <p className="text-muted-foreground mt-0.5">
                Visitors see them at the top of every page (rotating by priority,
                dismissible per user).
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      {editing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editing.id ? "Edit promo" : "New promo"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={editing.title || ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="May Day Bank Holiday Sale"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emoji">Emoji</Label>
                <Input
                  id="emoji"
                  value={editing.emoji || ""}
                  onChange={(e) => setEditing({ ...editing, emoji: e.target.value })}
                  placeholder="🎉"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                rows={2}
                value={editing.subtitle || ""}
                onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                placeholder="£25 off any phone — limited time only"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="code">Promo code</Label>
                <Input
                  id="code"
                  value={editing.code || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, code: e.target.value.toUpperCase() })
                  }
                  placeholder="MAYDAY25"
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ctaLabel">Button label</Label>
                <Input
                  id="ctaLabel"
                  value={editing.ctaLabel || ""}
                  onChange={(e) => setEditing({ ...editing, ctaLabel: e.target.value })}
                  placeholder="Shop now"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={editing.priority || 0}
                  onChange={(e) =>
                    setEditing({ ...editing, priority: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ctaUrl">CTA URL (Awin tracked) *</Label>
              <Input
                id="ctaUrl"
                value={editing.ctaUrl || ""}
                onChange={(e) => setEditing({ ...editing, ctaUrl: e.target.value })}
                placeholder="https://www.awin1.com/cread.php?awinmid=..."
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Tip: generate this in /admin/links so clicks are tracked per campaign.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startsAt">Starts at *</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={
                    editing.startsAt
                      ? toLocalDatetime(editing.startsAt as string)
                      : ""
                  }
                  onChange={(e) => setEditing({ ...editing, startsAt: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endsAt">Ends at *</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={
                    editing.endsAt
                      ? toLocalDatetime(editing.endsAt as string)
                      : ""
                  }
                  onChange={(e) => setEditing({ ...editing, endsAt: e.target.value })}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="provider">Linked merchant</Label>
                <Select
                  value={editing.providerId || "_none"}
                  onValueChange={(v) =>
                    setEditing({ ...editing, providerId: v === "_none" ? null : v })
                  }
                >
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Select merchant (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">No specific merchant</SelectItem>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gradient">Banner colour</Label>
                <Select
                  value={editing.bgGradient || GRADIENT_OPTIONS[0].value}
                  onValueChange={(v) => setEditing({ ...editing, bgGradient: v })}
                >
                  <SelectTrigger id="gradient">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADIENT_OPTIONS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={editing.isActive ?? true}
                onCheckedChange={(c) => setEditing({ ...editing, isActive: c })}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active
              </Label>
            </div>

            {/* Live preview */}
            {editing.title && (
              <div className="rounded-lg border-2 border-dashed border-border/60 p-4 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                <div
                  className={`bg-gradient-to-r ${editing.bgGradient || GRADIENT_OPTIONS[0].value} text-white rounded-md px-4 py-2.5 flex items-center gap-3`}
                >
                  <span className="text-lg">{editing.emoji || "🎉"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{editing.title}</p>
                    {editing.subtitle && (
                      <p className="text-xs text-white/80 truncate">{editing.subtitle}</p>
                    )}
                  </div>
                  {editing.code && (
                    <span className="text-xs font-mono font-bold rounded-full border border-white/30 bg-white/10 px-3 py-1">
                      {editing.code}
                    </span>
                  )}
                  <span className="text-xs font-bold rounded-full bg-white text-[#1a365d] px-3 py-1">
                    {editing.ctaLabel || "Shop now"} →
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button
                onClick={save}
                disabled={submitting || !editing.title || !editing.ctaUrl}
                className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : editing.id ? (
                  "Update promo"
                ) : (
                  "Create promo"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All promos ({promos.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {promos.map((p) => {
              const startMs = new Date(p.startsAt).getTime();
              const endMs = new Date(p.endsAt).getTime();
              const isLive = p.isActive && startMs <= now && endMs >= now;
              const isUpcoming = p.isActive && startMs > now;
              const isExpired = endMs < now;

              return (
                <div key={p.id} className="flex items-start gap-3 p-4">
                  <div className="mt-0.5 shrink-0 text-2xl">{p.emoji || "🎉"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{p.title}</span>
                      {isLive && (
                        <Badge className="bg-emerald-500 text-white text-[10px]">
                          LIVE
                        </Badge>
                      )}
                      {isUpcoming && (
                        <Badge variant="outline" className="text-[10px]">
                          Upcoming
                        </Badge>
                      )}
                      {isExpired && (
                        <Badge variant="secondary" className="text-[10px]">
                          Expired
                        </Badge>
                      )}
                      {!p.isActive && (
                        <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-600">
                          Paused
                        </Badge>
                      )}
                      {p.code && (
                        <Badge variant="outline" className="text-[10px] font-mono">
                          <Tag className="size-2.5 mr-0.5" />
                          {p.code}
                        </Badge>
                      )}
                    </div>
                    {p.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1">{p.subtitle}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(p.startsAt).toLocaleString("en-GB", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}{" "}
                      →{" "}
                      {new Date(p.endsAt).toLocaleString("en-GB", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(p)}
                      title={p.isActive ? "Pause" : "Activate"}
                      className="size-8"
                    >
                      {p.isActive ? (
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      ) : (
                        <XCircle className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditing(p)}
                      title="Edit"
                      className="size-8"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(p.id)}
                      title="Delete"
                      className="size-8 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {promos.length === 0 && (
              <div className="p-8 text-center">
                <Tag className="size-8 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No promos yet. Click &ldquo;New promo&rdquo; to add your first one.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

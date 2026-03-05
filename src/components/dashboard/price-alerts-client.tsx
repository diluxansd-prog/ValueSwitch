"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Trash2,
  Loader2,
  Zap,
  Wifi,
  Smartphone,
  Shield,
  PiggyBank,
  Building2,
  MapPin,
  Calendar,
  PoundSterling,
  Plus,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface PriceAlert {
  id: string;
  category: string;
  subcategory: string | null;
  postcode: string | null;
  targetPrice: number | null;
  isActive: boolean;
  lastTriggered: string | null;
  createdAt: string;
}

const categoryIcons: Record<string, typeof Zap> = {
  energy: Zap,
  broadband: Wifi,
  mobile: Smartphone,
  insurance: Shield,
  finance: PiggyBank,
  business: Building2,
};

const categoryColors: Record<string, string> = {
  energy: "bg-yellow-100 text-yellow-700",
  broadband: "bg-blue-100 text-blue-700",
  mobile: "bg-purple-100 text-purple-700",
  insurance: "bg-green-100 text-green-700",
  finance: "bg-emerald-100 text-emerald-700",
  business: "bg-slate-100 text-slate-700",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PriceAlertsClient({ alerts }: { alerts: PriceAlert[] }) {
  const router = useRouter();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleToggle(id: string, isActive: boolean) {
    setTogglingId(id);
    try {
      await fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      router.refresh();
    } catch {
      toast.error("Failed to update alert. Please try again.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/alerts/${id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      toast.error("Failed to delete alert. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const activeCount = alerts.filter((a) => a.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Price Alerts
          </h1>
          <p className="mt-1 text-muted-foreground">
            {alerts.length > 0
              ? `${activeCount} active alert${activeCount !== 1 ? "s" : ""} monitoring prices for you.`
              : "Get notified when prices drop on the deals you care about."}
          </p>
        </div>
      </div>

      {alerts.length > 0 ? (
        <div className="grid gap-4">
          {alerts.map((alert) => {
            const Icon =
              categoryIcons[alert.category.toLowerCase()] || Bell;
            const colorClass =
              categoryColors[alert.category.toLowerCase()] ||
              "bg-gray-100 text-gray-700";
            const isToggling = togglingId === alert.id;
            const isDeleting = deletingId === alert.id;

            return (
              <Card
                key={alert.id}
                className={`transition-all ${!alert.isActive ? "opacity-60" : ""}`}
              >
                <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                  <div
                    className={`flex items-center justify-center size-12 rounded-lg shrink-0 ${colorClass}`}
                  >
                    <Icon className="size-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold capitalize">
                      {alert.category}
                      {alert.subcategory && (
                        <span className="text-muted-foreground font-normal">
                          {" "}
                          / {alert.subcategory}
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {alert.targetPrice && (
                        <Badge
                          variant="secondary"
                          className="text-xs flex items-center gap-1"
                        >
                          <PoundSterling className="size-3" />
                          Target: {"\u00A3"}{alert.targetPrice.toFixed(2)}/mo
                        </Badge>
                      )}
                      <Badge
                        variant={alert.isActive ? "default" : "outline"}
                        className={`text-xs ${alert.isActive ? "bg-[#38a169] hover:bg-[#2f855a]" : ""}`}
                      >
                        {alert.isActive ? (
                          <>
                            <CheckCircle2 className="size-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <BellOff className="size-3 mr-1" />
                            Paused
                          </>
                        )}
                      </Badge>
                      {alert.postcode && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          {alert.postcode}
                        </span>
                      )}
                      {alert.lastTriggered && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          Last triggered: {formatDate(alert.lastTriggered)}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        Created {formatDate(alert.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Switch
                      checked={alert.isActive}
                      onCheckedChange={() =>
                        handleToggle(alert.id, alert.isActive)
                      }
                      disabled={isToggling}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(alert.id)}
                      disabled={isDeleting}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      {isDeleting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex items-center justify-center size-16 rounded-full bg-muted mb-4">
              <Bell className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No price alerts</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Set up price alerts to be notified when deals match your target
              price. Start by running a comparison and creating an alert.
            </p>
            <Button
              asChild
              className="mt-6 bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0"
            >
              <a href="/energy">
                <Plus className="size-4" />
                Create your first alert
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

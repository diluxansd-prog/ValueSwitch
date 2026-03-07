"use client";

import { Users, Building2, FileText, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AdminOverviewProps {
  stats: {
    users: number;
    providers: number;
    plans: number;
    guides: number;
  };
  recentUsers: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }[];
  categoryStats: {
    category: string;
    count: number;
  }[];
}

export function AdminOverviewClient({
  stats,
  recentUsers,
  categoryStats,
}: AdminOverviewProps) {
  const statCards = [
    {
      label: "Total Users",
      value: stats.users,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Providers",
      value: stats.providers,
      icon: Building2,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Plans & Deals",
      value: stats.plans,
      icon: FileText,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Guides",
      value: stats.guides,
      icon: BookOpen,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your ValueSwitch platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={`size-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={user.role === "admin" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {user.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No users yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plans by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryStats.map((cat) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="text-sm font-medium capitalize">
                    {cat.category}
                  </span>
                  <Badge variant="outline">{cat.count} plans</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

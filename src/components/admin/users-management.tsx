"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Shield, ShieldOff, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  postcode: string;
  createdAt: string;
  savedSearches: number;
  comparisons: number;
  alerts: number;
  reviews: number;
}

export function UsersManagement({ users }: { users: UserData[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function toggleRole(userId: string, currentRole: string) {
    setLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role: currentRole === "admin" ? "user" : "admin",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }
      toast.success(
        `User ${currentRole === "admin" ? "demoted to user" : "promoted to admin"}`
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">
            {users.length} registered user{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="size-5 text-muted-foreground" />
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    User
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                    Role
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                    Activity
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">
                    Joined
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge
                        variant={user.role === "admin" ? "destructive" : "secondary"}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>{user.comparisons} comp</span>
                        <span>{user.savedSearches} saved</span>
                        <span>{user.alerts} alerts</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant={user.role === "admin" ? "outline" : "default"}
                        onClick={() => toggleRole(user.id, user.role)}
                        disabled={loading === user.id}
                        className="text-xs"
                      >
                        {user.role === "admin" ? (
                          <>
                            <ShieldOff className="size-3" />
                            Demote
                          </>
                        ) : (
                          <>
                            <Shield className="size-3" />
                            Make Admin
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No users found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

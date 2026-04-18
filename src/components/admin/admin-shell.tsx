"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  BookOpen,
  Zap,
  Menu,
  ChevronRight,
  LogOut,
  Shield,
  ArrowLeft,
  Mail,
  Newspaper,
  Link2,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface AdminUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Providers", href: "/admin/providers", icon: Building2 },
  { label: "Plans & Deals", href: "/admin/plans", icon: FileText },
  { label: "Guides", href: "/admin/guides", icon: BookOpen },
  { label: "Messages", href: "/admin/messages", icon: Mail },
  { label: "Newsletter", href: "/admin/newsletter", icon: Newspaper },
  { label: "Link Generator", href: "/admin/links", icon: Link2 },
];

function getInitials(name?: string | null): string {
  if (!name) return "A";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function SidebarContent({
  user,
  pathname,
  onLinkClick,
}: {
  user: AdminUser;
  pathname: string;
  onLinkClick?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5">
        <Link
          href="/admin"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          onClick={onLinkClick}
        >
          <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-red-600 to-orange-500">
            <Shield className="size-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-foreground">
              Admin Panel
            </span>
          </div>
        </Link>
      </div>

      <Separator />

      {/* User info */}
      <div className="flex items-center gap-3 px-6 py-4">
        <Avatar className="size-10 border-2 border-red-500/20">
          <AvatarImage src={user.image || undefined} alt={user.name || "Admin"} />
          <AvatarFallback className="bg-gradient-to-br from-red-600 to-orange-500 text-white text-sm font-medium">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">
            {user.name || "Admin"}
          </p>
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
            Admin
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/10"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "size-5 shrink-0",
                  isActive ? "text-red-500" : ""
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="size-4 text-red-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-1">
        <Separator className="mb-4" />
        <Link
          href="/"
          onClick={onLinkClick}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-5 shrink-0" />
          Back to Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-5 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AdminShell({
  user,
  children,
}: {
  user: AdminUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage =
    navItems.find((item) =>
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.href)
    )?.label || "Admin";

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-background">
        <SidebarContent user={user} pathname={pathname} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[min(288px,85vw)] p-0" showCloseButton={true}>
          <SheetHeader className="sr-only">
            <SheetTitle>Admin Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent
            user={user}
            pathname={pathname}
            onLinkClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-72">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-7 rounded-md bg-gradient-to-br from-red-600 to-orange-500">
              <Shield className="size-4 text-white" />
            </div>
            <span className="font-semibold text-sm">{currentPage}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

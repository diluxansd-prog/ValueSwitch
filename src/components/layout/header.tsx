"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  Zap,
  User,
  ArrowRightLeft,
  Search,
  LayoutDashboard,
  Shield,
  LogOut,
  UserCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { mainNavItems } from "@/config/navigation";
import { categories } from "@/config/categories";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md transition-all duration-300",
        isScrolled
          ? "shadow-md border-border/60"
          : "shadow-none border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-[#1a365d] to-[#38a169]">
            <Zap className="size-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#1a365d] to-[#38a169] bg-clip-text text-transparent">
            ValueSwitch
          </span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {mainNavItems.map((item) => {
              const category = categories.find(
                (c) => c.slug === item.href.replace("/", "")
              );
              const Icon = category?.icon;

              return (
                <NavigationMenuItem key={item.href}>
                  {item.children && item.children.length > 0 ? (
                    <>
                      <NavigationMenuTrigger className="text-sm font-medium text-foreground/80 hover:text-foreground">
                        {Icon && (
                          <Icon
                            className={cn("size-4 mr-1", category?.color)}
                          />
                        )}
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[min(400px,90vw)] gap-1 p-2 md:w-[500px] md:grid-cols-2">
                          <li className="col-span-full">
                            <NavigationMenuLink asChild>
                              <Link
                                href={item.href}
                                className="flex items-center gap-3 rounded-md p-3 hover:bg-accent transition-colors"
                              >
                                {Icon && (
                                  <div
                                    className={cn(
                                      "flex items-center justify-center size-10 rounded-lg bg-gradient-to-br text-white shrink-0",
                                      category?.gradient
                                        ? `from-${category.gradient.split(" ")[0].replace("from-", "")} to-${category.gradient.split(" ")[1]?.replace("to-", "")}`
                                        : ""
                                    )}
                                    style={{
                                      background: category?.gradient
                                        ? undefined
                                        : "#1a365d",
                                    }}
                                  >
                                    <Icon className="size-5" />
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-semibold">
                                    All {item.label}
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {item.description}
                                  </p>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={child.href}
                                  className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-sm font-medium leading-none">
                                    {child.label}
                                  </div>
                                  {child.description && (
                                    <p className="mt-1.5 text-xs leading-snug text-muted-foreground line-clamp-2">
                                      {child.description}
                                    </p>
                                  )}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        className="text-sm font-medium text-foreground/80 hover:text-foreground px-4 py-2"
                      >
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
            <Link href="/search" aria-label="Search">
              <Search className="size-4" />
            </Link>
          </Button>
          <ThemeToggle />
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex gap-2 pl-2 pr-2.5"
                >
                  <Avatar className="size-6">
                    <AvatarImage
                      src={session.user.image || undefined}
                      alt={session.user.name || "User"}
                    />
                    <AvatarFallback className="text-[10px] bg-gradient-to-br from-[#1a365d] to-[#38a169] text-white">
                      {session.user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline max-w-[100px] truncate">
                    {session.user.name?.split(" ")[0] || "Account"}
                  </span>
                  <ChevronDown className="size-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold leading-none">
                      {session.user.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="size-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <UserCircle className="size-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {(session.user as Record<string, unknown>).role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Shield className="size-4 mr-2 text-red-500" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/login">
                <User className="size-4" />
                <span>Login</span>
              </Link>
            </Button>
          )}
          <Button
            size="sm"
            asChild
            className="hidden sm:inline-flex bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0"
          >
            <Link href="/mobile">
              <ArrowRightLeft className="size-4" />
              <span className="hidden md:inline">Compare</span>
            </Link>
          </Button>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Sheet */}
      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} session={session} />
    </header>
  );
}

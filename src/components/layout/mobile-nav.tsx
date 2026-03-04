"use client";

import Link from "next/link";
import { Zap, User, UserPlus, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { mainNavItems } from "@/config/navigation";
import { categories } from "@/config/categories";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const handleClose = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[320px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-4 pb-2">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-[#1a365d] to-[#38a169]">
              <Zap className="size-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-[#1a365d] to-[#38a169] bg-clip-text text-transparent">
              ValueSwitch
            </span>
          </SheetTitle>
        </SheetHeader>

        <Separator />

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {/* Compare button (prominent) */}
          <div className="mb-3">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0"
              onClick={handleClose}
            >
              <Link href="/energy">
                <ArrowRightLeft className="size-4" />
                Start Comparing
              </Link>
            </Button>
          </div>

          <Separator className="mb-2" />

          {/* Category Accordion */}
          <Accordion type="multiple" className="w-full">
            {mainNavItems.map((item) => {
              const category = categories.find(
                (c) => c.slug === item.href.replace("/", "")
              );
              const Icon = category?.icon;

              return (
                <AccordionItem key={item.href} value={item.href}>
                  <AccordionTrigger className="py-3 text-sm hover:no-underline">
                    <div className="flex items-center gap-2.5">
                      {Icon && (
                        <Icon className={cn("size-4", category?.color)} />
                      )}
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-0.5 pl-6">
                      <Link
                        href={item.href}
                        onClick={handleClose}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                      >
                        All {item.label}
                      </Link>
                      {item.children?.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={handleClose}
                          className="flex flex-col gap-0.5 rounded-md px-3 py-2 hover:bg-accent transition-colors"
                        >
                          <span className="text-sm font-medium">
                            {child.label}
                          </span>
                          {child.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {child.description}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Footer - Login/Register */}
        <div className="mt-auto border-t p-4 space-y-2">
          <Button
            variant="outline"
            asChild
            className="w-full justify-start"
            onClick={handleClose}
          >
            <Link href="/login">
              <User className="size-4" />
              Login
            </Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="w-full justify-start text-muted-foreground"
            onClick={handleClose}
          >
            <Link href="/register">
              <UserPlus className="size-4" />
              Create Account
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

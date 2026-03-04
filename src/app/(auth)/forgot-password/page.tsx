"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await requestPasswordReset(email);
      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      setIsSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <Card className="border-border/50 shadow-xl shadow-black/5">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex items-center justify-center size-12 rounded-full bg-[#38a169]/10">
            <CheckCircle2 className="size-6 text-[#38a169]" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Check your email
          </CardTitle>
          <CardDescription className="text-sm">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{email}</span>, we
            have sent a password reset link.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 border border-border/50 px-4 py-3 text-sm text-muted-foreground">
            The link will expire in 1 hour. Please check your spam folder if you
            don&apos;t see the email.
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSubmitted(false);
              setEmail("");
            }}
          >
            Try a different email
          </Button>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-[#1a365d] hover:text-[#2a4a7f] transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-xl shadow-black/5">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Reset your password
        </CardTitle>
        <CardDescription>
          Enter the email address associated with your account and we&apos;ll
          send you a link to reset your password.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-[#1a365d] hover:text-[#2a4a7f] transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

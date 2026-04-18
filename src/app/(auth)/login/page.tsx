"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Mail, Lock } from "lucide-react";
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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 20-second safety timeout so the user never sees an infinite spinner
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 20_000)
      );
      const signInPromise = signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      const result = await Promise.race([signInPromise, timeout]);

      if (!result) {
        setError("Sign in failed. Please try again.");
        setIsLoading(false);
        return;
      }

      if (result.error) {
        // "CredentialsSignin" = bad email/password; anything else = server error
        const isBadCreds = result.error === "CredentialsSignin";
        setError(
          isBadCreds
            ? "Invalid email or password."
            : `Sign in error: ${result.error}`
        );
        setIsLoading(false);
        return;
      }

      // Success — session cookie is set, navigate to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(
        msg === "timeout"
          ? "Sign in took too long. Please try again."
          : `Something went wrong: ${msg}`
      );
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border/50 shadow-xl shadow-black/5">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription>
          Sign in to your account to continue saving
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {justRegistered && !error && (
            <div className="rounded-lg bg-[#38a169]/10 border border-[#38a169]/20 px-4 py-3 text-sm text-[#2f855a] dark:text-[#48bb78]">
              Account created! Please sign in to continue.
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[#38a169] hover:text-[#2f855a] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
                autoComplete="current-password"
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
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-[#1a365d] hover:text-[#2a4a7f] transition-colors underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Card className="border-border/50 shadow-xl shadow-black/5">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Welcome back
            </CardTitle>
          </CardHeader>
        </Card>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

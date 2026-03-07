"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import crypto from "crypto";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  postcode?: string;
}) {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return { error: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        hashedPassword,
        postcode: data.postcode || null,
      },
    });

    return { success: true, userId: user.id };
  } catch {
    return { error: "Failed to create account. Please try again." };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      redirectTo: "/dashboard",
    });
    return { success: true, redirect: result };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    // NextAuth v5 may throw NEXT_REDIRECT on success — that's OK
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as Record<string, unknown>).digest === "string" &&
      ((error as Record<string, unknown>).digest as string).includes("NEXT_REDIRECT")
    ) {
      return { success: true };
    }
    throw error;
  }
}

export async function requestPasswordReset(email: string) {
  try {
    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Generate a reset token
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 3600000); // 1 hour

      // Store token in VerificationToken table
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });

      // In production, send email with reset link:
      // const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${email}`;
      // await sendEmail({ to: email, subject: "Reset your password", html: `<a href="${resetUrl}">Reset password</a>` });

      console.log(`[Password Reset] Token generated for ${email}: ${token}`);
    }

    return { success: true };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

export async function resetPassword(token: string, email: string, newPassword: string) {
  try {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token,
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      return { error: "Invalid or expired reset link. Please request a new one." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: { hashedPassword },
    });

    // Delete used token
    await prisma.verificationToken.deleteMany({
      where: { identifier: email, token },
    });

    return { success: true };
  } catch {
    return { error: "Failed to reset password. Please try again." };
  }
}

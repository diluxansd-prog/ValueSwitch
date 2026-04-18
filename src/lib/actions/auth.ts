"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  postcode?: string;
}) {
  try {
    // Basic validation
    if (!data.email || !data.password || !data.name) {
      return { error: "Name, email and password are required." };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return { error: "Please enter a valid email address." };
    }
    if (data.password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }

    const email = data.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { error: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        hashedPassword,
        postcode: data.postcode?.trim() || null,
      },
    });

    return { success: true, userId: user.id };
  } catch (err) {
    console.error("[registerUser] error:", err);
    // Surface the actual error message in dev to aid debugging
    const message =
      err instanceof Error
        ? err.message
        : "Failed to create account. Please try again.";
    return { error: message };
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

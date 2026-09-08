import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signPasswordResetToken } from "@/lib/auth";

const ForgotPasswordSchema = z.object({
  email: z.string().email("A valid email address is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const validated = ForgotPasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const email = validated.data.email.trim().toLowerCase();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, isActive: true },
    });

    if (user && user.isActive) {
      // Generate a signed token valid for 1 hour
      const resetToken = signPasswordResetToken(user.email, user.id);
      
      // In production, integrate with email provider (e.g. Resend, SendGrid, SMTP).
      // For now, log the recovery dispatch
      console.log(`[Password Reset] Generated reset token for ${user.email}: ${resetToken.substring(0, 16)}...`);
    }

    // Always return a positive message to prevent user enumeration attacks
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email address, password recovery instructions have been sent.",
    });
  } catch (error: any) {
    console.error("[Forgot Password Error]", error);
    return NextResponse.json(
      { error: "Unable to process password reset request. Please try again later." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import bcrypt from "bcryptjs";

// API for verifying reset code
export async function PUT(request: Request) {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const { code, email } = await request.json();

    if (!code || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Code and email are required",
        },
        { status: 400, headers }
      );
    }

    // Find user and validate code
    const user = await prisma.user.findFirst({
      where: {
        email,
        resetToken: code,
        resetTokenExp: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired code" },
        { status: 400, headers }
      );
    }

    // Code is valid, return success
    return NextResponse.json(
      {
        success: true,
        message: "Code verified successfully",
      },
      { headers }
    );
  } catch (error) {
    console.error("Code verification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers }
    );
  }
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const { code, email, password } = await request.json();

    // Validate input
    if (!code || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Code, email, and new password are required",
        },
        { status: 400, headers }
      );
    }

    // Find user and validate code
    const user = await prisma.user.findFirst({
      where: {
        email,
        resetToken: code,
        resetTokenExp: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired code" },
        { status: 400, headers }
      );
    }

    // Check if new password is the same as existing password
    const isSamePassword = await bcrypt.compare(password, user.password);
    console.log("Password comparison:", {
      inputPassword: password,
      hashedPassword: user.password,
      isSame: isSamePassword
    });

    if (isSamePassword) {
      return NextResponse.json(
        {
          success: false,
          error:
            "New password cannot be the same as your current password. Please choose a different password.",
        },
        { status: 400, headers }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password has been reset successfully",
      },
      { headers }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers }
    );
  }
}

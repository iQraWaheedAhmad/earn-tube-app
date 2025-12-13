import { NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

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
    const { email, password } = await request.json();

    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();

    // Prefer admin user from DB (seeded), fallback to env credentials
    const envEmail = process.env.ADMIN_EMAIL?.trim();
    const envPassword = process.env.ADMIN_PASSWORD?.trim();

    const adminUser = trimmedEmail
      ? await prisma.user.findUnique({ where: { email: trimmedEmail } })
      : null;

    let isValid = false;

    if (adminUser && trimmedPassword) {
      isValid = await bcrypt.compare(trimmedPassword, adminUser.password);
    }

    if (
      !isValid &&
      envEmail &&
      envPassword &&
      trimmedEmail &&
      trimmedPassword
    ) {
      isValid = trimmedEmail === envEmail && trimmedPassword === envPassword;
    }

    if (!isValid) {
      console.error("Admin login failed - credentials mismatch");
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid admin credentials. Please check your email and password.",
        },
        { status: 401, headers }
      );
    }

    const token = sign({ role: "admin" }, jwtSecret, { expiresIn: "1d" });

    return NextResponse.json(
      { success: true, token, role: "admin" },
      { headers }
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers }
    );
  }
}

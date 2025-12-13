import { NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
    const { email, password } = await request.json();

    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();

    // Prefer admin user from DB (seeded), fallback to env credentials
    const envEmail = process.env.ADMIN_EMAIL?.trim();
    const envPassword = process.env.ADMIN_PASSWORD?.trim();
    const inputEmailNorm = trimmedEmail?.toLowerCase();
    const envEmailNorm = envEmail?.toLowerCase();

    // DB lookup is optional — on local/dev you might not have DATABASE_URL configured.
    // If Prisma throws, we still want to allow env-based admin login.
    let adminUser: { password: string } | null = null;
    if (trimmedEmail) {
      try {
        adminUser = await prisma.user.findUnique({
          where: { email: trimmedEmail },
          select: { password: true },
        });
      } catch (dbErr) {
        console.error(
          "Admin login DB lookup failed (falling back to env):",
          dbErr
        );
        adminUser = null;
      }
    }

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
      // Email is case-insensitive; password is exact.
      isValid =
        inputEmailNorm === envEmailNorm && trimmedPassword === envPassword;
    }

    if (!isValid) {
      console.error("Admin login mismatch diagnostics:", {
        hasEnvCreds: Boolean(envEmail && envPassword),
        envEmailPresent: Boolean(envEmail),
        inputEmailPresent: Boolean(trimmedEmail),
        envEmailMatches: Boolean(
          envEmailNorm && inputEmailNorm && envEmailNorm === inputEmailNorm
        ),
        triedDb: Boolean(trimmedEmail),
        dbUserFound: Boolean(adminUser),
      });
      console.error("Admin login failed - credentials mismatch");
      return NextResponse.json(
        {
          success: false,
          error:
            envEmail && envPassword
              ? "Invalid admin credentials. Please check your email and password."
              : "Admin credentials are not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD (or configure DATABASE_URL with a seeded admin user).",
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

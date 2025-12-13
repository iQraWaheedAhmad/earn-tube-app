import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

// Enable Prisma logging with type assertion
prisma.$on("query" as never, (e: { query: string; duration: number }) => {
  console.log("Query: " + e.query);
  console.log("Duration: " + e.duration + "ms");
});

export const dynamic = "force-dynamic"; // Ensure the route is dynamic

export async function POST(request: Request) {
  // Set CORS headers
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle OPTIONS request for CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }
  console.log("=== REGISTRATION REQUEST STARTED ===");

  try {
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    const { email, password, name, ref } = body;
    console.log("=== REGISTRATION REQUEST BODY ===", { email, name, ref });

    // Validate input
    if (!email || !password) {
      const errorMsg = !email ? "Email is required" : "Password is required";
      console.error("Validation error:", errorMsg);
      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
        },
        { status: 400, headers }
      );
    }

    let referrerId = null;

    // Handle referral code
    if (ref) {
      console.log("=== REFERRAL CODE DETECTED ===", ref);
      // Find user by exact referral code match
      const referrer = await prisma.user.findFirst({
        where: {
          referralCode: ref.toUpperCase(),
        },
      });

      if (referrer) {
        referrerId = referrer.id;
        console.log("=== REFERRER FOUND ===", {
          referrerId: referrer.id,
          referrerEmail: referrer.email,
          referrerName: referrer.name,
        });
      } else {
        console.log("=== INVALID REFERRAL CODE ===", ref);
        // Don't fail registration, just continue without referral
      }
    } else {
      console.log("=== NO REFERRAL CODE PROVIDED ===");
    }

    console.log("Checking for existing user with email:", email);
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error("Registration failed: Email already in use");
      return NextResponse.json(
        {
          success: false,
          error: "Email already in use",
        },
        { status: 400, headers }
      );
    }

    console.log("Hashing password...");
    // Hash password
    const hashedPassword = await hashPassword(password);
    console.log("Password hashed successfully");

    console.log("Creating user in database...");
    // Create user first
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        referredBy: referrerId,
      },
    });

    // Generate and update referral code (8-char alphanumeric from user ID)
    const referralCode = user.id.slice(-8).toUpperCase();
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { referralCode },
    });

    console.log("=== USER CREATED SUCCESSFULLY ===", {
      userId: user.id,
      email: user.email,
      referralCode,
      referredBy: referrerId,
    });

    // Return user data (excluding password)
    const { password: _, ...userData } = user;

    console.log("=== REGISTRATION COMPLETED SUCCESSFULLY ===");
    return NextResponse.json(
      {
        success: true,
        user: userData,
      },
      { headers }
    );
  } catch (error) {
    console.error("Registration error:", error);

    // More detailed error handling
    let errorMessage = "Internal server error";
    const statusCode = 500;

    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      // Handle Prisma specific errors
      if (error.name === "PrismaClientKnownRequestError") {
        if (error.message.includes("Unique constraint")) {
          return NextResponse.json(
            {
              success: false,
              error: "Email already in use",
              details:
                process.env.NODE_ENV === "development" ? error : undefined,
            },
            { status: 400 }
          );
        }
        errorMessage = "Database error occurred";
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: statusCode, headers }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";

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
  console.log("=== LOGIN REQUEST STARTED ===");

  try {
    const body = await request.json();
    console.log("Login request body:", JSON.stringify(body, null, 2));

    const { email, password } = body;

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

    console.log("Looking up user with email:", email);
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error("Login failed: No user found with email:", email);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    console.log("User found, verifying password...");
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      console.error("Login failed: Invalid password for user:", email);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    console.log("Password verified, generating token...");
    // Generate JWT token
    const token = generateToken(user.id);
    console.log("Token generated successfully");

    // Return user data (excluding password) and token
    const { password: _, ...userData } = user;

    console.log("=== LOGIN SUCCESSFUL ===", {
      userId: user.id,
      email: user.email,
    });
    return NextResponse.json(
      {
        success: true,
        user: userData,
        token,
      },
      { headers }
    );
  } catch (error) {
    console.error("Login error:", error);

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
        errorMessage = "Database error occurred";
        // For login, we don't need to handle unique constraints
        // as we're not creating any records here
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

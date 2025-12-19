import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";
import { existsSync, mkdirSync } from "fs";
import { processReferralReward } from "@/lib/referrals";

export const dynamic = "force-dynamic";

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

  console.log("=== DEPOSIT REQUEST STARTED ===");

  try {
    // Get Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization token required" },
        { status: 401, headers }
      );
    }

    const token = authHeader.substring(7);

    // Verify token and get userId
    let decodedToken;
    try {
      decodedToken = verifyToken(token);
      if (typeof decodedToken === "string") {
        return NextResponse.json(
          { success: false, error: "Invalid token format" },
          { status: 401, headers }
        );
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401, headers }
      );
    }

    const userId = decodedToken.userId;

    // Fetch userNo (numeric id) for easier DB inspection/reporting
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { userNo: true },
    });

    // Parse form data
    const formData = await request.formData();
    console.log("Received form data with keys:", Array.from(formData.keys()));

    const coin = formData.get("coin") as string;
    const amount = formData.get("amount") as string;
    const transactionHash = formData.get("transactionHash") as string;
    const paymentProof = formData.get("paymentProof") as File;

    // Validate required fields
    if (!coin || !amount || !transactionHash) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400, headers }
      );
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400, headers }
      );
    }

    let paymentProofPath: string | null = null;
    const isVercel = Boolean(process.env.VERCEL);

    // Handle file upload if provided
    if (paymentProof) {
      try {
        // Validate file type
        if (!paymentProof.type.startsWith("image/")) {
          return NextResponse.json(
            { success: false, error: "Payment proof must be an image file" },
            { status: 400, headers }
          );
        }

        const bytes = await paymentProof.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // On Vercel serverless, the filesystem (project dir) is read-only.
        // Store a data URL directly (works with <img src="...">) to avoid disk writes.
        if (isVercel) {
          const MAX_BYTES = 1_500_000; // ~1.5MB to avoid huge DB rows / responses
          if (buffer.byteLength > MAX_BYTES) {
            return NextResponse.json(
              {
                success: false,
                error: "Payment proof image is too large. Please upload a smaller image.",
              },
              { status: 413, headers }
            );
          }

          const base64 = buffer.toString("base64");
          paymentProofPath = `data:${paymentProof.type};base64,${base64}`;
          console.log("Stored payment proof as data URL (Vercel). Size:", buffer.byteLength);
        } else {
          // Generate unique filename
          const timestamp = Date.now();
          const fileExtension = paymentProof.name.split(".").pop();
          const fileName = `deposit_${userId}_${timestamp}.${fileExtension}`;

          // Save file to public/uploads directory (local/dev)
          const uploadDir = path.join(process.cwd(), "public", "uploads");
          const filePath = path.join(uploadDir, fileName);

          // Ensure upload directory exists
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }

          await writeFile(filePath, buffer);

          // Store the full URL for payment proof
          const protocol = request.headers.get("x-forwarded-proto") || "http";
          const host = request.headers.get("host") || "localhost:3000";
          paymentProofPath = `${protocol}://${host}/api/uploads/${fileName}`;
          console.log("File saved successfully:", paymentProofPath);
        }
      } catch (fileError) {
        console.error("File upload error:", fileError);
        return NextResponse.json(
          { success: false, error: "Failed to upload payment proof" },
          { status: 500, headers }
        );
      }
    }

    // Create deposit record
    // Note: Prisma Client types may lag schema until you run `prisma generate`.
    // This keeps compile-time happy while still writing `userNo` to DB.
    const depositUnknown = await (
      prisma as unknown as {
        deposit: { create: (args: unknown) => Promise<unknown> };
      }
    ).deposit.create({
      data: {
        userId,
        userNo: userRecord?.userNo ?? null,
        coin,
        amount: amountNum,
        transactionHash,
        paymentProof: paymentProofPath,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const deposit = depositUnknown as {
      id: string;
      coin: string;
      amount: number;
      transactionHash: string;
      status: string;
      createdAt: Date;
      paymentProof: string | null;
      user: { id: string; name: string | null; email: string };
    };

    console.log("=== DEPOSIT CREATED SUCCESSFULLY ===", {
      depositId: deposit.id,
      userId,
      amount: amountNum,
      coin,
    });

    // Process referral reward if this is a referred user
    try {
      console.log("=== CHECKING FOR REFERRAL REWARD ===", {
        userId,
        amount: amountNum,
      });
      const referralResult = await processReferralReward(userId, amountNum);
      if (referralResult) {
        console.log("=== REFERRAL REWARD PROCESSED ===", referralResult);
      } else {
        console.log("=== NO REFERRAL REWARD TO PROCESS ===");
      }
    } catch (referralError) {
      console.error("=== REFERRAL REWARD PROCESSING FAILED ===", referralError);
      // Don't fail the deposit creation if referral processing fails
    }

    return NextResponse.json(
      {
        success: true,
        deposit: {
          id: deposit.id,
          coin: deposit.coin,
          amount: deposit.amount,
          transactionHash: deposit.transactionHash,
          status: deposit.status,
          createdAt: deposit.createdAt,
          paymentProof: deposit.paymentProof,
        },
      },
      { headers }
    );
  } catch (error) {
    console.error("Deposit creation error:", error);

    let errorMessage = "Internal server error";
    const statusCode = 500;

    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      if (error.name === "PrismaClientKnownRequestError") {
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

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

  console.log("=== DEPOSIT HISTORY REQUEST STARTED ===");

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
      if (typeof decodedToken === 'string') {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // PENDING, COMPLETED, REJECTED, or null for all

    console.log("Fetching deposit history for user:", userId, "with status filter:", status);

    // Build where clause
    const whereClause: { userId: string; status?: "PENDING" | "COMPLETED" | "REJECTED" } = { userId };
    if (status && status !== "all") {
      whereClause.status = status as "PENDING" | "COMPLETED" | "REJECTED";
    }

    // Fetch deposits
    const deposits = await prisma.deposit.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        coin: true,
        amount: true,
        transactionHash: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        paymentProof: true,
      },
    });

    // Calculate statistics
    const totalDeposits = await prisma.deposit.count({
      where: { userId },
    });

    const completedDeposits = await prisma.deposit.count({
      where: { 
        userId,
        status: "COMPLETED",
      },
    });

    const pendingDeposits = await prisma.deposit.count({
      where: { 
        userId,
        status: "PENDING",
      },
    });

    const rejectedDeposits = await prisma.deposit.count({
      where: { 
        userId,
        status: "REJECTED",
      },
    });

    // Calculate total amount
    const totalAmountResult = await prisma.deposit.aggregate({
      where: { userId },
      _sum: {
        amount: true,
      },
    });

    const totalAmount = totalAmountResult._sum.amount || 0;

    // Group deposits by status
    const pendingDepositsList = deposits.filter(d => d.status === "PENDING");
    const completedDepositsList = deposits.filter(d => d.status === "COMPLETED");
    const rejectedDepositsList = deposits.filter(d => d.status === "REJECTED");

    console.log("=== DEPOSIT HISTORY FETCHED SUCCESSFULLY ===", {
      userId,
      totalDeposits,
      totalAmount,
      completed: completedDeposits,
      pending: pendingDeposits,
      rejected: rejectedDeposits,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          statistics: {
            totalDeposits,
            completedDeposits,
            pendingDeposits,
            rejectedDeposits,
            totalAmount,
          },
          deposits,
          pending: pendingDepositsList,
          completed: completedDepositsList,
          rejected: rejectedDepositsList,
        },
      },
      { headers }
    );

  } catch (error) {
    console.error("Deposit history fetch error:", error);

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

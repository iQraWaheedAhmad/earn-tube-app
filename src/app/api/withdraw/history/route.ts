import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization token required" },
        { status: 401, headers }
      );
    }
    const token = authHeader.substring(7);
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
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401, headers }
      );
    }
    const userId = decodedToken.userId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // PENDING, COMPLETED, REJECTED, or null for all
    const whereClause = { userId };
    if (status && status !== "all") {
      whereClause["status"] = status;
    }
    const withdrawals = await prisma.withdrawal.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
    // Statistics
    const totalWithdrawals = await prisma.withdrawal.count({ where: { userId } });
    const completedWithdrawals = await prisma.withdrawal.count({ where: { userId, status: "COMPLETED" } });
    const pendingWithdrawals = await prisma.withdrawal.count({ where: { userId, status: "PENDING" } });
    const rejectedWithdrawals = await prisma.withdrawal.count({ where: { userId, status: "REJECTED" } });
    const totalAmountResult = await prisma.withdrawal.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    const totalAmount = totalAmountResult._sum.amount || 0;
    // Group by status
    const pending = withdrawals.filter(w => w.status === "PENDING");
    const completed = withdrawals.filter(w => w.status === "COMPLETED");
    const rejected = withdrawals.filter(w => w.status === "REJECTED");
    return NextResponse.json({
      success: true,
      data: {
        statistics: {
          totalWithdrawals,
          completedWithdrawals,
          pendingWithdrawals,
          rejectedWithdrawals,
          totalAmount,
        },
        withdrawals,
        pending,
        completed,
        rejected,
      },
    }, { headers });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

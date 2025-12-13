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
  headers.set("Cache-Control", "no-store, max-age=0");
  headers.set("Vary", "Authorization");

  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401, headers }
      );
    }

    const token = authHeader.substring(7);
    let decodedToken;
    try {
      decodedToken = verifyToken(token);
      if (typeof decodedToken === "string") {
        return NextResponse.json(
          { error: "Invalid token format" },
          { status: 401 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401, headers }
      );
    }

    const userId = decodedToken.userId;

    // Self-heal: keep `users.balance` consistent with what the system has recorded.
    // We do NOT overwrite balance; we only ever top-up when balance is behind.
    // Expected = (sum of paid task rounds) + (sum of completed referral rewards) - (sum of withdrawals)
    // Note: withdrawals decrement balance immediately when created, so we count ALL withdrawals.
    await prisma.$transaction(async (tx) => {
      const [u, referralAgg, taskAgg, withdrawalAgg] = await Promise.all([
        tx.user.findUnique({
          where: { id: userId },
          select: { balance: true },
        }),
        tx.referral.aggregate({
          where: { referrerId: userId, status: "COMPLETED" },
          _sum: { rewardAmount: true },
        }),
        tx.dailyTaskRound.aggregate({
          where: { userId, paidOut: true },
          _sum: { rewardAmount: true },
        }),
        tx.withdrawal.aggregate({
          where: { userId },
          _sum: { amount: true },
        }),
      ]);

      const currentBalance = u?.balance ?? 0;
      const referralEarned = referralAgg._sum.rewardAmount ?? 0;
      const taskEarned = taskAgg._sum.rewardAmount ?? 0;
      const withdrawn = withdrawalAgg._sum.amount ?? 0;

      const expected = referralEarned + taskEarned - withdrawn;
      const epsilon = 0.0001;

      if (expected > currentBalance + epsilon) {
        await tx.user.update({
          where: { id: userId },
          data: { balance: { increment: expected - currentBalance } },
        });
      }
    });

    // Find user (after potential self-heal)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userNo: true,
        email: true,
        name: true,
        image: true,
        balance: true,
        referralCode: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers }
      );
    }

    return NextResponse.json({ user }, { headers });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers }
    );
  }
}

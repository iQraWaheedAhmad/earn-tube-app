import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getReferralStats } from "@/lib/referrals";

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

    // ---- Balance sync from completed referrals (fixes "earnings show but balance is 0") ----
    // We treat COMPLETED referral rewards as the source of truth for referral earnings.
    // If, for any reason, those rewards weren't credited to `users.balance` (e.g. manual DB status change),
    // we top-up the balance to match: (sum of completed referral rewards) - (sum of all withdrawals amounts).
    // This is idempotent and only ever increments when balance is behind.
    try {
      const [user, referralAgg, withdrawalAgg] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { balance: true },
        }),
        prisma.referral.aggregate({
          where: { referrerId: userId, status: "COMPLETED" },
          _sum: { rewardAmount: true },
        }),
        prisma.withdrawal.aggregate({
          where: { userId },
          _sum: { amount: true },
        }),
      ]);

      const currentBalance = user?.balance ?? 0;
      const completedReferralEarnings = referralAgg._sum.rewardAmount ?? 0;
      const totalWithdrawals = withdrawalAgg._sum.amount ?? 0;
      const expectedBalanceFromReferrals =
        completedReferralEarnings - totalWithdrawals;

      // Only top-up if user is behind expected referral-derived balance.
      const epsilon = 0.0001;
      if (expectedBalanceFromReferrals > currentBalance + epsilon) {
        const incrementBy = expectedBalanceFromReferrals - currentBalance;
        await prisma.user.update({
          where: { id: userId },
          data: { balance: { increment: incrementBy } },
        });
      }
    } catch (syncErr) {
      // Don't fail stats endpoint if sync fails; just return stats.
      console.error("Referral balance sync failed:", syncErr);
    }

    // Get referral stats
    const stats = await getReferralStats(userId);

    // Get detailed referral history
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referredUser: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        stats,
        referrals,
      },
      { headers }
    );
  } catch (error) {
    console.error("Referral stats error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

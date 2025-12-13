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

    // Self-heal: if any referral rows were marked COMPLETED without payout,
    // credit them once and mark them paidOut so balance never "misses" referral rewards.
    await prisma.$transaction(async (tx) => {
      const unpaid = await tx.referral.findMany({
        where: { referrerId: userId, status: "COMPLETED", paidOut: false },
        select: { id: true, rewardAmount: true },
      });

      if (unpaid.length === 0) return;

      const total = unpaid.reduce((sum, r) => sum + (r.rewardAmount || 0), 0);
      const now = new Date();

      await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: total } },
      });

      await tx.referral.updateMany({
        where: { id: { in: unpaid.map((r) => r.id) } },
        data: { paidOut: true, paidOutAt: now, updatedAt: now },
      });
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

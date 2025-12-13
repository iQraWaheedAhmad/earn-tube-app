import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import {
  getDateKeyForTzOffset,
  getNextLocalMidnightUtc,
} from "@/lib/dailyTasks";
import { getProfitForDepositAmount } from "@/lib/planRewards";

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
    // Prisma Client types may lag behind schema changes until `prisma generate` runs.
    // This cast avoids dev-blocking type errors before you run migrations.
    const prismaWithRounds = prisma as unknown as {
      dailyTaskRound: {
        findUnique: (args: unknown) => Promise<unknown>;
      };
    };
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization token required" },
        { status: 401, headers }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (typeof decoded === "string") {
      return NextResponse.json(
        { success: false, error: "Invalid token format" },
        { status: 401, headers }
      );
    }

    const userId = decoded.userId;
    const now = new Date();

    // Use user's local midnight based on browser timezone offset (minutes).
    const tzOffsetMinutes =
      Number(request.headers.get("x-tz-offset-minutes") ?? "0") || 0;
    const dateKey = getDateKeyForTzOffset(now, tzOffsetMinutes);
    const nextAvailableAt = getNextLocalMidnightUtc(now, tzOffsetMinutes);

    // Determine user's plan from their latest COMPLETED deposit
    const latestCompletedDeposit = await prisma.deposit.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      select: { amount: true },
    });

    const rewardAmount =
      latestCompletedDeposit?.amount != null
        ? getProfitForDepositAmount(latestCompletedDeposit.amount) ?? 0
        : 0;

    const round = (await prismaWithRounds.dailyTaskRound.findUnique({
      where: { userId_dateKey: { userId, dateKey } },
      select: {
        id: true,
        totalSteps: true,
        currentStep: true,
        completedAt: true,
        rewardAmount: true,
        paidOut: true,
      },
    })) as {
      id: string;
      totalSteps: number;
      currentStep: number;
      completedAt: Date | null;
      rewardAmount: number;
      paidOut: boolean;
    } | null;

    const completedToday =
      !!round?.completedAt ||
      (round?.currentStep ?? 0) >= (round?.totalSteps ?? 5);
    const available =
      !!latestCompletedDeposit &&
      latestCompletedDeposit.amount > 0 &&
      !completedToday;

    return NextResponse.json(
      {
        success: true,
        dateKey,
        available,
        completedToday,
        nextAvailableAt: nextAvailableAt.toISOString(),
        rewardAmount: round?.rewardAmount ?? rewardAmount,
        round: round
          ? {
              id: round.id,
              totalSteps: round.totalSteps,
              currentStep: round.currentStep,
              completedAt: round.completedAt,
              paidOut: round.paidOut,
            }
          : null,
      },
      { headers }
    );
  } catch (error) {
    console.error("Task status error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers }
    );
  }
}

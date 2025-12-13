import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getDateKeyForTzOffset } from "@/lib/dailyTasks";
import { getProfitForDepositAmount } from "@/lib/planRewards";

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
    // Prisma Client types may lag behind schema changes until `prisma generate` runs.
    // This cast avoids dev-blocking type errors before you run migrations.
    const prismaWithRounds = prisma as unknown as {
      $transaction: <T>(fn: (tx: unknown) => Promise<T>) => Promise<T>;
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

    // Fetch userNo for DB reporting
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { userNo: true },
    });

    // Must have a completed deposit to do tasks
    const latestCompletedDeposit = await prisma.deposit.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      select: { amount: true },
    });
    if (!latestCompletedDeposit) {
      return NextResponse.json(
        { success: false, error: "Deposit required" },
        { status: 403, headers }
      );
    }

    const rewardAmount =
      getProfitForDepositAmount(latestCompletedDeposit.amount) ?? 0;

    const result = await prismaWithRounds.$transaction(async (tx) => {
      const txWithRounds = tx as unknown as {
        dailyTaskRound: {
          upsert: (args: unknown) => Promise<unknown>;
          update: (args: unknown) => Promise<unknown>;
        };
        user: {
          update: (args: unknown) => Promise<unknown>;
        };
      };
      // Create or load today's round
      const round = (await txWithRounds.dailyTaskRound.upsert({
        where: { userId_dateKey: { userId, dateKey } },
        create: {
          userId,
          userNo: userRecord?.userNo ?? null,
          dateKey,
          totalSteps: 5,
          currentStep: 0,
          rewardAmount,
        },
        update: {},
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
      };

      // If already completed today, just return state
      if (round.completedAt || round.currentStep >= round.totalSteps) {
        return { round, paid: false };
      }

      const newStep = Math.min(round.currentStep + 1, round.totalSteps);
      const isNowCompleted = newStep >= round.totalSteps;

      const updatedRound = (await txWithRounds.dailyTaskRound.update({
        where: { id: round.id },
        data: {
          currentStep: newStep,
          completedAt: isNowCompleted ? now : null,
        },
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
      };

      // If just completed and not yet paid, pay out and mark paidOut
      if (isNowCompleted && !updatedRound.paidOut) {
        await txWithRounds.user.update({
          where: { id: userId },
          data: { balance: { increment: updatedRound.rewardAmount } },
        });
        await txWithRounds.dailyTaskRound.update({
          where: { id: round.id },
          data: { paidOut: true, paidOutAt: now },
        });
        return { round: { ...updatedRound, paidOut: true }, paid: true };
      }

      return { round: updatedRound, paid: false };
    });

    return NextResponse.json(
      {
        success: true,
        dateKey,
        round: result.round,
        paid: result.paid,
      },
      { headers }
    );
  } catch (error) {
    console.error("Task step error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers }
    );
  }
}

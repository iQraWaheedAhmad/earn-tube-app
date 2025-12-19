import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const MIN_WITHDRAW_AMOUNT = 10;
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
    const data = await request.json();
    const { asset, address, amount } = data;
    if (!asset || !address || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400, headers }
      );
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400, headers }
      );
    }

    if (amountNum < MIN_WITHDRAW_AMOUNT) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum withdrawal amount is $${MIN_WITHDRAW_AMOUNT}.`,
        },
        { status: 400, headers }
      );
    }

    // Fetch userNo once (used for storing in withdrawals table for easier reporting).
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { userNo: true },
    });

    // Create withdrawal and deduct balance atomically in a transaction.
    // This prevents race conditions (double-withdraw / negative balance).
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      });

      if (!user) {
        // Throwing forces the transaction to rollback.
        throw new Error("USER_NOT_FOUND");
      }

      if ((user.balance ?? 0) < MIN_WITHDRAW_AMOUNT) {
        throw new Error("MIN_BALANCE_REQUIRED");
      }

      // Only decrement if balance is sufficient.
      const updated = await tx.user.updateMany({
        where: {
          id: userId,
          balance: { gte: amountNum },
        },
        data: {
          balance: { decrement: amountNum },
        },
      });

      if (updated.count !== 1) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const withdrawalUnknown = await (
        tx as unknown as {
          withdrawal: { create: (args: unknown) => Promise<unknown> };
        }
      ).withdrawal.create({
        data: {
          userId,
          // Prisma Client types may lag schema until you run `prisma generate`.
          // Store userNo for easier DB inspection.
          userNo: userRecord?.userNo ?? null,
          asset,
          address,
          amount: amountNum,
          balance: user.balance, // Store balance at time of withdrawal
          status: "PENDING",
        },
      });

      return withdrawalUnknown as { id: string };
    });

    return NextResponse.json(
      { success: true, withdrawal: result },
      { headers }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404, headers }
        );
      }
      if (error.message === "MIN_BALANCE_REQUIRED") {
        return NextResponse.json(
          {
            success: false,
            error: `Minimum balance required to withdraw is $${MIN_WITHDRAW_AMOUNT}.`,
          },
          { status: 400, headers }
        );
      }
      if (error.message === "INSUFFICIENT_BALANCE") {
        return NextResponse.json(
          { success: false, error: "Insufficient balance" },
          { status: 400, headers }
        );
      }
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

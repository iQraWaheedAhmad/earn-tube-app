import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { approveReferralReward } from '@/lib/referrals'

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { referralId } = await request.json();
    
    console.log("=== DEBUG: MANUAL BALANCE UPDATE TEST ===", { referralId });
    
    if (!referralId) {
      return NextResponse.json(
        { error: "referralId is required" },
        { status: 400 }
      );
    }

    // Get referral details before update
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      include: {
        referrer: {
          select: { id: true, email: true, balance: true }
        }
      }
    });

    if (!referral) {
      return NextResponse.json(
        { error: "Referral not found" },
        { status: 404 }
      );
    }

    console.log("=== BEFORE BALANCE UPDATE ===", {
      referralId: referral.id,
      referrerId: referral.referrerId,
      referrerEmail: referral.referrer.email,
      currentBalance: referral.referrer.balance,
      rewardAmount: referral.rewardAmount,
      status: referral.status
    });

    // Process the balance update
    const result = await approveReferralReward(referralId);

    // Get updated referrer balance
    const updatedReferrer = await prisma.user.findUnique({
      where: { id: referral.referrerId },
      select: { balance: true }
    });

    console.log("=== AFTER BALANCE UPDATE ===", {
      referralId: result.id,
      referrerId: referral.referrerId,
      updatedBalance: updatedReferrer?.balance,
      status: result.status
    });

    return NextResponse.json({
      success: true,
      before: {
        balance: referral.referrer.balance,
        status: referral.status
      },
      after: {
        balance: updatedReferrer?.balance,
        status: result.status
      },
      referral: result
    });

  } catch (error) {
    console.error("=== DEBUG: BALANCE UPDATE ERROR ===", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check current balance
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, balance: true }
    });

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error("=== DEBUG: GET USER ERROR ===", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

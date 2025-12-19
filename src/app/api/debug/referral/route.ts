import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { processReferralReward } from '@/lib/referrals'

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { userId, depositAmount } = await request.json();
    
    console.log("=== DEBUG: MANUAL REFERRAL REWARD TRIGGER ===", { userId, depositAmount });
    
    if (!userId || !depositAmount) {
      return NextResponse.json(
        { error: "userId and depositAmount are required" },
        { status: 400 }
      );
    }

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        referredByUser: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("=== DEBUG: USER INFO ===", {
      userId: user.id,
      userEmail: user.email,
      referredBy: user.referredBy,
      referredByName: user.referredByUser?.name
    });

    // Process referral reward
    const result = await processReferralReward(userId, depositAmount);

    // Get updated user balance
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.referredBy || '' },
      select: { balance: true }
    });

    return NextResponse.json({
      success: true,
      referralResult: result,
      referrerBalance: updatedUser?.balance || 0
    });

  } catch (error) {
    console.error("=== DEBUG: REFERRAL REWARD ERROR ===", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

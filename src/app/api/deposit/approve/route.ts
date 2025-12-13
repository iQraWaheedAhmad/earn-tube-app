import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { processReferralReward, approveReferralReward } from '@/lib/referrals'

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
    // Get Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization token required" },
        { status: 401, headers }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify token and get userId (should be admin)
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

    const { depositId, status } = await request.json();

    if (!depositId || !status) {
      return NextResponse.json(
        { success: false, error: "Deposit ID and status are required" },
        { status: 400, headers }
      );
    }

    if (!['PENDING', 'COMPLETED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400, headers }
      );
    }

    // Get deposit details
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: { user: true }
    });

    if (!deposit) {
      return NextResponse.json(
        { success: false, error: "Deposit not found" },
        { status: 404, headers }
      );
    }

    // Update deposit status
    const updatedDeposit = await prisma.deposit.update({
      where: { id: depositId },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If deposit is completed, approve any pending referral rewards
    if (status === 'COMPLETED') {
      try {
        console.log("=== CHECKING FOR PENDING REFERRAL REWARDS ===", { userId: decodedToken.userId, depositId });
        
        // Find any pending referral rewards for this user
        const pendingReferrals = await prisma.referral.findMany({
          where: {
            referredId: deposit.userId,
            status: 'PENDING'
          }
        });

        console.log("=== FOUND PENDING REFERRALS ===", pendingReferrals.length);

        // Approve each pending referral reward
        for (const referral of pendingReferrals) {
          const approvedReferral = await approveReferralReward(referral.id);
          if (approvedReferral) {
            console.log("=== REFERRAL REWARD APPROVED ===", approvedReferral.id);
          }
        }

        console.log("=== REFERRAL REWARDS APPROVAL COMPLETED ===");
      } catch (referralError) {
        console.error("=== FAILED TO APPROVE REFERRAL REWARDS ===", referralError);
        // Don't fail the deposit update if referral approval fails
      }
    }

    return NextResponse.json({
      success: true,
      deposit: updatedDeposit
    }, { headers });

  } catch (error) {
    console.error("Deposit approval error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

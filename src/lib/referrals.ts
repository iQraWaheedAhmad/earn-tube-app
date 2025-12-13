import prisma from "./prisma";
import { getProfitForDepositAmount } from "./planRewards";

export async function processReferralReward(
  userId: string,
  depositAmount: number
) {
  try {
    console.log("=== PROCESSING REFERRAL REWARD ===", {
      userId,
      depositAmount,
    });

    // Find the user who made the deposit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        referredByUser: true,
      },
    });

    if (!user) {
      console.log("=== USER NOT FOUND ===", userId);
      return null;
    }

    if (!user.referredBy) {
      console.log("=== NO REFERRER FOUND FOR USER ===", userId);
      return null;
    }

    console.log("=== FOUND REFERRER ===", {
      referredBy: user.referredBy,
      referredByName: user.referredByUser?.name,
    });

    // Check if referral reward already exists
    const existingReferral = await prisma.referral.findUnique({
      where: { referredId: userId },
    });

    if (existingReferral) {
      console.log(
        "=== REFERRAL RECORD ALREADY EXISTS ===",
        existingReferral.status
      );
      return existingReferral;
    }

    // Find the plan that matches the deposit amount
    const rewardAmount = getProfitForDepositAmount(depositAmount);
    if (rewardAmount == null) {
      console.log("=== NO MATCHING PLAN FOUND ===", depositAmount);
      return null;
    }

    const referrerId = user.referredBy;
    const referrerNo = user.referredByUser?.userNo ?? null;
    const referredNo = user.userNo ?? null;

    console.log("=== CREATING PENDING REFERRAL REWARD ===", {
      referrerId,
      referredId: userId,
      rewardAmount,
      planAmount: depositAmount,
    });

    // Create referral record with PENDING status (no balance update yet)
    // Note: Prisma Client types may lag schema until you run `prisma generate`.
    const referralUnknown = await (
      prisma as unknown as {
        referral: { create: (args: unknown) => Promise<unknown> };
      }
    ).referral.create({
      data: {
        referrerId,
        referrerNo,
        referredId: userId,
        referredNo,
        rewardAmount,
        planAmount: depositAmount,
        status: "PENDING",
      },
    });

    const referral = referralUnknown as {
      id: string;
      rewardAmount: number;
      status: string;
    };

    console.log("=== REFERRAL REWARD CREATED AS PENDING ===", {
      referralId: referral.id,
      rewardAmount,
      status: "PENDING",
    });

    return referral;
  } catch (error) {
    console.error("=== ERROR PROCESSING REFERRAL REWARD ===", error);
    throw error;
  }
}

export async function approveReferralReward(referralId: string) {
  try {
    console.log("=== APPROVING REFERRAL REWARD ===", referralId);

    // Get the referral record
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
    });

    if (!referral) {
      console.log("=== REFERRAL NOT FOUND ===", referralId);
      return null;
    }

    // If already completed, don't add to balance again (idempotent by status).
    if (referral.status === "COMPLETED") {
      console.log("=== REFERRAL ALREADY COMPLETED ===", referralId);
      return referral;
    }

    console.log("=== APPROVING REFERRAL AND ADDING TO BALANCE ===", {
      referralId,
      referrerId: referral.referrerId,
      rewardAmount: referral.rewardAmount,
    });

    // Update referral status and add to balance in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get current referrer balance before update
      const currentReferrer = await tx.user.findUnique({
        where: { id: referral.referrerId },
        select: { balance: true },
      });

      console.log("=== CURRENT REFERRER BALANCE ===", {
        referrerId: referral.referrerId,
        currentBalance: currentReferrer?.balance || 0,
        rewardAmount: referral.rewardAmount,
        newBalance: (currentReferrer?.balance || 0) + referral.rewardAmount,
      });

      const now = new Date();

      // Mark referral completed
      const updatedReferral = await tx.referral.update({
        where: { id: referralId },
        data: {
          status: "COMPLETED",
          paidOut: true,
          paidOutAt: now,
          updatedAt: now,
        },
      });

      // Add reward to referrer's balance
      const balanceUpdate = await tx.user.update({
        where: { id: referral.referrerId },
        data: {
          balance: {
            increment: referral.rewardAmount,
          },
        },
        select: {
          id: true,
          balance: true,
        },
      });

      console.log("=== BALANCE UPDATE COMPLETED ===", {
        referrerId: balanceUpdate.id,
        updatedBalance: balanceUpdate.balance,
      });

      return updatedReferral;
    });

    console.log("=== REFERRAL REWARD APPROVED SUCCESSFULLY ===", {
      referralId: result.id,
      rewardAmount: result.rewardAmount,
      status: "COMPLETED",
    });

    return result;
  } catch (error) {
    console.error("=== ERROR APPROVING REFERRAL REWARD ===", error);
    throw error;
  }
}

export async function getReferralStats(userId: string) {
  try {
    console.log("=== GETTING REFERRAL STATS FOR USER ===", userId);

    const stats = await prisma.referral.groupBy({
      by: ["status"],
      where: { referrerId: userId },
      _count: {
        id: true,
      },
      _sum: {
        rewardAmount: true,
      },
    });

    console.log("=== RAW REFERRAL STATS ===", stats);

    const totalReferrals = stats.reduce((sum, stat) => sum + stat._count.id, 0);
    const totalEarnings = stats
      .filter((stat) => stat.status === "COMPLETED")
      .reduce((sum, stat) => sum + (stat._sum.rewardAmount || 0), 0);
    const activeReferrals =
      stats.find((stat) => stat.status === "COMPLETED")?._count.id || 0;
    const pendingReferrals =
      stats.find((stat) => stat.status === "PENDING")?._count.id || 0;

    const result = {
      totalReferrals,
      totalEarnings,
      activeReferrals,
      pendingReferrals,
    };

    console.log("=== CALCULATED REFERRAL STATS ===", result);

    return result;
  } catch (error) {
    console.error("=== ERROR GETTING REFERRAL STATS ===", error);
    return {
      totalReferrals: 0,
      totalEarnings: 0,
      activeReferrals: 0,
      pendingReferrals: 0,
    };
  }
}

import prisma from "./prisma";
import { getReferralProfitForDepositAmount } from "./planRewards";

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

    // Find the plan that matches the deposit amount
    const rewardAmount = getReferralProfitForDepositAmount(depositAmount);
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

    // Create referral record with PENDING status (no balance update yet).
    // Use upsert to avoid duplicate rows even under concurrent requests.
    const referralUnknown = await (
      prisma as unknown as {
        referral: {
          upsert: (args: unknown) => Promise<unknown>;
        };
      }
    ).referral.upsert({
      where: { referredId: userId },
      // If already exists, leave it untouched (idempotent).
      update: {},
      create: {
        referrerId,
        referrerNo,
        referredId: userId,
        referredNo,
        rewardAmount,
        planAmount: depositAmount,
        status: "PENDING",
        paidOut: false,
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

    // Update referral status and add to balance in a transaction with double-check
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      // Only update if status is still PENDING
      const updated = await tx.referral.updateMany({
        where: { id: referralId, status: "PENDING" },
        data: {
          status: "COMPLETED",
          paidOut: true,
          paidOutAt: now,
          updatedAt: now,
        },
      });
      if (updated.count !== 1) {
        // Already completed or not found, skip balance increment
        return await tx.referral.findUnique({ where: { id: referralId } });
      }
      // Add reward to referrer's balance
      await tx.user.update({
        where: { id: referral.referrerId },
        data: {
          balance: {
            increment: referral.rewardAmount,
          },
        },
      });
      return await tx.referral.findUnique({ where: { id: referralId } });
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

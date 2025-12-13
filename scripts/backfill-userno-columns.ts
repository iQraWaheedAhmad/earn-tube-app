import prisma from "../src/lib/prisma";

async function main() {
  // Prisma Client types may lag schema until you run `prisma generate`.
  // Use a narrow cast so this script can run immediately after migrations.
  const prismaWithNewCols = prisma as unknown as {
    deposit: {
      findMany: (args: unknown) => Promise<unknown>;
      update: (args: unknown) => Promise<unknown>;
    };
    withdrawal: {
      findMany: (args: unknown) => Promise<unknown>;
      update: (args: unknown) => Promise<unknown>;
    };
    referral: {
      findMany: (args: unknown) => Promise<unknown>;
      update: (args: unknown) => Promise<unknown>;
    };
    dailyTaskRound: {
      findMany: (args: unknown) => Promise<unknown>;
      update: (args: unknown) => Promise<unknown>;
    };
    user: typeof prisma.user;
    $disconnect: typeof prisma.$disconnect;
  };

  const users = await prisma.user.findMany({
    select: { id: true, userNo: true },
  });

  const userNoById = new Map<string, number>();
  for (const u of users) {
    if (typeof u.userNo === "number") userNoById.set(u.id, u.userNo);
  }

  let deposits = 0;
  let withdrawals = 0;
  let rounds = 0;
  let referrals = 0;

  const depositRows = (await prismaWithNewCols.deposit.findMany({
    where: { userNo: null },
    select: { id: true, userId: true },
  })) as Array<{ id: string; userId: string }>;
  for (const d of depositRows) {
    const n = userNoById.get(d.userId);
    if (n == null) continue;
    await prismaWithNewCols.deposit.update({
      where: { id: d.id },
      data: { userNo: n },
    });
    deposits += 1;
  }

  const withdrawalRows = (await prismaWithNewCols.withdrawal.findMany({
    where: { userNo: null },
    select: { id: true, userId: true },
  })) as Array<{ id: string; userId: string }>;
  for (const w of withdrawalRows) {
    const n = userNoById.get(w.userId);
    if (n == null) continue;
    await prismaWithNewCols.withdrawal.update({
      where: { id: w.id },
      data: { userNo: n },
    });
    withdrawals += 1;
  }

  const roundRows = (await prismaWithNewCols.dailyTaskRound.findMany({
    where: { userNo: null },
    select: { id: true, userId: true },
  })) as Array<{ id: string; userId: string }>;
  for (const r of roundRows) {
    const n = userNoById.get(r.userId);
    if (n == null) continue;
    await prismaWithNewCols.dailyTaskRound.update({
      where: { id: r.id },
      data: { userNo: n },
    });
    rounds += 1;
  }

  const referralRows = (await prismaWithNewCols.referral.findMany({
    where: {
      OR: [{ referrerNo: null }, { referredNo: null }],
    },
    select: {
      id: true,
      referrerId: true,
      referredId: true,
      referrerNo: true,
      referredNo: true,
    },
  })) as Array<{
    id: string;
    referrerId: string;
    referredId: string;
    referrerNo: number | null;
    referredNo: number | null;
  }>;
  for (const r of referralRows) {
    const referrerNo = r.referrerNo ?? userNoById.get(r.referrerId) ?? null;
    const referredNo = r.referredNo ?? userNoById.get(r.referredId) ?? null;
    if (referrerNo == null && referredNo == null) continue;
    await prismaWithNewCols.referral.update({
      where: { id: r.id },
      data: {
        referrerNo,
        referredNo,
      },
    });
    referrals += 1;
  }

  console.log(
    `Backfill complete. deposits=${deposits}, withdrawals=${withdrawals}, daily_task_rounds=${rounds}, referrals=${referrals}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

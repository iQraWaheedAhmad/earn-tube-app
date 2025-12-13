import prisma from "../src/lib/prisma";

function isNumericCode(code: string) {
  return /^[0-9]{8}$/.test(code);
}

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, referralCode: true },
  });

  let updated = 0;
  for (const u of users) {
    if (!u.referralCode) continue;
    if (!isNumericCode(u.referralCode)) continue;

    const newCode = u.id.slice(-8).toUpperCase();
    if (newCode === u.referralCode) continue;

    await prisma.user.update({
      where: { id: u.id },
      data: { referralCode: newCode },
    });
    updated += 1;
  }

  console.log(`Fixed referral codes for ${updated} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@earntube.com").trim();
  const adminPassword = (
    process.env.ADMIN_PASSWORD || "pT9!r3*S8$wQ2@xA4yVf"
  ).trim();

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL or ADMIN_PASSWORD is missing. Please set them in .env."
    );
  }

  const hashed = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashed,
      name: "Admin",
    },
    create: {
      email: adminEmail,
      password: hashed,
      name: "Admin",
    },
  });

  console.log("Seeded admin user:", adminEmail);

  // Ensure all users have referral codes
  console.log("Checking and updating referral codes...");
  const usersWithoutReferralCodes = await prisma.user.findMany({
    where: {
      referralCode: null,
    },
  });

  console.log(
    `Found ${usersWithoutReferralCodes.length} users without referral codes`
  );

  for (const user of usersWithoutReferralCodes) {
    const referralCode = user.id.slice(-8).toUpperCase();
    await prisma.user.update({
      where: { id: user.id },
      data: { referralCode },
    });
    console.log(
      `Updated referral code for user ${user.email}: ${referralCode}`
    );
  }

  console.log("Referral codes updated successfully");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

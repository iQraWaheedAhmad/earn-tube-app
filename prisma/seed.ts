import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim() || "admin@earntube.com";
  const adminPassword = process.env.ADMIN_PASSWORD?.trim() || "Imran1122";

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
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Gives an existing user the admin role.
// Usage: npm run make-admin -- someone@example.com
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: npm run make-admin -- someone@example.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`No user with the email ${email}. Sign up first.`);
    process.exit(1);
  }

  await prisma.user.update({ where: { email }, data: { role: "admin" } });
  console.log(`${email} is now an admin.`);
}

main().finally(() => prisma.$disconnect());

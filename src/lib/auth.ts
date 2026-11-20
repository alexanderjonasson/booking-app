import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      // Every new user is a customer. input: false means the role
      // can never be sent in from a sign-up form.
      role: { type: "string", defaultValue: "customer", input: false },
    },
  },
  telemetry: { enabled: false },
  plugins: [nextCookies()],
});

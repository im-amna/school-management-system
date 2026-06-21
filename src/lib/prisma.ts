// Yeh file Prisma Client ka "singleton" banati hai
// Singleton matlab: poore app mein sirf EK connection use hoga, baar baar naya nahi banega

import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

// Adapter banate hain — yeh Prisma ko batata hai PostgreSQL se kaise connect karna hai
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
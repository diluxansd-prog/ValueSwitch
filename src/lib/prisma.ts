import { PrismaClient } from "@prisma/client";
import { recordDbOutcome, isConnectionError } from "@/lib/db-status";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient> | undefined;
};

/**
 * Every query doubles as a health check, so nothing has to poll the
 * database to find out whether it is reachable (see db-status.ts).
 */
function createClient() {
  return new PrismaClient().$extends({
    query: {
      async $allOperations({ args, query }) {
        try {
          const result = await query(args);
          recordDbOutcome(true);
          return result;
        } catch (err) {
          if (isConnectionError(err)) recordDbOutcome(false);
          throw err;
        }
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

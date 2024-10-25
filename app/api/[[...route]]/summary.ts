import { zValidator } from "@hono/zod-validator";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { Hono } from "hono";
import { number, z } from "zod";
import { differenceInDays, parse, subDays } from "date-fns";
import { db } from "@/db/drizzle";
import { and, eq, gte, lte, sql, sum } from "drizzle-orm";
import { accounts, transactions } from "@/db/schema";

const app = new Hono().get(
  "/",
  clerkMiddleware(),
  zValidator(
    "query",
    z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      accountId: z.string().optional(),
    })
  ),
  async (c) => {
    const auth = getAuth(c);
    const { from, to, accountId } = c.req.valid("query");

    // Check if userId is missing, return unauthorized if true
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const defaultTo = new Date();
    const defaultFrom = subDays(defaultTo, 30);
    const startDate = from
      ? parse(from, "yyyy-MM-dd", new Date())
      : defaultFrom;
    const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;
    const periodLength = differenceInDays(endDate, startDate) + 1;
    const lastPeroidStart = subDays(startDate, periodLength);
    const lastPeroidEnd = subDays(endDate, periodLength);

    async function fetchFinancialData(
      userId: string,
      startDate: Date,
      endDate: Date
    ) {
      return db
        .select({
          income:
            sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
              number
            ),
          expenses:
            sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
              number
            ),
          remaining: sum(transactions.amount).mapWith(number),
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, userId),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate)
          )
        );
    }

    // Use auth.userId with non-null assertion
    const [currentPeriod] = await fetchFinancialData(
      auth.userId!,
      startDate,
      endDate
    );
    const [lastPeriod] = await fetchFinancialData(
      auth.userId!,
      lastPeroidStart,
      lastPeroidEnd
    );

    return c.json({ currentPeriod, lastPeriod });
  }
);

export default app;

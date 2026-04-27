import { streamText, createDataStreamResponse, type Message } from "ai";
import { model } from "~/model";
import { auth } from "~/server/auth/index.ts";
import { db } from "~/server/db";
import { rateLimits, users } from "~/server/db/schema";
import { count, eq, and, gte } from "drizzle-orm";

export const maxDuration = 60;

const RATE_LIMIT_PER_DAY = 10;

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  // Check if user is admin
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  if (!user.isAdmin) {
    // Check rate limit
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
     
    const [requestCount] = await db
      .select({ value: count() })
      .from(rateLimits)
      .where(
        and(
          eq(rateLimits.userId, userId),
          gte(rateLimits.createdAt, twentyFourHoursAgo)
        )
      );
 
    if (requestCount && requestCount.value >= RATE_LIMIT_PER_DAY) {
      return new Response("Too Many Requests", { status: 429 });
    }
  }

  // Record the request
  await db.insert(rateLimits).values({
    userId,
  });

  const body = (await request.json()) as {
    messages: Array<Message>;
  };

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const { messages } = body;

      const result = streamText({
        model,
        messages,
        system: `You are a helpful search assistant. 
Always use the searchWeb tool to find up-to-date information before answering.
Always cite your sources using inline links like [Title](Link) at the end of the relevant sentence or paragraph.
Be concise and factual.`,
      });

      result.mergeIntoDataStream(dataStream, {
        sendSources: true,
      });
    },
    onError: (e) => {
      console.error(e);
      return "Oops, an error occured!";
    },
  });
}

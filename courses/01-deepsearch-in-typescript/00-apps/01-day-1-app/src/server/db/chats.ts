import { db } from "./index";
import { chats, messages } from "./schema";
import { eq, asc, desc, and } from "drizzle-orm";
import type { Message } from "ai";

export const upsertChat = async (opts: {
  userId: string;
  chatId: string;
  title: string;
  messages: Message[];
}) => {
  const { userId, chatId, title, messages: msgs } = opts;

  // Check if chat exists and belongs to user
  const existingChat = await db.query.chats.findFirst({
    where: eq(chats.id, chatId),
  });

  if (existingChat && existingChat.userId !== userId) {
    throw new Error("Chat does not belong to the user");
  }

  await db.transaction(async (tx) => {
    // Upsert chat
    await tx
      .insert(chats)
      .values({
        id: chatId,
        userId,
        title,
      })
      .onConflictDoUpdate({
        target: chats.id,
        set: { title },
      });

    // Delete existing messages
    await tx.delete(messages).where(eq(messages.chatId, chatId));

    // Insert new messages
    if (msgs.length > 0) {
      await tx.insert(messages).values(
        msgs.map((msg, index) => ({
          id: msg.id || crypto.randomUUID(),
          chatId,
          role: msg.role,
          parts: typeof msg.content === "string" 
            ? [{ type: "text", text: msg.content }] 
            : msg.content,
          order: index,
        })),
      );
    }
  });
};

export const getChat = async (opts: { chatId: string; userId: string }) => {
  const { chatId, userId } = opts;
  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
    with: {
      messages: {
        orderBy: asc(messages.order),
      },
    },
  });

  if (!chat) return null;

  return {
    ...chat,
    messages: chat.messages.map((msg) => {
      const parts = msg.parts as Array<{ type: string; text?: string }>;
      const content = parts.length === 1 && parts[0]?.type === "text" && parts[0]?.text !== undefined
        ? parts[0].text
        : parts;

      return {
        id: msg.id,
        role: msg.role as Message["role"],
        content,
        createdAt: msg.createdAt,
      } as Message;
    }),
  };
};

export const getChats = async (opts: { userId: string }) => {
  const { userId } = opts;
  return await db.query.chats.findMany({
    where: eq(chats.userId, userId),
    orderBy: desc(chats.createdAt),
  });
};

"use server";

import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { ok, err } from "@/utils/api";
import { db } from "@/_database/drizzle";
import { post } from "@/_database/schema/app-schema";
import { user } from "@/_database/schema/auth-schema";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createPostSchema, updatePostSchema, deletePostSchema } from "../post.validation";
import { getFeed, type PostItem } from "./queries";

export type CreatePostResult = { id: string; content: string; createdAt: Date; authorId: string; authorName: string; authorImage: string | null };
export type UpdatePostResult = { id: string; content: string };
export type DeletePostResult = { id: string };

export type PostActionResult =
  | ReturnType<typeof ok<CreatePostResult>>
  | ReturnType<typeof ok<UpdatePostResult>>
  | ReturnType<typeof ok<DeletePostResult>>
  | ReturnType<typeof err>;

const isAdminOrSuperadmin = (role: string) => role === "admin" || role === "superadmin";

export async function createPostAction(
  _prev: PostActionResult | null,
  formData: FormData,
): Promise<PostActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return err("Not authenticated");
  if (session.user.banned) return err("You are banned from posting");

  const parsed = createPostSchema.safeParse({
    content: formData.get("content"),
  });

  if (!parsed.success) return err(parsed.error.issues[0]!.message);

  try {
    const inserted = await db
      .insert(post)
      .values({
        content: parsed.data.content,
        authorId: session.user.id,
      })
      .returning({ id: post.id, content: post.content, createdAt: post.createdAt });

    const row = inserted[0]!;

    revalidatePath("/app/feed");
    return ok({
      id: row.id,
      content: row.content,
      createdAt: row.createdAt,
      authorId: session.user.id,
      authorName: session.user.name,
      authorImage: session.user.image ?? null,
    });
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to create post");
  }
}

export async function updatePostAction(
  _prev: PostActionResult | null,
  formData: FormData,
): Promise<PostActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return err("Not authenticated");
  if (session.user.banned) return err("You are banned from editing");

  const parsed = updatePostSchema.safeParse({
    id: formData.get("id"),
    content: formData.get("content"),
  });

  if (!parsed.success) return err(parsed.error.issues[0]!.message);

  try {
    const existing = await db
      .select({ authorId: post.authorId })
      .from(post)
      .where(and(eq(post.id, parsed.data.id), isNull(post.deletedAt)))
      .limit(1);

    if (existing.length === 0) return err("Post not found");

    const isOwner = existing[0]!.authorId === session.user.id;
    if (!isOwner && !isAdminOrSuperadmin(session.user.role)) {
      return err("You do not have permission to edit this post");
    }

    await db
      .update(post)
      .set({ content: parsed.data.content })
      .where(eq(post.id, parsed.data.id));

    revalidatePath("/app/feed");
    return ok({ id: parsed.data.id, content: parsed.data.content });
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to update post");
  }
}

export async function deletePostAction(
  _prev: PostActionResult | null,
  formData: FormData,
): Promise<PostActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return err("Not authenticated");

  const parsed = deletePostSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) return err(parsed.error.issues[0]!.message);

  try {
    const existing = await db
      .select({ authorId: post.authorId })
      .from(post)
      .where(and(eq(post.id, parsed.data.id), isNull(post.deletedAt)))
      .limit(1);

    if (existing.length === 0) return err("Post not found");

    const isOwner = existing[0]!.authorId === session.user.id;
    if (!isOwner && !isAdminOrSuperadmin(session.user.role)) {
      return err("You do not have permission to delete this post");
    }

    await db
      .update(post)
      .set({
        deletedAt: new Date(),
        deletedById: isOwner ? null : session.user.id,
      })
      .where(eq(post.id, parsed.data.id));

    revalidatePath("/app/feed");
    return ok({ id: parsed.data.id });
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to delete post");
  }
}

export async function getFeedAction(
  cursor?: string,
  limit = 25,
): Promise<
  | { success: true; data: { posts: PostItem[]; nextCursor: string | null } }
  | ReturnType<typeof err>
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return err("Not authenticated");

  try {
    const result = await getFeed(session.user.id, session.user.role, cursor, limit);
    return { success: true, data: result };
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to fetch feed");
  }
}

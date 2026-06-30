import { db } from "@/_database/drizzle";
import { post } from "@/_database/schema/app-schema";
import { user } from "@/_database/schema/auth-schema";
import { lt, or, and, desc, eq, isNull, type SQL } from "drizzle-orm";

export type PostItem = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  authorName: string;
  authorImage: string | null;
  canDelete: boolean;
  canEdit: boolean;
};

type FeedRow = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  authorName: string;
  authorImage: string | null;
};

function decodeCursor(cursor: string): { createdAt: string; id: string } {
  return JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8"));
}

function encodeCursor(item: { createdAt: Date; id: string }): string {
  return Buffer.from(
    JSON.stringify({ createdAt: item.createdAt.toISOString(), id: item.id }),
  ).toString("base64url");
}

export async function getFeed(
  sessionUserId: string,
  sessionUserRole: string,
  cursor?: string,
  limit = 25,
): Promise<{ posts: PostItem[]; nextCursor: string | null }> {
  const conditions = [isNull(post.deletedAt)];

  if (cursor) {
    const { createdAt, id } = decodeCursor(cursor);
    const cursorDate = new Date(createdAt);
    conditions.push(
      or(
        lt(post.createdAt, cursorDate) as SQL,
        and(eq(post.createdAt, cursorDate), lt(post.id, id)) as SQL,
      ) as SQL,
    );
  }

  const whereClause = and(...conditions) as SQL;

  const rows: FeedRow[] = await db
    .select({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorId: post.authorId,
      authorName: user.name,
      authorImage: user.image,
    })
    .from(post)
    .innerJoin(user, eq(post.authorId, user.id))
    .where(whereClause)
    .orderBy(desc(post.createdAt), desc(post.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;

  const canEditAll = sessionUserRole === "admin" || sessionUserRole === "superadmin";

  const posts: PostItem[] = items.map((row) => ({
    ...row,
    canEdit: canEditAll || row.authorId === sessionUserId,
    canDelete: canEditAll || row.authorId === sessionUserId,
  }));

  const nextCursor =
    hasMore && items.length > 0 ? encodeCursor(items[items.length - 1]) : null;

  return { posts, nextCursor };
}

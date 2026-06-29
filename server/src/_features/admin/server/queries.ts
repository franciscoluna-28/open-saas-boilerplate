import { db } from "@/_database/drizzle";
import { user, invitation } from "@/_database/schema/auth-schema";
import { lt, or, and, desc, eq, isNull, gt } from "drizzle-orm";

export type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  emailVerified: boolean | null;
  image: string | null;
};

export type InviteItem = {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
  createdAt: Date;
};

function decodeCursor(cursor: string): { createdAt: string; id: string } {
  return JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8"));
}

function encodeCursor(item: { createdAt: Date; id: string }): string {
  return Buffer.from(
    JSON.stringify({ createdAt: item.createdAt.toISOString(), id: item.id }),
  ).toString("base64url");
}

type GetUsersResult = {
  users: UserItem[];
  nextCursor: string | null;
};

export async function getUsers(cursor?: string, limit = 25): Promise<GetUsersResult> {
  const conditions = [];

  if (cursor) {
    const { createdAt, id } = decodeCursor(cursor);
    const cursorDate = new Date(createdAt);
    conditions.push(
      or(
        lt(user.createdAt, cursorDate),
        and(eq(user.createdAt, cursorDate), lt(user.id, id)),
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
      image: user.image,
    })
    .from(user)
    .where(whereClause)
    .orderBy(desc(user.createdAt), desc(user.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor =
    hasMore && items.length > 0 ? encodeCursor(items[items.length - 1]) : null;

  return { users: items, nextCursor };
}

export async function getPendingInvites(): Promise<InviteItem[]> {
  const invites = await db
    .select({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
    })
    .from(invitation)
    .where(
      and(
        isNull(invitation.usedAt),
        gt(invitation.expiresAt, new Date()),
      ),
    )
    .orderBy(invitation.createdAt);

  return invites;
}

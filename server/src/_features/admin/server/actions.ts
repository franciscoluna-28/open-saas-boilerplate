"use server";

import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { ok, err } from "@/utils/api";
import { inviteSchema, acceptInviteSchema } from "../invitation.validation";
import { user, invitation } from "@/_database/schema/auth-schema";
import { db } from "@/_database/drizzle";
import { eq, and, isNull, gt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendAdminInviteEmail } from "@/lib/email";
import { getUsers } from "./queries";
import type { UserItem } from "./queries";

export type AdminResult =
  | ReturnType<typeof ok<unknown>>
  | ReturnType<typeof err>;

const ALLOWED_ROLES: Record<string, readonly string[]> = {
  superadmin: ["superadmin", "admin"],
};

export async function inviteAdminAction(
  _prev: AdminResult | null,
  formData: FormData,
): Promise<AdminResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return err("Not authenticated");
  if (session.user.role !== "superadmin") return err("Only superadmins can send invites");

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role") ?? "admin",
  });

  if (!parsed.success) return err(parsed.error.issues[0]!.message);

  const allowed = ALLOWED_ROLES[session.user.role];
  if (!allowed!.includes(parsed.data.role)) {
    return err(`You do not have permission to invite users with role "${parsed.data.role}"`);
  }

  try {
    const existingUser = await db
      .select({ id: user.id, role: user.role })
      .from(user)
      .where(eq(user.email, parsed.data.email))
      .limit(1);

    if (existingUser.length > 0) {
      const currentRole = existingUser[0]!.role;
      if (currentRole === "admin" || currentRole === "superadmin") {
        return err("This user is already an admin");
      }
    }

    const existingInvite = await db
      .select({ id: invitation.id })
      .from(invitation)
      .where(
        and(
          eq(invitation.email, parsed.data.email),
          isNull(invitation.usedAt),
          gt(invitation.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (existingInvite.length > 0) return err("A pending invite already exists for this email");

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(invitation).values({
      email: parsed.data.email,
      token,
      role: parsed.data.role,
      expiresAt,
      createdById: session.user.id,
    });

    const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
    const inviteUrl = `${baseUrl}/accept-invite?token=${token}`;

    try {
      await sendAdminInviteEmail({ email: parsed.data.email, url: inviteUrl });
    } catch {
      console.log(`[INVITE] Email not sent. Invite link: ${inviteUrl}`);
    }

    revalidatePath("/app/admin");

    return ok({ email: parsed.data.email, role: parsed.data.role });
  } catch (e) {
    return err(`Failed to send invite: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function acceptInviteAction(
  _prev: AdminResult | null,
  formData: FormData,
): Promise<AdminResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return err("You must be signed in");

  const parsed = acceptInviteSchema.safeParse({
    token: formData.get("token"),
  });

  if (!parsed.success) return err(parsed.error.issues[0]!.message);

  try {
    const invite = await db
      .select()
      .from(invitation)
      .where(eq(invitation.token, parsed.data.token))
      .limit(1);

    if (invite.length === 0) return err("Invitation not found");

    const record = invite[0]!;

    if (record.usedAt) return err("This invitation has already been used");

    if (new Date() > record.expiresAt) return err("This invitation has expired");

    if (session.user.email !== record.email) {
      return err("This invitation was sent to a different email address");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(user)
        .set({ role: record.role })
        .where(eq(user.id, session.user.id));

      await tx
        .update(invitation)
        .set({ usedAt: new Date() })
        .where(eq(invitation.id, record.id));
    });

    revalidatePath("/app/profile");

    return ok({ role: record.role });
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to accept invitation");
  }
}

export async function getPendingInvitesAction(): Promise<
  { success: true; data: { id: string; email: string; role: string; expiresAt: Date; createdAt: Date }[] }
  | ReturnType<typeof err>
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return err("Not authenticated");
  if (session.user.role !== "superadmin" && session.user.role !== "admin") return err("Only admins can view invites");

  try {
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

    return { success: true, data: invites };
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to fetch invites");
  }
}

export async function revokeInviteAction(
  _prev: AdminResult | null,
  formData: FormData,
): Promise<AdminResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return err("Not authenticated");
  if (session.user.role !== "superadmin" && session.user.role !== "admin") return err("Only admins can revoke invites");

  const inviteId = formData.get("inviteId");
  if (typeof inviteId !== "string" || !inviteId) return err("Invite ID is required");

  try {
    await db
      .update(invitation)
      .set({ expiresAt: new Date(0) })
      .where(eq(invitation.id, inviteId));

    revalidatePath("/app/admin");

    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to revoke invite");
  }
}

export async function getUsersAction(
  cursor?: string,
  limit = 25,
): Promise<
  | { success: true; data: { users: UserItem[]; nextCursor: string | null } }
  | ReturnType<typeof err>
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return err("Not authenticated");
  if (session.user.role !== "superadmin" && session.user.role !== "admin") return err("Only admins can view users");

  try {
    const result = await getUsers(cursor, limit);
    return { success: true, data: result };
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to fetch users");
  }
}

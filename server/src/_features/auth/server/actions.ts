"use server";

import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { ok, err } from "@/utils/api";
import {
  signUpSchema,
  signInSchema,
  changePasswordSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  claimAdminSchema,
} from "../auth.validation";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client, Bucket, ensureBucket } from "@/lib/s3";
import { revalidatePath } from "next/cache";
import { user } from "@/_database/schema/auth-schema";
import { db } from "@/_database/drizzle";
import { eq } from "drizzle-orm";

export type AuthResult =
  | ReturnType<typeof ok<unknown>>
  | ReturnType<typeof err>;

export async function getSession() {
  const response = await auth.api.getSession({ headers: await headers() });
  return response;
}

export async function signUpAction(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return err(parsed.error.issues[0]!.message);

  try {
    const response = await auth.api.signUpEmail({ body: parsed.data });
    return ok(response);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Sign up failed");
  }
}

export async function signInAction(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    rememberMe: formData.get("rememberMe") ?? undefined,
  });

  if (!parsed.success) return err(parsed.error.issues[0]!.message);

  try {
    const response = await auth.api.signInEmail({ body: parsed.data });
    return ok(response);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Sign in failed");
  }
}

export async function signOutAction(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
}

export async function changePasswordAction(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) return err(parsed.error.issues[0]!.message);

  if (parsed.data.newPassword !== parsed.data.confirmPassword) {
    return err("Passwords do not match");
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to change password");
  }
}

export async function uploadAvatarAction(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const file = formData.get("avatar") as File | null;
  if (!file) return err("No file provided");

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return err("Only JPEG, PNG, or WebP images are allowed");
  }

  if (file.size > 5 * 1024 * 1024) {
    return err("File must be under 5MB");
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return err("Not authenticated");

    const ext = file.name.split(".").pop() ?? "jpg";
    const key = `avatars/${session.user.id}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await ensureBucket();

    const isDev = process.env.NODE_ENV !== "production";

    await getS3Client().send(
      new PutObjectCommand({
        Bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ...(isDev ? { ACL: "public-read" } : {}),
      }),
    );

    const endpoint = process.env.S3_ENDPOINT ?? "http://localhost:9000";
    const url = `${endpoint}/${Bucket}/${key}`;

    await auth.api.updateUser({
      body: { image: url },
      headers: await headers(),
    });

    revalidatePath("/app/profile");

    return ok({ url });
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to upload avatar");
  }
}

export async function updateProfileAction(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) return err(parsed.error.issues[0]!.message);

  try {
    await auth.api.updateUser({
      body: { name: parsed.data.name },
      headers: await headers(),
    });

    revalidatePath("/app/profile");

    return ok({ name: parsed.data.name });
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to update profile");
  }
}

export async function forgotPasswordAction(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) return err(parsed.error.issues[0]!.message);

  try {
    const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
    await auth.api.requestPasswordReset({
      body: { email: parsed.data.email, redirectTo: `${baseUrl}/reset-password` },
      headers: await headers(),
    });
    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to send reset email");
  }
}

export async function resetPasswordAction(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) return err(parsed.error.issues[0]!.message);

  if (parsed.data.newPassword !== parsed.data.confirmPassword) {
    return err("Passwords do not match");
  }

  try {
    await auth.api.resetPassword({
      body: {
        newPassword: parsed.data.newPassword,
        token: parsed.data.token,
      },
      headers: await headers(),
    });
    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to reset password");
  }
}

export async function hasAdminTokenConfigured() {
  return !!process.env.INITIAL_SUPERADMIN_TOKEN;
}

export async function claimAdminAction(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return err("You must be signed in");

  const parsed = claimAdminSchema.safeParse({
    adminToken: formData.get("adminToken"),
  });

  if (!parsed.success) return err(parsed.error.issues[0]!.message);

  const token = process.env.INITIAL_SUPERADMIN_TOKEN;
  if (!token) return err("No admin token configured on this instance");

  if (parsed.data.adminToken !== token) return err("Invalid admin token");

  const existingSuperadmin = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, "superadmin"))
    .limit(1);

  if (existingSuperadmin.length > 0) return err("Superadmin already exists — this token has been invalidated");

  try {
    await db
      .update(user)
      .set({ role: "superadmin" })
      .where(eq(user.id, session.user.id));

    console.warn(
      "[CLAIM_ADMIN] INITIAL_SUPERADMIN_TOKEN was consumed by user %s (%s). Remove it from your environment variables.",
      session.user.id,
      session.user.email,
    );

    revalidatePath("/app/profile");

    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to claim admin");
  }
}

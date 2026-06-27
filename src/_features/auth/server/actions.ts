"use server";

import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { ok, err } from "@/utils/api";
import { signUpSchema, signInSchema } from "../auth.validation";

export type AuthResult = ReturnType<typeof ok<unknown>> | ReturnType<typeof err>;

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
    rememberMe: formData.get("rememberMe"),
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

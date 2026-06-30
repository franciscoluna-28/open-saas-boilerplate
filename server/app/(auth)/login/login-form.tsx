"use client";

import { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { signInAction, type AuthResult } from "@/_features/auth/server/actions";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBanned = searchParams.get("banned") === "true";
  const [state, formAction, isPending] = useActionState<AuthResult | null, FormData>(signInAction, null);

  useEffect(() => {
    if (state?.success) router.push("/app/profile");
  }, [state, router]);

  const error = (state && !state.success ? state.error : null) as string | null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Welcome back! Enter your credentials to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        {isBanned && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            Your account has been suspended. Please contact an administrator.
          </div>
        )}
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordInput id="password" name="password" placeholder="Enter your password" required />
            </Field>
            <div className="flex justify-end -mt-2">
              <Link href="/forgot-password" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                Forgot password?
              </Link>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Spinner data-icon="inline-start" />}
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { forgotPasswordAction, type AuthResult } from "@/_features/auth/server/actions";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthResult | null, FormData>(forgotPasswordAction, null);

  const isSent = state?.success;
  const error = (state && !state.success ? state.error : null) as string | null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          {isSent
            ? "Check your email for a reset link."
            : "Enter your email and we'll send you a reset link."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSent ? (
          <p className="text-sm text-muted-foreground text-center">
            If an account with that email exists, you will receive a password reset link shortly.
          </p>
        ) : (
          <form action={formAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </Field>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Spinner data-icon="inline-start" />}
                {isPending ? "Sending..." : "Send Reset Link"}
              </Button>
            </FieldGroup>
          </form>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

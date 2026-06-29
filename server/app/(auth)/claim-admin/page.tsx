"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { claimAdminAction, type AuthResult } from "@/_features/auth/server/actions";
import { KeyIcon } from "lucide-react";

export default function ClaimAdminPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<AuthResult | null, FormData>(claimAdminAction, null);

  useEffect(() => {
    if (state?.success) router.push("/app/profile");
  }, [state, router]);

  const error = (state && !state.success ? state.error : null) as string | null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyIcon className="size-5" />
          </div>
          <div>
            <CardTitle>Claim Superadmin</CardTitle>
            <CardDescription>
              Enter the admin token to elevate your account to superadmin.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="adminToken">Admin Token</FieldLabel>
              <Input
                id="adminToken"
                name="adminToken"
                type="password"
                placeholder="Enter the superadmin claim token"
                required
              />
            </Field>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Spinner data-icon="inline-start" />}
              {isPending ? "Claiming..." : "Claim Admin"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already a superadmin?{" "}
          <a href="/app/profile" className="text-primary underline-offset-4 hover:underline">
            Go to profile
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}

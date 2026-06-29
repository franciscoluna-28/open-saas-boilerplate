"use client";

import { Suspense, useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { acceptInviteAction, type AdminResult } from "@/_features/admin/server/actions";
import { ShieldCheckIcon, UserIcon } from "lucide-react";

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, formAction, isPending] = useActionState<AdminResult | null, FormData>(
    acceptInviteAction,
    null,
  );

  useEffect(() => {
    if (state?.success) router.push("/app/profile");
  }, [state, router]);

  const error = state && !state.success ? (state.error as string) : null;
  const success = state?.success ?? false;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>
              This invitation link is missing a token. Please check the link you received.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          {success ? (
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheckIcon className="size-5" />
              </div>
              <div>
                <CardTitle>Welcome to the team!</CardTitle>
                <CardDescription>You've been promoted to admin. Redirecting...</CardDescription>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheckIcon className="size-5" />
              </div>
              <div>
                <CardTitle>Accept Invitation</CardTitle>
                <CardDescription>
                  You've been invited to join as an admin. Sign in to accept.
                </CardDescription>
              </div>
            </div>
          )}
        </CardHeader>
        {!success && (
          <CardContent>
            <form action={formAction}>
              <FieldGroup>
                <input type="hidden" name="token" value={token} />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <Spinner data-icon="inline-start" />}
                  {isPending ? "Accepting..." : "Accept & Become Admin"}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        )}
        {!success && (
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              <UserIcon className="mr-1 inline size-3.5" />
              Need an account?{" "}
              <Link
                href={`/register?inviteToken=${token}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                Sign up first
              </Link>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteForm />
    </Suspense>
  );
}

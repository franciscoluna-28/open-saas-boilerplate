"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  changePasswordAction,
  uploadAvatarAction,
  signOutAction,
  type AuthResult,
} from "@/_features/auth/server/actions";
import { LogOutIcon, UploadIcon, UserIcon } from "lucide-react";

interface InitClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null | undefined;
  };
}

export function InitClient({ user }: InitClientProps) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(user.image ?? null);
  const [passwordState, passwordAction, passwordPending] = useActionState<AuthResult | null, FormData>(
    changePasswordAction,
    null,
  );
  const [avatarState, avatarAction, avatarPending] = useActionState<AuthResult | null, FormData>(
    uploadAvatarAction,
    null,
  );

  const handleLogout = async () => {
    await signOutAction();
    router.push("/login");
  };

  const avatarError = avatarState && !avatarState.success ? (avatarState.error as string | null) : null;
  const passwordError = passwordState && !passwordState.success ? (passwordState.error as string | null) : null;

  if (avatarState?.success) {
    const url = (avatarState.data as { url: string }).url;
    if (url !== avatarUrl) {
      setAvatarUrl(url);
      toast.success("Avatar updated successfully");
    }
  }

  if (passwordState?.success) {
    toast.success("Password changed successfully");
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings.</p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Upload a new avatar for your profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={avatarAction} className="flex items-end gap-4">
            <Avatar className="size-20">
              <AvatarImage src={avatarUrl ?? undefined} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="avatar">Choose image</FieldLabel>
                <Input id="avatar" name="avatar" type="file" accept="image/jpeg,image/png,image/webp" />
              </Field>
              {avatarError && <p className="text-sm text-destructive">{avatarError}</p>}
              <Button type="submit" disabled={avatarPending}>
                {avatarPending && <Spinner data-icon="inline-start" />}
                <UploadIcon data-icon={avatarPending ? undefined : "inline-start"} />
                {avatarPending ? "Uploading..." : "Upload"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={passwordAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
                <Input id="currentPassword" name="currentPassword" type="password" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                <Input id="newPassword" name="newPassword" type="password" placeholder="At least 8 characters" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                <Input id="confirmPassword" name="confirmPassword" type="password" required />
              </Field>
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
              <Button type="submit" disabled={passwordPending}>
                {passwordPending && <Spinner data-icon="inline-start" />}
                {passwordPending ? "Updating..." : "Update Password"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Logout</CardTitle>
          <CardDescription>Sign out of your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            <LogOutIcon data-icon="inline-start" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

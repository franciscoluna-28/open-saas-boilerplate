"use client";

import { useActionState, useState, useEffect, useRef } from "react";
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
  updateProfileAction,
  signOutAction,
  type AuthResult,
} from "@/_features/auth/server/actions";
import { LogOutIcon, UploadIcon, UserIcon } from "lucide-react";

interface ProfileClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null | undefined;
  };
}

export function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(user.image ?? null);
  const [profileState, profileAction, profilePending] = useActionState<AuthResult | null, FormData>(
    updateProfileAction,
    null,
  );
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
  const profileError = profileState && !profileState.success ? (profileState.error as string | null) : null;
  const passwordError = passwordState && !passwordState.success ? (passwordState.error as string | null) : null;

  const prevAvatarState = useRef(avatarState);
  useEffect(() => {
    if (avatarState?.success && prevAvatarState.current !== avatarState) {
      const url = (avatarState.data as { url: string }).url;
      setAvatarUrl(url);
      toast.success("Avatar updated successfully");
    }
    prevAvatarState.current = avatarState;
  }, [avatarState]);

  const prevProfileState = useRef(profileState);
  useEffect(() => {
    if (profileState?.success && prevProfileState.current !== profileState) {
      const newName = (profileState.data as { name: string }).name;
      setName(newName);
      toast.success("Profile updated successfully");
    }
    prevProfileState.current = profileState;
  }, [profileState]);

  const prevPasswordState = useRef(passwordState);
  useEffect(() => {
    if (passwordState?.success && prevPasswordState.current !== passwordState) {
      toast.success("Password changed successfully");
    }
    prevPasswordState.current = passwordState;
  }, [passwordState]);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mx-auto flex w-full !max-w-xl flex-col gap-6 p-6">
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
              <AvatarImage src={avatarUrl ?? undefined} alt={name} />
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
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your display name.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={profileAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" name="name" defaultValue={name} required />
              </Field>
              {profileError && <p className="text-sm text-destructive">{profileError}</p>}
              <Button type="submit" disabled={profilePending}>
                {profilePending && <Spinner data-icon="inline-start" />}
                {profilePending ? "Saving..." : "Save"}
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

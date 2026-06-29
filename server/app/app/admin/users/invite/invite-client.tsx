"use client";

import { useActionState, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { inviteAdminAction, revokeInviteAction, type AdminResult } from "@/_features/admin/server/actions";
import { MailIcon, SendIcon, XIcon, ClockIcon, ShieldIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface InviteClientProps {
  initialInvites: {
    id: string;
    email: string;
    role: string;
    expiresAt: Date;
    createdAt: Date;
  }[];
  currentUserRole: string;
}

function RoleSelect() {
  const [value, setValue] = useState("admin");

  return (
    <Field>
      <FieldLabel>Role</FieldLabel>
      <div className="flex flex-col gap-1">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="superadmin">Superadmin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="role" value={value} />
      </div>
    </Field>
  );
}

export function InviteClient({ initialInvites, currentUserRole }: InviteClientProps) {
  const isSuperadmin = currentUserRole === "superadmin";

  const [inviteState, inviteAction, invitePending] = useActionState<AdminResult | null, FormData>(
    inviteAdminAction,
    null,
  );
  const [revokeState, revokeAction, revokePending] = useActionState<AdminResult | null, FormData>(
    revokeInviteAction,
    null,
  );

  const inviteError = inviteState && !inviteState.success ? (inviteState.error as string) : null;
  const inviteSuccess = inviteState && inviteState.success ? (inviteState.data as { email: string; role: string }) : null;

  return (
    <div className="mx-auto flex w-full max-w-2xl! flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Invite Users</h1>
        <p className="text-sm text-muted-foreground">
          Send an invitation to a user by email.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Invitation</CardTitle>
          <CardDescription>
            {isSuperadmin
              ? "You can invite users as superadmin, admin, or user."
              : "You can invite new users to the platform."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={inviteAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" placeholder="user@example.com" required />
              </Field>
              {isSuperadmin && <RoleSelect />}
              {!isSuperadmin && <input type="hidden" name="role" value="user" />}
              {inviteError && <p className="text-sm text-destructive">{inviteError}</p>}
              {inviteSuccess && (
                <p className="text-sm text-primary">
                  <MailIcon className="mr-1 inline size-3.5" />
                  {inviteSuccess.role === "superadmin" ? "Superadmin" : inviteSuccess.role === "admin" ? "Admin" : "User"} invitation sent to {inviteSuccess.email}
                </p>
              )}
              <Button type="submit" disabled={invitePending}>
                {invitePending && <Spinner data-icon="inline-start" />}
                <SendIcon data-icon={invitePending ? undefined : "inline-start"} />
                {invitePending ? "Sending..." : "Send Invite"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>
            {initialInvites.length === 0
              ? "No pending invitations."
              : `${initialInvites.length} invitation${initialInvites.length === 1 ? "" : "s"} pending.`}
          </CardDescription>
        </CardHeader>
        {initialInvites.length > 0 && (
          <CardContent>
            <div className="space-y-3">
              {initialInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{inv.email}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="size-3" />
                        Expires {formatDistanceToNow(new Date(inv.expiresAt), { addSuffix: true })}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldIcon className="size-3" />
                        {inv.role === "superadmin" ? "Superadmin" : inv.role === "admin" ? "Admin" : "User"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Pending
                    </Badge>
                    <form action={revokeAction}>
                      <input type="hidden" name="inviteId" value={inv.id} />
                      <Button type="submit" variant="ghost" size="icon-xs" disabled={revokePending}>
                        <XIcon className="size-3" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

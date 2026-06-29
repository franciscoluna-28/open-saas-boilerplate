"use client";

import { useState, useCallback } from "react";
import { useActionState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  MailIcon,
  SendIcon,
  XIcon,
  ClockIcon,
  ShieldIcon,
  PlusIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  inviteAdminAction,
  revokeInviteAction,
  getUsersAction,
  type AdminResult,
} from "@/_features/admin/server/actions";
import type { UserItem, InviteItem } from "@/_features/admin/server/queries";

type AdminClientProps = {
  initialUsers: UserItem[];
  initialNextCursor: string | null;
  initialInvites: InviteItem[];
  currentUserRole: string;
};

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

type InviteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSuperadmin: boolean;
};

function InviteDialog({ open, onOpenChange, isSuperadmin }: InviteDialogProps) {
  const [inviteState, inviteAction, invitePending] = useActionState<AdminResult | null, FormData>(
    inviteAdminAction,
    null,
  );

  const inviteError =
    inviteState && !inviteState.success ? (inviteState.error as string) : null;
  const inviteSuccess =
    inviteState && inviteState.success
      ? (inviteState.data as { email: string; role: string })
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>Send an invitation by email.</DialogDescription>
        </DialogHeader>
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
                Invitation sent to {inviteSuccess.email}
              </p>
            )}
            <Button type="submit" disabled={invitePending}>
              {invitePending && <Spinner data-icon="inline-start" />}
              <SendIcon data-icon={invitePending ? undefined : "inline-start"} />
              {invitePending ? "Sending..." : "Send Invite"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminClient({
  initialUsers,
  initialNextCursor,
  initialInvites,
  currentUserRole,
}: AdminClientProps) {
  const isSuperadmin = currentUserRole === "superadmin";
  const [users, setUsers] = useState(initialUsers);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [loading, setLoading] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const [, revokeAction, revokePending] = useActionState<AdminResult | null, FormData>(
    revokeInviteAction,
    null,
  );

  const loadMore = useCallback(async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    const result = await getUsersAction(nextCursor);
    if (result.success) {
      setUsers((prev) => [...prev, ...result.data.users]);
      setNextCursor(result.data.nextCursor);
    }
    setLoading(false);
  }, [nextCursor, loading]);

  return (
    <div className="mx-auto flex w-full max-w-4xl! flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage users.</p>
        </div>
        {isSuperadmin && (
          <>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              Invite User
            </Button>
            <InviteDialog
              open={inviteDialogOpen}
              onOpenChange={setInviteDialogOpen}
              isSuperadmin={isSuperadmin}
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>{users.length} user{users.length === 1 ? "" : "s"} loaded.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        u.role === "superadmin"
                          ? "destructive"
                          : u.role === "admin"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {u.role === "superadmin" ? "Superadmin" : u.role === "admin" ? "Admin" : "User"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {nextCursor && (
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={loadMore} disabled={loading}>
                {loading && <Spinner data-icon="inline-start" />}
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isSuperadmin && initialInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              {initialInvites.length} invitation{initialInvites.length === 1 ? "" : "s"} pending.
            </CardDescription>
          </CardHeader>
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
        </Card>
      )}
    </div>
  );
}

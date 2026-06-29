import { requireAuth } from "@/utils/guards";
import { redirect } from "next/navigation";
import { getPendingInvitesAction } from "@/_features/admin/server/actions";
import { InviteClient } from "./invite-client";

export default async function AdminInvitePage() {
  const session = await requireAuth();
  if (session.user.role !== "superadmin" && session.user.role !== "admin") {
    redirect("/app/profile");
  }

  const result = await getPendingInvitesAction();

  const invites = result.success ? result.data : [];

  return (
    <InviteClient
      initialInvites={invites}
      currentUserRole={session.user.role}
    />
  );
}

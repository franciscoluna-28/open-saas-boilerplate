import { requireAuth } from "@/utils/guards";
import { redirect } from "next/navigation";
import { getUsers, getPendingInvites } from "@/_features/admin/server/queries";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  const session = await requireAuth();
  if (session.user.role !== "superadmin" && session.user.role !== "admin") {
    redirect("/app/profile");
  }

  const { users, nextCursor } = await getUsers();
  const invites = await getPendingInvites();

  return (
    <AdminClient
      initialUsers={users}
      initialNextCursor={nextCursor}
      initialInvites={invites}
      currentUserRole={session.user.role}
    />
  );
}

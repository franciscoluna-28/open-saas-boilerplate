import { getSession } from "@/_features/auth/server/actions";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <ProfileClient user={session.user} />;
}

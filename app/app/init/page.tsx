import { getSession } from "@/_features/auth/server/actions";
import { redirect } from "next/navigation";
import { InitClient } from "./init-client";

export default async function InitPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <InitClient user={session.user} />;
}

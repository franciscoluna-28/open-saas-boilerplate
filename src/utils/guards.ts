import { getSession } from "@/_features/auth/server/actions";
import { redirect } from "next/navigation";

export const requireAuth = async () => {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
};

export const requireAdmin = async () => {
  const session = await requireAuth();
  if (session.user.role !== "admin") redirect("/app/dashboard");
  return session;
};

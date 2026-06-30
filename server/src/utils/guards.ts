import { getSession } from "@/_features/auth/server/actions";
import { redirect } from "next/navigation";

export const requireAuth = async () => {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.banned) redirect("/login?banned=true");
  return session;
};

export const requireAdmin = async () => {
  const session = await requireAuth();
  if (session.user.role !== "admin" && session.user.role !== "superadmin") {
    redirect("/app/feed");
  }
  return session;
};

export const requireSuperAdmin = async () => {
  const session = await requireAuth();
  if (session.user.role !== "superadmin") redirect("/app/feed");
  return session;
};

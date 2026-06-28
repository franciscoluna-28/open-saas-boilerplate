import { requireAuth } from "@/utils/guards";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();
  return <>{children}</>;
}

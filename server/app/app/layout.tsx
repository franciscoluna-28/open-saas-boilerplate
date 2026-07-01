import { requireAuth } from "@/utils/guards";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./app-sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar userRole={session.user.role} />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 px-4 border-b">
            <SidebarTrigger />
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

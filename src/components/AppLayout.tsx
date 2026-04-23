import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-10 flex items-center border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30 md:flex hidden">
            <SidebarTrigger className="ml-2" />
          </header>
          {/* Mobile trigger - floating */}
          {isMobile && (
            <div className="fixed top-3 left-3 z-50 md:hidden">
              <SidebarTrigger className="bg-card shadow-md border border-border rounded-lg" />
            </div>
          )}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

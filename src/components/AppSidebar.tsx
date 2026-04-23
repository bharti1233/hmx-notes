import { StickyNote, LayoutGrid, Archive, Trash2, Settings, MessageCircle } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { HmxLogo } from '@/components/HmxLogo';
import { AIChatPanel } from '@/components/AIChatPanel';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const navItems = [
  { title: 'Notes', url: '/', icon: StickyNote, end: true },
  { title: 'Templates', url: '/templates', icon: LayoutGrid },
  { title: 'Archive', url: '/archive', icon: Archive },
  { title: 'Trash', url: '/trash', icon: Trash2 },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-1 py-1">
            <HmxLogo size={28} />
            {!collapsed && (
              <span className="font-display font-bold text-sm text-foreground">HMX Notes</span>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.end ? location.pathname === item.url : location.pathname.startsWith(item.url)}
                      tooltip={item.title}
                    >
                      <NavLink to={item.url} end={item.end}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>AI</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="AI Chat"
                    onClick={() => setChatOpen(true)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>AI Chat</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          {!collapsed && (
            <p className="text-[10px] text-muted-foreground text-center py-1">
              HMX Notes v1.0
            </p>
          )}
        </SidebarFooter>
      </Sidebar>

      {/* AI Chat Sheet */}
      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent side="left" className="w-[340px] sm:w-[400px] p-0">
          <AIChatPanel />
        </SheetContent>
      </Sheet>
    </>
  );
}

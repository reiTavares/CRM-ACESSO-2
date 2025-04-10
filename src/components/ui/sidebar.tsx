import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Settings,
  Users,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  UserCircle,
  Sun,
  Moon,
  Trash
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/theme-provider";
import { useMobile } from "@/hooks/use-mobile";
import { useProfilesData } from "@/hooks/useProfilesData";

type SidebarItemType = {
  path: string;
  label: string;
  icon: React.ReactNode;
  children?: SidebarItemType[];
  onClick?: () => void;
}

const menuItems: SidebarItemType[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    path: "/pacientes",
    label: "Pacientes",
    icon: <Users className="h-4 w-4" />,
  },
  {
    path: "/configuracoes",
    label: "Configurações",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    path: "/profile",
    label: "Perfil Usuário",
    icon: <UserCircle className="h-4 w-4" />,
  }
];

export function Sidebar() {
  const location = useLocation();
  const { isMobile } = useMobile();
  const [isOpen, setIsOpen] = React.useState(!isMobile);
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { profiles } = useProfilesData();

  // Find the current user's profile to get their name
  const currentUserProfile = profiles.find(profile => profile.id === user?.id);
  const userName = currentUserProfile?.nome || user?.user_metadata?.nome || "Usuário";

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    if (!isMobile) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isMobile]);

  return (
    <>
      {isMobile && (
        <Button
          variant="outline"
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 text-muted-foreground md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full min-h-screen w-64 flex-col border-r transition-transform duration-300 ease-in-out ${
          isMobile
            ? isOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b px-4">
          <Link to="/dashboard" className="flex items-center space-x-2 font-semibold">
            <span>Logo</span>
          </Link>
          {!isMobile && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleSidebar} 
              className="md:flex"
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <div className="mb-4 flex items-center justify-between px-2">
            <span className="text-sm font-medium">Tema</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
          
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <SidebarCollapsibleItem item={item} isOpen={isOpen} />
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
                      location.pathname === item.path
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                    onClick={closeSidebar}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`https://uurjmthjfupxtkxgsowa.supabase.co/storage/v1/object/public/avatars/${user?.id}`} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {userName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm line-clamp-1">{userName}</span>
              <span className="text-xs text-muted-foreground">{currentUserProfile?.nivel_acesso || "Usuário"}</span>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-2" onClick={() => signOut()}>
            Sair
          </Button>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50" 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Space for content when sidebar is open */}
      <div 
        className={`transition-all duration-300 ${
          isOpen && !isMobile ? "ml-64" : "ml-0"
        }`}
      />
    </>
  );
}

interface SidebarCollapsibleItemProps {
  item: SidebarItemType;
  isOpen: boolean;
}

function SidebarCollapsibleItem({ item, isOpen }: SidebarCollapsibleItemProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  React.useEffect(() => {
    if (!isOpen) {
      setIsCollapsed(true);
    }
  }, [isOpen]);

  return (
    <Collapsible onOpenChange={toggleCollapsed} open={!isCollapsed}>
      <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground [&[data-state=open]>svg]:rotate-90">
        <div className="flex items-center space-x-3">
          {item.icon}
          <span>{item.label}</span>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-8">
        <ul className="mt-2 space-y-1">
          {item.children?.map((child) => (
            <li key={child.label}>
              <Link
                to={child.path}
                className={`flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
                  location.pathname === child.path
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
              >
                {child.icon}
                <span>{child.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

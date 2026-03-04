import { Link, useLocation } from "react-router-dom";
import { Settings, Users, BarChart3, UserCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", icon: Send, label: "Send" },
  { to: "/contacts", icon: Users, label: "Contacts" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/profile", icon: UserCircle, label: "Profile" },
];

const AppNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:static md:border-t-0 md:border-b md:bg-transparent md:backdrop-blur-none">
      <div className="mx-auto flex max-w-5xl items-center justify-around md:justify-center md:gap-1 px-2 py-2">
        {links.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors md:flex-row md:gap-2 md:px-4 md:py-2 md:text-sm",
                active
                  ? "text-primary font-medium bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-4 w-4 md:h-4 md:w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AppNav;

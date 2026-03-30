"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Instagram,
  BarChart2,
  CalendarDays,
  Users,
  Newspaper,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Instagram Manager",
    href: "/instagram",
    icon: Instagram,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart2,
  },
  {
    title: "Content Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    title: "Competitor Tracker",
    href: "/competitors",
    icon: Users,
  },
  {
    title: "News Consolidator",
    href: "/news",
    icon: Newspaper,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground">
            CMS Dashboard
          </p>
          <p className="text-xs text-muted-foreground">Content Studio</p>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Navigation
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
                    )}
                  />
                  <span className="flex-1">{item.title}</span>
                  {isActive && (
                    <ChevronRight className="h-3 w-3 text-primary opacity-70" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Footer */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2.5 rounded-lg border border-sidebar-border bg-sidebar-accent px-3 py-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-[10px] font-bold text-white select-none">
            TG
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-sidebar-foreground">@_Trippygrippy_</p>
            <p className="text-[10px] text-muted-foreground">Instagram · Connected</p>
          </div>
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground/50 px-1">v0.1.0 &middot; Dark Mode</p>
      </div>
    </aside>
  );
}

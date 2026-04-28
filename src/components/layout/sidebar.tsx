"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Calendar,
  HelpCircle,
  Users,
  Megaphone,
  UsersRound,
  User,
  MessageSquare,
  BarChart3,
  CalendarDays,
  Settings,
  LogOut,
  ChevronLeft,
  GraduationCap,
  Menu,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["STUDENT", "FACULTY", "ACADEMIC_REP", "ADMIN"],
  },
  {
    title: "Resources",
    href: "/dashboard/resources",
    icon: BookOpen,
    roles: ["STUDENT", "FACULTY", "ACADEMIC_REP", "ADMIN"],
  },
  {
    title: "PYQs",
    href: "/dashboard/pyqs",
    icon: FileText,
    roles: ["STUDENT", "FACULTY", "ACADEMIC_REP", "ADMIN"],
  },
  {
    title: "Timetable",
    href: "/dashboard/timetable",
    icon: Calendar,
    roles: ["STUDENT", "FACULTY", "ACADEMIC_REP", "ADMIN"],
  },
  {
    title: "Query Desk",
    href: "/dashboard/queries",
    icon: HelpCircle,
    roles: ["STUDENT", "FACULTY", "ACADEMIC_REP", "ADMIN"],
  },
  {
    title: "Faculty Connect",
    href: "/dashboard/faculty",
    icon: Users,
    roles: ["STUDENT", "FACULTY", "ACADEMIC_REP", "ADMIN"],
  },
  {
    title: "Announcements",
    href: "/dashboard/announcements",
    icon: Megaphone,
    roles: ["STUDENT", "FACULTY", "ACADEMIC_REP", "ADMIN"],
  },
  {
    title: "Study Groups",
    href: "/dashboard/study-groups",
    icon: UsersRound,
    roles: ["STUDENT", "FACULTY", "ACADEMIC_REP", "ADMIN"],
  },
  {
    title: "Discussion",
    href: "/dashboard/discussion",
    icon: MessageSquare,
    roles: ["STUDENT", "FACULTY", "ACADEMIC_REP", "ADMIN"],
  },
  {
    title: "Academic Calendar",
    href: "/dashboard/calendar",
    icon: CalendarDays,
    roles: ["STUDENT", "FACULTY", "ACADEMIC_REP", "ADMIN"],
  },
];

const adminNavItems = [
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    roles: ["ADMIN", "ACADEMIC_REP"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
];

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "STUDENT";

  const filteredMainNav = mainNavItems.filter((item) =>
    item.roles.includes(userRole)
  );
  const filteredAdminNav = adminNavItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "relative flex flex-col h-full bg-card border-r transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center h-16 px-4 border-b">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="p-1.5 bg-primary rounded-lg">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">AcadConnect</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("ml-auto", isCollapsed && "mx-auto")}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-2 space-y-1">
            {filteredMainNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return isCollapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}

            {filteredAdminNav.length > 0 && (
              <>
                <Separator className="my-4" />
                {filteredAdminNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return isCollapsed ? (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </ScrollArea>

        {/* User Section */}
        <div className="border-t p-4">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/dashboard/profile">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image || ""} />
                      <AvatarFallback>
                        {getInitials(session?.user?.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Profile</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/dashboard/profile">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback>
                    {getInitials(session?.user?.name || "U")}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session?.user?.role}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

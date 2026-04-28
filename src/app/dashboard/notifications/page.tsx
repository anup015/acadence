import { Suspense } from "react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  CheckCircle,
  FileText,
  MessageSquare,
  Megaphone,
  Calendar,
  HelpCircle,
  Trash2,
  Check,
  BellOff,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

interface SearchParams {
  tab?: string;
}

async function getNotifications(userId: string, unreadOnly: boolean) {
  const where: any = {
    userId,
  };

  if (unreadOnly) {
    where.isRead = false;
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return notifications;
}

async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  return count;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "announcement":
      return Megaphone;
    case "query_response":
      return HelpCircle;
    case "material_approved":
      return FileText;
    case "group_activity":
      return MessageSquare;
    case "event_reminder":
      return Calendar;
    default:
      return Bell;
  }
}

function getNotificationColor(type: string) {
  switch (type) {
    case "announcement":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "query_response":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "material_approved":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "group_activity":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "event_reminder":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  }
}

function NotificationCard({ notification }: { notification: any }) {
  const Icon = getNotificationIcon(notification.type);

  return (
    <div
      className={`p-4 rounded-lg border ${
        notification.isRead ? "bg-background" : "bg-muted/50"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between">
            <h3 className="font-medium">{notification.title}</h3>
            {!notification.isRead && (
              <Badge variant="default" className="text-xs">
                New
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(notification.createdAt)}
            </span>
            {notification.link && (
              <Button variant="link" size="sm" className="h-auto p-0" asChild>
                <Link href={notification.link}>View</Link>
              </Button>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          {!notification.isRead && (
            <form action={`/api/notifications/${notification.id}/read`} method="POST">
              <Button variant="ghost" size="icon" className="h-8 w-8" type="submit">
                <Check className="h-4 w-4" />
              </Button>
            </form>
          )}
          <form action={`/api/notifications/${notification.id}/delete`} method="POST">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" type="submit">
              <Trash2 className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

async function NotificationsList({
  userId,
  unreadOnly,
}: {
  userId: string;
  unreadOnly: boolean;
}) {
  const notifications = await getNotifications(userId, unreadOnly);

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        {unreadOnly ? (
          <>
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">All caught up!</h3>
            <p className="text-muted-foreground">
              You have no unread notifications
            </p>
          </>
        ) : (
          <>
            <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No notifications</h3>
            <p className="text-muted-foreground">
              You don&apos;t have any notifications yet
            </p>
          </>
        )}
      </div>
    );
  }

  // Group notifications by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  type NotificationData = { id: string; type: string; title: string; message: string; link: string | null; isRead: boolean; createdAt: Date };
  
  const grouped: {
    today: NotificationData[];
    yesterday: NotificationData[];
    thisWeek: NotificationData[];
    older: NotificationData[];
  } = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  notifications.forEach((notification: NotificationData) => {
    const date = new Date(notification.createdAt);
    if (date >= today) {
      grouped.today.push(notification);
    } else if (date >= yesterday) {
      grouped.yesterday.push(notification);
    } else if (date >= lastWeek) {
      grouped.thisWeek.push(notification);
    } else {
      grouped.older.push(notification);
    }
  });

  return (
    <div className="space-y-6">
      {grouped.today.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Today</h3>
          {grouped.today.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}

      {grouped.yesterday.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Yesterday</h3>
          {grouped.yesterday.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}

      {grouped.thisWeek.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">This Week</h3>
          {grouped.thisWeek.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}

      {grouped.older.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Older</h3>
          {grouped.older.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const params = await searchParams;
  const tab = params.tab || "all";
  const userId = session?.user?.id || "";

  const unreadCount = userId ? await getUnreadCount(userId) : 0;

  if (!session?.user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Please login to view your notifications
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your activity and announcements
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <form action="/api/notifications/read-all" method="POST">
              <Button variant="outline" type="submit">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unreadCount}</p>
              <p className="text-sm text-muted-foreground">Unread notifications</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={tab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" asChild>
            <Link href="/dashboard/notifications?tab=all">All</Link>
          </TabsTrigger>
          <TabsTrigger value="unread" asChild>
            <Link href="/dashboard/notifications?tab=unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Suspense
            fallback={
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4 rounded-lg border">
                    <div className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <NotificationsList userId={userId} unreadOnly={false} />
          </Suspense>
        </TabsContent>

        <TabsContent value="unread">
          <Suspense
            fallback={
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <NotificationsList userId={userId} unreadOnly={true} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

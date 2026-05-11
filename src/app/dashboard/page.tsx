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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  FileText,
  Calendar,
  HelpCircle,
  Megaphone,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Announcement, StudyMaterial, Query } from "@/types";

async function getStudentDashboardData(userId: string) {
  const [
    announcements,
    recentMaterials,
    queries,
    enrollments,
  ] = await Promise.all([
    prisma.announcement.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
      include: { author: { select: { name: true } } },
    }),
    prisma.studyMaterial.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { course: { select: { name: true, code: true } } },
    }),
    prisma.query.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.enrollment.findMany({
      where: { userId },
      include: { course: true },
    }),
  ]);

  return { announcements, recentMaterials, queries, enrollments };
}

async function DashboardStats({ userId }: { userId: string }) {
  const [totalMaterials, totalPYQs, pendingQueries, totalAnnouncements] =
    await Promise.all([
      prisma.studyMaterial.count({ where: { status: "APPROVED" } }),
      prisma.pYQ.count({ where: { status: "APPROVED" } }),
      prisma.query.count({ where: { authorId: userId, status: "PENDING" } }),
      prisma.announcement.count({ where: { isPublished: true } }),
    ]);

  const stats = [
    {
      title: "Study Materials",
      value: totalMaterials,
      icon: BookOpen,
      href: "/dashboard/resources",
      color: "text-blue-500",
    },
    {
      title: "PYQ Papers",
      value: totalPYQs,
      icon: FileText,
      href: "/dashboard/pyqs",
      color: "text-green-500",
    },
    {
      title: "Pending Queries",
      value: pendingQueries,
      icon: HelpCircle,
      href: "/dashboard/queries",
      color: "text-yellow-500",
    },
    {
      title: "Announcements",
      value: totalAnnouncements,
      icon: Megaphone,
      href: "/dashboard/announcements",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function AnnouncementsSection() {
  const announcements = await prisma.announcement.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 5,
    include: { author: { select: { name: true } } },
  });

  const categoryColors: Record<string, string> = {
    exam: "destructive",
    assignment: "warning",
    workshop: "info",
    seminar: "secondary",
    general: "default",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Announcements</CardTitle>
            <CardDescription>Latest updates from faculty and admin</CardDescription>
          </div>
          <Link href="/dashboard/announcements">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No announcements yet
          </p>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement: { id: string; title: string; category: string; content: string; author: { name: string }; publishedAt: Date }) => (
              <div
                key={announcement.id}
                className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <Megaphone className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{announcement.title}</h4>
                    <Badge variant={categoryColors[announcement.category] as any || "default"}>
                      {announcement.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {announcement.content}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>By {announcement.author.name}</span>
                    <span>{formatDate(announcement.publishedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function RecentMaterialsSection() {
  const materials = await prisma.studyMaterial.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      course: { select: { name: true, code: true } },
      uploadedBy: { select: { name: true } },
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Study Materials</CardTitle>
            <CardDescription>Latest uploaded resources</CardDescription>
          </div>
          <Link href="/dashboard/resources">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {materials.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No materials uploaded yet
          </p>
        ) : (
          <div className="space-y-4">
            {materials.map((material: { id: string; title: string; course: { code: string; name: string }; uploadedBy: { name: string | null }; createdAt: Date }) => (
              <div
                key={material.id}
                className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{material.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {material.course.code} - {material.course.name}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>By {material.uploadedBy.name}</span>
                    <span>{formatDate(material.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function QueryStatusSection({ userId }: { userId: string }) {
  const queries = await prisma.query.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const statusIcons: Record<string, React.ReactNode> = {
    PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
    IN_PROGRESS: <AlertCircle className="h-4 w-4 text-blue-500" />,
    RESOLVED: <CheckCircle className="h-4 w-4 text-green-500" />,
    CLOSED: <CheckCircle className="h-4 w-4 text-muted-foreground" />,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Queries</CardTitle>
            <CardDescription>Track your submitted queries</CardDescription>
          </div>
          <Link href="/dashboard/queries">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {queries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No queries submitted yet</p>
            <Link href="/dashboard/queries/new">
              <Button>Submit a Query</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {queries.map((query: { id: string; title: string; status: string; ticketId: string; createdAt: Date }) => (
              <div
                key={query.id}
                className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {statusIcons[query.status]}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{query.title}</h4>
                    <Badge
                      variant={
                        query.status === "RESOLVED"
                          ? "success"
                          : query.status === "PENDING"
                          ? "warning"
                          : "default"
                      }
                    >
                      {query.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ticket: {query.ticketId}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(query.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening in your academic portal today.
        </p>
      </div>

      {/* Stats */}
      <Suspense fallback={<StatsLoading />}>
        <DashboardStats userId={user?.id || ""} />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense
          fallback={
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          }
        >
          <AnnouncementsSection />
        </Suspense>

        <Suspense
          fallback={
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          }
        >
          <RecentMaterialsSection />
        </Suspense>

        <Suspense
          fallback={
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          }
        >
          <QueryStatusSection userId={user?.id || ""} />
        </Suspense>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/resources">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <BookOpen className="h-6 w-6" />
                  <span>Browse Resources</span>
                </Button>
              </Link>
              <Link href="/dashboard/pyqs">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span>Find PYQs</span>
                </Button>
              </Link>
              <Link href="/dashboard/queries/new">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <HelpCircle className="h-6 w-6" />
                  <span>Submit Query</span>
                </Button>
              </Link>
              <Link href="/dashboard/timetable">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  <span>View Timetable</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Users,
  FileText,
  Download,
  Eye,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Calendar,
  BookOpen,
  GraduationCap,
  Activity,
} from "lucide-react";
import { formatDate, BRANCHES } from "@/lib/utils";

async function getAnalytics() {
  const [
    totalUsers,
    totalMaterials,
    totalPYQs,
    totalQueries,
    totalAnnouncements,
    totalGroups,
    usersByRole,
    materialsByBranch,
    queriesByStatus,
    recentActivity,
  ] = await Promise.all([
    // Total counts
    prisma.user.count(),
    prisma.studyMaterial.count({ where: { status: "APPROVED" } }),
    prisma.pYQ.count(),
    prisma.query.count(),
    prisma.announcement.count(),
    prisma.discussionGroup.count(),
    // Users by role
    prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
    }),
    // Materials by branch
    prisma.studyMaterial.groupBy({
      by: ["courseId"],
      where: { status: "APPROVED" },
      _count: { courseId: true },
    }),
    // Queries by status
    prisma.query.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    // Recent activity
    prisma.analyticsEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // Get most downloaded materials
  const topMaterials = await prisma.studyMaterial.findMany({
    where: { status: "APPROVED" },
    orderBy: { downloadCount: "desc" },
    take: 10,
    include: {
      course: { select: { name: true, code: true, branch: true } },
      uploadedBy: { select: { name: true } },
    },
  });

  // Get most common query categories
  const queryCategories = await prisma.query.groupBy({
    by: ["category"],
    _count: { category: true },
    orderBy: { _count: { category: "desc" } },
  });

  return {
    totalUsers,
    totalMaterials,
    totalPYQs,
    totalQueries,
    totalAnnouncements,
    totalGroups,
    usersByRole,
    materialsByBranch,
    queriesByStatus,
    recentActivity,
    topMaterials,
    queryCategories,
  };
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: any;
  trend?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-green-600 text-xs">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function AnalyticsDashboard() {
  const analytics = await getAnalytics();

  const roleColors: Record<string, string> = {
    STUDENT: "bg-green-500",
    FACULTY: "bg-purple-500",
    ACADEMIC_REP: "bg-blue-500",
    ADMIN: "bg-red-500",
  };

  const statusColors: Record<string, string> = {
    OPEN: "bg-yellow-500",
    IN_PROGRESS: "bg-blue-500",
    RESOLVED: "bg-green-500",
    CLOSED: "bg-gray-500",
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Users"
          value={analytics.totalUsers}
          description="Registered users"
          icon={Users}
        />
        <StatCard
          title="Study Materials"
          value={analytics.totalMaterials}
          description="Approved resources"
          icon={FileText}
        />
        <StatCard
          title="PYQs"
          value={analytics.totalPYQs}
          description="Question papers"
          icon={BookOpen}
        />
        <StatCard
          title="Queries"
          value={analytics.totalQueries}
          description="Total queries"
          icon={HelpCircle}
        />
        <StatCard
          title="Announcements"
          value={analytics.totalAnnouncements}
          description="Published"
          icon={Activity}
        />
        <StatCard
          title="Discussion Groups"
          value={analytics.totalGroups}
          description="Active groups"
          icon={MessageSquare}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>Distribution of user roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.usersByRole.map((item: { role: string; _count: { role: number } }) => {
              const percentage =
                (item._count.role / analytics.totalUsers) * 100;
              return (
                <div key={item.role} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${roleColors[item.role]}`}
                      />
                      {item.role}
                    </span>
                    <span className="font-medium">
                      {item._count.role} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Query Status */}
        <Card>
          <CardHeader>
            <CardTitle>Query Status</CardTitle>
            <CardDescription>Current query distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.queriesByStatus.map((item: { status: string; _count: { status: number } }) => {
              const percentage =
                analytics.totalQueries > 0
                  ? (item._count.status / analytics.totalQueries) * 100
                  : 0;
              return (
                <div key={item.status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          statusColors[item.status] || "bg-gray-500"
                        }`}
                      />
                      {item.status.replace("_", " ")}
                    </span>
                    <span className="font-medium">
                      {item._count.status} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Downloaded Materials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Top Downloaded Materials
            </CardTitle>
            <CardDescription>Most popular study resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topMaterials.map((material: { id: string; title: string; downloadCount: number; course: { code: string; branch: string } }, index: number) => (
                <div
                  key={material.id}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{material.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {material.course.code} • {material.course.branch}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{material.downloadCount}</p>
                    <p className="text-xs text-muted-foreground">downloads</p>
                  </div>
                </div>
              ))}
              {analytics.topMaterials.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No materials uploaded yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Query Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Common Query Categories
            </CardTitle>
            <CardDescription>Most frequent query types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.queryCategories.map((category: { category: string; _count: { category: number } }, index: number) => {
                const percentage =
                  analytics.totalQueries > 0
                    ? (category._count.category / analytics.totalQueries) * 100
                    : 0;
                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {category.category.replace("_", " ")}
                      </span>
                      <span>
                        {category._count.category} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
              {analytics.queryCategories.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No queries submitted yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const session = await auth();

  // Check if user is admin
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of platform usage and statistics
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Suspense
            fallback={
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-24" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-32 mt-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-48 w-full" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-48 w-full" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            }
          >
            <AnalyticsDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage platform users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                User management interface coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>
                Review and moderate uploaded content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Content moderation interface coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

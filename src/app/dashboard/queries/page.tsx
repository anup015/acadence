import { Suspense } from "react";
import Link from "next/link";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HelpCircle,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { formatDate, QUERY_CATEGORIES } from "@/lib/utils";

async function getUserQueries(userId: string, status?: string) {
  const where: any = { authorId: userId };
  if (status && status !== "all") {
    where.status = status;
  }

  return prisma.query.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      responses: {
        include: { author: { select: { name: true, role: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

async function getAllQueries(status?: string) {
  const where: any = {};
  if (status && status !== "all") {
    where.status = status;
  }

  return prisma.query.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
      responses: {
        include: { author: { select: { name: true, role: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    variant: "warning" as const,
    color: "text-yellow-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: AlertCircle,
    variant: "info" as const,
    color: "text-blue-500",
  },
  RESOLVED: {
    label: "Resolved",
    icon: CheckCircle,
    variant: "success" as const,
    color: "text-green-500",
  },
  CLOSED: {
    label: "Closed",
    icon: CheckCircle,
    variant: "secondary" as const,
    color: "text-muted-foreground",
  },
};

function QueryCard({ query, showAuthor = false }: { query: any; showAuthor?: boolean }) {
  const status = statusConfig[query.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;
  const category = QUERY_CATEGORIES.find((c) => c.value === query.category);

  return (
    <Link href={`/dashboard/queries/${query.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${status.color}`} />
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {query.ticketId}
            </span>
          </div>
          <CardTitle className="text-lg line-clamp-2">{query.title}</CardTitle>
          <CardDescription>
            <Badge variant="outline">{category?.label}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {query.description}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {showAuthor ? (
              <span>By {query.author?.name}</span>
            ) : (
              <span>Created {formatDate(query.createdAt)}</span>
            )}
            {query.responses.length > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {query.responses.length} response(s)
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

async function QueriesList({
  userId,
  status,
  isStaff,
}: {
  userId: string;
  status?: string;
  isStaff: boolean;
}) {
  const queries = isStaff
    ? await getAllQueries(status)
    : await getUserQueries(userId, status);

  if (queries.length === 0) {
    return (
      <div className="text-center py-12">
        <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No queries found</h3>
        <p className="text-muted-foreground mb-4">
          {isStaff
            ? "No queries to review at the moment"
            : "You haven't submitted any queries yet"}
        </p>
        {!isStaff && (
          <Link href="/dashboard/queries/new">
            <Button>Submit Your First Query</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {queries.map((query: { id: string; ticketId: string; title: string; description: string; category: string; status: string; priority: number; votes: number; createdAt: Date; updatedAt: Date; author?: { name: string | null }; _count?: { responses: number } }) => (
        <QueryCard key={query.id} query={query} showAuthor={isStaff} />
      ))}
    </div>
  );
}

export default async function QueriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const userId = session?.user?.id || "";
  const isStaff = ["FACULTY", "ACADEMIC_REP", "ADMIN"].includes(
    session?.user?.role || ""
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Query Desk</h1>
          <p className="text-muted-foreground">
            {isStaff
              ? "Review and respond to student queries"
              : "Submit and track your academic queries"}
          </p>
        </div>
        {!isStaff && (
          <Link href="/dashboard/queries/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Query
            </Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue={params.status || "all"} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
          <TabsTrigger value="RESOLVED">Resolved</TabsTrigger>
          <TabsTrigger value="CLOSED">Closed</TabsTrigger>
        </TabsList>

        {["all", "PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
          <TabsContent key={status} value={status}>
            <Suspense
              fallback={
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-full" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-16 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              }
            >
              <QueriesList
                userId={userId}
                status={status === "all" ? undefined : status}
                isStaff={isStaff}
              />
            </Suspense>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

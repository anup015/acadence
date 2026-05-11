import { Suspense } from "react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Search,
  Plus,
  Users,
  Hash,
  Clock,
  MessageCircle,
} from "lucide-react";
import { BRANCHES, SEMESTERS, formatRelativeTime, getInitials } from "@/lib/utils";
import Link from "next/link";

interface SearchParams {
  search?: string;
  type?: string;
  branch?: string;
}

async function getDiscussionGroups(
  search: string,
  type: string,
  branch: string,
  userId: string
) {
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (type && type !== "all") {
    where.type = type;
  }

  if (branch && branch !== "all") {
    where.branch = branch;
  }

  const groups = await prisma.discussionGroup.findMany({
    where,
    include: {
      _count: {
        select: { posts: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return groups;
}

async function getMyDiscussions(userId: string) {
  const groups = await prisma.discussionGroup.findMany({
    where: {
      isActive: true,
    },
    include: {
      _count: {
        select: { posts: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return groups;
}

function getTypeColor(type: string) {
  switch (type) {
    case "branch":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "year":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "subject":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "general":
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  }
}

function DiscussionGroupCard({
  group,
  isMember = false,
}: {
  group: any;
  isMember?: boolean;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg ${getTypeColor(group.type)}`}
            >
              <Hash className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {group.name}
              </CardTitle>
              <CardDescription>
                {group.description?.substring(0, 50) || "Discussion group"}
              </CardDescription>
            </div>
          </div>
          <Badge className={getTypeColor(group.type)}>
            {group.type.charAt(0).toUpperCase() + group.type.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {group.branch && (
          <Badge variant="outline">{group.branch}</Badge>
        )}
        {group.year && (
          <Badge variant="outline">Year {group.year}</Badge>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {group._count.posts} posts
          </span>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        {isMember ? (
          <Button className="w-full" asChild>
            <Link href={`/dashboard/discussions/${group.id}`}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Open Discussion
            </Link>
          </Button>
        ) : (
          <Button className="w-full" variant="outline" asChild>
            <Link href={`/dashboard/discussions/${group.id}/join`}>
              <Users className="h-4 w-4 mr-2" />
              Join Group
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

async function AllGroupsList({
  search,
  type,
  branch,
  userId,
}: {
  search: string;
  type: string;
  branch: string;
  userId: string;
}) {
  const groups = await getDiscussionGroups(search, type, branch, userId);

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No discussion groups found</h3>
        <p className="text-muted-foreground mb-4">
          {search || type !== "all" || branch !== "all"
            ? "Try adjusting your filters"
            : "Be the first to create a discussion group!"}
        </p>
        <Button asChild>
          <Link href="/dashboard/discussions/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Link>
        </Button>
      </div>
    );
  }

  type GroupData = { id: string; name: string; description: string | null; type: string; branch: string | null; year: number | null; _count: { posts: number } };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group: GroupData) => (
        <DiscussionGroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}

async function MyGroupsList({ userId }: { userId: string }) {
  const groups = await getMyDiscussions(userId);

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No groups yet</h3>
        <p className="text-muted-foreground mb-4">
          You haven&apos;t joined any discussion groups yet
        </p>
        <Button asChild>
          <Link href="/dashboard/discussions?tab=browse">
            <Search className="h-4 w-4 mr-2" />
            Browse Groups
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group: { id: string; name: string; description: string | null; type: string; branch: string | null; year: number | null; _count: { posts: number } }) => (
        <DiscussionGroupCard key={group.id} group={group} isMember />
      ))}
    </div>
  );
}

export default async function DiscussionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const params = await searchParams;

  const search = params.search || "";
  const type = params.type || "all";
  const branch = params.branch || "all";
  const tab = (params as any).tab || "my-groups";
  const userId = session?.user?.id || "";

  const GROUP_TYPES = [
    { value: "branch", label: "Branch" },
    { value: "year", label: "Year" },
    { value: "subject", label: "Subject" },
    { value: "general", label: "General" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discussions</h1>
          <p className="text-muted-foreground">
            Join discussions with your branch and year peers
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/discussions/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Link>
        </Button>
      </div>

      <Tabs defaultValue={tab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-groups" asChild>
            <Link href="/dashboard/discussions?tab=my-groups">
              <MessageSquare className="h-4 w-4 mr-2" />
              My Groups
            </Link>
          </TabsTrigger>
          <TabsTrigger value="browse" asChild>
            <Link href="/dashboard/discussions?tab=browse">
              <Search className="h-4 w-4 mr-2" />
              Browse All
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="space-y-6">
          <Suspense
            fallback={
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          >
            {userId ? (
              <MyGroupsList userId={userId} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Please login to see your groups
                </p>
              </div>
            )}
          </Suspense>
        </TabsContent>

        <TabsContent value="browse" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <form className="grid gap-4 md:grid-cols-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="search"
                    placeholder="Search groups..."
                    defaultValue={search}
                    className="pl-8"
                  />
                </div>
                <Select name="type" defaultValue={type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {GROUP_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Select name="branch" defaultValue={branch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {BRANCHES.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="submit">Filter</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Groups List */}
          <Suspense
            fallback={
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          >
            <AllGroupsList search={search} type={type} branch={branch} userId={userId} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

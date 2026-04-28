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
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Search,
  Plus,
  BookOpen,
  Calendar,
  Target,
  Clock,
  Crown,
  UserPlus,
  CheckCircle,
} from "lucide-react";
import { BRANCHES, formatDate, getInitials } from "@/lib/utils";
import Link from "next/link";

interface SearchParams {
  search?: string;
  subject?: string;
  type?: string;
  tab?: string;
}

async function getStudyGroups(search: string, subject: string, type: string) {
  const where: any = {
    isActive: true,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (subject && subject !== "all") {
    where.subject = subject;
  }

  if (type && type !== "all") {
    where.type = type;
  }

  const groups = await prisma.studyGroup.findMany({
    where,
    include: {
      course: {
        select: { name: true, code: true },
      },
      leader: {
        select: { id: true, name: true, image: true },
      },
      _count: {
        select: { members: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return groups;
}

async function getMyGroups(userId: string) {
  const groups = await prisma.studyGroup.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      course: {
        select: { name: true, code: true },
      },
      leader: {
        select: { id: true, name: true, image: true },
      },
      _count: {
        select: { members: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return groups;
}

async function getSubjects() {
  const courses = await prisma.course.findMany({
    select: { id: true, name: true, code: true },
    orderBy: { code: "asc" },
  });
  return courses;
}

function StudyGroupCard({
  group,
  isMember = false,
}: {
  group: any;
  isMember?: boolean;
}) {
  const memberProgress =
    group.maxMembers > 0
      ? (group._count.members / group.maxMembers) * 100
      : 0;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "exam_prep":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "subject_study":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "project":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "general":
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "exam_prep":
        return "Exam Prep";
      case "subject_study":
        return "Subject Study";
      case "project":
        return "Project";
      default:
        return "General";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {group.name}
              {isMember && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </CardTitle>
            <CardDescription>
              {group.course ? `${group.course.code} - ${group.course.name}` : group.subject}
            </CardDescription>
          </div>
          <Badge className={getTypeColor(group.type)}>{getTypeLabel(group.type)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {group.description || "No description provided"}
        </p>

        {/* Group Leader */}
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-500" />
          <Avatar className="h-6 w-6">
            <AvatarImage src={group.leader?.image || ""} />
            <AvatarFallback className="text-xs">
              {getInitials(group.leader?.name || "L")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{group.leader?.name}</span>
        </div>

        {/* Member Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              Members
            </span>
            <span>
              {group._count.members}/{group.maxMembers || "∞"}
            </span>
          </div>
          {group.maxMembers > 0 && (
            <Progress value={memberProgress} className="h-2" />
          )}
        </div>

        {/* Meeting Schedule */}
        {group.meetingSchedule && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{group.meetingSchedule}</span>
          </div>
        )}

        {/* Goals */}
        {group.goals && group.goals.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Goals</span>
            </div>
            <ul className="text-sm text-muted-foreground pl-6 space-y-1">
              {group.goals.slice(0, 2).map((goal: string, i: number) => (
                <li key={i} className="list-disc">
                  {goal}
                </li>
              ))}
              {group.goals.length > 2 && (
                <li className="text-primary">+{group.goals.length - 2} more</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        {isMember ? (
          <Button className="w-full" asChild>
            <Link href={`/dashboard/study-groups/${group.id}`}>
              <BookOpen className="h-4 w-4 mr-2" />
              Open Group
            </Link>
          </Button>
        ) : (
          <Button
            className="w-full"
            variant="outline"
            disabled={group.maxMembers > 0 && group._count.members >= group.maxMembers}
            asChild
          >
            <Link href={`/dashboard/study-groups/${group.id}/join`}>
              <UserPlus className="h-4 w-4 mr-2" />
              {group.maxMembers > 0 && group._count.members >= group.maxMembers
                ? "Group Full"
                : "Join Group"}
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

async function AllGroupsList({
  search,
  subject,
  type,
}: {
  search: string;
  subject: string;
  type: string;
}) {
  const groups = await getStudyGroups(search, subject, type);

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No study groups found</h3>
        <p className="text-muted-foreground mb-4">
          {search || subject !== "all" || type !== "all"
            ? "Try adjusting your filters"
            : "Be the first to create a study group!"}
        </p>
        <Button asChild>
          <Link href="/dashboard/study-groups/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Study Group
          </Link>
        </Button>
      </div>
    );
  }

  type StudyGroupData = { id: string; name: string; description: string | null; type: string; subject: string; isPublic: boolean; maxMembers: number; meetingSchedule: string | null; goals: string[]; createdAt: Date; createdBy?: { name: string | null }; _count?: { members: number } };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group: StudyGroupData) => (
        <StudyGroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}

async function MyGroupsList({ userId }: { userId: string }) {
  const groups = await getMyGroups(userId);

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No groups yet</h3>
        <p className="text-muted-foreground mb-4">
          You haven&apos;t joined any study groups yet
        </p>
        <Button asChild>
          <Link href="/dashboard/study-groups?tab=browse">
            <Search className="h-4 w-4 mr-2" />
            Browse Groups
          </Link>
        </Button>
      </div>
    );
  }

  type StudyGroupMemberData = { id: string; name: string; description: string | null; type: string; subject: string; isPublic: boolean; maxMembers: number; meetingSchedule: string | null; goals: string[]; createdAt: Date; createdBy?: { name: string | null }; _count?: { members: number } };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group: StudyGroupMemberData) => (
        <StudyGroupCard key={group.id} group={group} isMember />
      ))}
    </div>
  );
}

export default async function StudyGroupsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const params = await searchParams;
  const subjects = await getSubjects();

  const search = params.search || "";
  const subject = params.subject || "all";
  const type = params.type || "all";
  const tab = params.tab || "my-groups";

  const GROUP_TYPES = [
    { value: "subject_study", label: "Subject Study" },
    { value: "exam_prep", label: "Exam Prep" },
    { value: "project", label: "Project" },
    { value: "general", label: "General" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Groups</h1>
          <p className="text-muted-foreground">
            Join or create study groups to collaborate with peers
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/study-groups/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Link>
        </Button>
      </div>

      <Tabs defaultValue={tab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-groups" asChild>
            <Link href="/dashboard/study-groups?tab=my-groups">
              <Users className="h-4 w-4 mr-2" />
              My Groups
            </Link>
          </TabsTrigger>
          <TabsTrigger value="browse" asChild>
            <Link href="/dashboard/study-groups?tab=browse">
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
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          >
            {session?.user?.id ? (
              <MyGroupsList userId={session.user.id} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Please login to see your groups</p>
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
                <Select name="subject" defaultValue={subject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((s: { id: string; code: string; name: string }) => (
                      <SelectItem key={s.id} value={s.code}>
                        {s.code} - {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
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
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          >
            <AllGroupsList search={search} subject={subject} type={type} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

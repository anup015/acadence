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
  GraduationCap,
  Search,
  Mail,
  Clock,
  BookOpen,
  MessageSquare,
  Calendar,
  Building2,
  Phone,
} from "lucide-react";
import { BRANCHES, getInitials } from "@/lib/utils";
import Link from "next/link";

interface SearchParams {
  search?: string;
  branch?: string;
  tab?: string;
}

async function getFaculty(search: string, branch: string) {
  const where: any = {
    role: "FACULTY",
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (branch && branch !== "all") {
    where.facultyProfile = {
      courses: {
        some: { branch },
      },
    };
  }

  const faculty = await prisma.user.findMany({
    where,
    include: {
      facultyProfile: {
        include: {
          courses: {
            select: {
              id: true,
              name: true,
              code: true,
              branch: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return faculty.map((user) => ({
    ...user,
    courses: user.facultyProfile?.courses ?? [],
  }));
}

async function getDiscussions() {
  const discussions = await prisma.discussionGroup.findMany({
    where: {
      type: "subject",
    },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return discussions;
}

function FacultyCard({ faculty }: { faculty: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={faculty.image || ""} />
            <AvatarFallback className="text-lg">
              {getInitials(faculty.name || "F")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <CardTitle className="text-lg">{faculty.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {faculty.email}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {faculty.courses && faculty.courses.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </p>
            <div className="flex flex-wrap gap-2">
              {faculty.courses.map((course: any) => (
                <Badge key={course.id} variant="secondary">
                  {course.code}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={`mailto:${faculty.email}`}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </a>
        </Button>
        <Button size="sm" asChild>
          <Link href={`/dashboard/faculty/${faculty.id}`}>
            <MessageSquare className="h-4 w-4 mr-2" />
            View Profile
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function SubjectChannelCard({ discussion }: { discussion: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{discussion.name}</CardTitle>
            <CardDescription>
              {discussion.description || "Subject discussion channel"}
            </CardDescription>
          </div>
          <Badge variant="outline">{discussion.branch}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          Year {discussion.year}
        </p>
      </CardContent>
      <CardFooter className="border-t pt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            {discussion._count.posts} posts
          </span>
        </div>
        <Button size="sm" asChild>
          <Link href={`/dashboard/discussions/${discussion.id}`}>Join</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

async function FacultyList({
  search,
  branch,
}: {
  search: string;
  branch: string;
}) {
  const faculty = await getFaculty(search, branch);

  if (faculty.length === 0) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No faculty found</h3>
        <p className="text-muted-foreground">
          {search ? "Try adjusting your search" : "No faculty members registered yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {faculty.map((f: { id: string; name: string | null; email: string; image: string | null; branch: string | null; bio: string | null; courses?: { id: string; code: string; name: string }[] }) => (
        <FacultyCard key={f.id} faculty={f} />
      ))}
    </div>
  );
}

async function SubjectChannels() {
  const discussions = await getDiscussions();

  if (discussions.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No subject channels</h3>
        <p className="text-muted-foreground">
          Subject-wise discussion channels will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {discussions.map((d) => (
        <SubjectChannelCard key={d.id} discussion={d} />
      ))}
    </div>
  );
}

export default async function FacultyConnectPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const params = await searchParams;

  const search = params.search || "";
  const branch = params.branch || "all";
  const tab = params.tab || "faculty";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Faculty Connect</h1>
        <p className="text-muted-foreground">
          Connect with faculty members and join subject discussions
        </p>
      </div>

      <Tabs defaultValue={tab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="faculty" asChild>
            <Link href="/dashboard/faculty?tab=faculty">
              <GraduationCap className="h-4 w-4 mr-2" />
              Faculty Directory
            </Link>
          </TabsTrigger>
          <TabsTrigger value="channels" asChild>
            <Link href="/dashboard/faculty?tab=channels">
              <MessageSquare className="h-4 w-4 mr-2" />
              Subject Channels
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faculty" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <form className="grid gap-4 md:grid-cols-3">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="search"
                    placeholder="Search faculty by name or email..."
                    defaultValue={search}
                    className="pl-8"
                  />
                </div>
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
                  <Button type="submit">Search</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Faculty List */}
          <Suspense
            fallback={
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          >
            <FacultyList search={search} branch={branch} />
          </Suspense>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <Suspense
            fallback={
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-12 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          >
            <SubjectChannels />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

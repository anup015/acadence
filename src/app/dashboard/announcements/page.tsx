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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Megaphone,
  Search,
  Plus,
  Calendar,
  Pin,
  Bell,
  User,
  BookOpen,
  GraduationCap,
  Wrench,
  PartyPopper,
} from "lucide-react";
import { BRANCHES, formatDate, formatRelativeTime, getInitials } from "@/lib/utils";
import Link from "next/link";

interface SearchParams {
  search?: string;
  category?: string;
  branch?: string;
}

const CATEGORIES = [
  { value: "exam", label: "Exam", icon: BookOpen },
  { value: "assignment", label: "Assignment", icon: GraduationCap },
  { value: "workshop", label: "Workshop", icon: Wrench },
  { value: "seminar", label: "Seminar", icon: Megaphone },
  { value: "event", label: "Event", icon: PartyPopper },
  { value: "general", label: "General", icon: Bell },
];

async function getAnnouncements(
  search: string,
  category: string,
  branch: string
) {
  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category && category !== "all") {
    where.category = category;
  }

  if (branch && branch !== "all") {
    where.OR = [{ targetBranch: branch }, { targetBranch: null }];
  }

  const announcements = await prisma.announcement.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return announcements;
}

function getCategoryIcon(category: string) {
  const cat = CATEGORIES.find((c) => c.value === category);
  return cat?.icon || Bell;
}

function getCategoryColor(category: string) {
  switch (category) {
    case "exam":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "assignment":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "workshop":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "seminar":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "event":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  }
}

async function AnnouncementsList({
  search,
  category,
  branch,
}: {
  search: string;
  category: string;
  branch: string;
}) {
  const announcements = await getAnnouncements(search, category, branch);

  if (announcements.length === 0) {
    return (
      <div className="text-center py-12">
        <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No announcements found</h3>
        <p className="text-muted-foreground">
          {search || category !== "all"
            ? "Try adjusting your filters"
            : "No announcements have been posted yet"}
        </p>
      </div>
    );
  }

  type AnnouncementData = { id: string; title: string; content: string; category: string; targetBranch: string | null; isPinned: boolean; createdAt: Date; author: { name: string | null } };
  const pinnedAnnouncements = announcements.filter((a: AnnouncementData) => a.isPinned);
  const regularAnnouncements = announcements.filter((a: AnnouncementData) => !a.isPinned);

  return (
    <div className="space-y-6">
      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Pin className="h-4 w-4" />
            Pinned Announcements
          </div>
          {pinnedAnnouncements.map((announcement: AnnouncementData) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
          <Separator />
        </div>
      )}

      {/* Regular Announcements */}
      <div className="space-y-4">
        {regularAnnouncements.map((announcement: AnnouncementData) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))}
      </div>
    </div>
  );
}

function AnnouncementCard({ announcement }: { announcement: any }) {
  const CategoryIcon = getCategoryIcon(announcement.category);

  return (
    <Card className={announcement.isPinned ? "border-primary" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg ${getCategoryColor(announcement.category)}`}
            >
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {announcement.title}
                {announcement.isPinned && (
                  <Pin className="h-4 w-4 text-primary" />
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge className={getCategoryColor(announcement.category)}>
                  {announcement.category}
                </Badge>
                {announcement.targetBranch && (
                  <Badge variant="outline">{announcement.targetBranch}</Badge>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatRelativeTime(announcement.createdAt)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground whitespace-pre-wrap">
          {announcement.content}
        </p>
        {announcement.attachmentUrl && (
          <Button variant="link" className="px-0 mt-2" asChild>
            <a href={announcement.attachmentUrl} target="_blank" rel="noopener">
              View Attachment
            </a>
          </Button>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={announcement.author.image || ""} />
            <AvatarFallback className="text-xs">
              {getInitials(announcement.author.name || "U")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            {announcement.author.name}
          </span>
          <Badge variant="secondary" className="text-xs">
            {announcement.author.role}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const params = await searchParams;
  const canCreate =
    session?.user?.role === "FACULTY" ||
    session?.user?.role === "ACADEMIC_REP" ||
    session?.user?.role === "ADMIN";

  const search = params.search || "";
  const category = params.category || "all";
  const branch = params.branch || "all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Stay updated with important notices and events
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/dashboard/announcements/new">
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form className="grid gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search announcements..."
                defaultValue={search}
                className="pl-8"
              />
            </div>
            <Select name="category" defaultValue={category}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
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

      {/* Category Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={category === "all" ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link href="/dashboard/announcements">All</Link>
        </Button>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Button
              key={cat.value}
              variant={category === cat.value ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={`/dashboard/announcements?category=${cat.value}`}>
                <Icon className="h-4 w-4 mr-1" />
                {cat.label}
              </Link>
            </Button>
          );
        })}
      </div>

      {/* Announcements List */}
      <Suspense
        fallback={
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <AnnouncementsList search={search} category={category} branch={branch} />
      </Suspense>
    </div>
  );
}

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  FileText,
  BookOpen,
  Megaphone,
  Users,
  Calendar,
  MessageSquare,
  Download,
  Eye,
} from "lucide-react";
import { BRANCHES, formatDate, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

interface SearchParams {
  q?: string;
  type?: string;
  branch?: string;
}

async function searchAll(query: string, type: string, branch: string) {
  if (!query || query.length < 2) {
    return {
      materials: [],
      pyqs: [],
      announcements: [],
      groups: [],
      events: [],
    };
  }

  const searchTerm = { contains: query, mode: "insensitive" as const };

  const [materials, pyqs, announcements, groups, events] = await Promise.all([
    // Study Materials
    type === "all" || type === "materials"
      ? prisma.studyMaterial.findMany({
          where: {
            OR: [
              { title: searchTerm },
              { description: searchTerm },
            ],
            ...(branch !== "all" && { course: { branch } }),
            status: "APPROVED",
          },
          include: {
            course: { select: { name: true, code: true, branch: true } },
          },
          take: 10,
        })
      : [],
    // PYQs
    type === "all" || type === "pyqs"
      ? prisma.pYQ.findMany({
          where: {
            OR: [
              { title: searchTerm },
            ],
            ...(branch !== "all" && { course: { branch } }),
          },
          include: {
            course: { select: { name: true, code: true, branch: true } },
          },
          take: 10,
        })
      : [],
    // Announcements
    type === "all" || type === "announcements"
      ? prisma.announcement.findMany({
          where: {
            OR: [
              { title: searchTerm },
              { content: searchTerm },
            ],
          },
          take: 10,
        })
      : [],
    // Discussion Groups
    type === "all" || type === "groups"
      ? prisma.discussionGroup.findMany({
          where: {
            OR: [
              { name: searchTerm },
              { description: searchTerm },
            ],
            ...(branch !== "all" && { branch }),
          },
          include: {
            _count: { select: { posts: true } },
          },
          take: 10,
        })
      : [],
    // Academic Events
    type === "all" || type === "events"
      ? prisma.academicEvent.findMany({
          where: {
            OR: [
              { title: searchTerm },
              { description: searchTerm },
            ],
            startDate: { gte: new Date() },
          },
          take: 10,
        })
      : [],
  ]);

  return { materials, pyqs, announcements, groups, events };
}

function ResultCard({
  type,
  icon: Icon,
  title,
  description,
  meta,
  href,
  badge,
}: {
  type: string;
  icon: any;
  title: string;
  description?: string;
  meta?: string;
  href: string;
  badge?: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{title}</h3>
                {badge && (
                  <Badge variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {description}
                </p>
              )}
              {meta && (
                <p className="text-xs text-muted-foreground">{meta}</p>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {type}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

async function SearchResults({
  query,
  type,
  branch,
}: {
  query: string;
  type: string;
  branch: string;
}) {
  const results = await searchAll(query, type, branch);
  const totalResults =
    results.materials.length +
    results.pyqs.length +
    results.announcements.length +
    results.groups.length +
    results.events.length;

  if (!query || query.length < 2) {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Start searching</h3>
        <p className="text-muted-foreground">
          Enter at least 2 characters to search across the platform
        </p>
      </div>
    );
  }

  if (totalResults === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No results found</h3>
        <p className="text-muted-foreground">
          Try different keywords or adjust your filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Found {totalResults} results for &quot;{query}&quot;
      </p>

      {/* Materials */}
      {results.materials.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Study Materials ({results.materials.length})
          </h3>
          {results.materials.map((material: { id: string; title: string; description: string | null; type: string; course: { code: string; branch: string } }) => (
            <ResultCard
              key={material.id}
              type="Material"
              icon={FileText}
              title={material.title}
              description={material.description || undefined}
              meta={`${material.course.code} • ${material.course.branch}`}
              href={`/dashboard/resources?id=${material.id}`}
              badge={material.type}
            />
          ))}
        </div>
      )}

      {/* PYQs */}
      {results.pyqs.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Previous Year Questions ({results.pyqs.length})
          </h3>
          {results.pyqs.map((pyq: { id: string; title: string; year: number; examType: string; course: { code: string } }) => (
            <ResultCard
              key={pyq.id}
              type="PYQ"
              icon={BookOpen}
              title={pyq.title}
              meta={`${pyq.course.code} • ${pyq.year} ${pyq.examType}`}
              href={`/dashboard/pyqs?id=${pyq.id}`}
              badge={pyq.examType}
            />
          ))}
        </div>
      )}

      {/* Announcements */}
      {results.announcements.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Announcements ({results.announcements.length})
          </h3>
          {results.announcements.map((announcement: { id: string; title: string; content: string; category: string; createdAt: Date }) => (
            <ResultCard
              key={announcement.id}
              type="Announcement"
              icon={Megaphone}
              title={announcement.title}
              description={announcement.content.substring(0, 100)}
              meta={formatRelativeTime(announcement.createdAt)}
              href={`/dashboard/announcements?id=${announcement.id}`}
              badge={announcement.category}
            />
          ))}
        </div>
      )}

      {/* Discussion Groups */}
      {results.groups.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Discussion Groups ({results.groups.length})
          </h3>
          {results.groups.map((group) => (
            <ResultCard
              key={group.id}
              type="Group"
              icon={Users}
              title={group.name}
              description={group.description || undefined}
              meta={`${group._count.posts} posts`}
              href={`/dashboard/discussions/${group.id}`}
              badge={group.type}
            />
          ))}
        </div>
      )}

      {/* Events */}
      {results.events.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events ({results.events.length})
          </h3>
          {results.events.map((event: { id: string; title: string; description: string | null; type: string; startDate: Date }) => (
            <ResultCard
              key={event.id}
              type="Event"
              icon={Calendar}
              title={event.title}
              description={event.description || undefined}
              meta={formatDate(event.startDate)}
              href={`/dashboard/calendar?id=${event.id}`}
              badge={event.type}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const query = params.q || "";
  const type = params.type || "all";
  const branch = params.branch || "all";

  const SEARCH_TYPES = [
    { value: "all", label: "All" },
    { value: "materials", label: "Materials" },
    { value: "pyqs", label: "PYQs" },
    { value: "announcements", label: "Announcements" },
    { value: "groups", label: "Groups" },
    { value: "events", label: "Events" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground">
          Search across all resources, announcements, and groups
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="pt-6">
          <form className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Search resources, PYQs, announcements..."
                  defaultValue={query}
                  className="pl-9 h-12 text-lg"
                  autoFocus
                />
              </div>
              <Button type="submit" size="lg">
                Search
              </Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Select name="type" defaultValue={type}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {SEARCH_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select name="branch" defaultValue={branch}>
                <SelectTrigger className="w-[180px]">
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
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {SEARCH_TYPES.map((t) => (
          <Button
            key={t.value}
            variant={type === t.value ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={`/dashboard/search?q=${query}&type=${t.value}&branch=${branch}`}>
              {t.label}
            </Link>
          </Button>
        ))}
      </div>

      {/* Results */}
      <Suspense
        fallback={
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <SearchResults query={query} type={type} branch={branch} />
      </Suspense>
    </div>
  );
}

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  Calendar,
} from "lucide-react";
import { formatDate, formatFileSize, BRANCHES, SEMESTERS, EXAM_TYPES } from "@/lib/utils";

interface SearchParams {
  branch?: string;
  semester?: string;
  year?: string;
  examType?: string;
  search?: string;
}

async function getPYQs(params: SearchParams) {
  const where: any = { status: "APPROVED" };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (params.branch) where.branch = params.branch;
  if (params.semester) where.semester = parseInt(params.semester);
  if (params.year) where.year = parseInt(params.year);
  if (params.examType) where.examType = params.examType;

  const pyqs = await prisma.pYQ.findMany({
    where,
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    include: {
      course: { select: { name: true, code: true } },
      uploadedBy: { select: { name: true } },
    },
  });

  return pyqs;
}

async function PYQsList({ params }: { params: SearchParams }) {
  const pyqs = await getPYQs(params);

  if (pyqs.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No PYQs found</h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {pyqs.map((pyq: { id: string; title: string; description: string | null; year: number; semester: number; branch: string; examType: string; fileUrl: string; solutionUrl: string | null; downloadCount: number; createdAt: Date; course: { code: string; name: string }; uploadedBy: { name: string | null } }) => (
        <Card key={pyq.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <Badge variant="outline">{pyq.year}</Badge>
              </div>
              <Badge variant="secondary">{pyq.branch}</Badge>
            </div>
            <CardTitle className="text-lg line-clamp-2">{pyq.title}</CardTitle>
            <CardDescription>
              {pyq.course.code} - {pyq.course.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>{pyq.examType.replace("-", " ").toUpperCase()}</Badge>
              <Badge variant="outline">Semester {pyq.semester}</Badge>
            </div>
            {pyq.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {pyq.description}
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>By {pyq.uploadedBy.name}</span>
              <span>Semester {pyq.semester}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatDate(pyq.createdAt)}</span>
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {pyq.downloadCount} downloads
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a href={pyq.fileUrl} target="_blank" rel="noopener">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </a>
              </Button>
              <Button size="sm" className="flex-1" asChild>
                <a href={pyq.fileUrl} download>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function PYQsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const params = await searchParams;
  const canUpload = ["FACULTY", "ACADEMIC_REP", "ADMIN"].includes(
    session?.user?.role || ""
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Previous Year Questions</h1>
          <p className="text-muted-foreground">
            Browse and download previous year question papers
          </p>
        </div>
        {canUpload && (
          <Link href="/dashboard/pyqs/upload">
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload PYQ
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form className="grid gap-4 md:grid-cols-6">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search PYQs..."
                defaultValue={params.search}
                className="pl-9"
              />
            </div>
            <Select name="branch" defaultValue={params.branch}>
              <SelectTrigger>
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {BRANCHES.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="semester" defaultValue={params.semester}>
              <SelectTrigger>
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {SEMESTERS.map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="year" defaultValue={params.year}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="examType" defaultValue={params.examType}>
              <SelectTrigger>
                <SelectValue placeholder="Exam Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {EXAM_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="md:col-span-6 md:w-fit md:ml-auto">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* PYQs List */}
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <PYQsList params={params} />
      </Suspense>
    </div>
  );
}

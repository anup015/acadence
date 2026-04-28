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
  BookOpen,
  Download,
  Upload,
  Search,
  Filter,
  FileText,
  Eye,
} from "lucide-react";
import { formatDate, formatFileSize, BRANCHES, SEMESTERS, MATERIAL_TYPES } from "@/lib/utils";

interface SearchParams {
  branch?: string;
  semester?: string;
  type?: string;
  course?: string;
  search?: string;
}

async function getMaterials(params: SearchParams) {
  const where: any = { status: "APPROVED" };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (params.type) {
    where.type = params.type;
  }

  if (params.course) {
    where.courseId = params.course;
  }

  if (params.branch || params.semester) {
    where.course = {};
    if (params.branch) where.course.branch = params.branch;
    if (params.semester) where.course.semester = parseInt(params.semester);
  }

  const materials = await prisma.studyMaterial.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { name: true, code: true, branch: true, semester: true } },
      uploadedBy: { select: { name: true } },
    },
  });

  return materials;
}

async function getCourses() {
  return prisma.course.findMany({
    orderBy: [{ branch: "asc" }, { semester: "asc" }, { name: "asc" }],
  });
}

async function MaterialsList({ params }: { params: SearchParams }) {
  const materials = await getMaterials(params);

  if (materials.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No materials found</h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {materials.map((material: { id: string; title: string; description: string | null; type: string; tags: string[]; fileUrl: string; fileSize: number | null; downloadCount: number; createdAt: Date; course: { code: string; name: string; branch: string }; uploadedBy: { name: string | null } }) => (
        <Card key={material.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <Badge variant="outline">{material.type.replace("_", " ")}</Badge>
              </div>
              <Badge variant="secondary">{material.course.branch}</Badge>
            </div>
            <CardTitle className="text-lg line-clamp-2">{material.title}</CardTitle>
            <CardDescription>
              {material.course.code} - {material.course.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {material.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {material.description}
              </p>
            )}
            <div className="flex flex-wrap gap-1">
              {material.tags.slice(0, 3).map((tag: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {material.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{material.tags.length - 3}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>By {material.uploadedBy.name}</span>
              <span>{formatFileSize(material.fileSize || 0)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatDate(material.createdAt)}</span>
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {material.downloadCount} downloads
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a href={material.fileUrl} target="_blank" rel="noopener">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </a>
              </Button>
              <Button size="sm" className="flex-1" asChild>
                <a href={material.fileUrl} download>
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

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const params = await searchParams;
  const courses = await getCourses();
  const canUpload = ["FACULTY", "ACADEMIC_REP", "ADMIN"].includes(
    session?.user?.role || ""
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
          <p className="text-muted-foreground">
            Browse and download lecture notes, tutorials, and reference materials
          </p>
        </div>
        {canUpload && (
          <Link href="/dashboard/resources/upload">
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Material
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form className="grid gap-4 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search materials..."
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
            <Select name="type" defaultValue={params.type}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {MATERIAL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="md:col-span-5 md:w-fit md:ml-auto">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Materials List */}
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
        <MaterialsList params={params} />
      </Suspense>
    </div>
  );
}

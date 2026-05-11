"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Course = {
  id: string;
  code: string;
  name: string;
  branch: string;
  semester: number;
};

type UploadMaterialFormProps = {
  courses: Course[];
};

export default function UploadMaterialForm({ courses }: UploadMaterialFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("lecture_notes");
  const [tags, setTags] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [fileUrl, setFileUrl] = useState("");
  const [fileSize, setFileSize] = useState<string>("");

  const isValid = useMemo(() => {
    return title.trim().length >= 2 && fileUrl.trim().length > 0 && courseId.length > 0;
  }, [title, fileUrl, courseId]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isValid) {
      setError("Please fill title, file URL, and course.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          type,
          tags: tags
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          courseId,
          fileUrl: fileUrl.trim(),
          fileSize: fileSize.trim() ? Number(fileSize) : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.message || "Failed to upload material.");
        return;
      }

      router.push("/dashboard/resources");
      router.refresh();
    } catch {
      setError("Failed to upload material. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Material</h1>
          <p className="text-muted-foreground">Add a new study resource for students.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/resources">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Material Details</CardTitle>
          <CardDescription>
            Provide metadata and an accessible file URL. Faculty and admins publish directly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Operating Systems Unit 3 Notes"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief overview of the content"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="lecture_notes">Lecture Notes</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="assignment">Assignment</option>
                  <option value="reference">Reference</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <select
                  id="course"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                >
                  {courses.length === 0 ? (
                    <option value="">No courses available</option>
                  ) : (
                    courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name} ({course.branch} S{course.semester})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileUrl">File URL</Label>
              <Input
                id="fileUrl"
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://example.com/your-file.pdf"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fileSize">File Size (bytes, optional)</Label>
                <Input
                  id="fileSize"
                  type="number"
                  min={0}
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  placeholder="1024000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="unit-3, exam, cse"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={isSubmitting || courses.length === 0 || !isValid}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Material
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

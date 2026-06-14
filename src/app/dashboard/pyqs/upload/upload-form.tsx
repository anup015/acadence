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
import { BRANCHES, SEMESTERS, EXAM_TYPES } from "@/lib/utils";

type Course = {
  id: string;
  code: string;
  name: string;
  branch: string;
  semester: number;
};

type PYQUploadFormProps = {
  courses: Course[];
};

export default function PYQUploadForm({ courses }: PYQUploadFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [branch, setBranch] = useState<string>(BRANCHES[0]);
  const [semester, setSemester] = useState<number>(SEMESTERS[0]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [examType, setExamType] = useState<string>(EXAM_TYPES[0].value);
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [fileUrl, setFileUrl] = useState("");

  const isValid = useMemo(() => {
    if (uploadMode === "file") {
      return title.trim().length >= 2 && selectedFile !== null && courseId.length > 0;
    }
    return title.trim().length >= 2 && fileUrl.trim().length > 0 && courseId.length > 0;
  }, [title, fileUrl, selectedFile, uploadMode, courseId]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (uploadMode === "url" && !isValid) {
      setError("Please fill in title, course, and file URL.");
      return;
    }
    if (uploadMode === "file" && !selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    setIsSubmitting(true);
    let finalFileUrl = fileUrl;

    try {
      if (uploadMode === "file" && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const upError = await uploadResponse.json().catch(() => ({}));
          throw new Error(upError.message || "Failed to upload file to server.");
        }

        const uploadData = await uploadResponse.json();
        finalFileUrl = uploadData.fileUrl;
      }

      const response = await fetch("/api/pyqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          branch,
          semester: Number(semester),
          year: Number(year),
          examType,
          courseId,
          fileUrl: finalFileUrl.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.message || "Failed to upload PYQ.");
        return;
      }

      router.push("/dashboard/pyqs");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to upload PYQ. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-dark-text">Upload PYQ Paper</h1>
          <p className="text-muted-foreground">Add a past year question paper for batch reference.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/pyqs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to PYQs
          </Link>
        </Button>
      </div>

      <Card className="bg-white border-paper-border border">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-dark-text">Paper Details</CardTitle>
          <CardDescription>
            Provide exam metadata, semester targets, and upload the question paper document.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold text-xs text-dark-text/85 uppercase tracking-wider">Upload Option</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={uploadMode === "file" ? "default" : "outline"}
                  onClick={() => setUploadMode("file")}
                  className="flex-1"
                >
                  Local Document File (PDF preferred)
                </Button>
                <Button
                  type="button"
                  variant={uploadMode === "url" ? "default" : "outline"}
                  onClick={() => setUploadMode("url")}
                  className="flex-1"
                >
                  Remote Document URL Link
                </Button>
              </div>
            </div>

            {uploadMode === "file" ? (
              <div className="space-y-2">
                <Label htmlFor="fileInput">Choose Paper File</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="fileInput"
                    className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer bg-warm-cream/20 hover:bg-warm-cream/40 border-paper-border transition"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-campus-green" />
                      <p className="mb-2 text-sm text-dark-text/85 font-semibold">
                        Click to select question paper
                      </p>
                      <p className="text-xs text-dark-text/60">
                        PDF, DOCX, DOC files
                      </p>
                    </div>
                    <input
                      id="fileInput"
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.doc"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          if (!title) {
                            const cleanTitle = file.name
                              .substring(0, file.name.lastIndexOf("."))
                              .replace(/[_\-]+/g, " ");
                            setTitle(cleanTitle);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {selectedFile && (
                  <p className="text-sm font-semibold text-campus-green mt-2">
                    Selected file: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="fileUrl">File URL</Label>
                <Input
                  id="fileUrl"
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://example.com/question-paper.pdf"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Paper Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Computer Networks End-Semester 2024 Exam"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include details about syllabus, marks weightage or instructors"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <select
                  id="course"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-dark-text"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                >
                  {courses.length === 0 ? (
                    <option value="">No courses available</option>
                  ) : (
                    courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="examType">Exam Type</Label>
                <select
                  id="examType"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-dark-text"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                >
                  {EXAM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Exam Year</Label>
                <Input
                  id="year"
                  type="number"
                  min={2015}
                  max={2030}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <select
                  id="branch"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-dark-text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <select
                  id="semester"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-dark-text"
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="bg-campus-green text-warm-cream" disabled={isSubmitting || courses.length === 0 || !isValid}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading Paper...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload PYQ
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

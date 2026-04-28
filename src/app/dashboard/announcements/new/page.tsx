"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { announcementSchema, type AnnouncementFormData } from "@/lib/validations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Megaphone } from "lucide-react";
import { BRANCHES } from "@/lib/utils";
import Link from "next/link";

const CATEGORIES = [
  { value: "exam", label: "Exam" },
  { value: "assignment", label: "Assignment" },
  { value: "workshop", label: "Workshop" },
  { value: "seminar", label: "Seminar" },
  { value: "event", label: "Event" },
  { value: "general", label: "General" },
];

export default function NewAnnouncementPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      isPinned: false,
    },
  });

  const isPinned = watch("isPinned");

  const onSubmit = async (data: AnnouncementFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create announcement");
      }

      toast({
        title: "Success",
        description: "Announcement has been published",
      });
      router.push("/dashboard/announcements");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user can create announcements
  const canCreate =
    session?.user?.role === "FACULTY" ||
    session?.user?.role === "ACADEMIC_REP" ||
    session?.user?.role === "ADMIN";

  if (!canCreate) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                Only faculty, academic representatives, and admins can create
                announcements.
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/announcements">Back to Announcements</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/announcements">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Announcement</h1>
          <p className="text-muted-foreground">
            Create a new announcement for students
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Announcement Details</CardTitle>
          <CardDescription>
            Fill in the details below to publish an announcement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter announcement title"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Write your announcement content..."
                rows={6}
                {...register("content")}
              />
              {errors.content && (
                <p className="text-sm text-destructive">
                  {errors.content.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("category", value as any, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetBranch">Target Branch (Optional)</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("targetBranch", value === "all" ? undefined : value, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All branches" />
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
                <p className="text-xs text-muted-foreground">
                  Leave empty to show to all branches
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachmentUrl">Attachment URL (Optional)</Label>
              <Input
                id="attachmentUrl"
                placeholder="https://..."
                {...register("attachmentUrl")}
              />
              <p className="text-xs text-muted-foreground">
                Link to any relevant attachment or document
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPinned"
                checked={isPinned}
                onCheckedChange={(checked) =>
                  setValue("isPinned", checked === true, { shouldValidate: true })
                }
              />
              <Label htmlFor="isPinned" className="cursor-pointer">
                Pin this announcement (will appear at the top)
              </Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish Announcement
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/announcements">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

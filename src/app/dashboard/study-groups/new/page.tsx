"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studyGroupSchema, type StudyGroupFormData } from "@/lib/validations";
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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Plus, X, Users } from "lucide-react";
import Link from "next/link";

const GROUP_TYPES = [
  { value: "subject_study", label: "Subject Study" },
  { value: "exam_prep", label: "Exam Prep" },
  { value: "project", label: "Project" },
  { value: "general", label: "General" },
];

export default function NewStudyGroupPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<StudyGroupFormData>({
    resolver: zodResolver(studyGroupSchema) as any,
    defaultValues: {
      isPublic: true,
      maxMembers: 10,
      goals: [],
    },
  });

  const addGoal = () => {
    if (newGoal.trim()) {
      const updatedGoals = [...goals, newGoal.trim()];
      setGoals(updatedGoals);
      setValue("goals", updatedGoals);
      setNewGoal("");
    }
  };

  const removeGoal = (index: number) => {
    const updatedGoals = goals.filter((_, i) => i !== index);
    setGoals(updatedGoals);
    setValue("goals", updatedGoals);
  };

  const onSubmit = async (data: StudyGroupFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, goals }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create study group");
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: "Study group has been created",
      });
      router.push(`/dashboard/study-groups/${result.id}`);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/study-groups">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Study Group</h1>
          <p className="text-muted-foreground">
            Start a new study group and invite peers to collaborate
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Group Details</CardTitle>
          <CardDescription>
            Fill in the details below to create your study group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name *</Label>
              <Input
                id="name"
                placeholder="e.g., DSA Prep Group"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what your group is about..."
                rows={4}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Group Type *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("type", value as any, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject/Topic *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Data Structures"
                  {...register("subject")}
                />
                {errors.subject && (
                  <p className="text-sm text-destructive">
                    {errors.subject.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxMembers">Maximum Members</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min={2}
                  max={100}
                  placeholder="10"
                  {...register("maxMembers", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for unlimited members
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meetingSchedule">Meeting Schedule</Label>
                <Input
                  id="meetingSchedule"
                  placeholder="e.g., Every Sunday 3 PM"
                  {...register("meetingSchedule")}
                />
              </div>
            </div>

            {/* Goals Section */}
            <div className="space-y-4">
              <Label>Group Goals</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a goal..."
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGoal();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addGoal}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {goals.length > 0 && (
                <div className="space-y-2">
                  {goals.map((goal, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted rounded-lg"
                    >
                      <span className="flex-1 text-sm">{goal}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeGoal(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Users className="mr-2 h-4 w-4" />
                Create Study Group
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/study-groups">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

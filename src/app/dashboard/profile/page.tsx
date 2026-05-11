"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormData } from "@/lib/validations";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  Loader2,
  Camera,
  Shield,
  Bell,
  Settings,
} from "lucide-react";
import { BRANCHES, SEMESTERS, getInitials } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          reset({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            bio: data.bio || "",
            branch: data.branch || "",
            semester: data.semester || undefined,
                rollNumber: data.rollNumber || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session, reset]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: updatedUser.name,
        },
      });

      toast({
        title: "Success",
        description: "Your profile has been updated",
      });
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "FACULTY":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "ACADEMIC_REP":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userData?.image || ""} />
                <AvatarFallback className="text-2xl">
                  {getInitials(userData?.name || session.user.name || "U")}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="outline"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-2xl font-semibold">
                {userData?.name || session.user.name}
              </h2>
              <p className="text-muted-foreground flex items-center gap-2 justify-center md:justify-start">
                <Mail className="h-4 w-4" />
                {userData?.email || session.user.email}
              </p>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Badge className={getRoleBadgeColor(userData?.role || session.user.role || "STUDENT")}>
                  <Shield className="h-3 w-3 mr-1" />
                  {userData?.role || session.user.role}
                </Badge>
                {userData?.branch && (
                  <Badge variant="outline">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {userData.branch}
                  </Badge>
                )}
                {userData?.semester && (
                  <Badge variant="outline">
                    Semester {userData.semester}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="academic">
            <GraduationCap className="h-4 w-4 mr-2" />
            Academic
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      disabled
                      {...register("email")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    {...register("phone")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    rows={4}
                    {...register("bio")}
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>
                Your academic details and enrollment information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                        <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input
                          id="rollNumber"
                      placeholder="Your roll number"
                          {...register("rollNumber")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select
                      defaultValue={userData?.branch}
                      onValueChange={(value) =>
                        setValue("branch", value, { shouldValidate: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRANCHES.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      defaultValue={userData?.semester?.toString()}
                      onValueChange={(value) =>
                        setValue("semester", parseInt(value), { shouldValidate: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEMESTERS.map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year of Joining</Label>
                    <Input
                      value={
                        userData?.createdAt
                          ? new Date(userData.createdAt).getFullYear().toString()
                          : "-"
                      }
                      disabled
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Announcement Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new announcements
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Query Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications when your queries are answered
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Study Group Activity</Label>
                    <p className="text-sm text-muted-foreground">
                      Updates from your study groups
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

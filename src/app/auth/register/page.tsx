"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, GraduationCap, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { BRANCHES, YEARS, SEMESTERS } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      role: "STUDENT",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      toast({
        title: "Account created",
        description: "You can now sign in with your credentials.",
      });

      router.push("/auth/login");
    } catch (error) {
      const err = error as { message?: string };
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-warm-cream p-4 overflow-hidden selection:bg-parchment-gold/40">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-dot-grid pointer-events-none" />
      <div className="absolute inset-0 bg-noise-overlay opacity-[0.015] pointer-events-none mix-blend-overlay" />

      <Card className="w-full max-w-lg relative bg-white border border-paper-border shadow-xl rounded-2xl z-10 p-2">
        <div className="absolute inset-0 -z-10 translate-x-1.5 translate-y-1.5 rounded-2xl border border-paper-border bg-white/60 shadow-lg" />

        <CardHeader className="space-y-2 text-center pb-4">
          <div className="flex justify-between items-center px-2">
            <Link href="/" className="flex items-center gap-1 text-xs font-semibold text-campus-green hover:underline">
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
            <span className="text-[10px] font-bold tracking-widest text-campus-green uppercase">Onboarding</span>
          </div>

          <div className="flex justify-center pt-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-campus-green text-warm-cream shadow-sm">
              <GraduationCap className="h-7 w-7" />
            </div>
          </div>
          <CardTitle className="text-2xl font-display font-extrabold text-dark-text tracking-tight">Create an Account</CardTitle>
          <CardDescription className="text-dark-text/60">
            Join AcadConnect to centralize and track your courses
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold text-xs text-dark-text/80 uppercase tracking-wider">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  className="text-dark-text bg-white border-paper-border focus:ring-campus-green focus:border-campus-green rounded-lg"
                  {...register("name")}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-xs text-dark-text/80 uppercase tracking-wider">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@college.edu"
                  className="text-dark-text bg-white border-paper-border focus:ring-campus-green focus:border-campus-green rounded-lg"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="font-semibold text-xs text-dark-text/80 uppercase tracking-wider">Select Role</Label>
              <Select
                onValueChange={(value) => setValue("role", value as "STUDENT" | "FACULTY" | "ACADEMIC_REP")}
                defaultValue="STUDENT"
              >
                <SelectTrigger className="border-paper-border focus:ring-campus-green focus:border-campus-green rounded-lg bg-white">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="FACULTY">Faculty</SelectItem>
                  <SelectItem value="ACADEMIC_REP">Academic Representative</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            {(selectedRole === "STUDENT" || selectedRole === "ACADEMIC_REP") && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rollNumber" className="font-semibold text-xs text-dark-text/80 uppercase tracking-wider">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      placeholder="21CSE001"
                      className="text-dark-text bg-white border-paper-border focus:ring-campus-green focus:border-campus-green rounded-lg animate-fade-up"
                      {...register("rollNumber")}
                      disabled={isLoading}
                    />
                    {errors.rollNumber && (
                      <p className="text-sm text-destructive">
                        {errors.rollNumber.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch" className="font-semibold text-xs text-dark-text/80 uppercase tracking-wider">Branch</Label>
                    <Select onValueChange={(value) => setValue("branch", value)}>
                      <SelectTrigger className="border-paper-border focus:ring-campus-green focus:border-campus-green rounded-lg bg-white">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {BRANCHES.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.branch && (
                      <p className="text-sm text-destructive">
                        {errors.branch.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year" className="font-semibold text-xs text-dark-text/80 uppercase tracking-wider">Academic Year</Label>
                    <Select
                      onValueChange={(value) => setValue("year", parseInt(value))}
                    >
                      <SelectTrigger className="border-paper-border focus:ring-campus-green focus:border-campus-green rounded-lg bg-white">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {YEARS.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                            {year === 1
                              ? "st"
                              : year === 2
                              ? "nd"
                              : year === 3
                              ? "rd"
                              : "th"}{" "}
                            Year
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.year && (
                      <p className="text-sm text-destructive">{errors.year.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester" className="font-semibold text-xs text-dark-text/80 uppercase tracking-wider">Current Semester</Label>
                    <Select
                      onValueChange={(value) => setValue("semester", parseInt(value))}
                    >
                      <SelectTrigger className="border-paper-border focus:ring-campus-green focus:border-campus-green rounded-lg bg-white">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {SEMESTERS.map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.semester && (
                      <p className="text-sm text-destructive">
                        {errors.semester.message}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold text-xs text-dark-text/80 uppercase tracking-wider">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="text-dark-text bg-white border-paper-border focus:ring-campus-green focus:border-campus-green rounded-lg"
                  {...register("password")}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-semibold text-xs text-dark-text/80 uppercase tracking-wider">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="text-dark-text bg-white border-paper-border focus:ring-campus-green focus:border-campus-green rounded-lg"
                  {...register("confirmPassword")}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-campus-green hover:bg-campus-green/90 text-warm-cream font-semibold rounded-lg shadow-sm" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
            
            <p className="text-center text-sm text-dark-text/60">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-bold text-campus-green hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

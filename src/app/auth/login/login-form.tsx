"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, GraduationCap, Key, ArrowLeft } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import { loginSchema, type LoginInput } from "@/lib/validations";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password",
        });
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
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

      <Card className="w-full max-w-md relative bg-white border border-paper-border shadow-xl rounded-2xl z-10 p-2">
        <div className="absolute inset-0 -z-10 translate-x-1.5 translate-y-1.5 rounded-2xl border border-paper-border bg-white/60 shadow-lg" />

        <CardHeader className="space-y-2 text-center pb-4">
          <div className="flex justify-between items-center px-2">
            <Link href="/" className="flex items-center gap-1 text-xs font-semibold text-campus-green hover:underline">
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
            <span className="text-[10px] font-bold tracking-widest text-campus-green uppercase">Secure Access</span>
          </div>

          <div className="flex justify-center pt-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-campus-green text-warm-cream shadow-sm">
              <GraduationCap className="h-7 w-7" />
            </div>
          </div>
          <CardTitle className="text-2xl font-display font-extrabold text-dark-text tracking-tight">Welcome to AcadConnect</CardTitle>
          <CardDescription className="text-dark-text/60">
            Sign in to access your batch & academic dashboard
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-xs text-dark-text/80 uppercase tracking-wider">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@college.edu"
                className="text-dark-text bg-white border-paper-border focus:ring-campus-green focus:border-campus-green rounded-lg"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            
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
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Demo Credentials Box */}
            <div className="rounded-xl border border-paper-border bg-warm-cream/50 p-4 space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-campus-green flex items-center gap-1.5">
                <Key className="h-3 w-3 text-campus-green" />
                Quick Access Demo Accounts
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "Student", email: "student@college.edu" },
                  { label: "Faculty", email: "faculty@college.edu" },
                  { label: "Rep", email: "rep@college.edu" },
                  { label: "Admin", email: "admin@college.edu" },
                ].map((demo) => (
                  <button
                    key={demo.label}
                    type="button"
                    onClick={() => {
                      setValue("email", demo.email);
                      setValue("password", "password123");
                    }}
                    className="flex flex-col items-start p-2 rounded-lg border border-paper-border bg-white text-left hover:border-campus-green hover:bg-campus-green/5 transition-all cursor-pointer"
                  >
                    <span className="font-bold text-dark-text">{demo.label}</span>
                    <span className="text-[10px] text-dark-text/60 truncate w-full">{demo.email}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-campus-green text-center font-bold uppercase tracking-wider">
                Click any card to auto-fill details for demo (password: password123)
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-campus-green hover:bg-campus-green/90 text-warm-cream font-semibold rounded-lg shadow-sm" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
            
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-paper-border/70" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-dark-text/40 font-semibold tracking-wider">
                  Or register instead
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-dark-text/60">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-bold text-campus-green hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}


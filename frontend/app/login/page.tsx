"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Loader2, LogIn } from "lucide-react";
import api from "../../lib/api";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      const response = await api.post("/auth/login", data);
      const token = response.data.token;
      
      // Save token to cookies
      Cookies.set("token", token, { expires: 1 }); // Expires in 1 day
      
      // Redirect based on role
      try {
        const decoded = jwtDecode<{role: string}>(token);
        if (decoded.role === "STUDENT") {
          router.push("/student/dashboard");
        } else if (decoded.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else if (decoded.role === "TEACHER") {
          router.push("/teacher/dashboard");
        } else {
          router.push("/dashboard");
        }
      } catch (e) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError("Invalid username or password.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-slate-100/60 rounded-[32px] p-8 md:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-indigo-500/20">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Log in to manage your portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">Username</label>
            <input
              type="text"
              {...register("username")}
              className={`w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm outline-none ${errors.username ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" : ""}`}
              placeholder="johndoe"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.username.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">Password</label>
            <input
              type="password"
              {...register("password")}
              className={`w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm outline-none ${errors.password ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" : ""}`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 mt-4"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8 font-medium">
          Don't have an account?{" "}
          <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
            Register as Student
          </Link>
        </p>
      </div>
    </div>
  );
}

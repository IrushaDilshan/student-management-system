"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";
import api from "../../lib/api";

const registerSchema = z.object({
  username: z.string().min(4, "Username must be at least 4 characters").max(20, "Username too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError("");
    try {
      await api.post("/auth/student/signup", data);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.data) {
        // Handle validation error object or string
        if (typeof err.response.data === "string") {
          setError(err.response.data);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("Registration failed. Please check your details.");
        }
      } else {
        setError("Network error. Please try again later.");
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
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Sign up as a new student</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-sm font-semibold rounded-xl text-center">
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <label className="block text-sm font-bold text-slate-700">Email</label>
            <input
              type="email"
              {...register("email")}
              className={`w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm outline-none ${errors.email ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" : ""}`}
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email.message}</p>}
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
            disabled={isSubmitting || success}
            className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 mt-4"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8 font-medium">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

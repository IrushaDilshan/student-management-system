"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { AlertCircle, BookOpen, Calendar, Clock, GraduationCap } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../lib/api";

interface DecodedToken {
  role: string;
}

interface StudentProfile {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string;
  username: string;
  status: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (decoded.role !== "STUDENT") {
        router.push("/login"); // Role guard
        return;
      }
    } catch {
      router.push("/login");
      return;
    }

    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/students/me");
      setProfile(response.data);
    } catch (error) {
      toast.error("Failed to load student profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isPending = profile?.status === "PENDING";
  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName}`
    : (profile?.username || "Student");

  return (
    <div className="space-y-6 w-full">
      {isPending && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-800">Registration Pending Approval</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your registration is currently under review by the Administrator. You will have full access once approved.
            </p>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-[32px] p-8 lg:p-10 text-white shadow-[0_20px_40px_rgb(59,130,246,0.2)] relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight">Welcome back, {displayName}!</h1>
          <p className="text-blue-100 mb-8 text-lg">Here's an overview of your academic journey.</p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wider shadow-inner">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${isPending ? 'bg-yellow-400 text-yellow-400' : 'bg-green-400 text-green-400'}`}></div>
            {isPending ? 'PENDING APPROVAL' : 'APPROVED'}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 mix-blend-overlay">
          <GraduationCap className="w-80 h-80" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Stats Card */}
        <div className="bg-white rounded-[28px] p-6 lg:p-8 border border-gray-100/50 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300">
          <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100/60">
            <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50/50 text-blue-600 rounded-2xl border border-blue-100/50 shadow-sm shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1 tracking-tight">Total Enrolled Courses</p>
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                {isPending ? "0" : "4"} {/* Mock count for now */}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-purple-50 to-fuchsia-50/50 text-purple-600 rounded-2xl border border-purple-100/50 shadow-sm shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1 tracking-tight">Academic Year</p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">2026/2027</h3>
            </div>
          </div>
        </div>

        {/* Quick Links Card */}
        <div className="bg-white rounded-[28px] p-6 lg:p-8 border border-gray-100/50 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Recent Announcements
          </h3>
          <div className="space-y-4">
            <div className="p-5 bg-gray-50/50 border border-gray-100/60 rounded-[20px] hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
              <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Semester Registration Open</p>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">Please complete your course registration by next week.</p>
            </div>
            <div className="p-5 bg-gray-50/50 border border-gray-100/60 rounded-[20px] hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
              <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Welcome to EduManage</p>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">Explore your new student portal and check out your courses!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="space-y-6 max-w-5xl">
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {displayName}!</h1>
          <p className="text-blue-100 mb-6">Here's an overview of your academic journey.</p>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-sm font-medium">
            <div className={`w-2 h-2 rounded-full ${isPending ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
            {isPending ? 'PENDING APPROVAL' : 'APPROVED'}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/3 -translate-y-1/4">
          <GraduationCap className="w-64 h-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stats Card */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Enrolled Courses</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {isPending ? "0" : "4"} {/* Mock count for now */}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Academic Year</p>
              <h3 className="text-xl font-bold text-gray-900">2026/2027</h3>
            </div>
          </div>
        </div>

        {/* Quick Links Card */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Recent Announcements
          </h3>
          <div className="space-y-4">
            <div className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <p className="text-sm font-medium text-gray-900">Semester Registration Open</p>
              <p className="text-xs text-gray-500 mt-1">Please complete your course registration by next week.</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <p className="text-sm font-medium text-gray-900">Welcome to EduManage</p>
              <p className="text-xs text-gray-500 mt-1">Explore your new student portal and check out your courses!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

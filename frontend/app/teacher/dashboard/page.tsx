"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Loader2, Users, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "../../../lib/api";

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

interface TeacherProfile {
  id: number;
  firstName: string;
  lastName: string;
}

export default function TeacherDashboard() {
  const [coursesCount, setCoursesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (decoded.role === "TEACHER") {
          fetchDashboardData();
        } else {
          setLoading(false);
          toast.error("Access denied. Teachers only.");
        }
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, coursesRes, studentsRes] = await Promise.all([
        api.get("/teacher/dashboard/profile"),
        api.get("/teacher/dashboard/courses"),
        api.get("/teacher/dashboard/students")
      ]);
      
      setProfile(profileRes.data);
      setCoursesCount(coursesRes.data.length);
      setStudentsCount(studentsRes.data.length);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 shadow-lg relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300 opacity-10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile ? `${profile.firstName} ${profile.lastName}` : "Teacher"}!</h1>
          <p className="text-blue-100 text-lg">Here's an overview of your classes today.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 flex items-center gap-6 hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Assigned Courses</p>
            <h3 className="text-4xl font-black text-gray-900 mt-1">{coursesCount}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-6 hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Students Enrolled</p>
            <h3 className="text-4xl font-black text-gray-900 mt-1">{studentsCount}</h3>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/teacher/courses" className="glass-panel p-6 flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <BookOpen className="w-6 h-6 text-gray-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">View My Courses</h3>
                <p className="text-sm text-gray-500">Manage course materials and details</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-all transform group-hover:translate-x-1" />
          </Link>
          
          <Link href="/teacher/students" className="glass-panel p-6 flex items-center justify-between hover:border-indigo-200 hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                <Users className="w-6 h-6 text-gray-500 group-hover:text-indigo-600 transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">View My Students</h3>
                <p className="text-sm text-gray-500">See all enrolled students across your courses</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-all transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

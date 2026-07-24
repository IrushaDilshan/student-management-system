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
    <div className="space-y-6 w-full">
      <div className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[32px] p-8 md:p-10 text-white border-0 shadow-lg relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300 opacity-10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="relative z-10">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-wider rounded-full uppercase border border-white/10">
            Instructor Portal
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-4 mb-2">Welcome back, {profile ? `${profile.firstName} ${profile.lastName}` : "Teacher"}!</h1>
          <p className="text-blue-100 text-lg font-medium">Here's an overview of your classes today.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-white border border-slate-100 rounded-[32px] p-8 flex items-center gap-6 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300">
          <div className="w-16 h-16 bg-blue-50 border border-blue-100/50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Courses</p>
            <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-1">{coursesCount}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[32px] p-8 flex items-center gap-6 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100/50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students Enrolled</p>
            <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-1">{studentsCount}</h3>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-5">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/teacher/courses" className="bg-white border border-slate-100 rounded-[32px] p-6 flex items-center justify-between shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors shadow-sm">
                <BookOpen className="w-6 h-6 text-slate-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 tracking-tight text-lg group-hover:text-blue-700 transition-colors">View My Courses</h3>
                <p className="text-sm text-slate-500 font-medium">Manage course materials and details</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-all transform group-hover:translate-x-1" />
          </Link>
          
          <Link href="/teacher/students" className="bg-white border border-slate-100 rounded-[32px] p-6 flex items-center justify-between shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors shadow-sm">
                <Users className="w-6 h-6 text-slate-500 group-hover:text-indigo-600 transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 tracking-tight text-lg group-hover:text-indigo-700 transition-colors">View My Students</h3>
                <p className="text-sm text-slate-500 font-medium">See all enrolled students across your courses</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-all transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

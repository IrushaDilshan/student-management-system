"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { 
  BookOpen, GraduationCap, Users, UserPlus, 
  ArrowRight, Loader2, ShieldAlert, Activity, Clock
} from "lucide-react";
import Link from "next/link";
import api from "../../../lib/api";

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

interface DashboardStats {
  totalStudents: number;
  pendingApprovals: number;
  totalTeachers: number;
  totalCourses: number;
}

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setRole(decoded.role);
        setUsername(decoded.sub);
        
        if (decoded.role === "ADMIN") {
          fetchStats();
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error("Invalid token");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      
      {/* 1. Hero Welcome Banner */}
      <div className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[32px] p-8 md:p-10 text-white border-0 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-wider rounded-full uppercase border border-white/10">
            System Administrator
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-4 mb-2">Welcome back, {username}!</h1>
          <p className="text-blue-100 text-lg font-medium">Here is what is happening with your system today.</p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 mix-blend-overlay">
          <ShieldAlert className="w-80 h-80" />
        </div>
      </div>

      {role === "ADMIN" && stats && (
        <>
          {/* 2. Stat Cards Section (4 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {/* Total Students */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 border border-blue-100/50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Students</p>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.totalStudents}</h3>
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-5">
              <div className="w-14 h-14 bg-red-50 border border-red-100/50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <UserPlus className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pending Approvals</p>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.pendingApprovals}</h3>
              </div>
            </div>

            {/* Total Teachers */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-5">
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100/50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Teachers</p>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.totalTeachers}</h3>
              </div>
            </div>

            {/* Total Courses */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-100/50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Courses</p>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.totalCourses}</h3>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 3. Two-Column Dashboard Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        
        {/* Left Column (2/3 width) - Quick Actions Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300 h-full">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-400" />
              Quick System Navigation
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Link href="/admin/students" className="flex items-center p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform shadow-sm">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 tracking-tight text-lg">Manage Students</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Review pending approvals</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link href="/admin/teachers" className="flex items-center p-5 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform shadow-sm">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 tracking-tight text-lg">Manage Teachers</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Add or edit faculty</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </Link>
              
              <Link href="/admin/courses" className="flex items-center p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform shadow-sm">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 tracking-tight text-lg">Manage Courses</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Configure academic catalog</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) - System Activity Timeline */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300 h-full">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              System Activity
            </h3>
            
            <div className="relative border-l border-slate-100 ml-3 space-y-8 pb-4">
              {stats && stats.pendingApprovals > 0 && (
                <div className="relative pl-6">
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-white"></div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100/50 uppercase tracking-wider">Action Required</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold"><Clock className="w-3 h-3"/> Just now</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{stats.pendingApprovals} Pending Student Approvals</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">Review the latest student registrations waiting in the queue.</p>
                </div>
              )}

              <div className="relative pl-6">
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white"></div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100/50 uppercase tracking-wider">System</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold"><Clock className="w-3 h-3"/> Today</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-1">Daily Backup Complete</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">The system successfully completed the automated database snapshot.</p>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold"><Clock className="w-3 h-3"/> 2 days ago</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-1">Platform Updated to v1.2</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">Security patches and minor UI improvements were successfully deployed.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

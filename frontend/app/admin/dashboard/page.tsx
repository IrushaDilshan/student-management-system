"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { BookOpen, GraduationCap, Users, UserPlus, ArrowRight, Loader2 } from "lucide-react";
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="glass-panel p-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {username}!</h1>
        <p className="text-gray-500 mt-2">
          You are logged in as <span className="font-semibold text-blue-600">{role}</span>
        </p>
      </div>

      {role === "ADMIN" && stats && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStudents}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
            
            <div className="glass-panel p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                <h3 className="text-3xl font-bold text-red-600 mt-1">{stats.pendingApprovals}</h3>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                <UserPlus className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Teachers</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTeachers}</h3>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Courses</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCourses}</h3>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Quick Links */}
      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Quick Navigation</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href={role === "ADMIN" ? "/admin/courses" : "/courses"} className="glass-panel p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 group">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Courses</h2>
          <p className="text-gray-500 text-sm mt-2 mb-4">View and manage available courses.</p>
          <div className="mt-auto flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Manage Courses <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {(role === "ADMIN" || role === "TEACHER") && (
          <Link href={role === "ADMIN" ? "/admin/students" : "/students"} className="glass-panel p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 group">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
              <Users className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Students</h2>
            <p className="text-gray-500 text-sm mt-2 mb-4">Manage student records and approvals.</p>
            <div className="mt-auto flex items-center gap-1 text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Manage Students <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        )}

        {role === "ADMIN" && (
          <Link href="/admin/teachers" className="glass-panel p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 group">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-600">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Teachers</h2>
            <p className="text-gray-500 text-sm mt-2 mb-4">Manage teacher records and assignments.</p>
            <div className="mt-auto flex items-center gap-1 text-sm font-medium text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Manage Teachers <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

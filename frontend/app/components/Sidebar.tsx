"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { LogOut, LayoutDashboard, Users, BookOpen, GraduationCap, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../../lib/api";

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setRole(decoded.role);
        
        if (decoded.role === "ADMIN") {
          fetchPendingCount();
        }
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, [pathname]);

  const fetchPendingCount = async () => {
    try {
      const response = await api.get("/auth/admin/pending-students");
      setPendingCount(response.data.length);
    } catch (error) {
      console.error("Failed to fetch pending count");
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  // Do not show sidebar on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 glass-panel !rounded-none !border-y-0 !border-l-0 flex flex-col z-50">
      <div className="p-6">
        <Link href={role === "ADMIN" ? "/admin/dashboard" : role === "STUDENT" ? "/student/dashboard" : role === "TEACHER" ? "/teacher/dashboard" : "/dashboard"} className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span>EduManage</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        <Link
          href={role === "ADMIN" ? "/admin/dashboard" : role === "STUDENT" ? "/student/dashboard" : role === "TEACHER" ? "/teacher/dashboard" : "/dashboard"}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
            pathname.includes("/dashboard") 
              ? "bg-blue-50 text-blue-600 border border-blue-100" 
              : "text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>

        {(role === "ADMIN" || role === "TEACHER") && (
          <Link
            href={role === "ADMIN" ? "/admin/students" : "/teacher/students"}
            className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all ${
              pathname.includes("/students") 
                ? "bg-blue-50 text-blue-600 border border-blue-100" 
                : "text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              Students
            </div>
            {role === "ADMIN" && pendingCount > 0 && (
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {pendingCount}
              </span>
            )}
          </Link>
        )}

        {role === "ADMIN" && (
          <Link
            href="/admin/teachers"
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
              pathname.includes("/teachers") 
                ? "bg-blue-50 text-blue-600 border border-blue-100" 
                : "text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent"
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            Teachers
          </Link>
        )}

        <Link
          href={role === "ADMIN" ? "/admin/courses" : role === "STUDENT" ? "/student/courses" : role === "TEACHER" ? "/teacher/courses" : "/courses"}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
            pathname.includes("/courses") 
              ? "bg-blue-50 text-blue-600 border border-blue-100" 
              : "text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          Courses
        </Link>

        {role === "STUDENT" && (
          <Link
            href="/student/profile"
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
              pathname.includes("/profile") 
                ? "bg-blue-50 text-blue-600 border border-blue-100" 
                : "text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent"
            }`}
          >
            <UserIcon className="w-5 h-5" />
            Profile
          </Link>
        )}

        {role === "TEACHER" && (
          <Link
            href="/teacher/profile"
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
              pathname.includes("/profile") 
                ? "bg-blue-50 text-blue-600 border border-blue-100" 
                : "text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent"
            }`}
          >
            <UserIcon className="w-5 h-5" />
            Profile
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 border border-transparent rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}

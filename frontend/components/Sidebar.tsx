"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { LogOut, LayoutDashboard, Users, BookOpen, GraduationCap, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "@/lib/api";

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setRole(decoded.role);
        setUsername(decoded.sub);

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
    <aside className="fixed top-0 left-0 h-screen w-64 bg-slate-50/80 backdrop-blur-md border-r border-slate-200/80 flex flex-col z-50">
      <div className="p-6 border-b border-slate-200/60">
        <Link 
          href={role === "ADMIN" ? "/admin/dashboard" : role === "STUDENT" ? "/student/dashboard" : role === "TEACHER" ? "/teacher/dashboard" : "/dashboard"} 
          className="flex items-center gap-3.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-[0_4px_12px_rgba(99,102,241,0.2)] group-hover:scale-105 transition-transform duration-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">EduManage</span>
            <span className="block text-[9px] text-slate-500 font-semibold uppercase tracking-wider -mt-0.5">Control Center</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        <Link
          href={role === "ADMIN" ? "/admin/dashboard" : role === "STUDENT" ? "/student/dashboard" : role === "TEACHER" ? "/teacher/dashboard" : "/dashboard"}
          className={`flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${
            pathname.includes("/dashboard") 
              ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200" 
              : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 font-medium"
          }`}
        >
          <LayoutDashboard className="w-4.5 h-4.5" />
          Dashboard
        </Link>

        {(role === "ADMIN" || role === "TEACHER") && (
          <Link
            href={role === "ADMIN" ? "/admin/students" : "/teacher/students"}
            className={`flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-all group ${
              pathname.includes("/students") 
                ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200" 
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 font-medium"
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4.5 h-4.5" />
              Students
            </div>
            {role === "ADMIN" && pendingCount > 0 && (
              <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full shadow-[0_2px_8px_rgba(244,63,94,0.15)]">
                {pendingCount}
              </span>
            )}
          </Link>
        )}

        {role === "ADMIN" && (
          <Link
            href="/admin/teachers"
            className={`flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${
              pathname.includes("/teachers") 
                ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200" 
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 font-medium"
            }`}
          >
            <GraduationCap className="w-4.5 h-4.5" />
            Teachers
          </Link>
        )}

        <Link
          href={role === "ADMIN" ? "/admin/courses" : role === "STUDENT" ? "/student/courses" : role === "TEACHER" ? "/teacher/courses" : "/courses"}
          className={`flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${
            pathname.includes("/courses") 
              ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200" 
              : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 font-medium"
          }`}
        >
          <BookOpen className="w-4.5 h-4.5" />
          Courses
        </Link>

        {role === "STUDENT" && (
          <Link
            href="/student/profile"
            className={`flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${
              pathname.includes("/profile") 
                ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200" 
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 font-medium"
          }`}
          >
            <UserIcon className="w-4.5 h-4.5" />
            Profile
          </Link>
        )}

        {role === "TEACHER" && (
          <Link
            href="/teacher/profile"
            className={`flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${
              pathname.includes("/profile") 
                ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200" 
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 font-medium"
            }`}
          >
            <UserIcon className="w-4.5 h-4.5" />
            Profile
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200/60 bg-white">
        {username && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-3 rounded-xl bg-slate-100/80 border border-slate-200/60 text-slate-800">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-extrabold text-white shrink-0 text-sm shadow-[0_2px_8px_rgba(99,102,241,0.15)]">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-slate-800 text-sm truncate">
                {username}
              </div>
              <div className="text-[10px] font-medium text-slate-500 mt-0.5">
                {role ? role.charAt(0) + role.slice(1).toLowerCase() : "User"}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 py-2.5 w-full text-sm font-bold bg-white text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/60 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

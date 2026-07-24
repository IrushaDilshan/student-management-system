"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Loader2, Users, Search, Filter, Mail, Phone, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../lib/api";

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
}

interface User {
  username: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  user: User;
  enrolledCourses: Course[];
}

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

export default function TeacherStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all");

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setRole(decoded.role);
        if (decoded.role === "TEACHER") {
          fetchData();
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, coursesRes] = await Promise.all([
        api.get("/teacher/dashboard/students"),
        api.get("/teacher/dashboard/courses")
      ]);
      setStudents(studentsRes.data);
      setCourses(coursesRes.data);
    } catch (err: any) {
      toast.error("Failed to load students data");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.user && student.user.username.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCourse = 
      selectedCourseFilter === "all" || 
      student.enrolledCourses.some(c => c.id.toString() === selectedCourseFilter);

    return matchesSearch && matchesCourse;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (role !== "TEACHER") {
    return (
      <div className="glass-panel p-12 text-center text-red-500 font-medium">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 md:p-8 rounded-[32px] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Students</h1>
          <p className="text-slate-500 mt-2 text-lg">View and filter students enrolled in your courses.</p>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm outline-none"
          />
        </div>
        
        <div className="relative w-full md:w-72 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm outline-none cursor-pointer text-slate-700 font-semibold appearance-none"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id.toString()}>
                {course.courseCode} - {course.courseName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[32px] p-4 lg:p-8 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 rounded-xl">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tl-2xl">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tr-2xl">Assigned Courses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-900 tracking-tight text-lg">{student.firstName} {student.lastName}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5 text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400"/> {student.email}</span>
                        {student.phone && <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400"/> {student.phone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-200/60">
                        @{student.user?.username || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {student.enrolledCourses
                          .filter(c => courses.some(tc => tc.id === c.id)) // Only show courses taught by this teacher
                          .map(course => {
                            const gradients = [
                              "from-blue-500 to-indigo-600",
                              "from-emerald-400 to-teal-500",
                              "from-orange-400 to-rose-500",
                              "from-purple-500 to-fuchsia-600",
                              "from-cyan-400 to-blue-500",
                              "from-pink-500 to-rose-500"
                            ];
                            const badgeGradient = gradients[course.id % gradients.length];
                            return (
                              <span key={course.id} className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${badgeGradient} text-white shadow-sm`}>
                                {course.courseCode}
                              </span>
                            );
                          })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

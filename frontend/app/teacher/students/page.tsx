"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Loader2, Users, Search, Filter } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-500 mt-1">View and filter students enrolled in your courses.</p>
        </div>
      </div>

      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-white shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
          />
        </div>
        
        <div className="relative w-full md:w-64 flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-white"
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

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Student Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Username</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Assigned Courses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                      {student.phone && <div className="text-xs text-gray-500 mt-1">{student.phone}</div>}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{student.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        @{student.user?.username || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {student.enrolledCourses
                          .filter(c => courses.some(tc => tc.id === c.id)) // Only show courses taught by this teacher
                          .map(course => (
                          <span key={course.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs rounded">
                            {course.courseCode}
                          </span>
                        ))}
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

"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Loader2, Users, BookOpen, ChevronRight, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../lib/api";

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  description: string;
  credits: number;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

export default function TeacherCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  
  // Student modal state
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setRole(decoded.role);
        if (decoded.role === "TEACHER") {
          fetchCourses();
        } else {
          setLoading(false);
          toast.error("Access denied. Teachers only.");
        }
      } catch (e) {
        console.error("Invalid token");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/teacher/dashboard/courses");
      setCourses(response.data);
    } catch (err: any) {
      toast.error("Failed to load assigned courses");
    } finally {
      setLoading(false);
    }
  };

  const viewStudents = async (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
    try {
      setLoadingStudents(true);
      const response = await api.get(`/teacher/dashboard/courses/${course.id}/students`);
      setStudents(response.data);
    } catch (err: any) {
      toast.error("Failed to load enrolled students");
    } finally {
      setLoadingStudents(false);
    }
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500 mt-1">Manage your assigned courses and view enrolled students.</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="glass-panel p-12 text-center text-gray-500">
          You have not been assigned to any courses yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="glass-panel p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {course.courseCode}
                </span>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">{course.courseName}</h2>
              <p className="text-gray-500 text-sm flex-grow mb-4 line-clamp-3">
                {course.description}
              </p>
              
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                <div className="text-sm font-medium text-gray-700">
                  Credits: <span className="ml-2 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{course.credits}</span>
                </div>
                <button 
                  onClick={() => viewStudents(course)}
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  View Students
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enrolled Students Modal */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Enrolled Students
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedCourse.courseCode} - {selectedCourse.courseName}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {loadingStudents ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No students currently enrolled in this course.
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div>
                        <h3 className="font-semibold text-gray-900">{student.firstName} {student.lastName}</h3>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                      {student.phone && (
                        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {student.phone}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
               <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-white transition-colors shadow-sm">
                  Close
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

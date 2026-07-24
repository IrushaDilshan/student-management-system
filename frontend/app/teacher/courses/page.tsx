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
      <div className="flex justify-between items-center bg-white p-6 md:p-8 rounded-[32px] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Courses</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage your assigned courses and view enrolled students.</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 border border-slate-100 text-center text-slate-500 shadow-sm">
          You have not been assigned to any courses yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const gradients = [
              "from-blue-500 to-indigo-600",
              "from-emerald-400 to-teal-500",
              "from-orange-400 to-rose-500",
              "from-purple-500 to-fuchsia-600",
              "from-cyan-400 to-blue-500",
              "from-pink-500 to-rose-500"
            ];
            const bannerGradient = gradients[course.id % gradients.length];
            return (
              <div key={course.id} className="group relative bg-white rounded-[24px] p-5 border border-slate-100/50 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${bannerGradient} text-white shadow-sm flex items-center gap-1.5`}>
                      <BookOpen className="w-3 h-3" />
                      {course.courseCode}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-500 transition-all line-clamp-2">
                    {course.courseName}
                  </h2>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[32px] leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100/50 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    Credits: <span className="w-6 h-6 flex items-center justify-center text-blue-700 bg-blue-50 border border-blue-100/50 rounded-md font-bold text-[10px]">{course.credits}</span>
                  </div>
                  <button 
                    onClick={() => viewStudents(course)}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-all hover:translate-x-0.5"
                  >
                    <Users className="w-4 h-4" />
                    Students
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enrolled Students Modal */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[80vh] flex flex-col border border-slate-100/50">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Enrolled Students
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedCourse.courseCode} - {selectedCourse.courseName}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto">
              {loadingStudents ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No students currently enrolled in this course.
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-4 border border-slate-100/60 rounded-2xl hover:bg-slate-50/50 transition-colors">
                      <div>
                        <h3 className="font-bold text-slate-900 tracking-tight">{student.firstName} {student.lastName}</h3>
                        <p className="text-sm text-slate-500 font-medium">{student.email}</p>
                      </div>
                      {student.phone && (
                        <div className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/50">
                          {student.phone}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 bg-white flex justify-end">
               <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  Close
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

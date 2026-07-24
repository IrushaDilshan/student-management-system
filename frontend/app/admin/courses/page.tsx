"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Loader2, Plus, Edit, Trash2, X, BookOpen, User as UserIcon, GraduationCap, Clock } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../lib/api";

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
}

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  description: string;
  credits: number;
  teacher?: Teacher;
}

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    description: "",
    credits: 3,
    teacherId: "",
  });

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setRole(decoded.role);
      } catch (e) {
        console.error("Invalid token");
      }
    }
    fetchCourses();
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await api.get("/teachers");
      setTeachers(response.data);
    } catch (err) {
      console.error("Failed to load teachers");
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/courses");
      setCourses(response.data);
    } catch (err) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses(courses.filter((course) => course.id !== id));
      toast.success("Course deleted successfully");
    } catch (err) {
      toast.error("Failed to delete course");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.name === "credits" ? (e.target.value === "" ? "" : parseInt(e.target.value)) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value as any });
  };

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData({ courseCode: "", courseName: "", description: "", credits: 3, teacherId: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode,
      courseName: course.courseName,
      description: course.description,
      credits: course.credits,
      teacherId: course.teacher?.id?.toString() || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let courseId;
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, formData);
        courseId = editingCourse.id;
        toast.success("Course updated successfully");
      } else {
        const res = await api.post("/courses", formData);
        courseId = res.data.id;
        toast.success("Course created successfully");
      }
      
      if (formData.teacherId) {
        await api.put(`/courses/${courseId}/assign-teacher/${formData.teacherId}`);
      }
      
      setIsModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save course");
    } finally {
      setIsSubmitting(false);
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
      <div className="flex justify-between items-center bg-white p-6 md:p-8 rounded-[32px] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Courses</h1>
          <p className="text-slate-500 mt-2 text-lg">View and manage all academic courses</p>
        </div>
        
        {(role === "ADMIN" || role === "TEACHER") && (
          <button onClick={openAddModal} className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5">
            <Plus className="w-5 h-5" />
            Add Course
          </button>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 border border-slate-100 text-center text-slate-500 shadow-sm">
          No courses available right now.
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
            <div key={course.id} className="group relative bg-white rounded-[24px] p-5 border border-slate-100/50 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${bannerGradient} text-white shadow-sm`}>
                  {course.courseCode}
                </span>

                {(role === "ADMIN" || role === "TEACHER") && (
                  <div className="absolute top-5 right-5 flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-4px] group-hover:translate-y-0 focus-within:opacity-100 focus-within:translate-y-0 z-10">
                    <button 
                      onClick={() => openEditModal(course)} 
                      className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(59,130,246,0.15)] hover:border-blue-100/80 transition-all duration-200"
                      title="Edit Course"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(course.id)}
                      className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(239,68,68,0.15)] hover:border-red-100/80 transition-all duration-200"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col flex-1">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-500 transition-all leading-tight line-clamp-2">
                  {course.courseName}
                </h3>
                
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[32px] leading-relaxed">
                  {course.description}
                </p>

                <div className="mt-auto">
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100/50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center border border-slate-200/50 shadow-sm">
                        {course.teacher ? (
                          <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-700 line-clamp-1">
                        {course.teacher 
                          ? `${course.teacher.firstName} ${course.teacher.lastName}`
                          : "TBA"}
                      </span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-600">{course.credits} Credits</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100/50">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {editingCourse ? "Edit Course" : "Create New Course"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Course Code</label>
                  <input type="text" name="courseCode" required value={formData.courseCode} onChange={handleInputChange} placeholder="e.g. CS101" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Credits</label>
                  <input type="number" min="1" max="4" name="credits" required value={formData.credits} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Course Title</label>
                <input type="text" name="courseName" required value={formData.courseName} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Description</label>
                <textarea name="description" rows={4} required value={formData.description} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm outline-none resize-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Assign Teacher</label>
                <select 
                  name="teacherId" 
                  value={formData.teacherId} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm outline-none appearance-none"
                >
                  <option value="">No Teacher</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-8 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingCourse ? "Save Changes" : "Create Course")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

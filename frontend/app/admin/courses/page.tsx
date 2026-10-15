"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Loader2, Plus, Edit, Trash2, X, BookOpen, User as UserIcon, GraduationCap, Clock } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../lib/api";
import ConfirmModal from "@/components/ui/ConfirmModal";
import CourseCard, { Course, Teacher } from "@/components/ui/CourseCard";

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
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

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

  const handleDelete = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Course",
      message: "Are you sure you want to delete this course? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await api.delete(`/courses/${id}`);
          setCourses((prev) => prev.filter((course) => course.id !== id));
          toast.success("Course deleted successfully");
        } catch {
          toast.error("Failed to delete course");
        }
      },
    });
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
      credits: course.credits ?? 3,
      teacherId: course.teacher?.id?.toString() || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        courseCode: formData.courseCode,
        courseName: formData.courseName,
        description: formData.description,
        credits: formData.credits,
      };

      let courseId;
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, payload);
        courseId = editingCourse.id;
        toast.success("Course updated successfully");
      } else {
        const res = await api.post("/courses", payload);
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
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              role="admin"
              onEdit={role === "ADMIN" || role === "TEACHER" ? openEditModal : undefined}
              onDelete={role === "ADMIN" || role === "TEACHER" ? handleDelete : undefined}
            />
          ))}
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
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        type={confirmConfig.type}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

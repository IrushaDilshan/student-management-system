"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Loader2, Plus, Edit, Trash2, X } from "lucide-react";
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500 mt-1">View and manage all academic courses</p>
        </div>
        
        {(role === "ADMIN" || role === "TEACHER") && (
          <button onClick={openAddModal} className="btn-primary w-auto flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Course
          </button>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="glass-panel p-12 text-center text-gray-500">
          No courses available right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="glass-panel p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  {course.courseCode}
                </span>
                
                {(role === "ADMIN" || role === "TEACHER") && (
                  <div className="flex gap-2 text-gray-400">
                    <button onClick={() => openEditModal(course)} className="hover:text-blue-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(course.id)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">{course.courseName}</h2>
              <p className="text-gray-500 text-sm flex-grow mb-4 line-clamp-3">
                {course.description}
              </p>
              
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-medium text-gray-700">
                <div>Credits: <span className="ml-2 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{course.credits}</span></div>
                {course.teacher && (
                  <div className="text-gray-500 font-normal">
                    Teacher: {course.teacher.firstName} {course.teacher.lastName}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCourse ? "Edit Course" : "Create New Course"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Course Code</label>
                  <input type="text" name="courseCode" required value={formData.courseCode} onChange={handleInputChange} placeholder="e.g. CS101" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Credits</label>
                  <input type="number" min="1" max="4" name="credits" required value={formData.credits} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Course Title</label>
                <input type="text" name="courseName" required value={formData.courseName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" rows={4} required value={formData.description} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Assign Teacher</label>
                <select 
                  name="teacherId" 
                  value={formData.teacherId} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">No Teacher</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-auto">
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

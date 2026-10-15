"use client";

import React from "react";
import { 
  CheckCircle, GraduationCap, Loader2, ArrowRight, 
  User as UserIcon, Clock, Edit, Trash2, Users, ChevronRight, BookOpen 
} from "lucide-react";

export interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
}

export interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  description: string;
  credits?: number;
  teacher?: Teacher;
  lecturerName?: string;
  teacherName?: string;
}

interface CourseCardProps {
  course: Course;
  role: "admin" | "teacher" | "student";
  // Admin-specific actions
  onEdit?: (course: Course) => void;
  onDelete?: (courseId: number) => void;
  // Teacher-specific actions
  onViewStudents?: (course: Course) => void;
  // Student-specific actions and states
  isEnrolled?: boolean;
  isEnrolling?: boolean;
  isProfileMissing?: boolean;
  onEnroll?: (courseId: number, courseName: string) => void;
  // Layout customization
  credits?: number; // Optional override
  viewMode?: "GRID" | "LIST"; // Default to "GRID", relevant mainly for student view
}

export default function CourseCard({
  course,
  role,
  onEdit,
  onDelete,
  onViewStudents,
  isEnrolled = false,
  isEnrolling = false,
  isProfileMissing = false,
  onEnroll,
  credits,
  viewMode = "GRID",
}: CourseCardProps) {
  // Generate a deterministic accent color based on course ID
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-emerald-400 to-teal-500",
    "from-orange-400 to-rose-500",
    "from-purple-500 to-fuchsia-600",
    "from-cyan-400 to-blue-500",
    "from-pink-500 to-rose-500"
  ];
  const bannerGradient = gradients[course.id % gradients.length];
  const courseCredits = credits ?? course.credits ?? 3;

  // Render for Student role
  if (role === "student") {
    return (
      <div 
        className={`group relative bg-white rounded-[24px] p-5 border border-gray-100/50 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex ${viewMode === "LIST" ? "flex-col sm:flex-row gap-5 w-full" : "flex-col"}`}
      >
        {/* Modern Minimalist Header */}
        <div className={`flex justify-between items-start mb-4 ${viewMode === "LIST" ? "w-full sm:w-48 shrink-0 flex-col sm:flex-row gap-4" : ""}`}>
          <div className="flex flex-col sm:flex-row gap-2 w-full justify-between items-start">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${bannerGradient} text-white shadow-sm`}>
              {course.courseCode}
            </span>
            <div className="flex flex-wrap gap-2 justify-end">
              {isEnrolled && (
                <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold border border-green-500/20 flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3" /> Enrolled
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-500 transition-all leading-tight line-clamp-2">
            {course.courseName}
          </h3>
          
          <p className="text-xs text-gray-500 mb-4 line-clamp-2 min-h-[32px] leading-relaxed">
            {course.description}
          </p>

          <div className="mt-auto">
            {/* Instructor & Credits Block - Ultra Minimal */}
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100/50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200/50 shadow-sm">
                  {course.teacher ? (
                    <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                  ) : (
                    <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-700 line-clamp-1">
                  {course.teacher 
                    ? `${course.teacher.firstName} ${course.teacher.lastName}`
                    : (course.lecturerName || course.teacherName || "TBA")}
                </span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300"></div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-600">{courseCredits} Credits</span>
              </div>
            </div>

            {/* Enroll Button Area */}
            {isEnrolled ? (
              <button 
                className="w-full py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 bg-green-500/10 text-green-700 cursor-default transition-all"
                disabled
              >
                <CheckCircle className="w-4 h-4" /> Already Enrolled
              </button>
            ) : (
              <button 
                className={`w-full py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 group/btn ${
                  isProfileMissing
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 hover:-translate-y-0.5"
                }`}
                disabled={isEnrolling || isProfileMissing}
                onClick={() => onEnroll?.(course.id, course.courseName)}
              >
                {isProfileMissing ? "Approval Pending" : isEnrolling ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enrolling...</>
                ) : (
                  <>Enroll in Course <ArrowRight className="w-4 h-4 opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render for Teacher role
  if (role === "teacher") {
    return (
      <div className="group relative bg-white rounded-[24px] p-5 border border-slate-100/50 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
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
            Credits: <span className="w-6 h-6 flex items-center justify-center text-blue-700 bg-blue-50 border border-blue-100/50 rounded-md font-bold text-[10px]">{courseCredits}</span>
          </div>
          <button 
            onClick={() => onViewStudents?.(course)}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-all hover:translate-x-0.5 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            Students
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Render for Admin role
  return (
    <div className="group relative bg-white rounded-[24px] p-5 border border-slate-100/50 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${bannerGradient} text-white shadow-sm`}>
          {course.courseCode}
        </span>

        {/* Edit and Delete Buttons for Admin */}
        <div className="absolute top-5 right-5 flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-4px] group-hover:translate-y-0 focus-within:opacity-100 focus-within:translate-y-0 z-10">
          {onEdit && (
            <button 
              onClick={() => onEdit(course)} 
              className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(59,130,246,0.15)] hover:border-blue-100/80 transition-all duration-200 cursor-pointer"
              title="Edit Course"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(course.id)}
              className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(239,68,68,0.15)] hover:border-red-100/80 transition-all duration-200 cursor-pointer"
              title="Delete Course"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
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
              <span className="text-xs font-semibold text-slate-600">{courseCredits} Credits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

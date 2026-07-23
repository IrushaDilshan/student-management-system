"use client";

import { useEffect, useState } from "react";
import { BookOpen, User as UserIcon, CheckCircle, GraduationCap, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import api from "../../../lib/api";

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  description: string;
  teacher?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  lecturerName?: string;
  teacherName?: string;
}

export default function StudentCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<number>>(new Set());
  const [enrollingIds, setEnrollingIds] = useState<Set<number>>(new Set());
  const [isProfileMissing, setIsProfileMissing] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all courses
        const coursesRes = await api.get("/courses", { headers });
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);

        // Fetch profile to check if status is PENDING
        try {
          const profileRes = await api.get("/students/me", { headers });
          if (profileRes.data?.status === "PENDING") {
            setIsProfileMissing(true);
          } else {
            setIsProfileMissing(false);
          }
        } catch (profileErr) {
          setIsProfileMissing(false);
        }

        // Fetch enrolled courses
        try {
          const enrolledRes = await api.get("/students/my-courses", { headers });
          const enrolledData = Array.isArray(enrolledRes.data) ? enrolledRes.data : [];
          setEnrolledCourseIds(new Set(enrolledData.map((c: any) => c.id)));
        } catch (enrolledErr: any) {
          console.warn("Could not fetch enrolled courses:", enrolledErr);
          setEnrolledCourseIds(new Set());
        }
      } catch (err: any) {
        toast.error("Failed to load courses");
        console.error("Error fetching student courses:", err.response || err);

        if (err.response?.status === 401 || err.response?.status === 403) {
          Cookies.remove("token");
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (courseId: number, courseName: string) => {
    try {
      setEnrollingIds(prev => new Set(prev).add(courseId));
      await api.post(`/students/enroll/${courseId}`);
      toast.success(`Successfully enrolled in ${courseName}!`);
      setEnrolledCourseIds(prev => new Set(prev).add(courseId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : "Failed to enroll"));
    } finally {
      setEnrollingIds(prev => {
        const next = new Set(prev);
        next.delete(courseId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Courses</h1>
          <p className="text-gray-500 mt-1">Browse and enroll in available courses for this semester.</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-xl hidden sm:block">
          <BookOpen className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {isProfileMissing && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-800">Action Required</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your account is missing an active Student Profile or is pending Admin approval. Please contact the administrator.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const isEnrolled = enrolledCourseIds.has(course.id);
          const isEnrolling = enrollingIds.has(course.id);
          
          return (
          <div key={course.id} className="glass-panel p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                {course.courseCode}
              </span>
              {isEnrolled ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full border border-purple-100">
                  <CheckCircle className="w-3 h-3" />
                  Enrolled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                  <CheckCircle className="w-3 h-3" />
                  Available
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
              {course.courseName}
            </h3>
            
            <p className="text-sm text-gray-500 mb-6 line-clamp-3 min-h-[60px]">
              {course.description}
            </p>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  {course.teacher ? (
                    <UserIcon className="w-4 h-4 text-gray-500" />
                  ) : (
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Lecturer</span>
                  <span className="font-medium text-gray-900">
                    {course.teacher 
                      ? `${course.teacher.firstName} ${course.teacher.lastName}`
                      : (course.lecturerName || course.teacherName || "TBA")}
                  </span>
                </div>
              </div>

              <button 
                className={`w-full py-2.5 shadow-sm text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
                  isEnrolled || isProfileMissing
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "btn-primary"
                }`}
                disabled={isEnrolled || isEnrolling || isProfileMissing}
                onClick={() => handleEnroll(course.id, course.courseName)}
              >
                {isProfileMissing ? "Approval Pending" : isEnrolled ? "Enrolled" : isEnrolling ? "Enrolling..." : "Enroll Now"}
              </button>
            </div>
          </div>
        )})}

        {courses.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
            <p className="text-gray-500">There are no available courses at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

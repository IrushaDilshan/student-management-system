"use client";

import { useEffect, useState } from "react";
import { 
  BookOpen, User as UserIcon, CheckCircle, GraduationCap, Loader2, 
  AlertCircle, Search, Filter, LayoutGrid, List, ArrowRight, Clock
} from "lucide-react";
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

  // New UI states for modern layout
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ENROLLED" | "AVAILABLE">("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");

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

  // Filter logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    const isEnrolled = enrolledCourseIds.has(course.id);
    if (filter === "ENROLLED" && !isEnrolled) return false;
    if (filter === "AVAILABLE" && isEnrolled) return false;
    
    return true;
  });

  // Mock data for UI showcase
  const getMockCredits = (id: number) => (id % 3) + 2; // Pseudo-random 2 to 4 credits

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden w-full">
      {/* 1. Header Area with Search, Filters, and View Toggle */}
      <div className="flex-none bg-gray-50/90 backdrop-blur-md pb-4 pt-2 z-20 w-full">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Directory</h1>
          <p className="text-gray-500 mt-1">Explore, enroll, and track your learning progress.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              placeholder="Search by code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none cursor-pointer text-gray-700 font-medium"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="ALL">All Courses</option>
              <option value="ENROLLED">My Enrolled</option>
              <option value="AVAILABLE">Available</option>
            </select>
          </div>

          {/* Grid/List View Toggle */}
          <div className="flex bg-gray-100 p-1.5 rounded-xl ml-auto sm:ml-0">
            <button
              onClick={() => setViewMode("GRID")}
              className={`p-2 rounded-lg transition-all ${viewMode === "GRID" ? "bg-white shadow-sm text-blue-600 scale-100" : "text-gray-400 hover:text-gray-600 scale-95 hover:scale-100"}`}
              title="Grid View"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`p-2 rounded-lg transition-all ${viewMode === "LIST" ? "bg-white shadow-sm text-blue-600 scale-100" : "text-gray-400 hover:text-gray-600 scale-95 hover:scale-100"}`}
              title="List View"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 pb-10 custom-scrollbar space-y-6">
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

      {/* 2. Courses Grid or List */}
      {filteredCourses.length > 0 ? (
        <div className={viewMode === "GRID" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full" : "flex flex-col space-y-6 w-full"}>
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            const isEnrolling = enrollingIds.has(course.id);
            const credits = getMockCredits(course.id);
            
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
            
            return (
              <div 
                key={course.id} 
                className={`group relative bg-white rounded-[24px] p-5 border border-gray-100/50 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex ${viewMode === "LIST" ? "flex-col sm:flex-row gap-5" : "flex-col"}`}
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
                        <span className="text-xs font-semibold text-gray-600">{credits} Credits</span>
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
                        onClick={() => handleEnroll(course.id, course.courseName)}
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
          })}
        </div>
      ) : (
        /* 3. Empty States */
        <div className="w-full py-24 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm text-center px-6">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="w-12 h-12 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500 max-w-md text-lg">
            {searchQuery 
              ? `We couldn't find any courses matching "${searchQuery}".` 
              : "There are no available courses at the moment. Check back later!"}
          </p>
          {(searchQuery || filter !== "ALL") && (
            <button 
              onClick={() => { setSearchQuery(""); setFilter("ALL"); }}
              className="mt-8 px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
            >
              Clear all filters
            </button>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

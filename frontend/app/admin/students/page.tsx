"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Loader2, UserCheck, UserX, Mail, Phone, Shield, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../lib/api";

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  name?: string;
  user?: {
    username: string;
  };
}

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [showPending, setShowPending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setRole(decoded.role);
        
        if (decoded.role === "ADMIN" || decoded.role === "TEACHER") {
          fetchStudents();
        } else {
          setError("You do not have permission to view this page.");
          setLoading(false);
        }
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/students");
      setStudents(response.data);
    } catch (err) {
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/admin/pending-students");
      setPendingStudents(response.data);
      setShowPending(true);
    } catch (err) {
      toast.error("Failed to load pending students");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/auth/admin/approve-student/${id}?status=ACTIVE`);
      setPendingStudents(pendingStudents.filter((student) => student.id !== id));
      fetchStudents();
      toast.success("Student approved successfully");
    } catch (err) {
      toast.error("Failed to approve student");
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Are you sure you want to reject this request?")) return;
    try {
      await api.put(`/auth/admin/approve-student/${id}?status=REJECTED`);
      setPendingStudents(pendingStudents.filter((student) => student.id !== id));
      toast.success("Student request rejected");
    } catch (err) {
      toast.error("Failed to reject student");
    }
  };

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    const fullName = `${student.firstName || ""} ${student.lastName || ""}`.toLowerCase();
    const email = (student.email || "").toLowerCase();
    const username = (student.username || student.user?.username || "").toLowerCase();
    
    return fullName.includes(query) || email.includes(query) || username.includes(query);
  });

  const filteredPendingStudents = pendingStudents.filter(student => {
    const query = searchQuery.toLowerCase();
    const email = (student.email || "").toLowerCase();
    const username = (student.username || "").toLowerCase();
    
    return email.includes(query) || username.includes(query);
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this student?")) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents(prev => prev.filter(s => s.id !== id));
      toast.success("Student removed successfully");
    } catch (err: any) {
      console.error(err.response?.data);
      toast.error(err.response?.data?.message || "Failed to delete student");
    }
  };

  if (loading && !showPending && students.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden w-full">
      <div className="flex-none bg-gray-50/90 backdrop-blur-md pb-4 pt-2 z-20 w-full space-y-4">
        <div className="flex justify-between items-center bg-white p-6 md:p-8 rounded-[32px] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {showPending ? "Pending Approvals" : "Students"}
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              {showPending 
                ? "Review and approve new student registrations." 
                : "Manage enrolled students and their profiles."}
            </p>
          </div>
          
          {role === "ADMIN" && (
            <button 
              onClick={() => showPending ? setShowPending(false) : fetchPendingStudents()}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${
                showPending 
                  ? "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5"
                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100/50 hover:-translate-y-0.5"
              }`}
            >
              {showPending ? (
                <>Back to Students</>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Pending Approvals
                </>
              )}
            </button>
          )}
        </div>

        <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={showPending ? "Search pending requests..." : "Search students by name, email, username..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-10 pr-2 custom-scrollbar">
        <div className="bg-white rounded-[32px] p-4 lg:p-8 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300 overflow-hidden">
          {!showPending ? (
            // ACTIVE STUDENTS VIEW
            filteredStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No students found matching your search query.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 rounded-xl">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tl-2xl">Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Username</th>
                      {role === "ADMIN" && (
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right rounded-tr-2xl">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="font-bold text-slate-900 tracking-tight text-lg">
                            {student.firstName ? `${student.firstName} ${student.lastName}` : (student.name || student.user?.username || student.username)}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1.5 text-sm text-slate-500 font-medium">
                            <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400"/> {student.email}</span>
                            <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400"/> {student.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-200/60">
                            @{student.username || "N/A"}
                          </span>
                        </td>
                        {role === "ADMIN" && (
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleDelete(student.id)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 shadow-sm hover:shadow"
                                title="Remove Student"
                              >
                                <UserX className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            // PENDING APPROVALS VIEW
            filteredPendingStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No pending student requests matching your search query.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-indigo-50/50 border-b border-indigo-100/50">
                      <th className="px-6 py-4 text-xs font-bold text-indigo-800 uppercase tracking-wider rounded-tl-2xl">Username</th>
                      <th className="px-6 py-4 text-xs font-bold text-indigo-800 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-xs font-bold text-indigo-800 uppercase tracking-wider text-right rounded-tr-2xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPendingStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="font-bold text-slate-900 text-lg tracking-tight">@{student.username}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <Mail className="w-4 h-4 text-slate-400"/> {student.email}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-3 opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleApprove(student.id)}
                              className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-100 hover:shadow-sm rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                            >
                              <UserCheck className="w-4 h-4" />
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReject(student.id)}
                              className="px-4 py-2 bg-red-50 text-red-700 border border-red-200/50 hover:bg-red-100 hover:shadow-sm rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                            >
                              <UserX className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

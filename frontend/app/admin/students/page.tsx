"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Loader2, UserCheck, UserX, Mail, Phone, Shield } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {showPending ? "Pending Approvals" : "Students"}
          </h1>
          <p className="text-gray-500 mt-1">
            {showPending 
              ? "Review and approve new student registrations." 
              : "Manage enrolled students and their profiles."}
          </p>
        </div>
        
        {role === "ADMIN" && (
          <button 
            onClick={() => showPending ? setShowPending(false) : fetchPendingStudents()}
            className="btn-secondary w-auto flex items-center gap-2"
          >
            {showPending ? (
              <>Back to Students</>
            ) : (
              <>
                <Shield className="w-5 h-5 text-indigo-600" />
                Pending Approvals
              </>
            )}
          </button>
        )}
      </div>

      <div className="glass-panel overflow-hidden">
        {!showPending ? (
          // ACTIVE STUDENTS VIEW
          students.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No students found in the system.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contact</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Username</th>
                    {role === "ADMIN" && (
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {student.firstName ? `${student.firstName} ${student.lastName}` : (student.name || student.user?.username || student.username)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> {student.email}</span>
                          <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> {student.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                          @{student.username || "N/A"}
                        </span>
                      </td>
                      {role === "ADMIN" && (
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDelete(student.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove Student"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
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
          pendingStudents.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No pending student requests.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-indigo-50/50 border-b border-indigo-100">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Username</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">@{student.username}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Mail className="w-3.5 h-3.5"/> {student.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleApprove(student.id)}
                            className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            <UserCheck className="w-4 h-4" />
                            Approve
                          </button>
                          <button 
                            onClick={() => handleReject(student.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
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
  );
}

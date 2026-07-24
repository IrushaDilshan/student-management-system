"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Loader2, UserX, Mail, Phone, GraduationCap, Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../lib/api";

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  user?: {
    username: string;
  };
  username?: string;
}

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    department: "",
  });

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setRole(decoded.role);
        
        if (decoded.role === "ADMIN") {
          fetchTeachers();
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/teachers");
      console.log("Fetched teachers:", response.data);
      setTeachers(response.data);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const query = searchQuery.toLowerCase();
    const fullName = `${teacher.firstName || ""} ${teacher.lastName || ""}`.toLowerCase();
    const email = (teacher.email || "").toLowerCase();
    const dept = (teacher.department || "").toLowerCase();
    const username = (teacher.user?.username || teacher.username || "").toLowerCase();

    return fullName.includes(query) || email.includes(query) || dept.includes(query) || username.includes(query);
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this teacher?")) return;
    try {
      await api.delete(`/teachers/${id}`);
      setTeachers(teachers.filter((teacher) => teacher.id !== id));
      toast.success("Teacher removed successfully");
    } catch (err) {
      toast.error("Failed to delete teacher");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/admin/teachers", formData);
      toast.success("Teacher created successfully");
      setIsModalOpen(false);
      setFormData({ username: "", email: "", password: "", firstName: "", lastName: "", phone: "", department: "" });
      await fetchTeachers();
    } catch (err: any) {
      console.error("Error creating teacher:", err);
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error || 
        (typeof err.response?.data === "string" ? err.response.data : "Failed to create teacher");
      
      toast.error(typeof errorMessage === "string" ? errorMessage : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (role !== "ADMIN") {
    return (
      <div className="p-8 text-center text-red-600">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden w-full">
      <div className="flex-none bg-gray-50/90 backdrop-blur-md pb-4 pt-2 z-20 w-full space-y-4">
        <div className="flex justify-between items-center bg-white p-6 md:p-8 rounded-[32px] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Teachers</h1>
            <p className="text-slate-500 mt-2 text-lg">Manage teacher records and departments.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Add Teacher
          </button>
        </div>

        <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search teachers by name, email, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-10 pr-2 custom-scrollbar">
        <div className="bg-white rounded-[32px] p-4 lg:p-8 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300 overflow-hidden">
          {filteredTeachers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No teachers found matching your search query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 rounded-xl">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tl-2xl">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right rounded-tr-2xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTeachers.map((teacher: any) => (
                    <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-900 tracking-tight text-lg">
                          {teacher.firstName ? `${teacher.firstName} ${teacher.lastName}` : teacher.name}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5 text-sm text-slate-500 font-medium">
                          <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400"/> {teacher.email}</span>
                          <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400"/> {teacher.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-purple-600" />
                          <span className="font-bold text-slate-700">{teacher.department || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-200/60">
                          @{teacher.user?.username || teacher.username || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDelete(teacher.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 shadow-sm hover:shadow"
                            title="Remove Teacher"
                          >
                            <UserX className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100/50">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Teacher</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-xl">
                <UserX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">First Name</label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Last Name</label>
                  <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Email Address</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Phone (Optional)</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm outline-none" placeholder="e.g. Computer Science" />
              </div>

              <div className="border-t border-slate-100 pt-6 mt-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Account Credentials</h3>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Username</label>
                    <input type="text" name="username" required value={formData.username} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Password</label>
                    <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm outline-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

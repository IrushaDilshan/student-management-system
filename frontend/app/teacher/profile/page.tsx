"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Loader2, User as UserIcon, Mail, Phone, Building, Save, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../lib/api";

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

interface TeacherProfile {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  phone: string;
  user?: {
    username: string;
    email: string;
  };
}

export default function TeacherProfile() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    department: "",
    phone: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setRole(decoded.role);
        if (decoded.role === "TEACHER") {
          fetchProfile();
        } else {
          setLoading(false);
          toast.error("Access denied. Teachers only.");
        }
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/teacher/dashboard/profile");
      const data = response.data;
      setProfile(data);
      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        department: data.department || "",
        phone: data.phone || "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.department,
        phone: formData.phone,
      };

      if (formData.newPassword) {
        payload.newPassword = formData.newPassword;
      }

      await api.put("/teacher/dashboard/profile", payload);
      toast.success("Profile updated successfully!");
      
      // Clear password fields after success
      setFormData(prev => ({
        ...prev,
        newPassword: "",
        confirmPassword: ""
      }));
      
      fetchProfile(); // Refresh profile data
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
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
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden w-full">
      <div className="flex-none bg-gray-50/90 backdrop-blur-md pb-2 pt-2 z-20 w-full">
        <div className="flex justify-between items-center bg-white p-6 md:p-8 rounded-[32px] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Profile Settings</h1>
            <p className="text-slate-500 mt-2 text-lg">Manage your personal information and account security.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-10 pr-2 custom-scrollbar space-y-6">
        {/* Modern Sub-Navigation Tabs */}
        <div className="flex border-b border-slate-200/60 pb-px mt-4">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all duration-200 -mb-[2px] ${
              activeTab === "general"
                ? "border-blue-600 text-blue-600 font-extrabold"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all duration-200 -mb-[2px] ${
              activeTab === "security"
                ? "border-blue-600 text-blue-600 font-extrabold"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Security & Password
          </button>
        </div>

        <div className="w-full">
          {activeTab === "general" ? (
            /* Personal Details Card */
            <div className="w-full bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
              {/* Top User Banner Card */}
              <div className="w-full flex items-center gap-4 bg-gray-50/80 p-4 rounded-xl border border-gray-100 mb-6">
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center font-extrabold text-white text-base">
                  {(profile?.firstName?.charAt(0) || "") + (profile?.lastName?.charAt(0) || "") || "U"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    {profile?.firstName ? `${profile?.firstName} ${profile?.lastName}` : profile?.user?.username}
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5">@{profile?.user?.username}</p>
                </div>
              </div>

              <div className="space-y-5 w-full">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <UserIcon className="w-5 h-5 text-indigo-650" />
                  Personal Details
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-505">Email Address</label>
                      <div className="bg-slate-50/50 px-4 py-3 rounded-[16px] border border-slate-200/60 text-slate-700 font-medium">
                        {profile?.user?.email}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700">Department</label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors duration-200 active:scale-[0.98]"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Security Settings Card */
            <div className="w-full bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <KeyRound className="w-5 h-5 text-indigo-650" />
                Change Password
              </h3>
              <p className="text-xs text-slate-400 font-semibold mb-2">Change your password below.</p>

              <form onSubmit={handleSubmit} className="space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-[16px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors duration-200 active:scale-[0.98]"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

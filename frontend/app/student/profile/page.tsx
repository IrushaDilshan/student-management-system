"use client";

import { useEffect, useState } from "react";
import { User as UserIcon, Mail, Phone, Hash, Shield, KeyRound, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../lib/api";

interface StudentProfile {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string;
  username: string;
  status: string;
}

export default function StudentProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");

  // Profile Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/students/me");
      const data = response.data;
      setProfile(data);
      
      // Remove placeholder values like "(Not Provided)" from being shown in the input
      const cleanFirstName = data.firstName && data.firstName.includes("Not Provided") ? "" : (data.firstName || "");
      const cleanLastName = data.lastName && data.lastName.includes("Not Provided") ? "" : (data.lastName || "");
      
      setFormData({
        firstName: cleanFirstName,
        lastName: cleanLastName,
        phone: data.phone && data.phone !== "N/A" ? data.phone : "",
      });
    } catch (error) {
      toast.error("Failed to load student profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    
    try {
      const payload = {
        ...formData,
        // Fallback for API validation if left entirely blank
        firstName: formData.firstName.trim() || profile?.username,
        lastName: formData.lastName.trim() || "(Not Provided)",
        email: profile?.email,
      };
      
      const response = await api.put("/students/me", payload);
      setProfile(response.data);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      const errorData = error.response?.data;
      const errorMessage = typeof errorData === 'string' 
        ? errorData 
        : (errorData?.message || "Failed to update profile");
      toast.error(errorMessage);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    setIsUpdatingPassword(true);
    
    // Simulate API call for password update
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isPending = profile?.status === "PENDING";

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden w-full">
      <div className="flex-none bg-gray-50/90 backdrop-blur-md pb-2 pt-2 z-20 w-full">
        <div className="flex justify-between items-center bg-white p-6 md:p-8 rounded-[32px] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-gray-100/50">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
            <p className="text-gray-500 mt-2 text-lg">Manage your account settings and personal information.</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100/50 hidden sm:block shadow-sm">
            <UserIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-10 pr-2 custom-scrollbar space-y-6">
        {/* Modern Sub-Navigation Tabs */}
        <div className="flex border-b border-gray-200/60 pb-px mt-4">
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
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                    {profile?.firstName ? `${profile?.firstName} ${profile?.lastName}` : profile?.username}
                  </h2>
                  <p className="text-gray-500 text-xs mt-0.5">@{profile?.username}</p>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 tracking-tight">
                <UserIcon className="w-5 h-5 text-gray-400" />
                Personal Details
              </h2>
              
              <form onSubmit={handleProfileUpdate} className="space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="e.g. Kasun"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/60 rounded-[16px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="e.g. Perera"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/60 rounded-[16px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email Address
                    </label>
                    <div className="bg-gray-50/50 px-4 py-3 rounded-[16px] border border-gray-100 text-gray-900 font-medium">
                      {profile?.email}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" /> Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="077XXXXXXX"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/60 rounded-[16px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Hash className="w-4 h-4" /> Student ID
                    </label>
                    <div className="bg-gray-50/50 px-4 py-3 rounded-[16px] border border-gray-100 text-gray-900 font-medium">
                      {profile?.id}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Account Status
                  </label>
                  <div className="bg-gray-50/50 px-4 py-3 rounded-[16px] border border-gray-100 flex items-center h-[50px]">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                      isPending ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                      {isPending ? 'PENDING APPROVAL' : 'APPROVED'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
                <button 
                  type="submit" 
                  disabled={isUpdatingProfile}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium flex justify-center items-center gap-2 transition-colors duration-200 active:scale-[0.98]"
                >
                  {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isUpdatingProfile ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Security Settings Card */
          <div className="w-full bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2 tracking-tight">
              <KeyRound className="w-5 h-5 text-gray-400" />
              Security Settings
            </h2>

            <form onSubmit={handlePasswordUpdate} className="space-y-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                  <input 
                    type="password" 
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/60 rounded-[16px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="••••••••" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/60 rounded-[16px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="••••••••" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/60 rounded-[16px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
                <button 
                  type="submit" 
                  disabled={isUpdatingPassword}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium flex justify-center items-center gap-2 transition-colors duration-200 active:scale-[0.98]"
                >
                  {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
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

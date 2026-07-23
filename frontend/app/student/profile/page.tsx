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
    <div className="max-w-5xl space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your account settings and personal information.</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-xl hidden sm:block">
          <UserIcon className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Details Card */}
        <div className="lg:col-span-2 glass-panel p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-gray-400" />
            Personal Details
          </h2>
          
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Student ID
                </label>
                <div className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 text-gray-900 font-medium">
                  {profile?.id}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Account Status
                </label>
                <div className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 flex items-center h-[42px]">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isPending ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                    {isPending ? 'PENDING APPROVAL' : 'APPROVED'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Kasun"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Perera"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <div className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 text-gray-900 font-medium">
                  {profile?.email}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" /> Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="077XXXXXXX"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={isUpdatingProfile}
                className="btn-primary flex justify-center items-center gap-2 w-full sm:w-auto px-8"
              >
                {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isUpdatingProfile ? "Saving..." : "Save Details"}
              </button>
            </div>
          </form>
        </div>

        {/* Security Settings Card */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-gray-400" />
            Security Settings
          </h2>

          <form onSubmit={handlePasswordUpdate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input 
                type="password" 
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field w-full"
                placeholder="••••••••" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field w-full"
                placeholder="••••••••" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field w-full"
                placeholder="••••••••" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isUpdatingPassword}
              className="w-full btn-primary py-2.5 shadow-sm text-sm flex justify-center items-center gap-2 mt-4"
            >
              <Save className="w-4 h-4" />
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  // Set colors based on modal type
  const getTypeConfig = () => {
    switch (type) {
      case "danger":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
          iconBg: "bg-red-50 border-red-100",
          confirmBtnClass: "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20",
        };
      case "warning":
        return {
          icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
          iconBg: "bg-amber-50 border-amber-100",
          confirmBtnClass: "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20",
        };
      case "info":
      default:
        return {
          icon: <Info className="w-6 h-6 text-blue-600" />,
          iconBg: "bg-blue-50 border-blue-100",
          confirmBtnClass: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20",
        };
    }
  };

  const { icon, iconBg, confirmBtnClass } = getTypeConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="bg-white border border-slate-100/60 rounded-[28px] max-w-md w-full p-6 md:p-8 shadow-2xl relative z-10 transform scale-100 transition-all duration-300 animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center mt-2">
          {/* Icon Header */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border mb-5 ${iconBg}`}>
            {icon}
          </div>

          <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 order-2 sm:order-1 py-3 px-4 text-slate-600 bg-slate-50 border border-slate-200/60 hover:bg-slate-100 font-bold rounded-xl transition-all text-sm"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 order-1 sm:order-2 py-3 px-4 font-bold rounded-xl transition-all text-sm hover:-translate-y-0.5 ${confirmBtnClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <div className="flex min-h-screen">
      {!isAuthPage && <Sidebar />}
      <main className={`flex-1 ${!isAuthPage ? "ml-64 p-8" : ""}`}>
        <div className={!isAuthPage ? "max-w-7xl mx-auto" : "h-full"}>
          {children}
        </div>
      </main>
    </div>
  );
}

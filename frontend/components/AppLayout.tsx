"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <div className="flex min-h-screen">
      {!isAuthPage && <Sidebar />}
      <div className={`flex-1 min-h-screen bg-gray-50 flex flex-col w-full overflow-x-hidden ${!isAuthPage ? "ml-64" : ""}`}>
        <main className="flex-1 w-full p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

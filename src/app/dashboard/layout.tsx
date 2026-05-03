"use client";

import { Sidebar } from "@/components/Sidebar";
import { PrivateRoute } from "@/components/PrivateRoute";
import { DashboardProvider } from "@/context/DashboardContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivateRoute>
      <DashboardProvider>
        <div className="min-h-screen bg-background lg:pl-72">
          <Sidebar />
          {children}
        </div>
      </DashboardProvider>
    </PrivateRoute>
  );
}

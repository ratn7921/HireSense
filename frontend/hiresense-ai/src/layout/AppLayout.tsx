import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import AISidebar from "../features/chat/AISidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api/client";
import { useFilters } from "../context/FilterContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setFilters } = useFilters();

  useEffect(() => {
    // Proactively check for resume if not on the resume page
    if (location.pathname !== "/login") {
      api.getResume().then(resume => {
        if (!resume || resume.trim() === "") {
          console.log("No resume found, redirecting to upload...");
          navigate("/login");
        }
      }).catch(err => console.error("Failed to check resume:", err));
    }
  }, [location.pathname, navigate]);

  return (
    <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0a0a] to-[#0a0a0a]">
      {/* Main Navigation Sidebar */}
      <aside className="w-64 fixed h-full z-40 hidden md:block">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 min-h-screen relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>

      {/* AI Assistant (Overlay) */}
      <AISidebar onApplyFilters={setFilters} />
    </div>
  );
}

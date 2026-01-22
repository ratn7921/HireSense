import { NavLink } from "react-router-dom";
import { LayoutDashboard, Briefcase, FileText, PlusCircle, Sparkles } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="flex flex-col h-full p-6 border-r border-white/5 bg-black/20 backdrop-blur-xl">
      <div className="mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            HireSense
          </div>
          <div className="text-xs text-zinc-500 font-medium tracking-wider uppercase">AI Job Tracker</div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <NavItem to="/" icon={<Briefcase />} label="Find Jobs" />
        <NavItem to="/applications" icon={<LayoutDashboard />} label="Applications" />
        <NavItem to="/login" icon={<FileText />} label="My Resume" />
      </nav>

      <div className="pt-6 border-t border-white/5">
        <button className="w-full btn-primary flex items-center justify-center gap-2 group">
          <PlusCircle className="w-4 h-4" />
          <span>Post a Job</span>
        </button>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
          ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
          : "text-zinc-400 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-white"}`}>
            {icon}
          </span>
          <span className="font-medium">{label}</span>
          {isActive && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          )}
        </>
      )}
    </NavLink>
  );
}

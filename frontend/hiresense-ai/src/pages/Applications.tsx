import { useEffect, useState } from "react";
import { api } from "../api/client";
import { LayoutDashboard, CheckCircle, Clock, XCircle, Building2 } from "lucide-react";

export default function Applications() {
  const [apps, setApps] = useState<any[]>([]);

  useEffect(() => {
    api.getApplications()
      .then(data => {
        if (Array.isArray(data)) {
          setApps(data);
        } else {
          console.error("Expected array from getApplications, got:", data);
          setApps([]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch applications:", err);
        setApps([]);
      });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "Applied Earlier": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "Browsing": return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
      default: return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Applied": return <CheckCircle className="w-4 h-4" />;
      case "Applied Earlier": return <Clock className="w-4 h-4" />;
      case "Browsing": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Application Tracker</h1>
          <p className="text-zinc-400">Track your job application status</p>
        </div>
      </div>

      <div className="space-y-4">
        {apps.length === 0 ? (
          <div className="text-center py-12 glass-card">
            <p className="text-zinc-500">No applications yet. Start applying!</p>
          </div>
        ) : (
          apps.map((a, i) => (
            <div key={i} className="glass-card p-4 flex items-center justify-between group hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{a.jobTitle || `Job #${a.jobId}`}</h3>
                  <p className="text-sm text-zinc-400">{a.company || "Unknown Company"}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-xs text-zinc-500">
                  {new Date(a.time).toLocaleDateString()}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${getStatusColor(a.status)}`}>
                  {getStatusIcon(a.status)}
                  {a.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

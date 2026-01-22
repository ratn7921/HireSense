import { api } from "../../api/client";
import { CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";

export default function ApplyPopup({ job, onClose }: any) {
  const apply = async (status: string) => {
    await api.applyJob(job.id, status, job.title, job.company);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="glass-card p-8 max-w-md w-full mx-4 space-y-6 relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Application Check</h3>
          <p className="text-zinc-400">
            Did you apply to <span className="text-white font-medium">{job.title}</span> at <span className="text-white font-medium">{job.company}</span>?
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => apply("Applied")}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Yes, I Applied
          </button>

          <button
            onClick={() => apply("Applied Earlier")}
            className="w-full p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Clock className="w-4 h-4" />
            Applied Earlier
          </button>

          <button
            onClick={() => apply("Browsing")}
            className="w-full p-3 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <XCircle className="w-4 h-4" />
            No, Just Browsing
          </button>
        </div>
      </div>
    </div>
  );
}

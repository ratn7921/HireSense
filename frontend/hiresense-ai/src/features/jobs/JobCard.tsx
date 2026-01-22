import type { Job } from "../../types/job";
import { MatchBadge } from "../matching/MatchBadge";
import { MapPin, Building2, Clock, Briefcase } from "lucide-react";

export function JobCard({ job, onApply }: { job: Job; onApply: (j: Job) => void }) {
  return (
    <div className="glass-card p-6 flex flex-col h-full group relative overflow-hidden">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Building2 className="w-4 h-4" />
            <span>{job.company}</span>
          </div>
        </div>
        <MatchBadge score={job.matchScore} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-700 text-zinc-300">
          <MapPin className="w-3 h-3" />
          {job.location}
        </div>
        <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-700 text-zinc-300">
          <Briefcase className="w-3 h-3" />
          {job.jobType}
        </div>
        <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-700 text-zinc-300">
          <Clock className="w-3 h-3" />
          {job.workMode}
        </div>
      </div>

      <p className="text-sm text-zinc-400 mb-6 line-clamp-3 flex-grow relative z-10">
        {job.description}
      </p>

      <div className="mt-auto relative z-10">
        <button
          onClick={() => {
            if (job.applyUrl) window.open(job.applyUrl, '_blank');
            onApply(job);
          }}
          className="w-full btn-primary flex items-center justify-center gap-2 group/btn"
        >
          Apply Now
          <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </div>
  );
}

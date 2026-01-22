import { useEffect, useState } from "react";
import { getJobs } from "../../api/client";
import { JobCard } from "./JobCard";
import { JobFilters } from "./JobFilters";
import ApplyPopup from "../applications/ApplyPopup";
import { Sparkles, Briefcase } from "lucide-react";

import { useFilters } from "../../context/FilterContext";

export function JobList() {
  const [jobs, setJobs] = useState<any[]>([]);
  const { filters, setFilters } = useFilters();
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    getJobs().then(setJobs);
  }, []);

  // Filter logic
  const filteredJobs = jobs.filter(job => {
    if (filters.title && !job.title.toLowerCase().includes(filters.title.toLowerCase())) return false;
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.type && job.jobType !== filters.type) return false;
    if (filters.match) {
      if (filters.match === "high" && job.matchScore < 70) return false;
      if (filters.match === "medium" && (job.matchScore < 40 || job.matchScore >= 70)) return false;
      if (filters.match === "low" && job.matchScore >= 40) return false;
    }
    return true;
  });

  const best = filteredJobs.filter(j => j.matchScore >= 70).sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);
  const others = filteredJobs.filter(j => !best.includes(j));

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Find Your Next Role</h1>
        <p className="text-zinc-400">We've found {filteredJobs.length} jobs that match your profile.</p>
      </div>

      <JobFilters filters={filters} setFilters={setFilters} />

      {best.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-indigo-400 w-5 h-5" />
            <h2 className="text-xl font-bold text-white">Best Matches for You</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {best.map(j => (
              <JobCard key={j.id} job={j} onApply={setSelectedJob} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-2 mb-6">
          <Briefcase className="text-zinc-400 w-5 h-5" />
          <h2 className="text-xl font-bold text-white">All Available Jobs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {others.map(j => (
            <JobCard key={j.id} job={j} onApply={setSelectedJob} />
          ))}
        </div>
      </section>

      {selectedJob && (
        <ApplyPopup job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </>
  );
}

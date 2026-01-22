import { Search, MapPin, Briefcase, Filter } from "lucide-react";

export function JobFilters({ filters, setFilters }: any) {
  const handleChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="glass-card p-4 mb-8">
      <div className="flex items-center gap-2 mb-4 text-zinc-400 text-sm font-medium uppercase tracking-wider">
        <Filter className="w-4 h-4" />
        Filter Jobs
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            placeholder="Search by role..."
            className="input-field pl-10"
            onChange={e => handleChange("title", e.target.value)}
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            placeholder="City or Region"
            className="input-field pl-10"
            onChange={e => handleChange("location", e.target.value)}
          />
        </div>

        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <select
            className="input-field pl-10 appearance-none cursor-pointer"
            onChange={e => handleChange("type", e.target.value)}
          >
            <option value="">Any Job Type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
            <span className="text-xs font-bold text-zinc-500">%</span>
          </div>
          <select
            className="input-field pl-10 appearance-none cursor-pointer"
            onChange={e => handleChange("match", e.target.value)}
          >
            <option value="">All Match Scores</option>
            <option value="high">High Match (&gt; 70%)</option>
            <option value="medium">Medium Match (40-70%)</option>
            <option value="low">Low Match (&lt; 40%)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

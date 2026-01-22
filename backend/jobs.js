import fetch from "node-fetch";

const BASE_URL = "https://api.adzuna.com/v1/api/jobs";

export async function fetchJobs() {
  const country = process.env.ADZUNA_COUNTRY || "in";
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    throw new Error("Missing Adzuna API credentials");
  }

  const url = `${BASE_URL}/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=20`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.results) return [];

  return data.results.map((job, index) => ({
    id: index + 1,
    title: job.title,
    company: job.company?.display_name || "Unknown",
    location: job.location?.display_name || "Unknown",
    jobType: job.contract_time || "Full-time",
    workMode: job.location?.area?.some(a =>
      a.toLowerCase().includes("remote")
    )
      ? "Remote"
      : "On-site",
    skills:
      job.description
        ?.toLowerCase()
        .match(/react|node|python|javascript|java|sql|html|css|express/g) || [],
    description: job.description,
    applyUrl: job.redirect_url
  }));
}
//6jobs.js (REAL Adzuna API integration)
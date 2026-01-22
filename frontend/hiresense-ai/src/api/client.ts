import type { Job } from "../types/job";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export async function getJobs(): Promise<Job[]> {
  const res = await fetch(`${BASE_URL}/jobs`);
  return res.json();
}

export async function uploadResume(resumeText: string) {
  return fetch(`${BASE_URL}/resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText }),
  });
}

export async function applyJob(jobId: number, status: string, jobTitle?: string, company?: string) {
  return fetch(`${BASE_URL}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId, status, jobTitle, company }),
  });
}

export async function getApplications() {
  const res = await fetch(`${BASE_URL}/applications`);
  return res.json();
}

export async function aiChat(query: string) {
  const res = await fetch(`${BASE_URL}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

export async function getResume(): Promise<string> {
  const res = await fetch(`${BASE_URL}/resume`);
  if (res.status === 404) return "";
  const data = await res.json();
  return data.resumeText || "";
}

// Backwards-compatible default-style API object used by components
export const api = {
  getJobs,
  getResume,
  uploadResume,
  applyJob,
  getApplications,
  aiChat,
};

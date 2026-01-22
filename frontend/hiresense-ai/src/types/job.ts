export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  jobType: string;
  workMode: string;
  skills: string[];
  matchScore: number;
  matchExplanation: string[];
  applyUrl: string;
}

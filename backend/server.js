import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";

import { fetchJobs } from "./jobs.js";
import { calculateMatchScore, explainMatch } from "./match.js";
import { store } from "./store.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const app = Fastify({
  logger: true,
  disableRequestLogging: false
});

// Register CORS
await app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
});

// Root route
app.get("/", async () => {
  return { status: "HireSense AI Backend is running", version: "1.0.0" };
});

// ---- Resume Upload ----
app.get("/resume", async (req, reply) => {
  try {
    const resumeText = await store.getResume();
    return { resumeText };
  } catch (err) {
    app.log.error(err, "Error in GET /resume");
    return reply.status(500).send({ error: "Failed to fetch resume" });
  }
});

app.post("/resume", async (req, reply) => {
  try {
    const { resumeText } = req.body;
    app.log.info({ resumeLength: resumeText?.length }, "Received resume upload");
    await store.setResume(resumeText || "");
    return { success: true };
  } catch (err) {
    app.log.error(err, "Error in /resume");
    return reply.status(500).send({ error: "Failed to save resume" });
  }
});

// ---- Job Feed + AI Matching ----
app.get("/jobs", async (req, reply) => {
  try {
    const jobs = await fetchJobs();
    const resume = await store.getResume();

    const matchedJobs = await Promise.all(jobs.map(async job => {
      const score = calculateMatchScore(job, resume);
      const explanation = explainMatch(job, resume);
      return {
        ...job,
        matchScore: score,
        matchExplanation: explanation
      };
    }));
    return matchedJobs;
  } catch (err) {
    app.log.error(err, "Error in /jobs");
    return reply.status(500).send({ error: "Failed to fetch jobs" });
  }
});

// ---- Apply to Job ----
app.post("/apply", async (req, reply) => {
  try {
    const { jobId, status, jobTitle, company } = req.body;
    await store.addApplication({
      jobId,
      status,
      jobTitle,
      company,
      time: new Date().toISOString()
    });
    return { success: true };
  } catch (err) {
    app.log.error(err, "Error in /apply");
    return reply.status(500).send({ error: "Failed to track application" });
  }
});

// ---- Applications Dashboard ----
app.get("/applications", async (req, reply) => {
  try {
    const apps = await store.getApplications();
    return Array.isArray(apps) ? apps : [];
  } catch (err) {
    app.log.error(err, "Error in GET /applications");
    return []; // Return empty array to prevent frontend crash
  }
});

// ---- AI Sidebar / Chat ----
app.post("/ai/chat", async (req, reply) => {
  try {
    const { query } = req.body || {};
    if (!query) return reply.status(400).send({ error: "Query is required" });

    app.log.info({ query }, "Processing AI chat query");

    let jobs = [];
    try {
      jobs = await fetchJobs();
    } catch (e) {
      app.log.error(e, "Error fetching jobs for AI chat");
    }

    let resume = "";
    try {
      resume = await store.getResume();
    } catch (e) {
      app.log.error(e, "Error fetching resume for AI chat");
    }

    // limit jobs to first 20 to keep prompt small and avoid token limits
    const briefJobs = jobs.slice(0, 20).map(j => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      jobType: j.jobType,
      workMode: j.workMode,
      skills: j.skills,
      matchScore: calculateMatchScore(j, resume)
    }));

    const systemPrompt = `You are a helpful AI assistant for HireSense, a job tracking app. 
    The user will ask for job search/filtering or product questions. 
    
    Current Jobs Available: ${JSON.stringify(briefJobs)}
    User's Resume: ${resume.slice(0, 1500)}...
    
    Respond STRICTLY in JSON format with the following keys:
    - answer: A helpful string response to the user.
    - filter: An object with keys like 'title', 'location', 'type', 'match' (high/medium/low) if the user wants to filter, otherwise null.
    - topJobIds: An array of job IDs that best match the query, or an empty array.
    
    If the user asks a product question like "How do I upload my resume?", explain that they can go to the "My Resume" section in the sidebar.`;

    const result = await model.generateContent(systemPrompt + "\n\nUser Query: " + query);
    const response = await result.response;
    const text = response.text();

    app.log.info({ aiResponse: text }, "Received AI response");

    // try to parse JSON from model
    let parsed = null;
    try {
      // Clean up markdown code blocks if present
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleanText);
    } catch (e) {
      app.log.warn({ text }, "Failed to parse AI response as JSON, returning as plain text");
      parsed = { answer: text, filter: null, topJobIds: [] };
    }

    return { raw: text, ...parsed };
  } catch (error) {
    app.log.error(error, "Gemini API Error");
    let status = 500;
    let answer = "I'm having trouble connecting to my AI core right now.";

    if (error.message?.includes("429") || error.status === 429) {
      status = 429;
      if (error.message?.includes("quota") || error.message?.includes("Quota")) {
        answer = "I've reached my daily AI limit. Please try again tomorrow or use a different API key.";
      } else {
        answer = "I'm a bit overwhelmed with requests right now. Please wait a few seconds and try again.";
      }
    } else if (error.message?.includes("404")) {
      answer = "The AI model is currently unavailable. Please check your configuration.";
    }

    return reply.status(status).send({
      error: "Failed to fetch AI response",
      details: error.message,
      answer: answer
    });
  }
});

// ---- Start Server ----
const PORT = process.env.PORT || 3001;
const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Backend running at http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
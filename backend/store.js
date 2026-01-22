import { Redis } from "@upstash/redis";

let redis = null;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken && !redisUrl.includes("foobar") && redisToken !== "your_token") {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
}

const inMemory = {
  resumeText: "",
  applications: [],
};

export const store = {
  async getResume() {
    try {
      if (!redis) return inMemory.resumeText;
      const val = await redis.get("resumeText");
      return val || "";
    } catch (err) {
      console.error("Redis getResume Error:", err);
      return inMemory.resumeText;
    }
  },

  async setResume(text) {
    try {
      if (!redis) {
        inMemory.resumeText = text;
        return;
      }
      await redis.set("resumeText", text);
    } catch (err) {
      console.error("Redis setResume Error:", err);
      inMemory.resumeText = text;
    }
  },

  async addApplication(app) {
    if (!redis) {
      inMemory.applications.push(app);
      return;
    }
    await redis.lpush("applications", JSON.stringify(app));
  },

  async getApplications() {
    try {
      if (!redis) return inMemory.applications;
      const items = await redis.lrange("applications", 0, -1);
      if (!Array.isArray(items)) return [];
      return items.map(i => {
        try {
          return typeof i === 'string' ? JSON.parse(i) : i;
        } catch (e) {
          console.error("Failed to parse application item:", i);
          return null;
        }
      }).filter(Boolean);
    } catch (err) {
      console.error("Redis getApplications Error:", err);
      return inMemory.applications;
    }
  }
};

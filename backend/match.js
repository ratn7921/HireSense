export function calculateMatchScore(job, resumeText) {
  if (!resumeText || !job.skills || job.skills.length === 0) return 0;

  const resume = resumeText.toLowerCase();
  let matched = 0;

  // Improved keyword matching: check for whole words or common variations
  job.skills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    // Simple check for presence
    if (resume.includes(skillLower)) {
      matched++;
    } else {
      // Check for common variations (e.g., "React.js" vs "React")
      const variations = [
        skillLower.replace(".js", ""),
        skillLower + ".js",
        skillLower.replace("node", "nodejs"),
        skillLower.replace("nodejs", "node")
      ];
      if (variations.some(v => resume.includes(v))) {
        matched++;
      }
    }
  });

  const baseScore = Math.round((matched / job.skills.length) * 100);

  // Cap at 100
  return Math.min(baseScore, 100);
}

export function explainMatch(job, resumeText) {
  if (!resumeText || !job.skills) return [];

  const resume = resumeText.toLowerCase();
  const matches = job.skills.filter(skill => {
    const skillLower = skill.toLowerCase();
    if (resume.includes(skillLower)) return true;

    const variations = [
      skillLower.replace(".js", ""),
      skillLower + ".js",
      skillLower.replace("node", "nodejs"),
      skillLower.replace("nodejs", "node")
    ];
    return variations.some(v => resume.includes(v));
  });

  return matches;
}
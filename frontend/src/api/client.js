const API_URL = "http://localhost:8000";

export const analyzeProfile = async (username, jobDescription) => {
  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      github_username: username,
      job_description: jobDescription,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to analyze profile");
  }
  
  return await response.json();
};

const API_BASE = (import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export async function analyzeResume(formData) {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Analysis could not be completed. Please try again.");
  }

  return payload;
}

export async function getAnalysisHistory() {
  const response = await fetch(`${API_BASE}/api/analyze/history`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "History could not be loaded. Please try again.");
  }
  return Array.isArray(payload) ? payload : [];
}
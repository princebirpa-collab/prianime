const API = "https://prianime-community.prianime-community.workers.dev";
export async function communityRequest(path, options={}) {
  const response = await fetch(API + path, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "PRI-ANIME service is temporarily unavailable.");
  return data;
}
export { API as COMMUNITY_API };

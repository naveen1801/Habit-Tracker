const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

let meCacheToken = null;
let meCachePromise = null;

function authHeaders(token, json = true) {
  const headers = { Authorization: `Bearer ${token}` };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

async function readJson(res) {
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const data = await readJson(res);
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export function clearApiCache() {
  meCacheToken = null;
  meCachePromise = null;
}

// Auth
export const login = (body) =>
  api("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const sendOtp = (email) =>
  api("/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

export const verifyOtp = (body) =>
  api("/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

// Profile
export function getMe(token) {
  if (!token) return Promise.reject(new Error("Missing token"));
  if (meCachePromise && meCacheToken === token) return meCachePromise;
  meCacheToken = token;
  meCachePromise = api("/me", { headers: authHeaders(token) }).catch((err) => {
    clearApiCache();
    throw err;
  });
  return meCachePromise;
}

export async function updateMe(token, formData) {
  const data = await api("/me", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  clearApiCache();
  return data;
}

// Habits
export const getHabits = (token) => api("/habits", { headers: authHeaders(token) });
export const createHabit = (token, body) =>
  api("/habits", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
export const updateHabit = (token, id, body) =>
  api(`/habits/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
export const deleteHabit = (token, id) =>
  api(`/habits/${id}`, { method: "DELETE", headers: authHeaders(token) });

export const submitProof = (token, id, formData) =>
  api(`/habits/${id}/submit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

// Logs, stats, and consolidated pages
export const getHabitLogs = (token) => api("/habitlogs", { headers: authHeaders(token) });
export const getStreak = (token) => api("/streak", { headers: authHeaders(token) });
export const getWeeklyStats = (token) => api("/weekly-stats", { headers: authHeaders(token) });
export const getDashboardSummary = (token) =>
  api("/dashboard-summary", { headers: authHeaders(token) });
export const getAnalytics = (token) => api("/analytics", { headers: authHeaders(token) });

// Guardian
export const getGuardianRequests = (token) =>
  api("/guardian/requests", { headers: authHeaders(token) });
export const approveLog = (token, id) =>
  api(`/guardian/approve/${id}`, { method: "POST", headers: authHeaders(token) });
export const rejectLog = (token, id) =>
  api(`/guardian/reject/${id}`, { method: "POST", headers: authHeaders(token) });

// Friends
export const sendFriendRequest = (token, email) =>
  api("/friends/request", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ email }),
  });
export const getFriends = (token) => api("/friends", { headers: authHeaders(token) });
export const getFriendRequests = (token) =>
  api("/friends/requests", { headers: authHeaders(token) });
export const acceptFriendRequest = (token, id) =>
  api(`/friends/accept/${id}`, { method: "POST", headers: authHeaders(token) });
export const removeFriend = (token, id) =>
  api(`/friends/${id}`, { method: "DELETE", headers: authHeaders(token) });
export const compareFriend = (token, friendId) =>
  api(`/friends/compare/${friendId}`, { headers: authHeaders(token) });

// Leaderboard
export const getLeaderboard = (token) => api("/leaderboard", { headers: authHeaders(token) });

// AI Coach
export const askCoach = (token, message) =>
  api("/ai/coach", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ message }),
  });
export const getWeeklyReport = (token) =>
  api("/ai/weekly-report", { headers: authHeaders(token) });

// Water
export const logWater = (token, amount) =>
  api("/water", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ amount }),
  });
export const getWaterToday = (token) => api("/water/today", { headers: authHeaders(token) });

// Pomodoro
export const savePomodoro = (token, body) =>
  api("/pomodoro", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
export const getPomodoroToday = (token) =>
  api("/pomodoro/today", { headers: authHeaders(token) });

// Community
export const getCommunityFeed = (token) =>
  api("/community/feed", { headers: authHeaders(token) });
export const createPost = (token, body) =>
  api("/community/post", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
export const likePost = (token, postId) =>
  api(`/community/${postId}/like`, { method: "POST", headers: authHeaders(token) });

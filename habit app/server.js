require("dotenv").config();

const express    = require("express");
const mongoose   = require("mongoose");
const bcrypt     = require("bcrypt");
const jwt        = require("jsonwebtoken");
const cors       = require("cors");
const nodemailer = require("nodemailer");
const multer     = require("multer");
const path       = require("path");

const User            = require("./models/User");
const Habit           = require("./models/Habit");
const HabitLog        = require("./models/HabitLog");
const Friend          = require("./models/Friend");
const WaterLog        = require("./models/WaterLog");
const PomodoroSession = require("./models/PomodoroSession");
const CommunityPost   = require("./models/CommunityPost");

// ─── Multer ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ─── Mailer ────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});


const app        = express();
const PORT       = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const otpStore   = {};
const frontendDist = path.join(__dirname, "..", "habit-frontend-vite", "dist");

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.static(frontendDist));

// ─── DB ───────────────────────────────────────────────────
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  }
}

// ─── Middleware ───────────────────────────────────────────
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Authorization header missing" });
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Token missing" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Badge helper ─────────────────────────────────────────
const BADGE_DEFINITIONS = [
  { key: "first_habit",  name: "First Step",      icon: "🌱", desc: "Completed your first habit" },
  { key: "streak_3",     name: "On a Roll",        icon: "🔥", desc: "3-day streak" },
  { key: "streak_7",     name: "Week Warrior",     icon: "⚡", desc: "7-day streak" },
  { key: "streak_30",    name: "Iron Will",        icon: "💎", desc: "30-day streak" },
  { key: "habits_10",    name: "Habit Collector",  icon: "🏅", desc: "Completed 10 habits total" },
  { key: "habits_50",    name: "Dedicated",        icon: "🚀", desc: "Completed 50 habits total" },
  { key: "habits_100",   name: "Legend",           icon: "👑", desc: "Completed 100 habits total" },
  { key: "early_bird",   name: "Early Bird",       icon: "🌅", desc: "Completed a habit before 8 AM" },
  { key: "social",       name: "Social Butterfly", icon: "🤝", desc: "Added your first friend" },
];

async function checkAndAwardBadges(userId, context = {}) {
  const user   = await User.findById(userId);
  const earned = new Set(user.earnedBadges.map(b => b.name));
  const toAward = [];

  if (context.totalCompleted >= 1   && !earned.has("First Step"))      toAward.push(BADGE_DEFINITIONS.find(b => b.key === "first_habit"));
  if (context.totalCompleted >= 10  && !earned.has("Habit Collector"))  toAward.push(BADGE_DEFINITIONS.find(b => b.key === "habits_10"));
  if (context.totalCompleted >= 50  && !earned.has("Dedicated"))        toAward.push(BADGE_DEFINITIONS.find(b => b.key === "habits_50"));
  if (context.totalCompleted >= 100 && !earned.has("Legend"))           toAward.push(BADGE_DEFINITIONS.find(b => b.key === "habits_100"));
  if (context.streak >= 3  && !earned.has("On a Roll"))                 toAward.push(BADGE_DEFINITIONS.find(b => b.key === "streak_3"));
  if (context.streak >= 7  && !earned.has("Week Warrior"))              toAward.push(BADGE_DEFINITIONS.find(b => b.key === "streak_7"));
  if (context.streak >= 30 && !earned.has("Iron Will"))                 toAward.push(BADGE_DEFINITIONS.find(b => b.key === "streak_30"));
  if (context.earlyBird    && !earned.has("Early Bird"))                toAward.push(BADGE_DEFINITIONS.find(b => b.key === "early_bird"));
  if (context.hasFriend    && !earned.has("Social Butterfly"))          toAward.push(BADGE_DEFINITIONS.find(b => b.key === "social"));

  if (toAward.length > 0) {
    user.earnedBadges.push(...toAward.filter(Boolean).map(b => ({ name: b.name, icon: b.icon, desc: b.desc })));
    await user.save();
  }
  return toAward.filter(Boolean);
}

// ─── Streak helper (fixed) ────────────────────────────────
async function calculateStreak(userId) {
  const logs = await HabitLog.find({ userId, status: "approved" })
    .select("date")
    .sort({ date: -1 })
    .lean();

  const dates = [...new Set(
    logs.map(l => new Date(l.date).toISOString().slice(0, 10))
  )].sort((a, b) => (a > b ? -1 : 1));

  if (dates.length === 0) return 0;

  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = Math.round((prev - curr) / 86400000);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function todayRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { today, tomorrow };
}

function isoDay(date) {
  return new Date(date).toISOString().slice(0, 10);
}

async function getWeeklyStatsForUser(userId) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const logs = await HabitLog.find({
    userId,
    status: "approved",
    date: { $gte: sevenDaysAgo }
  }).select("date").lean();

  const countsByDate = new Map();
  logs.forEach((log) => {
    const key = isoDay(log.date);
    countsByDate.set(key, (countsByDate.get(key) || 0) + 1);
  });

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push({
      day: days[d.getDay()],
      count: countsByDate.get(isoDay(d)) || 0
    });
  }
  return result;
}

async function getHabitsWithTodayStatus(userId) {
  const habits = await Habit.find({ userId }).sort({ createdAt: -1 }).lean();
  if (habits.length === 0) return [];

  const { today, tomorrow } = todayRange();
  const logs = await HabitLog.find({
    userId,
    habitId: { $in: habits.map((habit) => habit._id) },
    date: { $gte: today, $lt: tomorrow }
  }).sort({ date: -1 }).lean();

  const latestLogByHabit = new Map();
  logs.forEach((log) => {
    const key = log.habitId.toString();
    if (!latestLogByHabit.has(key)) latestLogByHabit.set(key, log);
  });

  return habits.map((habit) => {
    const log = latestLogByHabit.get(habit._id.toString());
    return { ...habit, status: log ? log.status : null, proof: log?.proof || null };
  });
}

async function getDashboardSummary(userId) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const [user, habits, logs, streak, weeklyStats] = await Promise.all([
    User.findById(userId).select("-password").lean(),
    getHabitsWithTodayStatus(userId),
    HabitLog.find({ userId, date: { $gte: oneYearAgo } }).sort({ date: -1 }).lean(),
    calculateStreak(userId),
    getWeeklyStatsForUser(userId)
  ]);

  return { user, habits, logs, streak, weeklyStats };
}

async function getAnalyticsForUser(userId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [
    user,
    habits,
    approvedLast30,
    totalLogs,
    approvedCount,
    pendingCount,
    rejectedCount,
    streak
  ] = await Promise.all([
    User.findById(userId).select("username avatar xp level totalHabitsCompleted earnedBadges").lean(),
    Habit.find({ userId }).select("category").lean(),
    HabitLog.find({ userId, status: "approved", date: { $gte: thirtyDaysAgo } }).select("date").lean(),
    HabitLog.countDocuments({ userId }),
    HabitLog.countDocuments({ userId, status: "approved" }),
    HabitLog.countDocuments({ userId, status: "pending" }),
    HabitLog.countDocuments({ userId, status: "rejected" }),
    calculateStreak(userId)
  ]);

  const categoryMap = new Map();
  habits.forEach((habit) => {
    const category = habit.category || "general";
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
  });

  const approvedByDate = new Map();
  approvedLast30.forEach((log) => {
    const key = isoDay(log.date);
    approvedByDate.set(key, (approvedByDate.get(key) || 0) + 1);
  });

  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = isoDay(d);
    last30Days.push({ date: key, count: approvedByDate.get(key) || 0 });
  }

  return {
    user,
    totalHabits: habits.length,
    totalLogs,
    approvedCount,
    pendingCount,
    rejectedCount,
    completionRate: totalLogs ? Math.round((approvedCount / totalLogs) * 100) : 0,
    streak,
    categoryBreakdown: [...categoryMap.entries()].map(([category, count]) => ({ category, count })),
    last30Days
  };
}

function buildCoachReply({ user, habits, logs, streak, weeklyStats, message }) {
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "short" });
  const dueToday = habits.filter((habit) =>
    habit.frequency === "daily" || (habit.frequency === "custom" && habit.days?.includes(todayName))
  );
  const pending = dueToday.filter((habit) => habit.status === "pending");
  const open = dueToday.filter((habit) => !habit.status);
  const weekTotal = weeklyStats.reduce((sum, day) => sum + day.count, 0);
  const lower = message.toLowerCase();

  if (lower.includes("miss") || lower.includes("slip") || lower.includes("fail")) {
    const target = open[0] || dueToday[0];
    return target
      ? `The smallest recovery move is to protect "${target.title}" today. Make the proof easy: ${target.proofType === "text" ? "write one honest sentence" : "upload a quick proof"} and submit it before you switch tasks. Your current streak is ${streak} days, so this is about keeping the chain alive, not doing everything perfectly.`
      : "You do not have a habit scheduled for today. Use that as breathing room: create one tiny habit with a proof you can complete in under two minutes.";
  }

  if (lower.includes("tomorrow") || lower.includes("plan")) {
    const names = dueToday.slice(0, 3).map((habit) => habit.title).join(", ");
    return names
      ? `Plan tomorrow around the first three commitments: ${names}. Put the easiest one first, then use that completion as momentum. If a habit needs guardian review, submit proof earlier so it is not waiting at the end of the day.`
      : "For tomorrow, add one daily habit and one wellness action. Keep both small enough that you can finish them even on a busy day.";
  }

  if (pending.length > 0) {
    return `You have ${pending.length} proof submission${pending.length === 1 ? "" : "s"} waiting for guardian review. While those are pending, focus on one unsubmitted habit instead of resubmitting the same proof. This week you have ${weekTotal} approved completion${weekTotal === 1 ? "" : "s"}.`;
  }

  if (open.length > 0) {
    return `Your next best action is "${open[0].title}". Keep it frictionless and submit proof immediately after finishing. You are level ${user?.level || 1} with ${user?.xp || 0} XP, so one approval moves the system forward.`;
  }

  return `You look caught up for today. Use the extra energy to make tomorrow easier: set a reminder, prepare proof in advance, or invite a guardian for one habit that needs accountability.`;
}

function buildWeeklyReport({ analytics, weeklyStats }) {
  const weekTotal = weeklyStats.reduce((sum, day) => sum + day.count, 0);
  const bestDay = weeklyStats.reduce((best, day) => (day.count > best.count ? day : best), weeklyStats[0] || { day: "N/A", count: 0 });
  const summary = weekTotal
    ? `You completed ${weekTotal} approved habit check-in${weekTotal === 1 ? "" : "s"} this week. Your all-time completion rate is ${analytics.completionRate}%, with ${analytics.pendingCount} proof${analytics.pendingCount === 1 ? "" : "s"} still pending.`
    : "No approved completions landed this week yet. Start with one tiny proof today to restart momentum.";

  return {
    summary,
    highlights: [
      `Best day: ${bestDay.day} with ${bestDay.count} approval${bestDay.count === 1 ? "" : "s"}`,
      `Current streak: ${analytics.streak} day${analytics.streak === 1 ? "" : "s"}`,
      `Total approved: ${analytics.approvedCount}`
    ]
  };
}

// ══════════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════════

app.get("/api/health", (req, res) => res.json({ message: "HabitCanvas server running" }));

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ username, email, password: hashedPassword }).save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Invalid email or password" });
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const existing = otpStore[email];
    if (existing && Date.now() - existing.lastSent < 60000)
      return res.status(429).json({ message: "Please wait before requesting another OTP" });
    const otp       = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    otpStore[email] = { otp: hashedOtp, expires: Date.now() + 5 * 60000, lastSent: Date.now(), attempts: 0 };
    await transporter.sendMail({
      from: process.env.EMAIL_USER, to: email,
      subject: "HabitCanvas — Email Verification",
      html: `<h2>Your OTP is: <strong>${otp}</strong></h2><p>Valid for 5 minutes.</p>`
    });
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { username, email, otp, password } = req.body;
    if (!username || !email || !otp || !password)
      return res.status(400).json({ message: "All fields are required" });
    const stored = otpStore[email];
    if (!stored) return res.status(400).json({ message: "OTP not found. Request a new one." });
    stored.attempts++;
    if (stored.attempts > 5) { delete otpStore[email]; return res.status(400).json({ message: "Too many attempts." }); }
    if (stored.expires < Date.now()) { delete otpStore[email]; return res.status(400).json({ message: "OTP expired" }); }
    if (!(await bcrypt.compare(otp, stored.otp))) return res.status(400).json({ message: "Invalid OTP" });
    if (await User.findOne({ email })) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ username, email, password: hashedPassword }).save();
    delete otpStore[email];
    res.json({ message: "Account created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ══════════════════════════════════════════════════════════
//  PROFILE
// ══════════════════════════════════════════════════════════

app.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json(user);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.put("/me", authenticateToken, upload.single("avatar"), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (req.body.username !== undefined && req.body.username.trim()) user.username = req.body.username.trim();
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.file)          user.avatar   = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ══════════════════════════════════════════════════════════
//  HABITS
// ══════════════════════════════════════════════════════════

app.post("/habits", authenticateToken, async (req, res) => {
  try {
    const { title, description, frequency, proofType, guardianEmail, reminder, days, category } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    let guardianId = null;
    if (guardianEmail) {
      const guardian = await User.findOne({ email: guardianEmail });
      if (!guardian) return res.status(404).json({ message: "Guardian user not found" });
      guardianId = guardian._id;
    }

    await new Habit({
      title, description, frequency, proofType, reminder,
      days: days || [], category: category || "general",
      userId: req.user.userId, guardianId
    }).save();

    res.status(201).json({ message: "Habit created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/habits", authenticateToken, async (req, res) => {
  try {
    res.json(await getHabitsWithTodayStatus(req.user.userId));
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/habits/:habitId/submit", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.habitId, userId: req.user.userId });
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    const proofData = req.file ? `/uploads/${req.file.filename}` : req.body.proof;

    const { today, tomorrow } = todayRange();
    const existing = await HabitLog.findOne({
      habitId: habit._id,
      userId: req.user.userId,
      date: { $gte: today, $lt: tomorrow }
    }).sort({ date: -1 });

    if (existing && existing.status === "approved") {
      return res.status(400).json({ message: "Habit already approved today" });
    }

    if (existing) {
      existing.proof = proofData;
      existing.status = "pending";
      existing.date = new Date();
      await existing.save();
    } else {
      await new HabitLog({
        habitId: habit._id, userId: req.user.userId,
        proof: proofData, status: "pending", date: new Date()
      }).save();
    }
    res.json({ message: "Proof submitted" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.put("/habits/:habitId", authenticateToken, async (req, res) => {
  try {
    const { title, description, frequency, days, proofType, guardianEmail, reminder, category } = req.body;
    const habit = await Habit.findOne({ _id: req.params.habitId, userId: req.user.userId });
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    if (title)                habit.title       = title;
    if (description !== undefined) habit.description = description;
    if (frequency)            habit.frequency   = frequency;
    if (days)                 habit.days        = days;
    if (proofType)            habit.proofType   = proofType;
    if (reminder !== undefined) habit.reminder  = reminder;
    if (category)             habit.category    = category;

    if (guardianEmail) {
      const guardian = await User.findOne({ email: guardianEmail });
      if (!guardian) return res.status(404).json({ message: "Guardian not found" });
      habit.guardianId = guardian._id;
    }

    await habit.save();
    res.json({ message: "Habit updated successfully" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.delete("/habits/:habitId", authenticateToken, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.habitId, userId: req.user.userId });
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    await HabitLog.deleteMany({ habitId: req.params.habitId });
    res.json({ message: "Habit deleted successfully" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ══════════════════════════════════════════════════════════
//  GUARDIAN
// ══════════════════════════════════════════════════════════

app.get("/guardian/requests", authenticateToken, async (req, res) => {
  try {
    const habits   = await Habit.find({ guardianId: req.user.userId });
    const habitIds = habits.map(h => h._id);
    const requests = await HabitLog.find({ habitId: { $in: habitIds }, status: "pending" })
      .populate("habitId", "title")
      .populate("userId", "email username avatar");
    res.json(requests);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/guardian/approve/:logId", authenticateToken, async (req, res) => {
  try {
    const log = await HabitLog.findById(req.params.logId);
    if (!log) return res.status(404).json({ message: "Log not found" });

    log.status     = "approved";
    log.verifiedBy = req.user.userId;
    await log.save();

    const user = await User.findById(log.userId);
    user.xp += 10;
    user.totalHabitsCompleted += 1;
    user.recalcLevel();
    await user.save();

    const streak  = await calculateStreak(log.userId);
    const isEarly = new Date(log.date).getHours() < 8;
    const newBadges = await checkAndAwardBadges(log.userId, {
      totalCompleted: user.totalHabitsCompleted,
      streak, earlyBird: isEarly
    });

    res.json({ message: "Habit approved", xpAwarded: 10, newBadges });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/guardian/reject/:logId", authenticateToken, async (req, res) => {
  try {
    const log = await HabitLog.findById(req.params.logId);
    if (!log) return res.status(404).json({ message: "Log not found" });
    log.status     = "rejected";
    log.verifiedBy = req.user.userId;
    await log.save();
    res.json({ message: "Habit rejected" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ══════════════════════════════════════════════════════════
//  LOGS + STREAK + WEEKLY STATS
// ══════════════════════════════════════════════════════════

app.get("/habitlogs", authenticateToken, async (req, res) => {
  try {
    const logs = await HabitLog.find({ userId: req.user.userId }).sort({ date: -1 }).lean();
    res.json(logs);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/streak", authenticateToken, async (req, res) => {
  try {
    const streak = await calculateStreak(req.user.userId);
    res.json({ streak });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/weekly-stats", authenticateToken, async (req, res) => {
  try {
    res.json(await getWeeklyStatsForUser(req.user.userId));
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/dashboard-summary", authenticateToken, async (req, res) => {
  try {
    res.json(await getDashboardSummary(req.user.userId));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/analytics", authenticateToken, async (req, res) => {
  try {
    res.json(await getAnalyticsForUser(req.user.userId));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ══════════════════════════════════════════════════════════
//  FRIENDS
// ══════════════════════════════════════════════════════════

app.post("/friends/request", authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    const recipient = await User.findOne({ email });
    if (!recipient) return res.status(404).json({ message: "User not found" });
    if (recipient._id.toString() === req.user.userId)
      return res.status(400).json({ message: "Cannot add yourself" });

    const existing = await Friend.findOne({
      $or: [
        { requester: req.user.userId, recipient: recipient._id },
        { requester: recipient._id,   recipient: req.user.userId }
      ]
    });
    if (existing) return res.status(400).json({ message: "Friend request already exists" });

    await new Friend({ requester: req.user.userId, recipient: recipient._id }).save();
    await checkAndAwardBadges(req.user.userId, { hasFriend: true });
    res.json({ message: "Friend request sent" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/friends", authenticateToken, async (req, res) => {
  try {
    const friendships = await Friend.find({
      $or: [{ requester: req.user.userId }, { recipient: req.user.userId }],
      status: "accepted"
    }).populate("requester", "username email avatar xp level")
      .populate("recipient", "username email avatar xp level");

    const friends = friendships.map(f =>
      f.requester._id.toString() === req.user.userId ? f.recipient : f.requester
    );
    res.json(friends);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/friends/requests", authenticateToken, async (req, res) => {
  try {
    const requests = await Friend.find({ recipient: req.user.userId, status: "pending" })
      .populate("requester", "username email avatar xp level");
    res.json(requests);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/friends/accept/:id", authenticateToken, async (req, res) => {
  try {
    const request = await Friend.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    request.status = "accepted";
    await request.save();
    res.json({ message: "Friend request accepted" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.delete("/friends/:id", authenticateToken, async (req, res) => {
  try {
    await Friend.findByIdAndDelete(req.params.id);
    res.json({ message: "Friend removed" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/friends/compare/:friendId", authenticateToken, async (req, res) => {
  try {
    const myId     = req.user.userId;
    const friendId = req.params.friendId;

    const [me, friend] = await Promise.all([
      User.findById(myId).select("username avatar xp level totalHabitsCompleted earnedBadges"),
      User.findById(friendId).select("username avatar xp level totalHabitsCompleted earnedBadges")
    ]);

    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 6); weekAgo.setHours(0, 0, 0, 0);

    const [myLogs, friendLogs, myStreak, friendStreak] = await Promise.all([
      HabitLog.find({ userId: myId,     date: { $gte: weekAgo }, status: "approved" }),
      HabitLog.find({ userId: friendId, date: { $gte: weekAgo }, status: "approved" }),
      calculateStreak(myId),
      calculateStreak(friendId)
    ]);

    res.json({
      me:     { ...me.toObject(),     weekCount: myLogs.length,     streak: myStreak },
      friend: { ...friend.toObject(), weekCount: friendLogs.length, streak: friendStreak }
    });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/leaderboard", authenticateToken, async (req, res) => {
  try {
    const friendships = await Friend.find({
      $or: [{ requester: req.user.userId }, { recipient: req.user.userId }],
      status: "accepted"
    });

    const friendIds = friendships.map(f =>
      f.requester.toString() === req.user.userId ? f.recipient : f.requester
    );
    friendIds.push(req.user.userId);

    const users = await User.find({ _id: { $in: friendIds } })
      .select("username avatar xp level totalHabitsCompleted")
      .sort({ xp: -1 });

    res.json(users);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});


app.get("/stats/users", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ══════════════════════════════════════════════════════════
//  WATER
// ══════════════════════════════════════════════════════════

app.post("/water", authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });
    await new WaterLog({ userId: req.user.userId, amount }).save();
    res.json({ message: "Water logged" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/water/today", authenticateToken, async (req, res) => {
  try {
    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const logs     = await WaterLog.find({ userId: req.user.userId, date: { $gte: today, $lt: tomorrow } });
    const total    = logs.reduce((sum, l) => sum + l.amount, 0);
    res.json({ total, logs });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ══════════════════════════════════════════════════════════
//  POMODORO
// ══════════════════════════════════════════════════════════

app.post("/pomodoro", authenticateToken, async (req, res) => {
  try {
    const { duration, label, completed } = req.body;
    await new PomodoroSession({ userId: req.user.userId, duration: duration || 25, label: label || "", completed: !!completed }).save();
    res.json({ message: "Session saved" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/pomodoro/today", authenticateToken, async (req, res) => {
  try {
    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const sessions = await PomodoroSession.find({ userId: req.user.userId, date: { $gte: today, $lt: tomorrow } });
    res.json({ sessions, completed: sessions.filter(s => s.completed).length });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ══════════════════════════════════════════════════════════
//  COMMUNITY
// ══════════════════════════════════════════════════════════

app.get("/community/feed", authenticateToken, async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .sort({ createdAt: -1 }).limit(50)
      .populate("userId", "username avatar level");
    res.json(posts);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/community/post", authenticateToken, async (req, res) => {
  try {
    const { content, type, habitId } = req.body;
    if (!content) return res.status(400).json({ message: "Content required" });
    const post = await new CommunityPost({
      userId: req.user.userId, content,
      type: type || "general", habitId: habitId || null
    }).save();
    await post.populate("userId", "username avatar level");
    res.status(201).json(post);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/community/:postId/like", authenticateToken, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const idx = post.likes.indexOf(req.user.userId);
    if (idx === -1) post.likes.push(req.user.userId);
    else            post.likes.splice(idx, 1);
    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// AI COACH
app.post("/ai/coach", authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const [summary, analytics] = await Promise.all([
      getDashboardSummary(req.user.userId),
      getAnalyticsForUser(req.user.userId)
    ]);

    const reply = buildCoachReply({
      user: summary.user,
      habits: summary.habits,
      logs: summary.logs,
      streak: summary.streak,
      weeklyStats: summary.weeklyStats,
      analytics,
      message
    });

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: "Coach is unavailable right now" });
  }
});

app.get("/ai/weekly-report", authenticateToken, async (req, res) => {
  try {
    const [analytics, weeklyStats] = await Promise.all([
      getAnalyticsForUser(req.user.userId),
      getWeeklyStatsForUser(req.user.userId)
    ]);
    res.json(buildWeeklyReport({ analytics, weeklyStats }));
  } catch (err) {
    res.status(500).json({ message: "Weekly report is unavailable right now" });
  }
});

app.post("/auth/google", async (req, res) => {
  try {
    const { credential, access_token } = req.body;
    if (!credential && !access_token) {
      return res.status(400).json({ message: "No Google token provided" });
    }

    let payload;
    if (credential) {
      // Backward compatible: decode credential JWT payload.
      payload = JSON.parse(Buffer.from(credential.split(".")[1], "base64").toString());
    } else {
      // Preferred for current frontend flow: verify Google access token through userinfo endpoint.
      const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      if (!googleRes.ok) {
        return res.status(401).json({ message: "Invalid Google access token" });
      }
      payload = await googleRes.json();
    }

    const { email, name, picture, sub } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Auto-create account for new Google users
      const randomPassword = await bcrypt.hash(sub + JWT_SECRET, 10);
      user = new User({
        username: name,
        email,
        password:  randomPassword,
        avatar:    picture || ""
      });
      await user.save();
    }

    // Update avatar if they have a Google profile pic
    if (picture && !user.avatar) {
      user.avatar = picture;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Google login successful", token });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ message: "Google login failed" });
  }
});


// ══════════════════════════════════════════════════════════
//  START
// ══════════════════════════════════════════════════════════

app.get("/profile", authenticateToken, (req, res) => res.json({ user: req.user }));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"), (err) => {
    if (err) res.status(404).json({ message: "Not found" });
  });
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}
startServer();

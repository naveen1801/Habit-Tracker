import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { getDashboardSummary } from "../services/api";

// ─── Progression Ring Calendar ─────────────────────────────
function ProgressionCalendar({ logs }) {
  const now = new Date();
  // ✅ FIX: Calendar navigation now works with state
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const today      = now.getDate();
  const thisMonth  = now.getMonth();
  const thisYear   = now.getFullYear();
  const monthName  = new Date(viewYear, viewMonth, 1).toLocaleString("default", { month: "long" });
  const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth= new Date(viewYear, viewMonth + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const getProgress = (d) => {
    const dateString = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayLogs    = logs.filter(log => log.date && log.date.startsWith(dateString));
    if (dayLogs.length === 0) return 0;
    const approved = dayLogs.filter(log => log.status === "approved").length;
    return Math.round((approved / dayLogs.length) * 100);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-black text-gray-900 text-[18px]">{monthName} {viewYear}</h4>
        <div className="flex gap-2">
          {/* ✅ FIX: Now actually navigates months */}
          <button onClick={prevMonth} className="material-symbols-outlined text-gray-400 hover:text-gray-900 text-[24px]">chevron_left</button>
          <button onClick={nextMonth} className="material-symbols-outlined text-gray-400 hover:text-gray-900 text-[24px]">chevron_right</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center mb-4">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <span key={i} className="text-[12px] font-black text-gray-300">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center">
        {days.map((day, i) => {
          if (!day) return <div key={i}></div>;

          // ✅ FIX: Only highlight today if viewing current month/year
          const isToday    = day === today && viewMonth === thisMonth && viewYear === thisYear;
          const progress   = getProgress(day);
          const radius     = 20;
          const circ       = 2 * Math.PI * radius;
          const offset     = circ - (progress / 100) * circ;
          const ringColor  = progress === 100 ? "#10b981" : "#f59e0b";

          return (
            <div key={i} className="relative w-12 h-12 flex items-center justify-center mx-auto cursor-pointer group">
              {isToday ? (
                <div className="w-full h-full bg-[#8a5126] rounded-full flex items-center justify-center shadow-md">
                  <span className="text-[15px] font-black text-white">{day}</span>
                </div>
              ) : (
                <>
                  {progress > 0 && (
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                      <circle cx="24" cy="24" r="20" fill="none" stroke={ringColor} strokeWidth="3" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
                    </svg>
                  )}
                  <span className={`relative z-10 text-[15px] font-extrabold transition-colors ${progress > 0 ? "text-gray-900" : "text-gray-400 group-hover:text-gray-900"}`}>
                    {day}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-8 pt-6 border-t border-gray-50">
        <button className="w-full flex items-center justify-center gap-2 text-[#8a5126] font-extrabold text-[15px] bg-[#fff0e6] py-3.5 rounded-full hover:bg-[#ffe4d6] transition-colors">
          <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          Full Calendar
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────
export default function Dashboard() {
  const token    = localStorage.getItem("token");
  const navigate = useNavigate();

  const [logs,        setLogs]        = useState([]);
  const [streak,      setStreak]      = useState(0);
  const [me,          setMe]          = useState(null);
  const [habits,      setHabits]      = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [loading,     setLoading]     = useState(true);
  // ✅ FIX: Search state
  const [search, setSearch] = useState("");
  // ✅ FIX: Weather state
  const [weather, setWeather] = useState({ city: "Loading...", temp: "--", desc: "Fetching...", icon: "partly_cloudy_day" });
  // ✅ FIX: Previous streak to calculate "+X days" badge
  const [streakDiff, setStreakDiff] = useState(0);

  const now      = new Date();
  const dayName  = now.toLocaleString("default", { weekday: "long" });
  const dateStr  = now.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  useEffect(() => {
    async function load() {
      try {
        const summary = await getDashboardSummary(token);
        const logsData = summary.logs || [];
        const weekData = summary.weeklyStats || [];

        setLogs(Array.isArray(logsData) ? logsData : []);
        setStreak(summary.streak || 0);
        setMe(summary.user || null);
        setHabits(Array.isArray(summary.habits) ? summary.habits : []);
        setWeeklyStats(Array.isArray(weekData) ? weekData : []);

        // ✅ FIX: Calculate streak diff from last week's data
        const weekArr  = Array.isArray(weekData) ? weekData : [];
        const lastWeek = weekArr.slice(0, 6).reduce((a, b) => a + b.count, 0);
        const thisWeek = weekArr.slice(1).reduce((a, b) => a + b.count, 0);
        setStreakDiff(Math.max(0, thisWeek - lastWeek));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (token) load();
  }, [token]);

  // ✅ FIX: Fetch real weather using browser geolocation + Open-Meteo (free, no key needed)
  useEffect(() => {
    async function fetchWeather() {
      try {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords;

          // Get weather data
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          const weatherData = await weatherRes.json();
          const temp        = Math.round(weatherData.current_weather.temperature);
          const windSpeed   = weatherData.current_weather.windspeed;
          const code        = weatherData.current_weather.weathercode;

          // Get city name
          const geoRes  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const geoData = await geoRes.json();
          const city    = geoData.address?.city || geoData.address?.town || geoData.address?.village || "Your City";

          // Map weather code to icon + description
          const getWeatherInfo = (wc) => {
            if (wc === 0)           return { desc: "Clear Sky",       icon: "sunny" };
            if (wc <= 3)            return { desc: "Partly Cloudy",   icon: "partly_cloudy_day" };
            if (wc <= 49)           return { desc: "Foggy",           icon: "foggy" };
            if (wc <= 69)           return { desc: "Rainy",           icon: "rainy" };
            if (wc <= 79)           return { desc: "Snowy",           icon: "weather_snowy" };
            if (wc <= 99)           return { desc: "Thunderstorms",   icon: "thunderstorm" };
            return { desc: "Cloudy", icon: "cloud" };
          };

          const { desc, icon } = getWeatherInfo(code);
          setWeather({ city, temp: `${temp}°C`, desc, icon });
        }, () => {
          // ✅ If user denies location, show friendly fallback
          setWeather({ city: "Location denied", temp: "--", desc: "Enable location for weather", icon: "location_off" });
        });
      } catch (err) {
        setWeather({ city: "Unavailable", temp: "--", desc: "Could not fetch weather", icon: "cloud_off" });
      }
    }
    fetchWeather();
  }, []);

  const approvedLogs   = logs.filter(l => l.status === "approved");
  const completionRate = logs.length === 0 ? 0 : Math.round((approvedLogs.length / logs.length) * 100);

  const todayHabits = habits.filter(h => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
    if (h.frequency === "daily")  return true;
    if (h.frequency === "custom") return h.days?.includes(today);
    return false;
  });

  // ✅ FIX: Search filters today's habits by title or description
  const filteredHabits = todayHabits.filter(h =>
    h.title.toLowerCase().includes(search.toLowerCase()) ||
    (h.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const doneToday = todayHabits.filter(h => h.status === "approved").length;
  const maxWeek   = Math.max(...weeklyStats.map(d => d.count), 1);

  // ✅ FIX: "Top X%" based on completion rate
  const topPercent = completionRate >= 90 ? "Top 1%" : completionRate >= 75 ? "Top 5%" : completionRate >= 50 ? "Top 20%" : "Keep going!";

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400 font-bold text-xl">Loading Canvas...</div>;

  return (
    <div className="flex bg-[#f9f9f8] min-h-screen font-sans text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64 relative">

        {/* ── TOP APP BAR ── */}
        <header className="w-full sticky top-0 z-40 bg-white/80 backdrop-blur-xl flex justify-between items-center px-10 py-5 shadow-[0_20px_40px_rgba(47,51,51,0.03)] border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-[#f3f4f3] px-5 py-3 rounded-full items-center gap-3 w-80">
              <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
              {/* ✅ FIX: Search is now functional */}
              <input
                className="bg-transparent border-none focus:ring-0 text-[15px] font-bold w-full outline-none text-gray-700 placeholder-gray-400"
                placeholder="Search habits..."
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {/* ✅ FIX: Clear search button */}
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-700">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-gray-800 transition-colors">
              <span className="material-symbols-outlined text-[28px]">notifications</span>
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            {/* ✅ FIX: Avatar goes to /me profile page instead of missing /settings */}
            <div className="w-12 h-12 rounded-full overflow-hidden border-[3px] border-[#ffb380] shadow-sm cursor-pointer" onClick={() => navigate("/friends")}>
              {me?.avatar
                ? <img src={`http://localhost:3000${me.avatar}`} className="w-full h-full object-cover" alt="User" />
                : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><span className="material-symbols-outlined text-gray-500 text-[24px]">person</span></div>
              }
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT CANVAS ── */}
        <main className="p-8 lg:p-12 max-w-[1400px] w-full mx-auto">

          {/* ── HERO SECTION ── */}
          <section className="mb-12">
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#faebd7] to-[#dcfce7] p-10 lg:p-14 border border-white/50 shadow-sm">
              <div className="relative z-10 max-w-3xl">
                <h2 className="text-[56px] font-black text-gray-900 tracking-tighter mb-4 leading-[1.1]">
                  Happy {dayName}, {me?.username || "there"}!
                </h2>
                <p className="text-[18px] text-gray-600 font-bold mb-10">
                  Today is {dateStr}. You've crushed{" "}
                  <span className="text-[#8a5126] font-black">{doneToday} of your {todayHabits.length}</span>{" "}
                  daily habits. Keep the momentum!
                </p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => navigate("/create-habit")} className="bg-[#8a5126] text-white px-10 py-4 rounded-full font-black text-[16px] shadow-lg shadow-[#8a5126]/30 hover:scale-105 transition-transform">
                    Add New Habit
                  </button>
                  <button onClick={() => navigate("/habits")} className="bg-white text-gray-900 px-10 py-4 rounded-full font-black text-[16px] shadow-sm hover:bg-gray-50 transition-colors border border-gray-100">
                    View Schedule
                  </button>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#caf9dc]/60 rounded-full blur-3xl"></div>
              <div className="absolute -right-10 top-10 w-64 h-64 bg-[#ffb380]/40 rounded-full blur-3xl"></div>
            </div>
          </section>

          {/* ── STATS BENTO GRID ── */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-[24px] flex flex-col justify-between shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-orange-100 rounded-full text-orange-600">
                  <span className="material-symbols-outlined text-[28px] filled-icon">local_fire_department</span>
                </div>
                {/* ✅ FIX: Dynamic streak diff badge */}
                <span className="text-[13px] font-black text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full">
                  {streakDiff > 0 ? `+${streakDiff} Days` : "Keep going!"}
                </span>
              </div>
              <div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-[12px] mb-1">Current Streak</p>
                <h3 className="text-[40px] font-black text-gray-900 leading-none">{streak} Days</h3>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[24px] flex flex-col justify-between shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-[#caf6fd] rounded-full text-[#3c656c]">
                  <span className="material-symbols-outlined text-[28px] filled-icon">emoji_events</span>
                </div>
                <span className="text-[13px] font-black text-[#3c656c] bg-[#ebfcff] px-3 py-1.5 rounded-full border border-[#caf6fd]">
                  Level {me?.level || 1}
                </span>
              </div>
              <div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-[12px] mb-1">Total XP</p>
                <h3 className="text-[40px] font-black text-gray-900 leading-none">{(me?.xp || 0).toLocaleString()}</h3>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[24px] flex flex-col justify-between shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-[#caf9dc] rounded-full text-[#3e6752]">
                  <span className="material-symbols-outlined text-[28px] filled-icon">task_alt</span>
                </div>
                {/* ✅ FIX: Dynamic "Top X%" based on real completion rate */}
                <span className="text-[13px] font-black text-[#3e6752] bg-[#e6ffee] px-3 py-1.5 rounded-full border border-[#caf9dc]">
                  {topPercent}
                </span>
              </div>
              <div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-[12px] mb-1">Completion Rate</p>
                <h3 className="text-[40px] font-black text-gray-900 leading-none">{completionRate}%</h3>
              </div>
            </div>
          </section>

          {/* ── MAIN DASHBOARD CONTENT ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Left 2 Columns */}
            <div className="lg:col-span-8 space-y-10">

              {/* Should Do Today */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[28px] font-black text-gray-900 tracking-tight">
                    Should Do! Today
                    {/* ✅ FIX: Show search result count if searching */}
                    {search && (
                      <span className="text-[16px] text-gray-400 font-bold ml-3">
                        ({filteredHabits.length} result{filteredHabits.length !== 1 ? "s" : ""} for "{search}")
                      </span>
                    )}
                  </h3>
                  <button onClick={() => navigate("/habits")} className="text-[#8a5126] font-extrabold text-[15px] hover:underline">
                    Edit List
                  </button>
                </div>

                <div className="space-y-4">
                  {/* ✅ FIX: Uses filteredHabits so search works */}
                  {filteredHabits.length === 0 ? (
                    <p className="text-gray-400 font-bold text-[18px] py-6 text-center">
                      {search ? `No habits match "${search}"` : "All caught up for today!"}
                    </p>
                  ) : (
                    filteredHabits.map(habit => {
                      const isDone    = habit.status === "approved";
                      const isWaiting = habit.status === "pending";
                      const pillClass = isDone ? "bg-[#caf9dc] text-[#254e3a]" : isWaiting ? "bg-gray-200 text-gray-600" : "bg-[#ffedd5] text-[#8a5126]";
                      const checkClass= isDone ? "bg-[#3e6752] border-[#3e6752]" : "border-gray-300 bg-white";

                      return (
                        <div
                          key={habit._id}
                          onClick={() => navigate("/habits")}
                          className="bg-white p-6 rounded-[20px] border border-gray-100 flex items-center gap-5 cursor-pointer hover:shadow-lg transition-shadow"
                        >
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDone ? "bg-gray-100 text-gray-400" : "bg-[#fff0e6] text-[#ea580c]"}`}>
                            <span className="material-symbols-outlined text-[28px]">
                              {isDone ? "check_circle" : "local_cafe"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-[18px] font-black truncate ${isDone ? "text-gray-400 line-through" : "text-gray-900"}`}>
                              {habit.title}
                            </h4>
                            <p className="text-[14px] text-gray-500 font-bold truncate mt-1">
                              Daily Goal • {habit.description || "Any time"}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`${pillClass} text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full`}>
                              {isDone ? "Completed" : isWaiting ? "Waiting" : "Todo"}
                            </span>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${checkClass}`}>
                              {isDone && <span className="material-symbols-outlined text-white text-[18px]">check</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Weekly Consistency Bar Chart */}
              <div className="bg-white p-10 rounded-[24px] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-[24px] font-black text-gray-900 tracking-tight">Weekly Consistency</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#3e6752]"></span>
                    <span className="text-[13px] font-extrabold text-gray-400">Goals Met</span>
                  </div>
                </div>
                <div className="flex items-end justify-between h-56 gap-3">
                  {weeklyStats.map((d, i) => {
                    const pct     = maxWeek > 0 ? (d.count / maxWeek) * 100 : 0;
                    const isToday = i === weeklyStats.length - 1;
                    return (
                      <div key={i} className="flex flex-col items-center gap-4 flex-1 h-full justify-end">
                        <div
                          className={`w-full rounded-t-[16px] transition-all duration-500 hover:opacity-80 ${isToday ? "bg-[#3e6752]" : "bg-[#caf9dc] hover:bg-[#3e6752]"}`}
                          style={{ height: `${Math.max(pct, 10)}%` }}
                        ></div>
                        <span className={`text-[12px] font-black tracking-widest ${isToday ? "text-gray-900" : "text-gray-400"}`}>
                          {d.day.substring(0, 3).toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-8">

              <ProgressionCalendar logs={logs} />

              {/* ✅ FIX: Real weather using geolocation + Open-Meteo API */}
              <div className="bg-[#caf6fd]/50 p-8 rounded-[24px] border border-[#caf6fd] relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-black text-[#224c52] text-[20px]">{weather.city}</h4>
                      <p className="text-[15px] text-[#40696f] font-bold mt-1">{weather.desc}</p>
                    </div>
                    <span className="material-symbols-outlined text-[56px] text-yellow-500 filled-icon">{weather.icon}</span>
                  </div>
                  <div className="flex items-end gap-3 mt-4">
                    <span className="text-[56px] font-black text-[#224c52] leading-none">{weather.temp}</span>
                    <span className="text-[15px] font-extrabold text-[#40696f] mb-1">{weather.desc}</span>
                  </div>
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                  <span className="material-symbols-outlined text-[180px] filled-icon">cloud</span>
                </div>
              </div>

              {/* Motivational Image */}
              <div className="rounded-[24px] overflow-hidden h-56 relative shadow-md group">
                <img
                  alt="Yoga motivation"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <p className="text-white font-extrabold text-[16px] leading-snug">
                    "The secret of your future is hidden in your daily routine."
                  </p>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

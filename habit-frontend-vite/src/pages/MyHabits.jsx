import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardSummary, submitProof, deleteHabit } from "../services/api";
import HabitCard from "../components/HabitCard";
import Sidebar from "../components/layout/Sidebar";

export default function MyHabits() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [habits, setHabits] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const summary = await getDashboardSummary(token);
        const habitsData = summary.habits || [];
        const weekData = summary.weeklyStats || [];

        const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
        const filtered = Array.isArray(habitsData) ? habitsData.filter(habit => {
          if (habit.frequency === "daily") return true;
          if (habit.frequency === "custom") return habit.days?.includes(today);
          return false;
        }) : [];
        
        setHabits(filtered);
        setWeeklyStats(Array.isArray(weekData) ? weekData : []);
        setStreak(summary.streak || 0);
        setBadges(summary.user?.earnedBadges?.length || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  const handleTextProof = async (habit, proof) => {
    if (!proof) return;
    try {
      const formData = new FormData();
      formData.append("proof", proof);
      await submitProof(token, habit._id, formData);
      setHabits(prev => prev.map(h => h._id === habit._id ? { ...h, status: "pending", proof } : h));
    } catch (err) { console.error(err); }
  };

  const handleFileProof = async (habit) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = habit.proofType === "image" ? "image/*" : "video/*";
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      try {
        await submitProof(token, habit._id, formData);
        setHabits(prev => prev.map(h => h._id === habit._id ? { ...h, status: "pending" } : h));
      } catch (err) { console.error(err); }
    };
    input.click();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this habit and all its logs?")) return;
    try {
      await deleteHabit(token, id);
      setHabits(prev => prev.filter(h => h._id !== id));
    } catch (err) { console.error(err); }
  };

  const maxWeek = Math.max(...weeklyStats.map(d => d.count), 1);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400 font-bold bg-[#f9f9f8]">Loading Habits...</div>;

  return (
    <div className="flex bg-[#f9f9f8] min-h-screen font-sans text-[#2f3333]">
      <Sidebar />

      <main className="ml-0 md:ml-64 flex-1 p-8 lg:p-12 w-full max-w-[1600px] mx-auto overflow-y-auto">
        
        {/* ── Header Section ── */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-start mb-12 gap-6">
          <div>
            <h1 className="text-[44px] lg:text-[56px] font-black tracking-tight mb-1 leading-none text-gray-900">Today's Habits</h1>
            <p className="text-[#5c605f] font-bold text-[16px]">You have {habits.length} habits for today. Keep going 🚀</p>
          </div>
          <button 
            onClick={() => navigate("/create-habit")}
            className="bg-[#ffb380] text-[#633108] px-8 py-4 rounded-full font-black text-[15px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#ffb380]/20 shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create Habit
          </button>
        </header>

        {/* ── Bento Layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Stats Column (Col-3) */}
          <aside className="xl:col-span-3 flex flex-col gap-8">
            
            {/* Weekly Growth Card */}
            <div className="bg-[#caf9dc] p-8 rounded-[40px] flex flex-col gap-6 shadow-sm border border-[#bceace]">
              <div className="flex justify-between items-center">
                <span className="material-symbols-outlined text-[#3e6752] text-[32px] filled-icon">trending_up</span>
                <span className="bg-white/50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#37614b]">Weekly Growth</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[48px] font-black text-[#37614b] leading-none mb-1">84%</span>
                <span className="text-[14px] font-bold text-[#37614b]/80">Completion rate this week</span>
              </div>
              <div className="h-28 flex items-end gap-2 mt-2">
                {weeklyStats.slice(-7).map((d, i) => {
                  const pct = maxWeek > 0 ? (d.count / maxWeek) * 100 : 0;
                  const isToday = i === weeklyStats.slice(-7).length - 1;
                  return (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-t-[10px] transition-all duration-700 ${isToday ? "bg-[#3e6752]" : "bg-[#37614b]/15"}`}
                      style={{ height: `${Math.max(pct, 15)}%` }}
                    ></div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-[#f3f4f3] p-8 rounded-[40px] flex flex-col gap-6 shadow-sm border border-[#e0e3e2]">
              <h3 className="text-[12px] font-black uppercase tracking-widest text-[#787b7b] mb-2">Quick Stats</h3>
              
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-[#caf6fd] rounded-3xl flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[#3c656c] text-[28px] filled-icon">local_fire_department</span>
                </div>
                <div>
                  <p className="text-[12px] font-extrabold text-[#787b7b] mb-0.5">Longest Streak</p>
                  <p className="text-[24px] font-black text-gray-900 leading-none">{streak} Days</p>
                </div>
              </div>

              <div className="flex items-center gap-5 mt-2">
                <div className="w-14 h-14 bg-[#ffb380] rounded-3xl flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[#8a5126] text-[28px] filled-icon">emoji_events</span>
                </div>
                <div>
                  <p className="text-[12px] font-extrabold text-[#787b7b] mb-0.5">Badges Earned</p>
                  <p className="text-[24px] font-black text-gray-900 leading-none">{badges}</p>
                </div>
              </div>
            </div>

          </aside>

          {/* Right Habits Grid (Col-9) */}
          <div className="xl:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {habits.length === 0 ? (
                <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center bg-white p-14 rounded-[40px] border border-gray-100 shadow-sm">
                  <span className="material-symbols-outlined text-[64px] text-gray-300 mb-4">checklist</span>
                  <p className="text-[24px] font-black text-gray-900">No habits assigned for today!</p>
                  <p className="text-gray-500 font-bold mt-2 text-[15px]">Take a break or create a new one.</p>
                </div>
              ) : (
                habits.map((habit) => (
                  <HabitCard 
                    key={habit._id} 
                    habit={habit} 
                    onTextSubmit={handleTextProof}
                    onFileSubmit={handleFileProof}
                    onEdit={(id) => navigate(`/edit-habit/${id}`)}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

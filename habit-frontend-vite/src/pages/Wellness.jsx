import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import { logWater, getWaterToday, savePomodoro, getPomodoroToday, getMe } from "../services/api";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
//  POMODORO TIMER (Warm Peach Theme)
// ─────────────────────────────────────────────
function PomodoroTimer() {
  const token = localStorage.getItem("token");
  const MODES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
  
  const [mode, setMode] = useState("focus");
  const [seconds, setSeconds] = useState(MODES.focus);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    getPomodoroToday(token).then(d => setDone(d.completed)).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "focus") {
              savePomodoro(token, { duration: 25, label: "Focus Session", completed: true })
                .then(() => setDone(d => d + 1));
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, token]);

  const switchMode = (m) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setMode(m);
    setSeconds(MODES[m]);
  };

  const reset = () => {
    setRunning(false);
    setSeconds(MODES[mode]);
  };

  const pct = ((MODES[mode] - seconds) / MODES[mode]) * 100;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const r = 130;
  const circ = 2 * Math.PI * r;
  const dash = circ - (pct / 100) * circ;

  return (
    <section className="lg:col-span-7 bg-[#fff0e5] rounded-[40px] p-10 lg:p-14 flex flex-col items-center justify-center relative overflow-hidden group shadow-sm border border-[#ffb380]/20">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <span className="material-symbols-outlined text-[140px] text-[#8a5126]">timer</span>
      </div>

      {/* Tabs */}
      <div className="bg-white/50 backdrop-blur p-1.5 rounded-full flex gap-1 mb-14 relative z-10 shadow-sm border border-white/60">
        {[
          { key: "focus", label: "Focus" },
          { key: "short", label: "Short Break" },
          { key: "long", label: "Long Break" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => switchMode(tab.key)}
            className={`px-8 py-3 rounded-full text-[15px] font-bold transition-colors ${
              mode === tab.key ? "bg-white text-[#8a5126] shadow-sm" : "text-[#8a5126]/60 hover:bg-white/40"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Large Circular Timer */}
      <div className="relative w-[300px] h-[300px] flex items-center justify-center mb-14">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 288 288">
          <circle className="opacity-30" cx="144" cy="144" fill="transparent" r={r} stroke="white" strokeWidth="12"></circle>
          <circle cx="144" cy="144" fill="transparent" r={r} stroke="#8a5126" strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" strokeWidth="12" style={{ transition: "stroke-dashoffset 1s linear" }}></circle>
        </svg>
        <div className="absolute flex flex-col items-center mt-2">
          <span className="text-[80px] font-black text-[#8a5126] tracking-tighter leading-none">{mm}:{ss}</span>
          <span className="text-[14px] font-black uppercase tracking-[0.25em] text-[#8a5126]/50 mt-1">minutes</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8 relative z-10">
        <button onClick={reset} className="w-16 h-16 rounded-full bg-white text-[#8a5126] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-[#8a5126]/5">
          <span className="material-symbols-outlined text-[28px]">replay</span>
        </button>
        <button onClick={() => setRunning(!running)} className="px-14 py-5 rounded-full bg-[#ffb380] text-[#633108] text-[20px] font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#ffb380]/40 tracking-tight">
          {running ? "Pause Session" : mode === "focus" ? "Start Focus" : "Start Break"}
        </button>
        <button className="w-16 h-16 rounded-full bg-white text-[#8a5126] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-[#8a5126]/5">
          <span className="material-symbols-outlined text-[28px]">settings</span>
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  WATER TRACKER (Mint Green Theme)
// ─────────────────────────────────────────────
function WaterTracker() {
  const token = localStorage.getItem("token");
  const GOAL = 2000;
  
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getWaterToday(token).then(d => setTotal(d.total)).catch(() => {});
  }, [token]);

  const addWater = async (amount) => {
    setLoading(true);
    try {
      await logWater(token, amount);
      setTotal(t => t + amount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pct = Math.min((total / GOAL) * 100, 100);

  return (
    <section className="lg:col-span-5 bg-[#e5f7ee] rounded-[40px] p-10 flex flex-col h-full border border-[#caf9dc]/50 shadow-sm">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-[28px] font-black text-[#254e3a] tracking-tight mb-1">Stay Hydrated</h3>
          <p className="text-[#37614b] font-bold opacity-70 text-[16px]">Drink up, stay fresh.</p>
        </div>
        <div className="bg-white/50 p-4 rounded-[20px] shadow-sm">
          <span className="material-symbols-outlined text-[#254e3a] text-[28px] filled-icon">water_drop</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-10 py-6">
        {/* Visual Glass Representation */}
        <div className="relative w-40 h-56 border-[6px] border-white/70 rounded-b-[40px] rounded-t-[12px] overflow-hidden shadow-inner bg-white/20">
          <div 
            className="absolute bottom-0 left-0 right-0 bg-[#3e6752]/30 transition-all duration-1000 ease-out"
            style={{ height: `${pct}%` }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[36px] font-black text-[#254e3a]">{Math.round(pct)}%</span>
          </div>
        </div>
        
        <div className="text-center">
          <span className="text-[52px] font-black text-[#254e3a] leading-none block mb-2">{total} ml</span>
          <span className="text-[18px] font-extrabold text-[#37614b] opacity-60">of {GOAL} ml</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-auto">
        <button onClick={() => addWater(150)} disabled={loading} className="bg-white/60 hover:bg-white py-5 rounded-[24px] font-black text-[#254e3a] text-[16px] transition-all active:scale-95 shadow-sm">150ml</button>
        <button onClick={() => addWater(250)} disabled={loading} className="bg-white/60 hover:bg-white py-5 rounded-[24px] font-black text-[#254e3a] text-[16px] transition-all active:scale-95 shadow-sm">250ml</button>
        <button onClick={() => addWater(500)} disabled={loading} className="bg-[#caf9dc] hover:bg-[#bceace] text-[#254e3a] py-5 rounded-[24px] font-black text-[16px] transition-all active:scale-95 shadow-sm">+ Custom</button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  MEDITATION TIMER (Deep Purple Theme)
// ─────────────────────────────────────────────
function MeditationCards() {
  const PATTERNS = [
    { id: "simple", label: "Simple Breathing", min: 3, icon: "air", desc: "A basic 4s-4s inhale/exhale rhythm for quick relaxation." },
    { id: "box",    label: "Box Breathing",    min: 5, icon: "square", desc: "Used by professionals to reduce stress: 4s inhale, 4s hold, 4s exhale, 4s hold." },
    { id: "sleep",  label: "4-7-8 Breathing",  min: 10, icon: "mode_fan", desc: "Powerful technique for falling asleep and deep anxiety relief." }
  ];

  const [activeId, setActiveId] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  const startSession = (id, minutes) => {
    setActiveId(id);
    setSeconds(minutes * 60);
  };

  const stopSession = () => {
    setActiveId(null);
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (activeId) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            stopSession();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [activeId]);

  return (
    <section className="lg:col-span-12 bg-[#f5e5ff] rounded-[40px] p-10 lg:p-12 shadow-sm border border-[#5d417a]/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h3 className="text-[36px] font-black text-[#5d417a] tracking-tight mb-2">Breathe & Centered</h3>
          <p className="text-[#5d417a]/80 font-bold text-[18px]">Choose a guided breathing technique to calm your mind.</p>
        </div>
        <div className="bg-white/50 backdrop-blur-md px-8 py-5 rounded-[24px] flex items-center gap-4 shadow-sm border border-white">
          <span className="material-symbols-outlined text-[#5d417a] text-[32px]">history</span>
          <div>
            <p className="text-[11px] uppercase font-black text-[#5d417a]/60 tracking-widest mb-0.5">Total Time</p>
            <p className="text-[18px] font-black text-[#5d417a] leading-none">14h 25m</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PATTERNS.map((p) => {
          const isActive = activeId === p.id;
          
          if (isActive) {
            // ACTIVE STATE CARD
            const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
            const ss = String(seconds % 60).padStart(2, "0");
            const pct = ((p.min * 60 - seconds) / (p.min * 60)) * 100;

            return (
              <div key={p.id} className="bg-white p-8 rounded-[32px] shadow-xl shadow-[#5d417a]/10 flex flex-col h-full border-2 border-[#5d417a]/20 animate-fadeIn">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 rounded-[20px] bg-[#5d417a] flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white text-[32px]">{p.icon}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[32px] font-black text-[#5d417a] leading-none block mb-1">{mm}:{ss}</span>
                    <p className="text-[11px] font-black text-[#5d417a]/50 uppercase tracking-widest">Remaining</p>
                  </div>
                </div>
                <h4 className="text-[22px] font-black text-[#5d417a] mb-2 leading-tight">{p.label}</h4>
                <p className="text-[15px] text-[#5d417a]/70 font-medium mb-8 flex-1">{p.desc}</p>
                <div className="space-y-6 mt-auto">
                  <div className="h-1.5 bg-[#f5e5ff] rounded-full overflow-hidden">
                    <div className="h-full bg-[#5d417a] transition-all duration-1000 ease-linear" style={{ width: `${pct}%` }}></div>
                  </div>
                  <button onClick={stopSession} className="w-full py-4 rounded-full bg-[#5d417a] text-white font-black text-[16px] hover:bg-[#4a3461] transition-colors shadow-md">
                    Pause Session
                  </button>
                </div>
              </div>
            );
          }

          // INACTIVE STATE CARD
          return (
            <div key={p.id} onClick={() => startSession(p.id, p.min)} className="bg-white/60 hover:bg-white p-8 rounded-[32px] transition-all cursor-pointer group flex flex-col h-full border border-white/50 hover:shadow-lg hover:shadow-[#5d417a]/5">
              <div className="w-16 h-16 rounded-[20px] bg-[#f5e5ff] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-[#5d417a] text-[32px]">{p.icon}</span>
              </div>
              <h4 className="text-[22px] font-black text-[#5d417a] mb-3 leading-tight">{p.label}</h4>
              <p className="text-[15px] text-[#5d417a]/70 font-medium mb-10 flex-1 leading-relaxed">{p.desc}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-[13px] font-black text-[#5d417a]/60 bg-[#f5e5ff]/80 px-4 py-2 rounded-full">
                  {p.min} Minutes
                </span>
                <button className="w-14 h-14 rounded-full bg-[#5d417a] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <span className="material-symbols-outlined text-[28px] filled-icon">play_arrow</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────
export default function Wellness() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [me, setMe] = useState(null);

  useEffect(() => {
    getMe(token).then(setMe).catch(console.error);
  }, [token]);

  return (
    <div className="flex bg-[#f9f9f8] min-h-screen font-sans text-[#2f3333]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64 relative">
        
        {/* ── TOP APP BAR ── */}
        <header className="w-full sticky top-0 z-40 bg-[#f9f9f8]/90 backdrop-blur-xl flex justify-between items-center px-10 py-6 border-b border-gray-100">
          <div>
            <h2 className="text-[28px] font-black text-[#8a5126] tracking-tight mb-1">Wellness Center</h2>
            <p className="text-[15px] text-gray-500 font-bold">Your space for focus and clarity.</p>
          </div>
          <div className="flex items-center gap-6 ml-auto">
            <button className="relative text-gray-400 hover:text-gray-800 transition-colors">
              <span className="material-symbols-outlined text-[32px]">notifications</span>
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border-2 border-[#f9f9f8] rounded-full"></span>
            </button>
            <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-[15px] font-black text-gray-900 leading-tight">{me?.username || "User"}</p>
                <p className="text-[12px] text-gray-500 font-bold">Daily Streak: {me?.streak || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full overflow-hidden border-[3px] border-[#ffb380] shadow-sm cursor-pointer" onClick={() => navigate("/settings")}>
                {me?.avatar ? <img src={`http://localhost:3000${me.avatar}`} className="w-full h-full object-cover" alt="User" /> : <div className="w-full h-full bg-[#8a5126] flex items-center justify-center text-white font-black text-[20px]">{me?.username?.[0]?.toUpperCase()}</div>}
              </div>
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT ── */}
        <main className="p-8 lg:p-12 max-w-[1600px] w-full mx-auto overflow-y-auto pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <PomodoroTimer />
            <WaterTracker />
            <MeditationCards />
          </div>
        </main>

        {/* ── Mobile Bottom Navigation ── */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 rounded-t-[2rem] bg-white/90 backdrop-blur-xl border-t border-gray-200 h-20 flex justify-around items-center px-6 pb-safe shadow-[0_-10px_40px_rgba(47,51,51,0.06)]">
          <div className="flex flex-col items-center justify-center text-[#9c9d9c] py-3 cursor-pointer" onClick={() => navigate("/")}>
            <span className="material-symbols-outlined text-2xl">dashboard</span>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Dash</span>
          </div>
          <div className="flex flex-col items-center justify-center text-[#9c9d9c] py-3 cursor-pointer" onClick={() => navigate("/habits")}>
            <span className="material-symbols-outlined text-2xl">event_repeat</span>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Habits</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-[#8a5126] text-white rounded-full w-16 h-16 -mt-8 shadow-xl shadow-[#8a5126]/40 border-[4px] border-[#f9f9f8] cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate("/create-habit")}>
            <span className="material-symbols-outlined text-3xl">add</span>
          </div>
          <div className="flex flex-col items-center justify-center text-[#8a5126] py-3 cursor-pointer">
            <span className="material-symbols-outlined text-2xl filled-icon">self_improvement</span>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Wellness</span>
          </div>
          <div className="flex flex-col items-center justify-center text-[#9c9d9c] py-3 cursor-pointer" onClick={() => navigate("/settings")}>
            <span className="material-symbols-outlined text-2xl">settings</span>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Settings</span>
          </div>
        </nav>

      </div>
    </div>
  );
}
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMe } from "../../services/api";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) getMe(token).then(setUser).catch(() => {});
  }, [token]);

  // ✅ Restored all your amazing custom features!
  const navItems = [
    { name: "Dashboard",   path: "/",            icon: "dashboard" },
    { name: "My Habits",   path: "/habits",      icon: "checklist" },
    { name: "Guardian",    path: "/guardian",    icon: "security" },
    { name: "Analytics",   path: "/analytics",   icon: "insights" },
    { name: "Leaderboard", path: "/leaderboard", icon: "leaderboard" },
    { name: "Friends",     path: "/friends",     icon: "group" },
    { name: "Community",   path: "/community",   icon: "forum" },
    { name: "Wellness",    path: "/wellness",    icon: "self_improvement" },
    { name: "AI Coach",    path: "/ai-coach",    icon: "smart_toy" },
    { name: "Settings",    path: "/settings",    icon: "settings" },
  ];

  return (
    <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-[#fafaf9] border-r border-gray-100 flex-col gap-2 p-6 z-50 custom-scrollbar">
      
      {/* Brand */}
      <div className="mb-8 px-4 shrink-0">
        <h1 className="text-[26px] font-black text-gray-900 tracking-tighter">HabitPulse</h1>
        <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mt-1">Living Canvas</p>
      </div>

      {/* Navigation List */}
      <nav className="flex flex-col gap-1.5 shrink-0">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.name === "My Habits" && location.pathname.includes("/habit"));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-3 rounded-full transition-all text-[14.5px] font-bold ${
                isActive
                  ? "bg-orange-100/70 text-[#c2410c]"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${isActive ? "filled-icon" : ""}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer to push user card to the bottom if there is room */}
      <div className="flex-1 min-h-[20px]"></div>

      {/* User XP / Level Card */}
      {user && (
        <div className="mt-4 p-5 bg-[#ffedd5] rounded-2xl border border-[#fed7aa] shrink-0">
          <p className="text-[11px] font-black text-[#c2410c] mb-3 uppercase tracking-widest">Your Progress</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#ea580c] flex items-center justify-center text-white font-black text-sm shadow-sm">
              {user.avatar ? <img src={`http://localhost:3000${user.avatar}`} className="w-full h-full object-cover rounded-full" alt="" /> : user.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-gray-900 text-[14px] leading-tight truncate">{user.username}</p>
              <p className="text-[12px] font-bold text-[#c2410c]">Level {user.level}</p>
            </div>
          </div>
          <div className="h-2.5 bg-white/60 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-[#ea580c] rounded-full transition-all duration-700" style={{ width: `${user.xp % 100}%` }} />
          </div>
          <p className="text-[11px] text-[#c2410c] mt-2 font-bold text-center">
            {100 - (user.xp % 100)} XP to level up
          </p>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={() => { localStorage.clear(); navigate("/login"); }}
        className="mt-2 flex items-center gap-4 text-gray-400 px-6 py-3 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-all text-[15px] font-bold w-full shrink-0"
      >
        <span className="material-symbols-outlined text-[24px]">logout</span>
        <span>Logout</span>
      </button>

    </aside>
  );
}
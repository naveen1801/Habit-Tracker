import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { getLeaderboard, getMe } from "../services/api";

export default function Leaderboard() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [board, setBoard] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLeaderboard(token), getMe(token)])
      .then(([b, m]) => {
        setBoard(Array.isArray(b) ? b : []);
        setMe(m);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const myRank = board.findIndex(u => u._id === me?._id) + 1;
  
  // Logic for the sticky card progress
  const nextRankUser = myRank > 1 ? board[myRank - 2] : null;
  const xpToGo = nextRankUser ? nextRankUser.xp - me.xp + 1 : 0;
  const progressPct = nextRankUser && nextRankUser.xp > 0 ? Math.min((me.xp / nextRankUser.xp) * 100, 100) : 100;

  // Extract Top 3 for the spotlight
  const rank1 = board[0];
  const rank2 = board[1];
  const rank3 = board[2];
  const restUsers = board.slice(3);

  if (loading) {
    return (
      <div className="flex bg-[#f9f9f8] min-h-screen font-sans text-[#2f3333]">
        <Sidebar />
        <main className="ml-0 md:ml-64 flex-1 flex items-center justify-center text-gray-400 font-bold text-lg">
          Loading Rankings...
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-[#f9f9f8] min-h-screen font-sans text-[#2f3333]">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64 relative">
        
        {/* ── TOP APP BAR ── */}
        <header className="w-full sticky top-0 z-40 bg-white/80 backdrop-blur-xl flex justify-between items-center px-10 py-5 shadow-[0_20px_40px_rgba(47,51,51,0.03)] border-b border-gray-100">
          <div className="flex items-center gap-4">
             <span className="text-[24px] font-black text-[#8a5126] tracking-tight">HabitCanvas</span>
          </div>
          <div className="hidden md:flex flex-1 max-w-md bg-[#f3f4f3] rounded-full px-5 py-3 items-center gap-3 mx-8">
            <span className="material-symbols-outlined text-gray-400">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-[15px] font-bold w-full outline-none text-gray-700 placeholder-gray-400" placeholder="Search competitors..." type="text"/>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-gray-800 transition-colors">
              <span className="material-symbols-outlined text-[28px]">notifications</span>
            </button>
            <button className="text-gray-400 hover:text-gray-800 transition-colors">
              <span className="material-symbols-outlined text-[28px]">emoji_events</span>
            </button>
            <div className="w-12 h-12 rounded-full overflow-hidden border-[3px] border-[#ffb380] shadow-sm cursor-pointer" onClick={() => navigate("/settings")}>
              {me?.avatar ? <img src={`http://localhost:3000${me.avatar}`} className="w-full h-full object-cover" alt="User" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><span className="material-symbols-outlined text-gray-500 text-[24px]">person</span></div>}
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT CANVAS ── */}
        <main className="p-8 lg:p-12 max-w-[1200px] w-full mx-auto overflow-y-auto">
          
          <section className="mb-14">
            <h2 className="text-[48px] lg:text-[56px] font-black leading-none text-gray-900 tracking-tight mb-3">Global Leaderboard</h2>
            <p className="text-[#5c605f] text-[18px] max-w-2xl font-medium">Competition fuels growth. See how you stack up against the global canvas of high achievers and your closest friends.</p>
          </section>

          {/* ── TOP 3 SPOTLIGHT ── */}
          {board.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-end">
              
              {/* Rank 2: Silver */}
              {rank2 && (
                <div className="order-2 md:order-1 bg-[#f3f4f3] rounded-[24px] p-8 flex flex-col items-center text-center relative overflow-hidden h-[340px] justify-center shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform">
                  <div className="absolute top-0 right-0 p-5">
                    <span className="text-[40px] font-black text-gray-300 italic">#2</span>
                  </div>
                  <div className="w-28 h-28 rounded-full border-4 border-slate-300 p-1 mb-5 relative bg-white">
                    {rank2.avatar ? <img src={`http://localhost:3000${rank2.avatar}`} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full rounded-full bg-[#3e6752] flex items-center justify-center text-white text-2xl font-black">{rank2.username[0].toUpperCase()}</div>}
                    <div className="absolute -bottom-2 -right-2 bg-slate-300 text-gray-900 text-[11px] font-black px-3 py-1.5 rounded-full shadow-sm">LVL {rank2.level || 1}</div>
                  </div>
                  <h3 className="text-[20px] font-black text-gray-900">{rank2.username}</h3>
                  <p className="text-[#3e6752] font-extrabold mt-1 text-[16px]">{rank2.xp.toLocaleString()} XP</p>
                  <div className="mt-5">
                    <span className="bg-[#caf9dc] text-[#254e3a] px-4 py-2 rounded-full text-[12px] font-black uppercase tracking-widest shadow-sm">Silver Tier</span>
                  </div>
                </div>
              )}

              {/* Rank 1: Gold */}
              {rank1 && (
                <div className="order-1 md:order-2 bg-[#ffb380] rounded-[24px] p-10 flex flex-col items-center text-center relative overflow-hidden h-[400px] justify-center shadow-[0_20px_40px_rgba(255,179,128,0.3)] hover:-translate-y-2 transition-transform border border-[#ff9d5c]">
                  <div className="absolute top-0 right-0 p-5">
                    <span className="material-symbols-outlined text-[#8a5126] text-[56px] opacity-30 filled-icon">workspace_premium</span>
                  </div>
                  <div className="w-36 h-36 rounded-full border-[5px] border-white p-1 mb-6 relative bg-white shadow-md">
                    {rank1.avatar ? <img src={`http://localhost:3000${rank1.avatar}`} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full rounded-full bg-[#8a5126] flex items-center justify-center text-white text-3xl font-black">{rank1.username[0].toUpperCase()}</div>}
                    <div className="absolute -bottom-3 -right-3 bg-white text-[#8a5126] text-[13px] font-black px-4 py-1.5 rounded-full shadow-md border border-gray-100">LVL {rank1.level || 1}</div>
                  </div>
                  <h3 className="text-[26px] font-black text-[#633108] tracking-tight">{rank1.username}</h3>
                  <p className="text-[#8a5126] text-[20px] font-black mt-1">{rank1.xp.toLocaleString()} XP</p>
                  <div className="mt-6">
                    <span className="bg-white/50 text-[#633108] px-5 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/40 shadow-sm">Master Artist</span>
                  </div>
                  <div className="absolute bottom-0 w-full h-3 bg-[#8a5126]/20"></div>
                </div>
              )}

              {/* Rank 3: Bronze */}
              {rank3 && (
                <div className="order-3 md:order-3 bg-[#f3f4f3] rounded-[24px] p-8 flex flex-col items-center text-center relative overflow-hidden h-[300px] justify-center shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform">
                  <div className="absolute top-0 right-0 p-5">
                    <span className="text-[40px] font-black text-gray-300 italic">#3</span>
                  </div>
                  <div className="w-24 h-24 rounded-full border-4 border-orange-200 p-1 mb-5 relative bg-white">
                    {rank3.avatar ? <img src={`http://localhost:3000${rank3.avatar}`} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full rounded-full bg-[#3c656c] flex items-center justify-center text-white text-2xl font-black">{rank3.username[0].toUpperCase()}</div>}
                    <div className="absolute -bottom-2 -right-2 bg-orange-200 text-[#8a5126] text-[11px] font-black px-3 py-1.5 rounded-full shadow-sm">LVL {rank3.level || 1}</div>
                  </div>
                  <h3 className="text-[18px] font-black text-gray-900">{rank3.username}</h3>
                  <p className="text-[#3e6752] font-extrabold mt-1 text-[15px]">{rank3.xp.toLocaleString()} XP</p>
                  <div className="mt-5">
                    <span className="bg-[#caf6fd] text-[#355f65] px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm">Bronze Tier</span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── RANKINGS LIST ── */}
          <section className="space-y-4 mb-40">
            <div className="flex items-center justify-between px-6 mb-8">
              <h4 className="text-[22px] font-black tracking-tight text-gray-900">Global Rankings</h4>
              <div className="flex gap-6">
                <button className="text-[15px] font-black text-[#8a5126] border-b-[3px] border-[#8a5126] pb-1">All Time</button>
                <button className="text-[15px] font-bold text-gray-400 hover:text-gray-600 pb-1">This Month</button>
              </div>
            </div>

            {restUsers.length === 0 && board.length <= 3 && (
              <p className="text-gray-400 font-bold px-6">No other users found. Invite your friends!</p>
            )}

            {restUsers.map((user, index) => {
              const rank = index + 4;
              const isMe = user._id === me?._id;
              
              return (
                <div key={user._id} className={`bg-white p-6 rounded-[20px] flex items-center gap-6 transition-all hover:translate-x-2 hover:shadow-md duration-300 group border ${isMe ? 'border-[#ffb380] bg-[#fff0e6]/30' : 'border-gray-50'}`}>
                  <span className="text-[20px] font-black text-gray-400 group-hover:text-[#8a5126] w-10 text-center transition-colors">#{rank}</span>
                  
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-gray-100">
                    {user.avatar ? <img src={`http://localhost:3000${user.avatar}`} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-[#8a5126] flex items-center justify-center text-white font-black text-xl">{user.username[0].toUpperCase()}</div>}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-black text-gray-900 text-[18px]">
                      {user.username} {isMe && <span className="text-[10px] bg-[#8a5126] text-white px-2 py-0.5 rounded-full ml-2 uppercase tracking-widest align-middle">You</span>}
                    </p>
                    <p className="text-[13px] text-gray-500 font-bold mt-0.5">{user.totalHabitsCompleted || 0} Habits Completed</p>
                  </div>
                  
                  <div className="text-right flex items-center gap-10">
                    <div className="hidden sm:block text-center">
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-black block mb-1">Level</span>
                      <span className="font-black text-[#3e6752] text-[18px]">{user.level || 1}</span>
                    </div>
                    <div className="w-28 text-right">
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-black block mb-1">Total XP</span>
                      <span className="font-black text-gray-900 text-[20px]">{user.xp.toLocaleString()}</span>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 group-hover:text-[#8a5126] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">chevron_right</span>
                  </div>
                </div>
              );
            })}
          </section>
        </main>

        {/* ── STICKY YOUR POSITION CARD ── */}
        {me && myRank > 0 && (
          <div className="fixed bottom-0 left-0 md:left-64 right-0 p-8 pointer-events-none z-50">
            <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-xl rounded-[24px] shadow-[0_-10px_40px_rgba(47,51,51,0.08)] p-6 border-[3px] border-[#ffb380] flex items-center gap-8 pointer-events-auto hover:shadow-[0_-10px_40px_rgba(47,51,51,0.12)] transition-shadow">
              
              <div className="flex flex-col items-center justify-center min-w-[60px]">
                <span className="text-[32px] font-black text-[#8a5126] italic leading-none">#{myRank}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Rank</span>
              </div>
              
              <div className="h-12 w-[3px] bg-gray-100 rounded-full"></div>
              
              <div className="w-16 h-16 rounded-full overflow-hidden border-[3px] border-[#8a5126] shrink-0 bg-gray-200 shadow-sm">
                {me.avatar ? <img src={`http://localhost:3000${me.avatar}`} className="w-full h-full object-cover" alt="You" /> : <div className="w-full h-full bg-[#8a5126] flex items-center justify-center text-white font-black text-2xl">{me.username[0].toUpperCase()}</div>}
              </div>
              
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex justify-between items-end mb-3">
                  <p className="font-black text-gray-900 text-[18px] truncate">You ({me.username})</p>
                  <p className="text-[13px] font-black text-[#8a5126] bg-[#ffb380]/20 px-3 py-1 rounded-full shrink-0">Level {me.level || 1} • {me.xp.toLocaleString()} XP</p>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-[#ffb380] rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPct}%` }}></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{myRank > 1 ? `Progress to Rank #${myRank - 1}` : 'You are #1!'}</span>
                  <span className="text-[12px] font-black text-gray-900">{myRank > 1 ? `${xpToGo.toLocaleString()} XP to go` : 'Max Rank Achieved'}</span>
                </div>
              </div>
              
              <button className="bg-[#8a5126] text-white px-8 py-4 rounded-full font-black text-[15px] hidden md:block active:scale-95 transition-transform shadow-lg shadow-[#8a5126]/20 hover:bg-[#7c451c]">
                Share Stats
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
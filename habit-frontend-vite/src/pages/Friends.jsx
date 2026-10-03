import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  getFriends, getFriendRequests, sendFriendRequest,
  acceptFriendRequest, removeFriend, compareFriend, getMe
} from "../services/api";

// Larger Avatar Component for the Friends Grid
function FriendCardAvatar({ user, isOnline, barBg }) {
  return (
    <div className="relative w-24 h-24 shrink-0">
      <div className="w-full h-full rounded-[30px] bg-[#e87a41] flex items-center justify-center text-white font-black text-3xl overflow-hidden shadow-sm">
        {user?.avatar
          ? <img src={`http://localhost:3000${user.avatar}`} className="w-full h-full object-cover" alt="" />
          : user?.username?.[0]?.toUpperCase() || "?"}
      </div>
      {/* Online Status Indicator */}
      <div className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full border-[5px] border-white flex items-center justify-center ${isOnline ? barBg : 'bg-gray-300'}`}>
        {isOnline && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
      </div>
    </div>
  );
}

// Standard Avatar for lists/comparison
function Avatar({ user }) {
  return (
    <div className="w-full h-full rounded-[1.5rem] bg-[#e87a41] flex items-center justify-center text-white font-black text-xl overflow-hidden shadow-sm">
      {user?.avatar
        ? <img src={`http://localhost:3000${user.avatar}`} className="w-full h-full object-cover" alt="" />
        : user?.username?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

export default function Friends() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [me, setMe] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [compareData, setCompareData] = useState(null);
  const [comparing, setComparing] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const [f, r, userData] = await Promise.all([
        getFriends(token),
        getFriendRequests(token),
        getMe(token)
      ]);
      setFriends(Array.isArray(f) ? f : []);
      setRequests(Array.isArray(r) ? r : []);
      setMe(userData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleSendRequest = async () => {
    if (!email.trim()) return;
    try {
      setSending(true);
      await sendFriendRequest(token, email);
      setEmail("");
      alert("Friend request sent!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (id) => {
    await acceptFriendRequest(token, id);
    load();
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this friend?")) return;
    await removeFriend(token, id);
    load();
  };

  const handleCompare = async (friend) => {
    setComparing(friend._id);
    try {
      const data = await compareFriend(token, friend._id);
      setCompareData(data);
      // Scroll to top to see comparison
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    } finally {
      setComparing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-[#f9f9f8] min-h-screen font-sans text-[#2f3333]">
        <Sidebar />
        <main className="ml-0 md:ml-64 flex-1 flex items-center justify-center font-black text-gray-400 text-[20px]">
          Loading Community...
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-[#f9f9f8] min-h-screen font-sans text-[#2f3333]">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64 relative">
        
        {/* ── TOP APP BAR ── */}
        <header className="w-full sticky top-0 z-40 bg-white/80 backdrop-blur-xl flex justify-between items-center px-12 py-6 shadow-[0_20px_40px_rgba(47,51,51,0.03)] border-b border-gray-100">
          <div className="hidden md:flex flex-1 max-w-lg bg-[#f3f4f3] rounded-full px-6 py-4 items-center gap-4">
            <span className="material-symbols-outlined text-gray-400 text-[24px]">search</span>
            {/* Larger Search Input Text */}
            <input className="bg-transparent border-none focus:ring-0 text-[17px] font-bold w-full outline-none text-gray-700 placeholder-gray-400" placeholder="Search friends or habits..." type="text"/>
          </div>
          <div className="flex items-center gap-6 ml-auto pl-8">
            <button className="relative text-gray-400 hover:text-gray-800 transition-colors">
              <span className="material-symbols-outlined text-[32px]">notifications</span>
              {requests.length > 0 && <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>}
            </button>
            <div className="flex items-center gap-4 pl-8 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                {/* Larger Header Profile Text */}
                <p className="text-[16px] font-black text-gray-900 leading-tight">{me?.username || "User"}</p>
                <p className="text-[12px] text-gray-500 font-bold">Level {me?.level || 1} Explorer</p>
              </div>
              <div className="w-14 h-14 rounded-full overflow-hidden border-[4px] border-[#ffb380] shadow-sm cursor-pointer shrink-0" onClick={() => navigate("/settings")}>
                {me?.avatar ? <img src={`http://localhost:3000${me.avatar}`} className="w-full h-full object-cover" alt="User" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><span className="material-symbols-outlined text-gray-500 text-[28px]">person</span></div>}
              </div>
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT CANVAS ── */}
        <main className="p-10 lg:p-16 max-w-[1500px] w-full mx-auto overflow-y-auto">
          
          {/* Hero Header - Enlarged to 3.5rem */}
          <section className="mb-14 px-4">
            <h2 className="text-[56px] lg:text-[72px] font-extrabold text-gray-900 tracking-tight leading-[1.05] mb-4">Circle of Growth</h2>
            <p className="text-[20px] text-gray-500 font-medium max-w-2xl">Surround yourself with the habits you want to mirror.</p>
          </section>

          {/* Compare Panel - Enlarged details */}
          {compareData && (
            <div className="bg-white rounded-[40px] p-12 shadow-xl shadow-gray-200/50 border border-[#ffb380]/40 mb-14 animate-fadeIn relative overflow-hidden">
              <button onClick={() => setCompareData(null)} className="absolute top-8 right-8 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors z-10">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
              
              <h2 className="text-[28px] font-black text-gray-900 mb-10 text-center tracking-tight">Head-to-Head Comparison</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                {[compareData.me, compareData.friend].map((person, i) => (
                  <div key={i} className={`rounded-[32px] p-10 ${i === 0 ? "bg-[#fff0e6] border border-[#ffb380]/30" : "bg-[#e0f2fe] border border-[#bae6fd]/50"}`}>
                    <div className="flex items-center gap-6 mb-10 pb-6 border-b border-black/5">
                      <div className="w-20 h-20 shrink-0"><Avatar user={person} /></div>
                      <div>
                        {/* Enlarged Comparison Titles */}
                        <p className="font-black text-[28px] text-gray-900 leading-tight tracking-tight">{person.username} {i === 0 && <span className="text-[11px] bg-[#8a5126] text-white px-3 py-1 rounded-full ml-3 uppercase tracking-widest align-middle font-black">You</span>}</p>
                        <p className={`text-[17px] font-black mt-1 ${i === 0 ? "text-[#8a5126]" : "text-[#0284c7]"}`}>Level {person.level}</p>
                      </div>
                    </div>
                    <div className="space-y-5">
                      {[
                        { label: "Total XP",         value: `${person.xp.toLocaleString()} XP` },
                        { label: "Current streak",   value: `${person.streak} days 🔥` },
                        { label: "Habits this week", value: person.weekCount },
                        { label: "Total completed",  value: person.totalHabitsCompleted },
                        { label: "Badges Earned",    value: (person.earnedBadges || []).length },
                      ].map(stat => (
                        <div key={stat.label} className="flex justify-between items-center pb-4 border-b border-black/5 last:border-0">
                          <span className="text-[16px] text-gray-600 font-bold">{stat.label}</span>
                          <span className="font-black text-[18px] text-gray-900">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 bg-gray-900 rounded-full py-6 px-10 text-center shadow-lg shadow-gray-900/10 max-w-xl mx-auto relative z-10">
                {compareData.me.xp > compareData.friend.xp ? (
                  <p className="font-black text-[#caf9dc] text-[17px]">🏆 You're in the lead! Keep it up!</p>
                ) : compareData.me.xp < compareData.friend.xp ? (
                  <p className="font-black text-[#ffb380] text-[17px]">💪 {compareData.friend.username} is ahead — time to grind!</p>
                ) : (
                  <p className="font-black text-white text-[17px]">🤝 You're perfectly matched!</p>
                )}
              </div>
            </div>
          )}

          {/* Add Friend Bento Section - Enlarged padding and text */}
          <section className="mb-14">
            <div className="bg-[#ffb380]/15 rounded-[48px] p-12 flex flex-col md:flex-row items-center gap-12 border border-[#ffb380]/30 shadow-sm relative overflow-hidden">
              <div className="flex-1 relative z-10">
                {/* Enlarged Bento Title */}
                <h3 className="text-[32px] font-black text-[#8a5126] mb-3 tracking-tight">Expand Your Canvas</h3>
                {/* Enlarged Bento Description */}
                <p className="text-[#633108]/80 text-[17px] font-bold mb-10 max-w-lg leading-relaxed">Invite friends to share progress, compete in streaks, and unlock exclusive collective rewards.</p>
                
                {/* Enlarged Input and Button */}
                <div className="flex gap-4 w-full max-w-xl">
                  <div className="flex-1 bg-white rounded-full px-7 py-2.5 shadow-sm flex items-center gap-4 focus-within:ring-2 ring-[#ffb380] transition-all border border-gray-100">
                    <span className="material-symbols-outlined text-[#8a5126] text-[24px]">alternate_email</span>
                    <input 
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSendRequest()}
                      className="bg-transparent border-none focus:ring-0 text-[17px] w-full font-bold outline-none placeholder-gray-400" 
                      placeholder="Username or email address..." 
                    />
                  </div>
                  <button 
                    onClick={handleSendRequest}
                    disabled={sending}
                    className="bg-[#8a5126] text-white px-10 py-5 rounded-full font-black text-[16px] shadow-lg shadow-[#8a5126]/20 hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-70 whitespace-nowrap"
                  >
                    {sending ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </div>
              
              <div className="w-full md:w-80 h-64 bg-white/40 rounded-[36px] overflow-hidden relative group shrink-0 hidden md:block border border-white/50">
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop" alt="Friends hanging out" className="w-full h-full object-cover mix-blend-overlay opacity-80 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#8a5126] text-[72px] filled-icon shadow-sm">person_add</span>
                </div>
              </div>
            </div>
          </section>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Requests & Friends List (Span 8) */}
            <div className="xl:col-span-8 space-y-12">
              
              {/* Pending Requests Section */}
              {requests.length > 0 && (
                <div className="px-2">
                  <h3 className="text-[26px] font-black text-gray-900 mb-8 flex items-center gap-3.5 tracking-tight">
                    <span className="material-symbols-outlined text-[#8a5126] text-[28px]">notifications_active</span>
                    Pending Requests <span className="bg-[#ffb380]/30 text-[#8a5126] text-[15px] px-3.5 py-1 rounded-full font-black align-middle">{requests.length}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {requests.map(req => (
                      <div key={req._id} className="bg-white rounded-[32px] p-7 shadow-sm border border-[#ffb380]/20 flex flex-col gap-6 transition-all hover:shadow-md hover:border-[#ffb380]/40">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 shrink-0"><Avatar user={req.requester} /></div>
                          <div className="min-w-0 flex-1">
                            {/* Enlarged Request Name */}
                            <p className="font-black text-gray-900 text-[18px] truncate leading-tight tracking-tight">{req.requester?.username}</p>
                            <p className="text-[13px] text-gray-500 font-bold truncate mt-0.5">{req.requester?.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          {/* Enlarged Accept/Decline Buttons */}
                          <button onClick={() => handleAccept(req._id)} className="flex-1 bg-[#caf9dc] text-[#254e3a] font-black py-4 rounded-full text-[14px] hover:bg-[#bceace] transition-colors shadow-sm">Accept</button>
                          <button onClick={() => handleRemove(req._id)} className="flex-1 bg-red-50 text-red-600 font-black py-4 rounded-full text-[14px] hover:bg-red-100 transition-colors border border-red-100">Decline</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Your Friends Grid - Enlarged details */}
              <div>
                <div className="flex items-center justify-between mb-8 px-4">
                  <h3 className="text-[26px] font-black text-gray-900 tracking-tight">Your Friends <span className="text-gray-400 font-bold ml-3 text-[20px]">{friends.length}</span></h3>
                  <div className="flex gap-3.5">
                    <button className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-200 transition-colors"><span className="material-symbols-outlined text-[24px]">filter_list</span></button>
                    <button className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-200 transition-colors"><span className="material-symbols-outlined text-[24px]">grid_view</span></button>
                  </div>
                </div>

                {friends.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-gray-200 rounded-[40px] p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 rounded-full bg-[#f3f4f3] flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-gray-400 text-[48px]">person_add</span>
                    </div>
                    <h4 className="text-[24px] font-black text-gray-900 mb-2 tracking-tight">Grow your community</h4>
                    <p className="text-[17px] text-gray-500 font-bold">Use the bar above to invite some friends.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {friends.map((friend, idx) => {
                      const isEven = idx % 2 === 0;
                      const badgeBg = isEven ? "bg-[#caf9dc] text-[#254e3a]" : "bg-[#caf6fd] text-[#355f65]";
                      const barBg = isEven ? "bg-[#3e6752]" : "bg-[#3c656c]";
                      
                      return (
                        <div key={friend._id} className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 hover:shadow-xl hover:shadow-[#8a5126]/5 transition-all group hover:border-[#ffb380]/20 flex flex-col min-h-[380px]">
                          
                          <div className="flex items-start justify-between mb-8">
                            {/* Enlarged Avatar inside FriendCardAvatar */}
                            <FriendCardAvatar user={friend} isOnline={true} barBg={barBg} />
                            
                            <div className="text-right">
                              {/* Enlarged Level Badge */}
                              <span className={`inline-block px-4 py-2 rounded-full text-[12px] font-black uppercase tracking-widest shadow-sm ${badgeBg}`}>
                                LVL {friend.level || 1}
                              </span>
                              <p className="text-[11px] text-gray-400 font-black mt-2.5 tracking-widest uppercase">{friend.streak || 0} Day Streak</p>
                            </div>
                          </div>

                          <div className="mb-6">
                            {/* Enlarged Friend Name */}
                            <h4 className="text-[24px] font-black text-gray-900 leading-tight truncate tracking-tight">{friend.username}</h4>
                            <p className="text-[15px] text-gray-500 font-bold flex items-center gap-1.5 mt-1">
                              <span className="material-symbols-outlined text-[18px] text-[#8a5126] filled-icon">local_fire_department</span>
                              {friend.xp.toLocaleString()} Total XP
                            </p>
                          </div>

                          {/* Larger XP Bar */}
                          <div className="w-full bg-[#f3f4f3] h-3 rounded-full mb-8 overflow-hidden shadow-inner">
                            <div className={`${barBg} h-full rounded-full transition-all duration-500`} style={{ width: `${Math.min((friend.xp % 100), 100)}%` }}></div>
                          </div>

                          {/* Enlarged Action Buttons */}
                          <div className="grid grid-cols-2 gap-4 mt-auto">
                            <button 
                              onClick={() => handleCompare(friend)}
                              disabled={comparing === friend._id}
                              className="flex items-center justify-center gap-2.5 py-4 bg-[#f3f4f3] rounded-[24px] text-[15px] font-black text-gray-600 hover:bg-[#ffb380] hover:text-[#633108] hover:shadow-md transition-all disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-[20px]">query_stats</span> {comparing === friend._id ? "..." : "Compare"}
                            </button>
                            <button 
                              onClick={() => handleRemove(friend._id)}
                              className="flex items-center justify-center gap-2.5 py-4 bg-[#f3f4f3] rounded-[24px] text-[15px] font-black text-gray-600 hover:bg-red-100 hover:text-red-700 hover:shadow-md transition-all border border-transparent hover:border-red-200"
                            >
                              <span className="material-symbols-outlined text-[20px]">person_remove</span> Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* ── Right Side Widgets (Span 4) - Enlarged text ── */}
            <div className="xl:col-span-4 space-y-10">
              
              {/* Mutual Habits Widget */}
              <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
                <h3 className="text-[22px] font-black text-gray-900 mb-8 tracking-tight">Mutual Habits</h3>
                <div className="space-y-5">
                  {[
                    { title: "Zen Master", icon: "self_improvement", bg: "bg-[#caf9dc]", color: "text-[#254e3a]", joinBg: "hover:bg-[#caf9dc]", joinColor: "hover:text-[#3e6752]", friends: 3 },
                    { title: "Bookworm Club", icon: "menu_book", bg: "bg-[#ffb380]/30", color: "text-[#8a5126]", joinBg: "hover:bg-[#ffb380]", joinColor: "hover:text-[#8a5126]", friends: 1 },
                  ].map((habit, i) => (
                    <div key={i} className="flex items-center gap-5 bg-[#f9f9f8] p-5 rounded-[28px] border border-gray-50">
                      {/* Larger Mutual Habit Icons */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${habit.bg} ${habit.color}`}>
                        <span className="material-symbols-outlined text-[30px] filled-icon">{habit.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[16px] font-black text-gray-900 truncate leading-tight">{habit.title}</p>
                        <div className="flex -space-x-2 mt-2">
                          <div className="w-7 h-7 rounded-full border-2 border-[#f9f9f8] bg-gray-300"></div>
                          <div className="w-7 h-7 rounded-full border-2 border-[#f9f9f8] bg-gray-400"></div>
                          <div className="w-7 h-7 rounded-full border-2 border-[#f9f9f8] bg-[#f3f4f3] flex items-center justify-center text-[10px] font-black text-gray-600">+{habit.friends}</div>
                        </div>
                      </div>
                      <button className={`w-11 h-11 bg-white rounded-[16px] shadow-sm flex items-center justify-center text-gray-400 transition-colors border border-gray-100 ${habit.joinBg} ${habit.joinColor}`}>
                        <span className="material-symbols-outlined text-[22px]">join_full</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Widget - Enlarged Text */}
              <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
                <h3 className="text-[22px] font-black text-gray-900 mb-8 tracking-tight">Recent Activity</h3>
                <div className="space-y-8 px-1">
                  
                  <div className="flex gap-5 relative">
                    <div className="absolute left-5 top-12 bottom-[-32px] w-0.5 bg-gray-100"></div>
                    <div className="w-10 h-10 rounded-full bg-gray-200 border-[3px] border-white shrink-0 z-10 flex items-center justify-center text-lg shadow-sm">👱‍♀️</div>
                    <div className="pb-2">
                      {/* Enlarged Activity Text */}
                      <p className="text-[14px] font-medium text-gray-600 leading-normal"><span className="font-black text-gray-900">Elena</span> completed "Daily Water" <span className="text-gray-400 text-[12px] block mt-1">2h ago</span></p>
                      <div className="mt-3 px-4 py-2 bg-[#f3f4f3] rounded-full text-[12px] font-black text-[#3e6752] inline-flex items-center gap-2 shadow-sm border border-gray-100">
                        <span className="material-symbols-outlined text-[16px]">thumb_up</span> High Five
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-5 relative">
                    <div className="absolute left-5 top-12 bottom-[-32px] w-0.5 bg-gray-100"></div>
                    <div className="w-10 h-10 rounded-full bg-gray-200 border-[3px] border-white shrink-0 z-10 flex items-center justify-center text-lg shadow-sm">🧑‍🚀</div>
                    <div className="pb-2">
                      <p className="text-[14px] font-medium text-gray-600 leading-normal"><span className="font-black text-gray-900">Sasha</span> hit a 30-day streak! <span className="text-gray-400 text-[12px] block mt-1">5h ago</span></p>
                      <div className="mt-3 px-4 py-2 bg-[#ffb380] text-[#633108] rounded-full text-[12px] font-black inline-flex items-center gap-2 shadow-sm border border-[#ffb380]/50">
                        <span className="material-symbols-outlined text-[16px]">celebration</span> Congratulate
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-5 relative">
                    <div className="w-10 h-10 rounded-full bg-gray-200 border-[3px] border-white shrink-0 z-10 flex items-center justify-center text-lg shadow-sm">🧔</div>
                    <div>
                      <p className="text-[14px] font-medium text-gray-600 leading-normal"><span className="font-black text-gray-900">Marcus</span> joined the Yoga challenge <span className="text-gray-400 text-[12px] block mt-1">1d ago</span></p>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </main>

        {/* Global Floating Action Button - Enlarged */}
        <button className="fixed bottom-12 right-12 w-20 h-20 bg-[#8a5126] text-white rounded-full shadow-2xl shadow-[#8a5126]/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 hover:bg-[#7c451c]">
          <span className="material-symbols-outlined text-[36px]">person_search</span>
        </button>

      </div>
    </div>
  );
}
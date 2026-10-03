import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGuardianRequests, getMe } from "../services/api";
import Sidebar from "../components/layout/Sidebar";

export default function GuardianRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [reqData, userData] = await Promise.all([
          getGuardianRequests(token),
          getMe(token)
        ]);
        
        if (Array.isArray(reqData)) {
          setRequests(reqData);
        }
        setMe(userData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  // ✅ APPROVE
  const approve = async (id) => {
    try {
      await fetch(`http://localhost:3000/guardian/approve/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ REJECT
  const reject = async (id) => {
    try {
      await fetch(`http://localhost:3000/guardian/reject/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-[#f9f9f8] min-h-screen font-sans text-[#2f3333]">
        <Sidebar />
        <main className="ml-0 md:ml-64 flex-1 flex items-center justify-center text-gray-400 font-bold text-lg">
          Loading requests...
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
             <span className="text-[24px] font-black text-[#8a5126] tracking-tight">Guardian</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-gray-800 transition-colors">
              <span className="material-symbols-outlined text-[28px]">notifications</span>
              {requests.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>}
            </button>
            <button className="text-gray-400 hover:text-gray-800 transition-colors">
              <span className="material-symbols-outlined text-[28px]">history</span>
            </button>
            <div className="w-12 h-12 rounded-full overflow-hidden border-[3px] border-[#ffb380] shadow-sm cursor-pointer" onClick={() => navigate("/settings")}>
              {me?.avatar ? <img src={`http://localhost:3000${me.avatar}`} className="w-full h-full object-cover" alt="User" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><span className="material-symbols-outlined text-gray-500 text-[24px]">person</span></div>}
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT CANVAS ── */}
        <main className="p-8 lg:p-12 max-w-[1400px] w-full mx-auto overflow-y-auto">
          
          <header className="mb-12">
            <h1 className="text-[44px] lg:text-[52px] font-black tracking-tight mb-2 leading-none text-gray-900">Guardian Requests</h1>
            <p className="text-[#5c605f] font-bold text-[18px]">You have {requests.length} pending verifications from your circle.</p>
          </header>

          {/* EMPTY STATE */}
          {requests.length === 0 && (
            <div className="bg-white border border-gray-100 shadow-sm rounded-[32px] p-16 text-center mt-10 max-w-3xl">
              <div className="text-[64px] mb-6">🙌</div>
              <h3 className="text-[28px] font-black text-gray-900 mb-3 tracking-tight">You're all caught up!</h3>
              <p className="text-gray-500 font-bold text-[16px]">Your friends are still working on their habits. Check back later to verify their proofs.</p>
            </div>
          )}

          {/* GRID LAYOUT */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* Map through dynamic requests */}
            {requests.map(req => {
              const proofUrl = req.proof && (req.proof.startsWith('/') || req.proof.startsWith('http'))
                ? (req.proof.startsWith('http') ? req.proof : `http://localhost:3000${req.proof}`)
                : "";

              const isImage = req.proof?.match(/\.(jpg|jpeg|png|gif)$/i);
              const isVideo = req.proof?.match(/\.(mp4|webm|ogg)$/i);
              const isFile = proofUrl && !isImage && !isVideo; // Assuming if it's a URL but not media, it's a generic file/csv

              return (
                <div key={req._id} className="bg-white rounded-[24px] p-8 shadow-[0_20px_40px_rgba(47,51,51,0.04)] border border-gray-50 flex flex-col gap-6">
                  
                  {/* User & Habit Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-[24px] overflow-hidden shrink-0">
                        {req.userId?.avatar ? <img src={`http://localhost:3000${req.userId.avatar}`} className="w-full h-full object-cover" alt="" /> : "👤"}
                      </div>
                      <div>
                        <h3 className="text-[20px] font-black text-gray-900">{req.userId?.username || "Unknown User"}</h3>
                        <div className="flex items-center gap-1.5 text-[#8a5126] font-extrabold text-[14px]">
                          <span className="material-symbols-outlined text-[18px]">psychology</span>
                          {req.habitId?.title || "Unknown Habit"}
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 bg-[#f3f4f3] text-[#5c605f] text-[12px] font-black rounded-full uppercase tracking-wider">Pending</span>
                  </div>

                  {/* Proof Content Box */}
                  {req.proof ? (
                    isImage ? (
                      <div className="relative group cursor-pointer overflow-hidden rounded-[20px] aspect-video bg-gray-100" onClick={() => window.open(proofUrl)}>
                        <img src={proofUrl} alt="Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-white text-[40px]">fullscreen</span>
                        </div>
                      </div>
                    ) : isVideo ? (
                      <video src={proofUrl} controls className="w-full h-48 bg-black rounded-[20px] object-cover" />
                    ) : isFile ? (
                      <div className="bg-[#f3f4f3] rounded-[20px] p-6 min-h-[160px] flex flex-col justify-center cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => window.open(proofUrl)}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="material-symbols-outlined text-[#8a5126] text-[32px]">attachment</span>
                          <span className="text-[14px] font-black text-[#5c605f] uppercase tracking-tight truncate">Attached_Proof_File</span>
                        </div>
                        <p className="text-[#5c605f] text-[14px] font-medium">Click to download or view the submitted log data.</p>
                      </div>
                    ) : (
                      <div className="bg-[#f3f4f3] rounded-[20px] p-6 min-h-[160px] flex flex-col justify-center">
                        <p className="italic text-[#5c605f] leading-relaxed font-medium text-[15px]">"{req.proof}"</p>
                      </div>
                    )
                  ) : (
                    <div className="bg-[#f3f4f3] rounded-[20px] p-6 min-h-[160px] flex flex-col justify-center items-center text-center">
                      <p className="text-[#5c605f] font-bold">No proof provided.</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-auto">
                    <button onClick={() => approve(req._id)} className="flex-1 py-4 bg-[#caf9dc] text-[#254e3a] rounded-full font-black flex items-center justify-center gap-2 hover:brightness-95 transition-all text-[15px]">
                      <span className="material-symbols-outlined">check_circle</span> Approve
                    </button>
                    <button onClick={() => reject(req._id)} className="flex-1 py-4 bg-[#fa7150]/10 text-[#aa371c] rounded-full font-black flex items-center justify-center gap-2 hover:bg-[#fa7150]/20 transition-all text-[15px]">
                      <span className="material-symbols-outlined">cancel</span> Reject
                    </button>
                  </div>

                </div>
              );
            })}

            {/* STATIC WIDGET: Badges Earned Section (From Design) */}
            {requests.length > 0 && (
              <div className="grid grid-cols-2 gap-5 h-fit">
                
                <div className="bg-[#caf6fd]/40 p-8 rounded-[24px] flex flex-col items-center justify-center text-center gap-3 border border-[#caf6fd]">
                  <div className="w-16 h-16 rounded-full bg-[#caf6fd] flex items-center justify-center mb-1">
                    <span className="material-symbols-outlined text-[#355f65] text-[36px] filled-icon">award_star</span>
                  </div>
                  <h4 className="font-black text-gray-900 text-[18px]">Truth Seeker</h4>
                  <p className="text-[13px] font-bold text-gray-500">50 Approved Proofs</p>
                </div>
                
                <div className="bg-[#ffb380]/20 p-8 rounded-[24px] flex flex-col items-center justify-center text-center gap-3 border border-[#ffb380]/30">
                  <div className="w-16 h-16 rounded-full bg-[#ffb380] flex items-center justify-center mb-1">
                    <span className="material-symbols-outlined text-[#633108] text-[36px] filled-icon">bolt</span>
                  </div>
                  <h4 className="font-black text-gray-900 text-[18px]">Fast Acting</h4>
                  <p className="text-[13px] font-bold text-gray-500">Avg review &lt; 1hr</p>
                </div>
                
                <div className="bg-[#caf9dc]/30 col-span-2 p-8 rounded-[24px] flex items-center gap-6 border border-[#caf9dc]">
                  <div className="flex-1">
                    <h4 className="text-[20px] font-black text-[#254e3a] mb-1.5">Guardian Level 12</h4>
                    <p className="text-[14px] font-bold text-[#37614b]">You've helped friends maintain 142 streaks this month. Keep up the great work!</p>
                  </div>
                  <div className="relative w-24 h-24 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle className="text-[#3e6752]/10" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                      <circle className="text-[#3e6752]" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="75.36" strokeWidth="8" strokeLinecap="round"></circle>
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-[#254e3a] text-[20px]">70%</span>
                  </div>
                </div>

              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
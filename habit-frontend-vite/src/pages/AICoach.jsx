import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import { askCoach, getMe, getStreak, getWeeklyReport } from "../services/api";

export default function AICoach() {
  const token = localStorage.getItem("token");
  const [me, setMe] = useState(null);
  const [streak, setStreak] = useState(0);
  const [report, setReport] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "coach",
      text: "Tell me what is getting in the way today. I will use your habit history to suggest a small next move.",
    },
  ]);

  useEffect(() => {
    Promise.all([getMe(token), getStreak(token), getWeeklyReport(token)])
      .then(([userData, streakData, reportData]) => {
        setMe(userData);
        setStreak(streakData.streak || 0);
        setReport(reportData);
      })
      .catch(console.error);
  }, [token]);

  const send = async (event) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: message }]);

    try {
      setSending(true);
      const data = await askCoach(token, message);
      setMessages((prev) => [...prev, { role: "coach", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "coach", text: err.message || "I could not read your habit data right now." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex bg-[#f9f9f8] min-h-screen font-sans text-[#2f3333]">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64 relative">
        <header className="w-full sticky top-0 z-40 bg-[#f9f9f8]/90 backdrop-blur-xl flex justify-between items-center px-10 py-6 border-b border-gray-100">
          <div>
            <h2 className="text-[28px] font-black text-[#8a5126] tracking-tight mb-1">AI Coach</h2>
            <p className="text-[15px] text-gray-500 font-bold">Habit guidance from your own progress data.</p>
          </div>
          <div className="hidden md:flex items-center gap-4 bg-white border border-gray-100 rounded-full px-5 py-3 shadow-sm">
            <span className="material-symbols-outlined text-[#8a5126] filled-icon">local_fire_department</span>
            <span className="text-[15px] font-black text-gray-900">{streak} day streak</span>
          </div>
        </header>

        <main className="p-8 lg:p-12 max-w-[1500px] w-full mx-auto overflow-y-auto pb-24">
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 flex flex-col gap-8">
              <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#ffb380] via-[#fff0e6] to-[#caf9dc] p-10 border border-white/70 shadow-sm">
                <div className="relative z-10 max-w-2xl">
                  <h1 className="text-[46px] lg:text-[64px] font-black tracking-tight leading-none text-[#633108] mb-5">
                    Hello, {me?.username?.split(" ")[0] || "there"}.
                  </h1>
                  <p className="text-[19px] text-[#8a5126] font-bold leading-relaxed">
                    Your coach can now answer from your actual habits, weekly approvals, streak, XP, and pending proofs.
                  </p>
                </div>
              </div>

              <div className="flex flex-col h-[620px] bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/60">
                  <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                  <span className="text-[16px] font-black text-gray-900">Pulse Coach</span>
                </div>

                <div className="flex-1 p-7 overflow-y-auto space-y-5 bg-[#fcfdfd]">
                  {messages.map((message, index) => {
                    const isUser = message.role === "user";
                    return (
                      <div
                        key={`${message.role}-${index}`}
                        className={`flex items-start gap-4 max-w-[88%] ${isUser ? "ml-auto flex-row-reverse" : ""}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${isUser ? "bg-[#caf9dc]" : "bg-[#ffb380]"}`}>
                          <span className="material-symbols-outlined text-[20px] filled-icon">
                            {isUser ? "person" : "smart_toy"}
                          </span>
                        </div>
                        <div className={`p-5 rounded-[24px] shadow-sm text-[15px] font-medium leading-relaxed ${
                          isUser
                            ? "rounded-tr-none bg-[#ffb380] text-[#633108] font-bold"
                            : "rounded-tl-none bg-white border border-gray-100 text-gray-800"
                        }`}>
                          {message.text}
                        </div>
                      </div>
                    );
                  })}
                  {sending && (
                    <div className="text-gray-400 font-bold text-[14px] px-14">Thinking...</div>
                  )}
                </div>

                <form onSubmit={send} className="p-6 bg-white border-t border-gray-100 flex items-center gap-4">
                  <input
                    className="flex-1 bg-[#f3f4f3] border-none rounded-full px-7 py-4 text-[15px] font-bold text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#ffb380] outline-none"
                    placeholder="Ask why a habit is slipping, what to do next, or how to plan tomorrow..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <button
                    disabled={sending || !input.trim()}
                    className="w-14 h-14 flex items-center justify-center rounded-full bg-[#8a5126] text-white hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-[#8a5126]/25 disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[26px]">send</span>
                  </button>
                </form>
              </div>
            </div>

            <aside className="lg:col-span-4 flex flex-col gap-8">
              <div className="p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm">
                <h3 className="text-[22px] font-black text-gray-900 mb-6">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="p-5 rounded-[22px] bg-[#fff0e6] flex items-center gap-4">
                    <span className="material-symbols-outlined text-[#ea580c] text-[32px] filled-icon">local_fire_department</span>
                    <div>
                      <p className="text-[26px] font-black text-gray-900 leading-none">{streak} Days</p>
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Current Streak</p>
                    </div>
                  </div>
                  <div className="p-5 rounded-[22px] bg-[#e6f8fb] flex items-center gap-4">
                    <span className="material-symbols-outlined text-[#0284c7] text-[32px] filled-icon">military_tech</span>
                    <div>
                      <p className="text-[26px] font-black text-gray-900 leading-none">{me?.xp || 0}</p>
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">XP Earned</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[32px] bg-[#2f3333] text-white shadow-xl shadow-gray-900/10">
                <div className="flex items-center gap-3 mb-5">
                  <span className="material-symbols-outlined text-[#ffb380] text-[28px] filled-icon">auto_awesome</span>
                  <h3 className="text-[22px] font-black tracking-tight">Weekly Report</h3>
                </div>
                <p className="text-[15px] text-gray-300 font-medium leading-relaxed mb-7">
                  {report?.summary || "Complete a few habits and your weekly report will become more specific."}
                </p>
                <div className="space-y-4">
                  {(report?.highlights || []).map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-green-400 text-[20px] filled-icon">check_circle</span>
                      <span className="text-[14px] font-bold text-gray-100">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}

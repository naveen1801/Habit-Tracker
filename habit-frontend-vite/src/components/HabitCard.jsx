import { useState } from "react";

// The gorgeous "Living Canvas" color palettes
const THEMES = {
  green:  { bg: "bg-[#caf9dc]", text: "text-[#254e3a]", iconText: "text-[#3e6752]", accentBg: "bg-[#3e6752]", icon: "eco", title: "text-gray-900" },
  orange: { bg: "bg-[#ffb380]", text: "text-[#633108]", iconText: "text-[#8a5126]", accentBg: "bg-[#8a5126]", icon: "menu_book", title: "text-gray-900" },
  blue:   { bg: "bg-[#caf6fd]", text: "text-[#355f65]", iconText: "text-[#3c656c]", accentBg: "bg-[#3c656c]", icon: "water_drop", title: "text-gray-900" },
  purple: { bg: "bg-[#e0e7ff]", text: "text-[#312e81]", iconText: "text-[#4f46e5]", accentBg: "bg-[#4f46e5]", icon: "self_improvement", title: "text-gray-900" },
  pink:   { bg: "bg-[#fce7f3]", text: "text-[#831843]", iconText: "text-[#e11d48]", accentBg: "bg-[#e11d48]", icon: "fitness_center", title: "text-gray-900" },
  gray:   { bg: "bg-[#e6e9e8]", text: "text-[#5c605f]", iconText: "text-[#787b7b]", accentBg: "bg-[#787b7b]", icon: "checklist", title: "text-gray-800" }
};

// Intelligently assigns themes based on keywords, with a colorful fallback
function getTheme(habit) {
  const str = (habit.title + " " + (habit.category || "")).toLowerCase();
  
  if (str.match(/water|drink|hydrat/)) return THEMES.blue;
  if (str.match(/read|book|study|learn/)) return THEMES.orange;
  if (str.match(/yoga|meditat|mindful|breath/)) return THEMES.green;
  if (str.match(/gym|run|workout|exercise|fit/)) return THEMES.pink;
  if (str.match(/sleep|rest|bed/)) return THEMES.purple;
  
  // Fallback: Pick a consistent beautiful color based on the title length!
  const fallbackColors = [THEMES.blue, THEMES.orange, THEMES.purple, THEMES.green, THEMES.pink];
  return fallbackColors[(habit.title?.length || 0) % fallbackColors.length];
}

export default function HabitCard({ habit, onTextSubmit, onFileSubmit, onEdit, onDelete }) {
  const [proof, setProof] = useState("");

  const isCompleted = habit.status === "approved";
  const isPending = habit.status === "pending";
  const isFileUpload = ["image", "video", "file"].includes(habit.proofType);

  const theme = getTheme(habit);

  // Dynamic Badge Styling based on status
  let badgeBg, badgeText;
  if (isCompleted) {
    badgeBg = theme.accentBg;
    badgeText = "text-white";
  } else if (isPending) {
    badgeBg = "bg-white/40";
    badgeText = theme.text;
  } else {
    badgeBg = "bg-black/5";
    badgeText = theme.text;
  }

  return (
    <div className={`group relative p-8 rounded-[40px] flex flex-col min-h-[300px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50 ${theme.bg} ${isCompleted ? 'opacity-90' : ''}`}>
      
      {/* Edit & Delete Actions (Show on hover) */}
      <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={() => onEdit(habit._id)} className="p-2 bg-white/50 rounded-full hover:bg-white transition-colors">
          <span className="material-symbols-outlined text-sm text-gray-700">edit</span>
        </button>
        <button onClick={() => onDelete(habit._id)} className="p-2 bg-white/50 rounded-full hover:bg-white transition-colors">
          <span className="material-symbols-outlined text-sm text-red-600">delete</span>
        </button>
      </div>

      {/* Icon */}
      <div className="w-14 h-14 bg-white/80 rounded-[20px] flex items-center justify-center mb-6 shadow-sm shrink-0">
        <span className={`material-symbols-outlined text-[28px] ${theme.iconText} filled-icon`}>{theme.icon}</span>
      </div>

      {/* Title & Description */}
      <h2 className={`text-[24px] font-extrabold mb-2 tracking-tight leading-tight ${theme.title}`}>
        {habit.title}
      </h2>
      <p className={`text-[14px] mb-8 leading-relaxed font-medium ${theme.text}`}>
        {habit.description || "Complete your daily habit."}
      </p>

      {/* Dynamic Action Area */}
      <div className="mt-auto">
        {isCompleted ? (
          <div className="flex items-center justify-between">
            <span className={`px-4 py-1.5 ${badgeBg} ${badgeText} rounded-full text-[12px] font-bold flex items-center gap-1.5 shadow-sm`}>
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Completed
            </span>
            {/* Faux M T W bubbles to match design */}
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-white/50 flex items-center justify-center text-[10px] font-black border-2 border-white/20 text-gray-500">M</div>
              <div className="w-7 h-7 rounded-full bg-white/50 flex items-center justify-center text-[10px] font-black border-2 border-white/20 text-gray-500">T</div>
              <div className={`w-7 h-7 rounded-full ${theme.accentBg} flex items-center justify-center text-[10px] font-black border-2 border-white/20 text-white`}>W</div>
            </div>
          </div>
        ) : (
          <>
            {/* ── ALWAYS SHOW INPUT IF NOT COMPLETED ── */}
            {isFileUpload ? (
              <button 
                onClick={() => onFileSubmit(habit)}
                className={`w-full py-3.5 bg-white/60 border-2 border-dashed rounded-[20px] flex items-center justify-center gap-2 text-[14px] font-extrabold hover:bg-white/90 transition-colors mb-5 ${theme.iconText} border-white/50`}
              >
                <span className="material-symbols-outlined text-[20px]">cloud_upload</span> Upload Proof
              </button>
            ) : (
              <div className="flex items-center gap-2 mb-5">
                <input 
                  className={`flex-grow bg-white/50 border-none rounded-2xl px-5 py-3.5 text-[14px] font-bold text-gray-900 placeholder:text-gray-500/60 outline-none focus:ring-2 focus:ring-white`}
                  placeholder="Add proof text here..." 
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && proof.trim() !== "") { onTextSubmit(habit, proof); setProof(""); } }}
                />
                <button 
                  onClick={() => { if(proof.trim() !== "") { onTextSubmit(habit, proof); setProof(""); } }}
                  className={`w-12 h-12 shrink-0 ${theme.accentBg} text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-transform shadow-sm`}
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            )}

            {/* ── BOTTOM STATUS ROW ── */}
            <div className="flex items-center justify-between">
              <span className={`px-4 py-1.5 ${badgeBg} ${badgeText} rounded-full text-[11px] font-black uppercase tracking-widest`}>
                {isPending ? "Waiting" : "Not Done"}
              </span>
              
              {isPending ? (
                <div className="flex gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${theme.accentBg}`}></div>
                  <div className="w-2 h-2 rounded-full bg-white/60"></div>
                  <div className="w-2 h-2 rounded-full bg-white/60"></div>
                </div>
              ) : (
                <button className={`${theme.text} hover:text-gray-900 font-extrabold text-[12px] underline underline-offset-4`}>
                  Mark for Tomorrow
                </button>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
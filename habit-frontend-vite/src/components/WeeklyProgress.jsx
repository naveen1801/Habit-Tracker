import { useEffect, useState } from "react";
import { getWeeklyStats } from "../services/api";

export default function WeeklyProgress() {
  const [data, setData] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    getWeeklyStats(token).then(setData).catch(() => {});
  }, [token]);

  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-[#bbf0d4] p-8 rounded-[40px] shadow-sm relative flex flex-col h-full min-h-[280px]">

      {/* Icon */}
      <div className="w-12 h-12 bg-white/60 rounded-[18px] flex items-center justify-center mb-4 shadow-sm">
        <span className="material-symbols-outlined text-[#2a4d36] text-[24px]">trending_up</span>
      </div>

      <h3 className="text-[24px] font-extrabold text-[#1a4028] mb-1 tracking-tight">
        Weekly Growth
      </h3>
      <p className="text-[14px] text-[#346246] font-bold mb-4">Stay consistent 📈</p>

      {/* Bar chart */}
      <div className="flex items-end justify-between gap-2 h-24 mt-auto">
        {data.map((d, i) => {
          const pct     = max > 0 ? (d.count / max) * 100 : 0;
          const isToday = i === data.length - 1;
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
                <div
                  className={`w-full max-w-[28px] rounded-t-lg transition-all duration-700 ${
                    isToday ? "bg-[#1a4028]" : "bg-[#5eb881]"
                  }`}
                  style={{ height: `${Math.max(pct, 8)}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-[#346246]">{d.day}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
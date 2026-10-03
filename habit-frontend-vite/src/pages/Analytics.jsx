import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import { getAnalytics } from "../services/api";

function StatCard({ icon, label, value, tone = "orange" }) {
  const tones = {
    orange: "bg-[#fff0e6] text-[#8a5126]",
    green: "bg-[#e5f7ee] text-[#254e3a]",
    blue: "bg-[#e6f8fb] text-[#224c52]",
    gray: "bg-[#f3f4f3] text-gray-700",
  };

  return (
    <div className="bg-white rounded-[24px] border border-gray-100 p-7 shadow-sm">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${tones[tone]}`}>
        <span className="material-symbols-outlined text-[30px] filled-icon">{icon}</span>
      </div>
      <p className="text-[12px] font-black uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <h3 className="text-[38px] font-black text-gray-900 leading-none">{value}</h3>
    </div>
  );
}

export default function Analytics() {
  const token = localStorage.getItem("token");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics(token)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex bg-[#f9f9f8] min-h-screen font-sans text-[#2f3333]">
        <Sidebar />
        <main className="ml-0 md:ml-64 flex-1 flex items-center justify-center text-gray-400 font-black">
          Loading analytics...
        </main>
      </div>
    );
  }

  const maxDay = Math.max(...(data?.last30Days || []).map((day) => day.count), 1);

  return (
    <div className="flex bg-[#f9f9f8] min-h-screen font-sans text-[#2f3333]">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-8 lg:p-12 max-w-[1500px] mx-auto w-full">
        <header className="mb-10">
          <h1 className="text-[44px] lg:text-[56px] font-black tracking-tight text-gray-900 leading-none mb-3">
            Analytics
          </h1>
          <p className="text-[#5c605f] font-bold text-[17px]">
            A quick read on your consistency, approvals, and strongest habit areas.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7 mb-10">
          <StatCard icon="task_alt" label="Completion Rate" value={`${data?.completionRate || 0}%`} tone="green" />
          <StatCard icon="local_fire_department" label="Current Streak" value={`${data?.streak || 0}d`} />
          <StatCard icon="military_tech" label="Total XP" value={data?.user?.xp || 0} tone="blue" />
          <StatCard icon="pending_actions" label="Pending Proofs" value={data?.pendingCount || 0} tone="gray" />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 bg-white rounded-[28px] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[24px] font-black text-gray-900">Last 30 Days</h2>
              <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Approved logs</span>
            </div>
            <div className="h-72 flex items-end gap-2">
              {(data?.last30Days || []).map((day) => (
                <div key={day.date} className="flex-1 flex flex-col justify-end gap-3 h-full group">
                  <div
                    className="rounded-t-lg bg-[#3e6752] min-h-[8px] transition-all group-hover:bg-[#8a5126]"
                    title={`${day.date}: ${day.count}`}
                    style={{ height: `${Math.max((day.count / maxDay) * 100, 4)}%` }}
                  />
                </div>
              ))}
            </div>
          </div>

          <aside className="xl:col-span-4 bg-white rounded-[28px] border border-gray-100 p-8 shadow-sm">
            <h2 className="text-[24px] font-black text-gray-900 mb-7">Category Mix</h2>
            <div className="space-y-5">
              {(data?.categoryBreakdown || []).map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between mb-2">
                    <span className="font-black text-gray-800 capitalize">{item.category}</span>
                    <span className="font-black text-[#8a5126]">{item.count}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ffb380] rounded-full"
                      style={{ width: `${Math.min((item.count / Math.max(data.totalHabits || 1, 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {(data?.categoryBreakdown || []).length === 0 && (
                <p className="text-gray-400 font-bold">Create habits to see category insights.</p>
              )}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

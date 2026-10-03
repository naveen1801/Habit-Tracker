import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import HabitForm from "../components/HabitForm";
import { createHabit } from "../services/api";

export default function CreateHabit() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleCreate = async (payload) => {
    try {
      setSaving(true);
      await createHabit(token, payload);
      navigate("/habits");
    } catch (err) {
      alert(err.message || "Failed to create habit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fcfdfd] font-sans">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-8 lg:p-12 flex justify-center">
        <div className="w-full max-w-2xl">
          <header className="mb-10">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-gray-900 mb-4 flex items-center gap-2 font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              Back
            </button>
            <h1 className="text-[40px] font-black text-gray-900 tracking-tight leading-none mb-2">
              Create Habit
            </h1>
            <p className="text-gray-500 font-medium">
              Define the schedule, proof style, and accountability partner.
            </p>
          </header>

          <HabitForm
            mode="create"
            saving={saving}
            onSubmit={handleCreate}
            onCancel={() => navigate(-1)}
          />
        </div>
      </main>
    </div>
  );
}

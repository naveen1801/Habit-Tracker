import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import HabitForm from "../components/HabitForm";
import { getHabits, updateHabit } from "../services/api";

export default function EditHabit() {
  const { habitId } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadHabit() {
      try {
        const data = await getHabits(token);
        setHabit(data.find((item) => item._id === habitId) || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHabit();
  }, [habitId, token]);

  const handleSave = async (payload) => {
    try {
      setSaving(true);
      await updateHabit(token, habitId, payload);
      navigate("/habits");
    } catch (err) {
      alert(err.message || "Failed to update habit");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-[#fcfdfd] min-h-screen font-sans">
        <Sidebar />
        <main className="ml-0 md:ml-64 flex-1 flex items-center justify-center text-gray-400 font-bold">
          Loading habit...
        </main>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="flex bg-[#fcfdfd] min-h-screen font-sans">
        <Sidebar />
        <main className="ml-0 md:ml-64 flex-1 flex items-center justify-center">
          <div className="bg-white rounded-[32px] border border-gray-100 p-10 text-center shadow-sm">
            <p className="text-xl font-black text-gray-900 mb-4">Habit not found</p>
            <button
              onClick={() => navigate("/habits")}
              className="bg-[#94572e] text-white px-6 py-3 rounded-full font-black"
            >
              Back to Habits
            </button>
          </div>
        </main>
      </div>
    );
  }

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
              Edit Habit
            </h1>
            <p className="text-gray-500 font-medium">
              Update your habit details and schedule.
            </p>
          </header>

          <HabitForm
            mode="edit"
            initialValues={{
              title: habit.title || "",
              description: habit.description || "",
              frequency: habit.frequency || "daily",
              days: habit.days || [],
              proofType: habit.proofType || "text",
              guardianEmail: "",
              reminder: habit.reminder || "",
              category: habit.category || "general",
            }}
            saving={saving}
            onSubmit={handleSave}
            onCancel={() => navigate(-1)}
          />
        </div>
      </main>
    </div>
  );
}

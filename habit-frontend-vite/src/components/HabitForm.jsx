import { useState } from "react";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const categories = [
  { value: "general", label: "General", icon: "star" },
  { value: "fitness", label: "Fitness", icon: "fitness_center" },
  { value: "water", label: "Water", icon: "water_drop" },
  { value: "reading", label: "Reading", icon: "menu_book" },
  { value: "mindfulness", label: "Mindfulness", icon: "self_improvement" },
  { value: "sleep", label: "Sleep", icon: "bedtime" },
  { value: "nutrition", label: "Nutrition", icon: "restaurant" },
  { value: "study", label: "Study", icon: "school" },
];

const emptyHabit = {
  title: "",
  description: "",
  frequency: "daily",
  days: [],
  proofType: "text",
  guardianEmail: "",
  reminder: "",
  category: "general",
};

export default function HabitForm({ mode, initialValues = {}, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState({ ...emptyHabit, ...initialValues });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const toggleDay = (day) =>
    update("days", form.days.includes(day) ? form.days.filter((d) => d !== day) : [...form.days, day]);

  const submit = () => {
    const title = form.title.trim();
    if (!title) return alert("Title is required");
    if (form.frequency === "custom" && form.days.length === 0) {
      return alert("Select at least one active day");
    }
    onSubmit({ ...form, title, description: form.description.trim() });
  };

  return (
    <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-sm border border-gray-100">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Habit Title *</label>
          <input
            placeholder="e.g., Drink 2L of water"
            className="w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-2xl text-base outline-none focus:ring-2 focus:ring-[#e87a41] focus:bg-white transition-all text-gray-900 font-semibold placeholder-gray-400"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Description <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            placeholder="Why is this habit important to you?"
            rows="3"
            className="w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-2xl text-base outline-none focus:ring-2 focus:ring-[#e87a41] focus:bg-white transition-all text-gray-800 placeholder-gray-400 resize-none"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => update("category", cat.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                  form.category === cat.value
                    ? "bg-[#e87a41] text-white border-[#e87a41]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Frequency</label>
            <select
              className="w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-2xl text-base outline-none focus:ring-2 focus:ring-[#e87a41] focus:bg-white transition-all text-gray-800 font-medium cursor-pointer"
              value={form.frequency}
              onChange={(e) => update("frequency", e.target.value)}
            >
              <option value="daily">Every Day</option>
              <option value="custom">Specific Days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Proof Type</label>
            <select
              className="w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-2xl text-base outline-none focus:ring-2 focus:ring-[#e87a41] focus:bg-white transition-all text-gray-800 font-medium cursor-pointer"
              value={form.proofType}
              onChange={(e) => update("proofType", e.target.value)}
            >
              <option value="text">Written Note</option>
              <option value="image">Photo Upload</option>
              <option value="video">Video Upload</option>
            </select>
          </div>
        </div>

        {form.frequency === "custom" && (
          <div className="bg-[#fff0e6] p-6 rounded-[24px] border border-[#ffedd5]">
            <p className="text-sm font-bold text-[#94572e] mb-3">Select active days</p>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    form.days.includes(day)
                      ? "bg-[#e87a41] text-white shadow-md"
                      : "bg-white text-gray-500 border border-gray-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Guardian Email <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="email"
              placeholder="friend@example.com"
              className="w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-2xl text-base outline-none focus:ring-2 focus:ring-[#e87a41] focus:bg-white transition-all text-gray-800 placeholder-gray-400"
              value={form.guardianEmail}
              onChange={(e) => update("guardianEmail", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Reminder Time</label>
            <input
              type="time"
              className="w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-2xl text-base outline-none focus:ring-2 focus:ring-[#e87a41] focus:bg-white transition-all text-gray-800 cursor-pointer"
              value={form.reminder}
              onChange={(e) => update("reminder", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-100 flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border-2 border-gray-200 text-gray-600 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="flex-1 bg-[#94572e] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#7a4624] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
        >
          {saving ? "Saving..." : mode === "create" ? "Create Habit" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

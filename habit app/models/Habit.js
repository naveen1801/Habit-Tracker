const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: "" },
  frequency:   { type: String, default: "daily" },
  days:        { type: [String], default: [] },
  proofType:   { type: String, default: "text" },
  reminder:    { type: String, default: "" },
  category:    { type: String, default: "general" },
  status:      { type: String, default: "active" },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  guardianId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdAt:   { type: Date, default: Date.now }
});

habitSchema.index({ userId: 1, createdAt: -1 });
habitSchema.index({ guardianId: 1 });

module.exports = mongoose.model("Habit", habitSchema);

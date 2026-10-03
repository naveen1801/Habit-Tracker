const mongoose = require("mongoose");

const pomodoroSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  duration:  { type: Number, default: 25 },
  label:     { type: String, default: "" },
  completed: { type: Boolean, default: false },
  date:      { type: Date, default: Date.now }
});

module.exports = mongoose.model("PomodoroSession", pomodoroSchema);
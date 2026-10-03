const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: "Habit", default: null },
  likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  type:    { type: String, enum: ["achievement", "checkin", "tip", "general"], default: "general" }
}, { timestamps: true });

module.exports = mongoose.model("CommunityPost", communityPostSchema);
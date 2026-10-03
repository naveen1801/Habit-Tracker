const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ["user", "admin"], default: "user" },
  avatar:   { type: String, default: "" },
  bio:      { type: String, default: "" },
  xp:       { type: Number, default: 0 },
  level:    { type: Number, default: 1 },
  totalHabitsCompleted: { type: Number, default: 0 },
  earnedBadges: [
    {
      name:     { type: String },
      icon:     { type: String },
      desc:     { type: String },
      earnedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

userSchema.methods.recalcLevel = function () {
  this.level = Math.floor(this.xp / 100) + 1;
};

module.exports = mongoose.model("User", userSchema);
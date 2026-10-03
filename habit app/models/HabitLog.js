const mongoose = require("mongoose")

const habitLogSchema = new mongoose.Schema({

  habitId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Habit",
    required:true
  },

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  date:{
    type:Date,
    default:Date.now
  },

  proof:{
    type:String
  },

  status:{
    type:String,
    enum:["pending","approved","rejected"],
    default:"pending"
  },

  verifiedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }

})

habitLogSchema.index({ userId: 1, date: -1, status: 1 });
habitLogSchema.index({ habitId: 1, userId: 1, date: -1 });

module.exports = mongoose.model("HabitLog",habitLogSchema)

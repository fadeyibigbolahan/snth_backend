const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  referredBy: { type: String, default: null }, // Stores the username of the referrer
  referrals: [{ type: String }], // List of usernames the user referred
  pv: { type: Number, default: 0 }, // PV earned from package + referrals
  earnings: { type: Number, default: 0 }, // Total earnings
  totalEarnings: { type: Number, default: 0 }, // Lifetime earnings
  totalWithdrawals: { type: Number, default: 0 }, // Total amount withdrawn
  monthlyPV: { type: Number, default: 0 }, // Monthly Personal Volume
  weeklyPV: { type: Number, default: 0 }, // Personal Volume this week
  weeklyGV: { type: Number, default: 0 }, // Group Volume this week (optional cache)

  rank: {
    type: String,
    enum: ["Advocate", "Leader", "Champion", "Visionary"],
    default: "Advocate",
  },

  commissionRate: {
    type: Number,
    default: 0.15, // Updated weekly based on rank
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  phoneNumber: {
    type: String,
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;

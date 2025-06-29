const User = require("../models/User");

async function updateUserWeeklyPV(userId, amount) {
  const user = await User.findById(userId);
  if (!user) return;

  user.weeklyPV = (user.weeklyPV || 0) + amount;
  await user.save();
}

module.exports = updateUserWeeklyPV;

const User = require("../models/User");
const calculateWeeklyGV = require("./calculateWeeklyGV");

async function runWeeklyCommissionCalculation() {
  const users = await User.find();

  for (const user of users) {
    const gv = await calculateWeeklyGV(user);
    const pv = user.weeklyPV || 0;

    console.log(`${user.username} - PV: ${pv}, GV: ${gv}`);

    // TODO: Add logic here to:
    // - Pay personal PV commission
    // - Pay group bonuses based on GV thresholds
    // - Trigger rank advancement, etc.
  }
}

module.exports = runWeeklyCommissionCalculation;

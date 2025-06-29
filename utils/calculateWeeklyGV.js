const getAllDownlines = require("./getAllDownlines");

async function calculateWeeklyGV(user) {
  const downlines = await getAllDownlines(user);
  const totalDownlinePV = downlines.reduce(
    (sum, d) => sum + (d.weeklyPV || 0),
    0
  );
  const gv = (user.weeklyPV || 0) + totalDownlinePV;

  user.weeklyGV = gv;
  await user.save();

  return gv;
}
module.exports = calculateWeeklyGV;

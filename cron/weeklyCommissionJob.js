const User = require("../models/User");
const Transaction = require("../models/Transaction");
const createNotification = require("../utils/createNotification");
const getAllDownlines = require("../utils/getAllDownlines");
const distributeGroupVolumeCommission = require("../utils/distributeGroupVolumeCommission");

// Personal PV commission rates
function getPVCommissionRate(pv) {
  if (pv >= 300) return 0.25;
  if (pv >= 100) return 0.2;
  if (pv > 0) return 0.15;
  return 0;
}

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

async function runWeeklyCommissionJob() {
  const users = await User.find();

  for (const user of users) {
    const pv = user.weeklyPV || 0;
    const rate = getPVCommissionRate(pv);
    const pvCommission = pv * rate;

    if (pvCommission > 0) {
      user.earnings += pvCommission;
      user.totalEarnings += pvCommission;

      await user.save();

      await Transaction.create({
        user: user._id,
        type: "commission",
        amount: pvCommission,
        balanceAfter: user.earnings,
        status: "successful",
        details: `Weekly PV commission (${(rate * 100).toFixed(
          0
        )}%) on ${pv} PV`,
      });

      await createNotification(
        user._id,
        `You earned ₦${pvCommission.toFixed(2)} as your weekly PV commission!`
      );

      console.log(`Paid PV commission to ${user.username}`);
    }

    if (pv > 0) {
      await distributeGroupVolumeCommission(user, pv);
    }

    // Calculate GV for records and other bonus logic
    await calculateWeeklyGV(user);
  }

  // Reset volumes after payout
  await User.updateMany({}, { $set: { weeklyPV: 0, weeklyGV: 0 } });

  console.log("✅ Weekly commissions distributed and volumes reset.");
}

module.exports = runWeeklyCommissionJob;

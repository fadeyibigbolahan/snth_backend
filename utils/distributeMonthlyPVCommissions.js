const User = require("../models/User");
const Transaction = require("../models/Transaction");
const createNotification = require("../utils/createNotification");
const getPVCommissionRate = require("./getPVCommissionRate");

async function distributeMonthlyPVCommissions() {
  const users = await User.find({ monthlyPV: { $gt: 0 } });

  for (const user of users) {
    const rate = getPVCommissionRate(user.monthlyPV);
    const commission = user.monthlyPV * rate;

    if (commission > 0) {
      user.earnings += commission;
      user.totalEarnings += commission;

      await user.save();

      // Log transaction
      await Transaction.create({
        user: user._id,
        type: "commission",
        amount: commission,
        balanceAfter: user.earnings,
        status: "successful",
        details: `Monthly PV commission at ${rate * 100}% on ${
          user.monthlyPV
        } PV`,
      });

      // Send notification
      await createNotification(
        user._id,
        `You earned $${commission.toFixed(2)} as monthly PV commission!`
      );

      console.log(`Commission sent to ${user.username}`);
    }

    // Optionally reset monthly PV to 0 after processing
    user.monthlyPV = 0;
    await user.save();
  }
}

module.exports = distributeMonthlyPVCommissions;

const Transaction = require("../models/Transaction");
const createNotification = require("../utils/createNotification");
const getUplines = require("./getUplines"); // ✅ Make sure this is correct

async function distributeGroupVolumeCommission(originUser, cvAmount) {
  const uplines = await getUplines(originUser, 10);

  const LEVEL_COMMISSIONS = {
    1: 0.1,
    2: 0.07,
    3: 0.05,
    4: 0.03,
    5: 0.02,
    6: 0.01,
    7: 0.01,
    8: 0.01,
    9: 0.01,
    10: 0.01,
  };

  for (const { user: upline, level } of uplines) {
    const rate = LEVEL_COMMISSIONS[level];
    if (!rate) continue;

    const commission = cvAmount * rate;

    upline.earnings += commission;
    upline.totalEarnings += commission;
    await upline.save();

    await Transaction.create({
      user: upline._id,
      type: "commission",
      amount: commission,
      balanceAfter: upline.earnings,
      status: "successful",
      details: `Group Volume commission (Level ${level}) from ${originUser.username}`,
    });

    await createNotification(
      upline._id,
      `You earned ₦${commission.toFixed(
        2
      )} from your Level ${level} downline (${originUser.username})`
    );

    console.log(
      `Paid ₦${commission.toFixed(2)} to ${upline.username} for Level ${level}`
    );
  }
}

module.exports = distributeGroupVolumeCommission;

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const getCommissionRate = require("../utils/getCommissionRate");
const createNotification = require("../utils/createNotification");

async function assignUserRanks() {
  const users = await User.find();

  for (const user of users) {
    const pv = user.weeklyPV;
    const gv = user.weeklyGV;

    const downlines = await User.find({ referredBy: user.username });
    const sponsoredLeaders = downlines.filter((dl) => dl.rank === "Leader");
    const sponsoredChampions = downlines.filter((dl) => dl.rank === "Champion");

    // Determine rank
    let newRank = "Advocate";

    const daysSinceRegistration =
      (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);

    if (pv >= 200 && gv >= 5000 && sponsoredChampions.length >= 3) {
      newRank = "Visionary";
    } else if (pv >= 150 && gv >= 2000 && sponsoredLeaders.length >= 2) {
      newRank = "Champion";
    } else if (pv >= 100 && gv >= 500) {
      newRank = "Leader";
    } else if (pv >= 50) {
      newRank = "Advocate";
    }

    const previousRank = user.rank;
    user.rank = newRank;
    user.commissionRate = getCommissionRate(newRank);
    await user.save();

    // Bonuses
    if (
      newRank === "Leader" &&
      previousRank !== "Leader" &&
      daysSinceRegistration <= 60
    ) {
      user.earnings += 25;
      user.totalEarnings += 25;
      await user.save();

      await Transaction.create({
        user: user._id,
        type: "bonus",
        amount: 25,
        balanceAfter: user.earnings,
        details: "Fast Start Bonus for becoming Leader within 60 days",
      });

      await createNotification(
        user._id,
        "🎉 You received a $25 Fast Start Bonus for becoming a Leader within your first 60 days!"
      );
    }

    if (newRank === "Champion" && previousRank !== "Champion") {
      user.earnings += 50;
      user.totalEarnings += 50;
      await user.save();

      await Transaction.create({
        user: user._id,
        type: "bonus",
        amount: 50,
        balanceAfter: user.earnings,
        details: "Champion Bonus",
      });

      await createNotification(
        user._id,
        "🏅 Congratulations! You earned a $50 Champion Bonus!"
      );

      // Check if upline is Visionary for 5% matching bonus
      const upline = await User.findOne({ username: user.referredBy });
      if (upline && upline.rank === "Visionary") {
        const matchBonus = 50 * 0.05;
        upline.earnings += matchBonus;
        upline.totalEarnings += matchBonus;
        await upline.save();

        await Transaction.create({
          user: upline._id,
          type: "bonus",
          amount: matchBonus,
          balanceAfter: upline.earnings,
          details: `5% Matching Bonus from ${user.username}'s Champion Bonus`,
        });

        await createNotification(
          upline._id,
          `💸 You received ₦${matchBonus.toFixed(
            2
          )} as a 5% matching bonus from ${user.username}'s Champion Bonus!`
        );
      }
    }

    if (newRank === "Visionary" && previousRank !== "Visionary") {
      user.earnings += 150;
      user.totalEarnings += 150;
      await user.save();

      await Transaction.create({
        user: user._id,
        type: "bonus",
        amount: 150,
        balanceAfter: user.earnings,
        details: "Visionary Rank Bonus",
      });

      await createNotification(
        user._id,
        "🌟 Congratulations! You've achieved Visionary rank and earned a $150 bonus!"
      );
    }
  }
}

module.exports = assignUserRanks;

const User = require("../models/User");

async function getUplines(user, maxLevels = 10) {
  const uplines = [];
  let current = user;
  let level = 1;

  while (current.referredBy && level <= maxLevels) {
    const referrer = await User.findOne({ username: current.referredBy });
    if (!referrer) break;

    uplines.push({ user: referrer, level });
    current = referrer;
    level++;
  }

  return uplines;
}
module.exports = getUplines;

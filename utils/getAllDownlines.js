const User = require("../models/User");

async function getAllDownlines(user) {
  const allUsers = await User.find();
  const downlines = [];

  function findChildren(username) {
    const children = allUsers.filter((u) => u.referredBy === username);
    for (const child of children) {
      downlines.push(child);
      findChildren(child.username);
    }
  }

  findChildren(user.username);
  return downlines;
}
module.exports = getAllDownlines;

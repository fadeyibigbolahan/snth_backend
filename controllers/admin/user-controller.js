const User = require("../../models/User");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Optionally use `.select('-password')` to exclude password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
};

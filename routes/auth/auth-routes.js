const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  authMiddleware,
} = require("../../controllers/auth/auth-controller");
const getReferralBVTree = require("../../utils/getReferralBVTree");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getUserProfile);
router.post("/logout", logoutUser);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});

/****************************************************************************************************
 * GET REFERRAL BV TREE => START
 ****************************************************************************************************/
router.get("/bv-referral-tree/:username", authMiddleware, async (req, res) => {
  try {
    const username = req.params.username;

    const tree = await getReferralBVTree(username);
    console.log("tree", tree);

    res.status(200).json({
      message: "Referral BV Tree Structure",
      tree,
    });
  } catch (error) {
    console.error("Error generating tree:", error);
    res.status(500).json({ message: "Server error" });
  }
});
/****************************************************************************************************
 * GET REFERRAL BV TREE => ENDS
 ****************************************************************************************************/

module.exports = router;

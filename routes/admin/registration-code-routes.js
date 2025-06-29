const express = require("express");
const router = express.Router();
const RegistrationCode = require("../../models/RegistrationCode");
const authMiddleware = require("../../middlewares/authMiddleware");

// Utility function to generate a single code
const generateCode = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

// POST /api/admin/generate-codes
router.post("/generate-codes", authMiddleware, async (req, res) => {
  try {
    const { quantity = 1, length = 8 } = req.body;
    const createdBy = req.userId; // Assumes user is authenticated and `req.user` is populated

    if (quantity < 1 || quantity > 1000) {
      return res
        .status(400)
        .json({ message: "Invalid quantity (must be 1 - 1000)" });
    }

    const codes = [];

    for (let i = 0; i < quantity; i++) {
      codes.push({
        code: generateCode(length),
        createdBy,
      });
    }

    // Save to DB
    const savedCodes = await RegistrationCode.insertMany(codes);

    res.status(201).json({
      message: `${savedCodes.length} code(s) generated successfully`,
      codes: savedCodes.map((c) => c.code),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error generating codes" });
  }
});

module.exports = router;

const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  const token = req.cookies.token; // Ensure cookie-parser is used!

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.userId = decoded.id; // ✅ This is the user ID you need
    req.user = decoded; // Optionally access role/email/etc
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = authenticateUser;

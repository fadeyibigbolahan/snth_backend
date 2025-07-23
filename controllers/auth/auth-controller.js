const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const RegistrationCode = require("../../models/RegistrationCode");
const Transaction = require("../../models/Transaction");
const createNotification = require("../../utils/createNotification"); // adjust path as needed

//register
const registerUser = async (req, res) => {
  const {
    username,
    email,
    password,
    referredBy,
    name,
    phoneNumber,
    code,
    role,
  } = req.body;
  // console.log("Registration request body:", req.body);

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with the same username! Please try again",
      });
    }

    let newCode = null;

    if (role !== "admin") {
      if (!code) {
        return res.status(400).json({
          message: "Registration code is required.",
          success: false,
        });
      }

      newCode = await RegistrationCode.findOne({ code, used: false });
      // console.log("Found registration code:", newCode);
      if (!newCode) {
        return res.status(400).json({
          message: "Invalid or already used registration code.",
          success: false,
        });
      }
    }

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      username: username.trim(),
      email: email.trim(),
      password: hashPassword,
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      code,
    });

    if (referredBy) {
      newUser.referredBy = referredBy.trim();
    }

    await newUser.save();

    if (referredBy) {
      const referrer = await User.findOne({ username: referredBy });

      if (referrer) {
        referrer.earnings += 5;
        referrer.totalEarnings += 5;
        referrer.referrals.push(username); // Add new user's username
        await referrer.save();

        await Transaction.create({
          user: referrer._id,
          type: "earning",
          amount: 5,
          balanceAfter: referrer.earnings,
          status: "successful",
          details: `Referral bonus for inviting ${username}`,
        });

        // Send notification to referrer
        await createNotification(
          referrer._id,
          `${username} registered using your referral. You've earned $5!`
        );

        // console.log(`Referral bonus added to ${referredBy}`);
      } else {
        console.warn(`Referrer not found: ${referredBy}`);
      }
    }

    if (newCode) {
      newCode.used = true;
      newCode.usedBy = newUser._id;
      await newCode.save();
    }

    res.status(201).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    console.error("Registration error:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred during registration.",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const checkUser = await User.findOne({ username });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        username: checkUser.username,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 1000 * 60 * 60, // 1 hour
      })
      .json({
        success: true,
        message: "Logged in successfully",
        user: {
          email: checkUser.email,
          role: checkUser.role,
          id: checkUser._id,
          username: checkUser.username,
        },
      });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const getUserProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the user profile.",
    });
  }
};
//get user profile
//logout

const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  getUserProfile,
};

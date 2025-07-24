require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cron = require("node-cron");

const distributeMonthlyPVCommissions = require("./utils/distributeMonthlyPVCommissions");
const distributeGroupVolumeCommissions = require("./utils/distributeGroupVolumeCommission");
const runWeeklyCommissionJob = require("./cron/weeklyCommissionJob");
const assignUserRanks = require("./cron/assignUserRanks");

const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const adminRegistrationCodeRouter = require("./routes/admin/registration-code-routes");
const adminUserRouter = require("./routes/admin/user-routes");

const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");

const commonFeatureRouter = require("./routes/common/feature-routes");

const transactionRouter = require("./routes/transactions");
const notificationRouter = require("./routes/notification");
const genealogyRouter = require("./routes/genealogy");

// This cron job runs on the first day of every month at midnight
cron.schedule("0 0 1 * *", async () => {
  try {
    console.log("🟢 Monthly commission job started...");
    await distributeMonthlyPVCommissions();
    console.log("✅ Monthly commission job completed.");
  } catch (err) {
    console.error("❌ Monthly commission job failed:", err);
  }
});

// Run every Sunday at 11:59 PM
cron.schedule("59 23 * * 0", async () => {
  console.log("⏳ Starting weekly commission job...");
  try {
    await assignUserRanks();
    await runWeeklyCommissionJob();
    console.log("✅ Weekly commission job completed.");
  } catch (err) {
    console.error("❌ Weekly commission job failed:", err);
  }
});

//create a database connection -> u can also
//create a separate file for this and then import/use that file here

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://snthinternational.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/code", adminRegistrationCodeRouter);
app.use("/api/admin/users", adminUserRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);

app.use("/api/common/feature", commonFeatureRouter);

app.use("/api/transactions", transactionRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/genealogy", genealogyRouter);

app.get("/scheduled-task", (req, res) => {
  console.log("Scheduled task triggered!");
  // Run your task here, e.g., database cleanup, sending emails, etc.
  res.send("Task completed");
});

app.get("/test-weekly", async (req, res) => {
  await assignUserRanks();
  await runWeeklyCommissionJob();
  res.send("Weekly job ran");
});

app.get("/test-monthly", async (req, res) => {
  await distributeMonthlyPVCommissions();
  res.send("Monthly job ran");
});

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));

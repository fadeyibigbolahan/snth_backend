const { Schema, model } = require("mongoose");

const RegistrationCodeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    used: { type: Boolean, default: false },
    usedBy: { type: Schema.Types.ObjectId, ref: "users", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "users" }, // Optional: for vendors/admins
    expiresAt: { type: Date }, // Optional: if you want to expire codes
  },
  { timestamps: true }
);

module.exports = model("RegistrationCode", RegistrationCodeSchema);

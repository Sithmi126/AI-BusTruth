const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["INFO", "SUCCESS", "WARNING", "REPORT_UPDATE"],
      default: "INFO",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusReport",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
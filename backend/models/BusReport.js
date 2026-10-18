
const mongoose = require("mongoose");

const busReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusRoute",
      default: null,
    },

    routeNumber: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    reportType: {
      type: String,
      enum: [
        "CROWDING",
        "DELAY",
        "ACCESSIBILITY",
        "SERVICE_ISSUE",
        "OTHER",
      ],
      required: true,
    },

    crowdLevel: {
      type: String,
      enum: ["LOW", "MODERATE", "HIGH", "VERY_HIGH", ""],
      default: "",
    },

    delayMinutes: {
      type: Number,
      min: 0,
      max: 600,
      default: null,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["SUBMITTED", "REVIEWED", "RESOLVED", "REJECTED"],
      default: "SUBMITTED",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BusReport", busReportSchema);




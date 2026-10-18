
const mongoose = require("mongoose");

const busRouteSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: true,
      trim: true,
    },
    routeName: {
      type: String,
      required: true,
      trim: true,
    },
    startLocation: {
      type: String,
      required: true,
      trim: true,
    },
    endLocation: {
      type: String,
      required: true,
      trim: true,
    },
    stops: {
      type: [String],
      default: [],
    },
    distanceKm: {
      type: Number,
      min: 0,
      default: null,
    },
    estimatedDurationMinutes: {
      type: Number,
      min: 0,
      default: null,
    },
    operator: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

busRouteSchema.index({
  routeNumber: 1,
  startLocation: 1,
  endLocation: 1,
});

module.exports = mongoose.model("BusRoute", busRouteSchema);

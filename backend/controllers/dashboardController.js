
const BusRoute = require("../models/BusRoute");
const BusReport = require("../models/BusReport");

const getAnalytics = async (req, res) => {
  try {
    const [
      totalRoutes,
      activeRoutes,
      totalReports,
      pendingReports,
      resolvedReports,
      crowdingReports,
      delayReports,
      accessibilityReports,
    ] = await Promise.all([
      BusRoute.countDocuments(),
      BusRoute.countDocuments({ status: "ACTIVE" }),
      BusReport.countDocuments(),
      BusReport.countDocuments({ status: { $in: ["SUBMITTED", "PENDING"] } }),
      BusReport.countDocuments({ status: "RESOLVED" }),
      BusReport.countDocuments({ reportType: "CROWDING" }),
      BusReport.countDocuments({ reportType: "DELAY" }),
      BusReport.countDocuments({ reportType: "ACCESSIBILITY" }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalRoutes,
        activeRoutes,
        totalReports,
        pendingReports,
        resolvedReports,
        crowdingReports,
        delayReports,
        accessibilityReports,
      },
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard analytics.",
    });
  }
};

module.exports = { getAnalytics };



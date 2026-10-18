const mongoose = require("mongoose");
const BusReport = require("../models/BusReport");
const Notification = require("../models/Notification");

const getUserId = (req) => req.user?._id || req.user?.id || req.user?.userId;
const isAdmin = (req) => String(req.user?.role || "").toUpperCase() === "ADMIN";

// Admins see all reports; passengers see only their own.
const getBusReports = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ success: false, message: "Please log in again." });
    }
    const filter = isAdmin(req) ? {} : { user: userId };
    const reports = await BusReport.find(filter)
      .populate("user", "fullName name email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    console.error("Get reports error:", error);
    return res.status(500).json({ success: false, message: "Failed to load reports." });
  }
};

const createBusReport = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ success: false, message: "Please log in again." });
    }
    const { routeId, routeNumber, reportType, location, description, crowdLevel, delayMinutes } = req.body;
    const allowedTypes = ["CROWDING", "DELAY", "ACCESSIBILITY", "SERVICE_ISSUE", "OTHER"];
    if (!allowedTypes.includes(reportType)) {
      return res.status(400).json({ success: false, message: "Please select a valid report type." });
    }
    if (!String(location || "").trim() || !String(description || "").trim()) {
      return res.status(400).json({ success: false, message: "Location and description are required." });
    }
    const parsedDelay = delayMinutes === "" || delayMinutes == null ? null : Number(delayMinutes);
    if (parsedDelay !== null && (!Number.isFinite(parsedDelay) || parsedDelay < 0 || parsedDelay > 600)) {
      return res.status(400).json({ success: false, message: "Delay must be between 0 and 600 minutes." });
    }
    const report = await BusReport.create({
      user: userId,
      route: routeId && mongoose.isValidObjectId(routeId) ? routeId : null,
      routeNumber: String(routeNumber || "").trim(),
      reportType,
      location: String(location).trim(),
      description: String(description).trim(),
      crowdLevel: reportType === "CROWDING" ? (crowdLevel || "") : "",
      delayMinutes: reportType === "DELAY" ? parsedDelay : null,
    });
    try {
      await Notification.create({
        user: userId,
        title: "Report submitted successfully",
        message: `Your ${reportType.toLowerCase().replace("_", " ")} report for bus route ${routeNumber || "N/A"} has been received.`,
        type: "SUCCESS",
        relatedReport: report._id,
      });
    } catch (notificationError) {
      console.error("Notification creation error:", notificationError);
    }
    return res.status(201).json({ success: true, message: "Report submitted successfully.", report });
  } catch (error) {
    console.error("Create report error:", error);
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Failed to submit report." });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ success: false, message: "Admin access required." });
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["SUBMITTED", "REVIEWED", "RESOLVED", "REJECTED"];
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid report ID." });
    if (!allowedStatuses.includes(status)) return res.status(400).json({ success: false, message: "Choose a valid report status." });
    const report = await BusReport.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
      .populate("user", "fullName name email");
    if (!report) return res.status(404).json({ success: false, message: "Report not found." });
    try {
      const reportOwnerId = report.user?._id || report.user;
      await Notification.create({
        user: reportOwnerId,
        title: "Your report status was updated",
        message: `Your report for route ${report.routeNumber || "N/A"} is now ${status.toLowerCase()}.`,
        type: status === "RESOLVED" ? "SUCCESS" : "INFO",
        relatedReport: report._id,
      });
    } catch (notificationError) {
      console.error("Status notification error:", notificationError);
    }
    return res.status(200).json({ success: true, message: "Report status updated.", report });
  } catch (error) {
    console.error("Update report status error:", error);
    return res.status(500).json({ success: false, message: "Failed to update report status." });
  }
};

module.exports = { getBusReports, createBusReport, updateReportStatus };




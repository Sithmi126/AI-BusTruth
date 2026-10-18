const express = require("express");
const router = express.Router();
const { getBusReports, createBusReport, updateReportStatus } = require("../controllers/busReportController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", getBusReports); // Passenger: own reports; Admin: all reports
router.post("/", createBusReport); // Signed-in passenger report submission
router.patch("/:id/status", updateReportStatus); // Controller enforces ADMIN role

module.exports = router;

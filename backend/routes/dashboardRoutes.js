
const express = require("express");
const router = express.Router();

const { getAnalytics } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

router.get("/analytics", protect, getAnalytics);

module.exports = router;



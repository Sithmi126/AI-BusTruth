
const express = require("express");
const router = express.Router();

const {
  getBusRoutes,
  getBusRouteById,
  createBusRoute,
} = require("../controllers/busRouteController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", getBusRoutes);
router.get("/:id", getBusRouteById);
router.post("/", protect, createBusRoute);

module.exports = router;

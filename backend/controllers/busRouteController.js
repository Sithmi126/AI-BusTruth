
const BusRoute = require("../models/BusRoute");

// @desc    Get all bus routes
// @route   GET /api/routes
const getBusRoutes = async (req, res) => {
  try {
    const { search, status } = req.query;

    const filter = {};

    if (status) {
      if (!["ACTIVE", "INACTIVE"].includes(status.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: "Invalid route status",
        });
      }

      filter.status = status.toUpperCase();
    } else {
      filter.status = "ACTIVE";
    }

    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const searchRegex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { routeNumber: searchRegex },
        { routeName: searchRegex },
        { startLocation: searchRegex },
        { endLocation: searchRegex },
        { stops: searchRegex },
      ];
    }

    const routes = await BusRoute.find(filter).sort({
      routeNumber: 1,
    });

    return res.status(200).json({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error) {
    console.error("Get bus routes error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve bus routes",
    });
  }
};

// @desc    Get one bus route
// @route   GET /api/routes/:id
const getBusRouteById = async (req, res) => {
  try {
    const route = await BusRoute.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Bus route not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: route,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid bus route ID",
      });
    }

    console.error("Get bus route error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve bus route",
    });
  }
};

// @desc    Create a bus route
// @route   POST /api/routes
const createBusRoute = async (req, res) => {
  try {
    const {
      routeNumber,
      routeName,
      startLocation,
      endLocation,
      stops,
      distanceKm,
      estimatedDurationMinutes,
      operator,
    } = req.body;

    if (
      !routeNumber?.trim() ||
      !routeName?.trim() ||
      !startLocation?.trim() ||
      !endLocation?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Route number, route name, start location and end location are required",
      });
    }

    if (stops !== undefined && !Array.isArray(stops)) {
      return res.status(400).json({
        success: false,
        message: "Stops must be an array of location names",
      });
    }

    if (
      stops &&
      stops.some((stop) => typeof stop !== "string" || !stop.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Every stop must be a non-empty string",
      });
    }

    for (const value of [distanceKm, estimatedDurationMinutes]) {
      if (
        value !== undefined &&
        value !== null &&
        (typeof value !== "number" || !Number.isFinite(value) || value < 0)
      ) {
        return res.status(400).json({
          success: false,
          message: "Distance and duration must be non-negative numbers",
        });
      }
    }

    const route = await BusRoute.create({
      routeNumber: routeNumber.trim(),
      routeName: routeName.trim(),
      startLocation: startLocation.trim(),
      endLocation: endLocation.trim(),
      stops: (stops || []).map((stop) => stop.trim()),
      distanceKm: distanceKm ?? null,
      estimatedDurationMinutes: estimatedDurationMinutes ?? null,
      operator: operator?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Bus route created successfully",
      data: route,
    });
  } catch (error) {
    console.error("Create bus route error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create bus route",
    });
  }
};

module.exports = {
  getBusRoutes,
  getBusRouteById,
  createBusRoute,
};

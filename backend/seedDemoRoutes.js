
const mongoose = require("mongoose");
require("dotenv").config();

const BusRoute = require("./models/BusRoute");

const demoRoutes = [
  {
    routeNumber: "138",
    routeName: "Pettah - Maharagama",
    startLocation: "Pettah",
    endLocation: "Maharagama",
    stops: ["Pettah", "Nugegoda", "Maharagama"],
    distanceKm: 15,
    estimatedDurationMinutes: 50,
    operator: "SLTB",
    status: "ACTIVE",
  },
  {
    routeNumber: "177",
    routeName: "Kollupitiya - Kaduwela",
    startLocation: "Kollupitiya",
    endLocation: "Kaduwela",
    stops: ["Kollupitiya", "Rajagiriya", "Malabe", "Kaduwela"],
    distanceKm: 20,
    estimatedDurationMinutes: 65,
    operator: "Private",
    status: "ACTIVE",
  },
  {
    routeNumber: "154",
    routeName: "Kiribathgoda - Angulana",
    startLocation: "Kiribathgoda",
    endLocation: "Angulana",
    stops: ["Kiribathgoda", "Wellawatte", "Rathmalana", "Angulana"],
    distanceKm: 22,
    estimatedDurationMinutes: 70,
    operator: "Private",
    status: "ACTIVE",
  },
];

async function seedRoutes() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is missing from backend .env");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    for (const route of demoRoutes) {
      await BusRoute.updateOne(
        { routeNumber: route.routeNumber },
        { $setOnInsert: route },
        { upsert: true }
      );
    }

    console.log("Demo routes added successfully.");
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

seedRoutes();



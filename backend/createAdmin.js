
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function createAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI .env file eke naha");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    const email = "admin@bustruth.lk";
    const password = "Admin@BusTruth2026";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      if (existingAdmin.role !== "ADMIN") {
        existingAdmin.role = "ADMIN";
        await existingAdmin.save();
        console.log("Existing account updated to ADMIN");
      } else {
        console.log("Admin account already exists");
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        fullName: "AI BusTruth Admin",
        email,
        password: hashedPassword,
        role: "ADMIN",
      });

      console.log("Admin account created successfully");
    }

    console.log("Admin email:", email);
    console.log("Admin password:", password);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();

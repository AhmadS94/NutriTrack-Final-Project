require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

async function testUserModel() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected!");

    const testUser = new User({
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
      password: "temporary-test-value",
      role: "user",
    });

    await testUser.save();
    console.log("User saved successfully!");

    await User.findByIdAndDelete(testUser._id);
    console.log("Test user deleted successfully!");
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testUserModel();

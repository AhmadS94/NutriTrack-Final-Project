const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify JWT signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    // Get current user and role from MongoDB
    const user = await User.findById(decoded.userId).select("_id role");

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists.",
      });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError" ||
      error.name === "CastError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token.",
      });
    }

    console.error("Authentication error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = authMiddleware;

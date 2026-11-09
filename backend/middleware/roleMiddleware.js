const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // Make sure the user is authenticated
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Check if the user has permission
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access forbidden. Insufficient permissions.",
      });
    }

    // User has permission
    next();
  };
};

module.exports = roleMiddleware;

const jwt = require("jsonwebtoken");

//  Check token and match user ID
const checkUserId = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Compare user id from token with param id
    if (decoded.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource",
      });
    }

    req.user = decoded; // attach decoded data
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

//  Check token and specific role(s)
const checkRole = (...roles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied: insufficient role",
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  };
};

//  Check token & attach user info (for general use)
const checkTokenAndAttachUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach all { id, role, email, userName }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const checkOwnerOrRole = (...roles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Condition: Either same user OR role matches
      if (decoded.id !== req.params.id && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied: not owner or insufficient role",
        });
      }

      req.user = decoded; // attach decoded token info
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  };
};

module.exports = {
  checkUserId,
  checkRole,
  checkTokenAndAttachUser,
  checkOwnerOrRole,
};

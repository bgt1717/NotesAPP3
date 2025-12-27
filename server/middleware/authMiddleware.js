import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Header must exist
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Expected format: "Bearer TOKEN"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach userId to request
    req.userId = decoded.userId;

    // Continue to the route
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

export default authMiddleware;

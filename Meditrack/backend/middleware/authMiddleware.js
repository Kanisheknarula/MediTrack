const jwt = require('jsonwebtoken');

// This is our new middleware function
const authMiddleware = (req, res, next) => {
  // 1. Get the token from the request header
  // It's usually sent as: "Bearer <token>"
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Get just the token part

  if (token == null) {
    // 401 means "Unauthorized"
    return res.status(401).json({ message: 'No token provided. Access denied.' });
  }

  // 2. Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // 403 means "Forbidden" (token is invalid or expired)
      return res.status(403).json({ message: 'Invalid token. Access denied.' });
    }

    // 3. If token is valid, attach the user's data to the request
    // The 'user' here is the payload we put in the token: { userId, role }
    req.user = user; 

    // 4. Continue to the original endpoint (e.g., 'add animal')
    next(); 
  });
};

module.exports = authMiddleware;
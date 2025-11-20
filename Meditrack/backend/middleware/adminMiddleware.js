// This middleware checks if the user is an Admin
// It MUST run *after* the 'authMiddleware'

const adminMiddleware = (req, res, next) => {
  // 'authMiddleware' should have already added 'req.user'
  if (req.user && req.user.role === 'Admin') {
    // If user is an Admin, proceed
    next();
  } else {
    // If not an Admin, deny access
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

module.exports = adminMiddleware;
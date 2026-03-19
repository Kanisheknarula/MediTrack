const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Protect routes (Check for valid token)
const protect = async (req, res, next) => {
    let token;

    // Tokens are usually sent in the headers as: "Bearer eyJhbGciOi..."
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Split the string and grab just the token part
            token = req.headers.authorization.split(' ')[1];

            // Decode the token using our secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user in the database and attach their info to 'req.user'
            // We use .select('-password') to ensure we NEVER pass the password along
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Move on to the actual route logic
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// 2. Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        // req.user was set by the 'protect' middleware above
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User role '${req.user.role}' is not authorized to access this route.` 
            });
        }
        next(); // User has the right role, let them through
    };
};

module.exports = { protect, authorize };
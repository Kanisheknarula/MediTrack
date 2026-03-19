const jwt = require('jsonwebtoken');

// This function creates a token that expires in 30 days
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = generateToken;
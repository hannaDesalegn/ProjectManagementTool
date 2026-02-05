const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

exports.generateToken = (payload) => {
    return jwt.sign(payload, SECRET, { expiresIn: "1h" });
};

exports.verifyToken = (token) => {
    try {
        return jwt.verify(token, SECRET);
    } catch (err) {
        throw new Error("Invalid or expired token");
    }
};

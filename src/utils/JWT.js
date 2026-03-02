// utils/jwt.js
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "f94f563a5750a933cec4bb5ec3f3159eab4216db56a1758d14750b3fbdb219628230cd7e6b9bd5d546a262b9fa9f91117940c2916913e0c3cc09e76b41024c90";

export const generateToken = (payload) => {
    return jwt.sign(payload, SECRET, { expiresIn: "1h" });
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, SECRET);
    } catch (err) {
        throw new Error("Invalid or expired token");
    }
};
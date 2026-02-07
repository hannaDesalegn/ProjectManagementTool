import prisma from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../config/jwt.js";

export const register = async ({ email, password, name }) => {
    if (!email || !password || !name) {
        throw new Error("Email, password, and name are required");
    }

    const exists = await prisma.users.findUnique({
        where: { email },
    });

    if (exists) {
        throw new Error("User already exists");
    }

    const hashed = await hashPassword(password);

    const user = await prisma.users.create({
        data: {
            email,
            password_hash: hashed,
            name,
            profile_pic: 'default.png', // Default profile picture
        },
    });

    return { id: user.id, email: user.email, name: user.name };
};

export const login = async ({ email, password }) => {
    const user = await prisma.users.findUnique({
        where: { email },
    });

    if (!user) throw new Error("Invalid credentials");

    const match = await comparePassword(password, user.password_hash);
    if (!match) throw new Error("Invalid credentials");

    const token = generateToken({ id: user.id, email: user.email });

    return { token, user: { id: user.id, email: user.email, name: user.name } };
};

export default { register, login };
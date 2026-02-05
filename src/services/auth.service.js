const prisma = require("../config/prisma");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken } = require("../config/jwt");

exports.register = async({ email, password }) => {
    if (!email || !password) {
        throw new Error("Email and password required");
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
            password: hashed,
        },
    });

    return { id: user.id, email: user.email };
};

exports.login = async({ email, password }) => {
    const user = await prisma.users.findUnique({
        where: { email },
    });

    if (!user) throw new Error("Invalid credentials");

    const match = await comparePassword(password, user.password);
    if (!match) throw new Error("Invalid credentials");

    const token = generateToken({ id: user.id, email: user.email });

    return { token };
};
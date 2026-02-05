import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash("123456", 10);

    const existingUser = await prisma.user.findUnique({
        where: { email: "yo@taskflow.com" },
    });

    if (!existingUser) {
        await prisma.user.create({
            data: {
                email: "yo@taskflow.com",
                password_hash: hashedPassword,
            },
        });
        console.log("Seeded user: yo@taskflow.com");
    } else {
        console.log("User already exists");
    }
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
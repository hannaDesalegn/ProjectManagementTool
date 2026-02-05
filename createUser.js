import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('123456', 10);

    const user = await prisma.users.create({
        data: {
            email: 'yo@taskflow.com',
            password_hash: hashedPassword,
            name: 'Yordanos Tesfaye',
            profile_pic: 'default.png', // <-- required field filled
        },
    });

    console.log(user);
}

main()
    .catch((e) => console.error(e))
    .finally(async() => {
        await prisma.$disconnect();
    });
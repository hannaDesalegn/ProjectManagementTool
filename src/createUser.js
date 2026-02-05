import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createUser() {
    const hashedPassword = await bcrypt.hash('123456', 10);

    const user = await prisma.users.create({ // <-- change 'user' to 'users'
        data: {
            email: 'yo@taskflow.com',
            password_hash: hashedPassword, // make sure field matches your schema
        },
    });

    console.log('Created user:', user);
}

createUser()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
// Manage Users Script - Delete users one by one
import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function listUsers() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            isVerified: true,
            is_system_admin: true,
            created_at: true
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    if (users.length === 0) {
        console.log('\n📭 No users found in database.\n');
        return [];
    }

    console.log('\n👥 Current Users:\n');
    console.log('─'.repeat(80));
    users.forEach((user, index) => {
        const verified = user.isVerified ? '✅' : '❌';
        const admin = user.is_system_admin ? '👑' : '  ';
        console.log(`${index + 1}. ${admin} ${verified} ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Created: ${user.created_at.toLocaleString()}`);
        console.log('─'.repeat(80));
    });

    return users;
}

async function deleteUserById(userId) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true }
        });

        if (!user) {
            console.log('❌ User not found.');
            return false;
        }

        await prisma.user.delete({
            where: { id: userId }
        });

        console.log(`\n✅ Successfully deleted user: ${user.name} (${user.email})\n`);
        return true;
    } catch (error) {
        console.error('❌ Error deleting user:', error.message);
        return false;
    }
}

async function deleteUserByEmail(email) {
    try {
        const user = await prisma.user.findUnique({
            where: { email: email },
            select: { id: true, name: true, email: true }
        });

        if (!user) {
            console.log('❌ User not found with that email.');
            return false;
        }

        await prisma.user.delete({
            where: { id: user.id }
        });

        console.log(`\n✅ Successfully deleted user: ${user.name} (${user.email})\n`);
        return true;
    } catch (error) {
        console.error('❌ Error deleting user:', error.message);
        return false;
    }
}

async function main() {
    console.log('\n🔧 User Management Tool\n');

    while (true) {
        const users = await listUsers();

        if (users.length === 0) {
            break;
        }

        console.log('\nOptions:');
        console.log('  - Enter user number (1, 2, 3...) to delete');
        console.log('  - Enter email address to delete');
        console.log('  - Type "all" to delete all users');
        console.log('  - Type "exit" to quit\n');

        const answer = await question('Your choice: ');
        const input = answer.trim().toLowerCase();

        if (input === 'exit' || input === 'quit' || input === 'q') {
            console.log('\n👋 Goodbye!\n');
            break;
        }

        if (input === 'all') {
            const confirm = await question('⚠️  Delete ALL users? Type "yes" to confirm: ');
            if (confirm.trim().toLowerCase() === 'yes') {
                const result = await prisma.user.deleteMany({});
                console.log(`\n✅ Deleted ${result.count} users.\n`);
                break;
            } else {
                console.log('❌ Cancelled.\n');
                continue;
            }
        }

        // Check if it's a number (user index)
        const userIndex = parseInt(input);
        if (!isNaN(userIndex) && userIndex > 0 && userIndex <= users.length) {
            const selectedUser = users[userIndex - 1];
            const confirm = await question(`Delete ${selectedUser.name} (${selectedUser.email})? (y/n): `);
            if (confirm.trim().toLowerCase() === 'y' || confirm.trim().toLowerCase() === 'yes') {
                await deleteUserById(selectedUser.id);
            } else {
                console.log('❌ Cancelled.\n');
            }
            continue;
        }

        // Check if it's an email
        if (input.includes('@')) {
            const confirm = await question(`Delete user with email ${input}? (y/n): `);
            if (confirm.trim().toLowerCase() === 'y' || confirm.trim().toLowerCase() === 'yes') {
                await deleteUserByEmail(input);
            } else {
                console.log('❌ Cancelled.\n');
            }
            continue;
        }

        console.log('❌ Invalid input. Please try again.\n');
    }

    rl.close();
    await prisma.$disconnect();
}

main()
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
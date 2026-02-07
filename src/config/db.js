const hashedPassword = await bcrypt.hash("123456", 10);
await prisma.user.create({
    data: {
        email: "yo@taskflow.com",
        password_hash: hashedPassword
    }
});
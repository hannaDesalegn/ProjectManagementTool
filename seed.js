import prisma from "./src/config/prisma.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendEmail } from "./src/utils/email.js";

async function seed() {
  try {
    console.log("Seeding database...");

    await prisma.user.deleteMany({});
    console.log("Existing users deleted");

    const usersData = [
      { name: "Hanna", email: "hannazeurael@gmail.com" },
      { name: "Yonas", email: "yonas@gmail.com" },
      { name: "Abel", email: "abel@gmail.com" },
      { name: "Yordi", email: "yordit296@gmail.com" },
    ];

    const hashedPassword = await bcrypt.hash("123456", 10);

    for (const u of usersData) {
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const passwordResetToken = crypto.randomBytes(32).toString("hex");

      const user = await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          password_hash: hashedPassword,   
          isVerified: false,
          verificationToken,
          passwordResetToken,
          passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
          profile_pic: "img.jpg",
          is_system_admin: false,         
        },
      });

      const verifyUrl = `http://localhost:4000/api/auth/verify-email?token=${verificationToken}`;

      try {
        await sendEmail({
          to: user.email,
          subject: "Verify your email",
          html: `<a href="${verifyUrl}">Verify Email</a>`,
        });
      } catch (err) {
        console.log(`Email failed for ${user.email}: ${err.message}`);
      }

      console.log(`Seeded: ${user.email}`);
    }

    console.log("Seeding complete");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

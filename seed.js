
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
      { name: "yordi", email: "yordit296@gmail.com" },
    ];

    const hashedPassword = await bcrypt.hash("123456", 10);

    for (const u of usersData) {
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const passwordResetToken = crypto.randomBytes(32).toString("hex");
      const passwordResetExpires = new Date(Date.now() + 3600 * 1000); 

      const user = await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          password_hash: hashedPassword,
          isVerified: false, 
          verificationToken,
          passwordResetToken,
          passwordResetExpires,
          profile_pic: "img.jpg", 
          is_system_admin: false, 
        },
      });

      console.log(`User created: ${user.email}`);
      console.log(`Verification link: http://localhost:4000/users/verify?token=${verificationToken}`);
      console.log(`Password reset token (for testing): ${passwordResetToken}`);


      try {
        await sendEmail({
          to: user.email,
          subject: "Verify your email",
          text: `Click to verify your email: http://localhost:4000/users/verify?token=${verificationToken}`,
          html: `<p>Click <a href="http://localhost:4000/users/verify?token=${verificationToken}">here</a> to verify your email</p>`,
        });
        console.log(`Verification email sent to: ${user.email}`);
      } catch (err) {
        console.log(`Could not send email to ${user.email}: ${err.message}`);
      }
    }

    console.log("All users seeded");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

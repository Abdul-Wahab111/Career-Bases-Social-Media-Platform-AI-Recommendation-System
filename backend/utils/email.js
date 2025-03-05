const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendVerificationEmail = async (email, token) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Verify your email",
    text: `Click the link to verify your email: ${process.env.BASE_URL}/verify?token=${token}`,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail };

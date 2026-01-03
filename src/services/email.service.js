import transporter from '../config/mailer.js';

export const sendOtpEmail = async (to, otp) => {
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'LOADED' : 'MISSING');

  await transporter.sendMail({
    from: `"Hotel Booking" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your account - OTP',
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
    `
  });
};

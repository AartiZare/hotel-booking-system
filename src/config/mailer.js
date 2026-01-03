import nodemailer from 'nodemailer';

console.log('MAILER ENV CHECK', {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS ? 'LOADED' : 'MISSING'
});

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error) => {
  if (error) {
    console.error('SMTP ERROR:', error.message);
  } else {
    console.log('SMTP READY');
  }
});

export default transporter;

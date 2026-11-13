import nodemailer from 'nodemailer';

// Run from web/: node --env-file=.env.local scripts/test-email.mjs (reads the SMTP_* variables).

async function testSmtp() {
  console.log(`Testing SMTP connection with ${process.env.SMTP_USER}...`);
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false }
  });

  try {
    const info = await transporter.sendMail({
      from: `"GigTim" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: 'lucas.rus.dojo@gmail.com',
      subject: 'Test Email from GigTim',
      text: 'Testing SMTP delivery with real email account',
    });
    console.log('SUCCESS! Email Sent:', info.messageId);
  } catch (err) {
    console.error('SMTP Error:', err);
  }
}

testSmtp();

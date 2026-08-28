import nodemailer from 'nodemailer';

async function testSmtp() {
  console.log('Testing SMTP connection with REMOVED...');
  
  const transporter = nodemailer.createTransport({
    host: 'REMOVED',
    port: 465,
    secure: true,
    auth: {
      user: 'REMOVED',
      pass: 'REMOVED',
    },
    tls: { rejectUnauthorized: false }
  });

  try {
    const info = await transporter.sendMail({
      from: '"GigTim" <REMOVED>',
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

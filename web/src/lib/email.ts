import nodemailer from 'nodemailer';

export async function sendVerificationEmail(toEmail: string, token: string) {
  const confirmUrl = `https://gigtim.arhebis.ro/confirm-email?token=${token}`;

  // SMTP_HOST, SMTP_USER and SMTP_PASS come only from the environment (web/.env.local, Vercel settings); SMTP_FROM is optional.
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('email: SMTP_HOST, SMTP_USER or SMTP_PASS not set; verification emails cannot be sent.');
    return { success: false, error: 'Email is not configured' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fcfbf8; color: #1c1917; margin: 0; padding: 40px 20px; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 24px; padding: 40px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
        .logo { font-size: 28px; font-weight: 900; color: #e11d48; margin-bottom: 24px; text-align: center; }
        .title { font-size: 20px; font-weight: 800; color: #1c1917; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #57534e; margin-bottom: 24px; }
        .btn { display: block; width: 100%; text-align: center; background-color: #e11d48; color: #ffffff !important; font-weight: 700; font-size: 15px; padding: 14px 0; border-radius: 16px; text-decoration: none; box-shadow: 0 4px 12px rgba(225,29,72,0.25); }
        .footer { margin-top: 32px; font-size: 11px; color: #a8a29e; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">GigTim</div>
        <div class="title">Confirmă adresa ta de email</div>
        <div class="text">
          Îți mulțumim că te-ai înregistrat pe platforma <strong>GigTim</strong>. Pentru a-ți activa contul și a putea accesa joburile disponibile, te rugăm să confirmi adresa de email făcând click pe butonul de mai jos:
        </div>
        <a href="${confirmUrl}" class="btn">Confirmă adresa de email</a>
        <div class="text" style="margin-top: 24px; font-size: 12px;">
          Dacă nu poți apăsa butonul, copiază următorul link în browser:<br>
          <a href="${confirmUrl}" style="color: #e11d48;">${confirmUrl}</a>
        </div>
        <div class="footer">
          Dacă nu ai creat tu acest cont, poți ignora acest mesaj cu siguranță.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"GigTim" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Confirmă adresa ta de email — GigTim',
      html: htmlContent,
    });
    console.log('Verification email sent to:', toEmail, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('SMTP Email Send Error:', error.message);
    return { success: false, error: error.message };
  }
}

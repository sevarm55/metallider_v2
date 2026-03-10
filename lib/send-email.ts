import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  await transporter.sendMail({
    from: `"МеталлЛидер" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

export function buildPasswordResetEmail(code: string) {
  return {
    subject: `${code} — сброс пароля МеталлЛидер`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="460" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <tr><td style="background:#27272a;padding:28px 32px;text-align:center">
          <span style="font-size:18px;font-weight:900;letter-spacing:3px;color:#ffffff">МЕТАЛЛ</span><span style="font-size:18px;font-weight:900;letter-spacing:3px;color:#f97316">ЛИДЕР</span>
        </td></tr>
        <tr><td style="padding:36px 32px 20px">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b">Сброс пароля</h1>
          <p style="margin:0 0 28px;font-size:15px;color:#71717a;line-height:1.5">
            Вы запросили сброс пароля. Введите этот код, чтобы установить новый пароль:
          </p>
          <div style="text-align:center;margin:0 0 28px">
            <div style="display:inline-block;background:#fef3c7;border:2px dashed #f59e0b;border-radius:12px;padding:16px 36px">
              <span style="font-size:36px;font-weight:900;letter-spacing:12px;color:#18181b;font-family:'Courier New',monospace">${code}</span>
            </div>
          </div>
          <p style="margin:0 0 4px;font-size:13px;color:#a3a3a3">
            Код действителен <strong style="color:#71717a">15 минут</strong>.
          </p>
          <p style="margin:0;font-size:13px;color:#a3a3a3">
            Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px 28px;border-top:1px solid #f0f0f0">
          <p style="margin:0;font-size:12px;color:#d4d4d4;text-align:center">
            © МеталлЛидер · metallider.ru
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

export function buildVerificationEmail(code: string) {
  return {
    subject: `${code} — код подтверждения МеталлЛидер`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="460" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

        <!-- Header -->
        <tr><td style="background:#27272a;padding:28px 32px;text-align:center">
          <span style="font-size:18px;font-weight:900;letter-spacing:3px;color:#ffffff">МЕТАЛЛ</span><span style="font-size:18px;font-weight:900;letter-spacing:3px;color:#f97316">ЛИДЕР</span>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 32px 20px">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b">Подтверждение email</h1>
          <p style="margin:0 0 28px;font-size:15px;color:#71717a;line-height:1.5">
            Введите этот код на странице подтверждения, чтобы завершить регистрацию:
          </p>

          <!-- Code -->
          <div style="text-align:center;margin:0 0 28px">
            <div style="display:inline-block;background:#f5f5f5;border:2px dashed #d4d4d4;border-radius:12px;padding:16px 36px">
              <span style="font-size:36px;font-weight:900;letter-spacing:12px;color:#18181b;font-family:'Courier New',monospace">${code}</span>
            </div>
          </div>

          <p style="margin:0 0 4px;font-size:13px;color:#a3a3a3">
            Код действителен <strong style="color:#71717a">15 минут</strong>.
          </p>
          <p style="margin:0;font-size:13px;color:#a3a3a3">
            Если вы не регистрировались на сайте, просто проигнорируйте это письмо.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 32px 28px;border-top:1px solid #f0f0f0">
          <p style="margin:0;font-size:12px;color:#d4d4d4;text-align:center">
            © МеталлЛидер · metallider.ru
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

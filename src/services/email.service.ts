import { transporter } from "../config";
import { emailVerificationTemplate } from "../templates/emailVerification";
import { resetPasswordTemplate } from "../templates/resetPassword";
import type { SendEmailOptions } from "../types";

export async function sendEmail({ to, type, payload }: SendEmailOptions) {
  let subject: string;
  let html: string;

  switch (type) {
    case "VERIFICATION":
      subject = "Verifica tu cuenta";
      html = emailVerificationTemplate(payload.link);
      break;
    case "RESET_PASSWORD":
      subject = "Restablece tu contraseña";
      html = resetPasswordTemplate(payload.link);
      break;
    default:
      throw new Error("Tipo de email no soportado");
  }

  await transporter.sendMail({
    from: `"Tu App" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

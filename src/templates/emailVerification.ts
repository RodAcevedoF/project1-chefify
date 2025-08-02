export function emailVerificationTemplate(link: string) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color: #4CAF50;">Bienvenido a Tu App 🎉</h2>
    <p>Gracias por registrarte. Por favor verifica tu email para activar tu cuenta.</p>
    <a href="${link}" style="background: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
      Verificar mi cuenta
    </a>
    <p style="margin-top: 20px; font-size: 12px; color: #888;">Este enlace expirará en 24 horas.</p>
  </div>
  `;
}

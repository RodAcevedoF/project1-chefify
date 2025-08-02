export function resetPasswordTemplate(link: string) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color: #f44336;">Restablece tu contraseña 🔑</h2>
    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
    <a href="${link}" style="background: #f44336; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
      Cambiar contraseña
    </a>
    <p style="margin-top: 20px; font-size: 12px; color: #888;">
      Si no solicitaste este cambio, ignora este correo.
    </p>
  </div>
  `;
}

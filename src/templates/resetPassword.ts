export function resetPasswordTemplate(link: string) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color: #f44336;">Reset your password 🔑</h2>
    <p>We received a request to reset your password.</p>
    <br/>
    <a href="${link}" style="background: #f44336; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
      Change password
    </a>
    <p style="margin-top: 20px; font-size: 12px; color: #888;">
      If you didn\`t request this change, ignore this email.
    </p>
  </div>
  `;
}

export function emailVerificationTemplate(link: string) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color: #4CAF50;">Welcome to CHEFify 🎉</h2>
    <p>Thanks for signing up. Please, verify your email to access your account.</p>
    <br/>
    <a href="${link}" style="background: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
      Verify my email
    </a>
    <p style="margin-top: 20px; font-size: 12px; color: #888;">This link will expire in 24h.</p>
  </div>
  `;
}

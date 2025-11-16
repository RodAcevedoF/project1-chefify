export function contactTemplate(
	name: string,
	replyTo: string,
	message: string,
) {
	return `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color: #1976d2;">New contact message</h2>
    <p><strong>From:</strong> ${name} &lt;${replyTo}&gt;</p>
    <hr/>
    <div style="margin-top: 12px; white-space: pre-wrap;">${message}</div>
  </div>
  `;
}

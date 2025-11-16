import { transporter } from '../config';
import { emailVerificationTemplate } from '../templates/emailVerification';
import { resetPasswordTemplate } from '../templates/resetPassword';
import { contactTemplate } from '../templates/contact';
import type { SendEmailOptions } from '../types';
import logger from '@/utils/logger';

export async function sendEmail({ to, type, payload }: SendEmailOptions) {
	let subject: string;
	let html: string;

	switch (type) {
		case 'VERIFICATION':
			subject = 'Verify your email';
			html = emailVerificationTemplate((payload as { link: string }).link);
			if (process.env.NODE_ENV !== 'production') {
				try {
					logger.info(
						`[email] sending ${type} to ${to} — link:`,
						(payload as { link: string }).link,
					);
				} catch (err) {
					logger.error('Error logging email verification link:', err);
				}
			}
			break;
		case 'RESET_PASSWORD':
			subject = 'Reset your password';
			html = resetPasswordTemplate((payload as { link: string }).link);
			break;
		case 'CONTACT':
			subject = `New contact message from ${(payload as { name: string }).name}`;
			html = contactTemplate(
				(payload as { name: string }).name,
				(payload as { replyTo: string }).replyTo,
				(payload as { message: string }).message,
			);
			break;
		default:
			throw new Error('Type of email not supported');
	}

	await transporter.sendMail({
		from: `"Chefify " <${process.env.SMTP_USER}>`,
		to,
		subject,
		html,
	});
}

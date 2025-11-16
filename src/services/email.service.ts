import { transporter } from '../config';
import { emailVerificationTemplate } from '../templates/emailVerification';
import { resetPasswordTemplate } from '../templates/resetPassword';
import type { SendEmailOptions } from '../types';
import logger from '@/utils/logger';

export async function sendEmail({ to, type, payload }: SendEmailOptions) {
	let subject: string;
	let html: string;

	switch (type) {
		case 'VERIFICATION':
			subject = 'Verify your email';
			html = emailVerificationTemplate(payload.link);
			if (process.env.NODE_ENV !== 'production') {
				try {
					logger.info(`[email] sending ${type} to ${to} — link:`, payload.link);
				} catch (err) {
					logger.error('Error logging email verification link:', err);
				}
			}
			break;
		case 'RESET_PASSWORD':
			subject = 'Reset your password';
			html = resetPasswordTemplate(payload.link);
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

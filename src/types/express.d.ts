import { JWTPayload } from '../schemas';
import type { Session, SessionData } from 'express-session';

declare global {
	namespace Express {
		interface Request {
			user?: JWTPayload;
			session?: Session & SessionData & { user?: JWTPayload };
			sessionID?: string;
		}
	}
}

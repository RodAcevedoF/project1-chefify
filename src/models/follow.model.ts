import { model } from 'mongoose';
import FollowSchema, { type IFollow } from '../schemas/follow.schema';

export const Follow = model<IFollow>('Follow', FollowSchema, 'follows');

import { model } from 'mongoose';
import LikeSchema, { type ILike } from '../schemas/like.schema';

export const Like = model<ILike>('Like', LikeSchema, 'likes');

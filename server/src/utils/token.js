import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env.js';

export function signAccessToken(user) {
  const env = getEnv();
  return jwt.sign(
    { sub: user._id.toString() },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getEnv().JWT_SECRET);
}

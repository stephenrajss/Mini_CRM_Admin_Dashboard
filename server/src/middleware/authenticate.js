import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { readAccessToken } from '../utils/cookies.js';
import { verifyAccessToken } from '../utils/token.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = readAccessToken(req);
  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const user = await User.findById(payload.sub).select('+token');
  if (!user || !user.isActive || !user.token?.includes(token)) {
    throw new ApiError(401, 'Invalid or expired token');
  }

  user.token = undefined;
  user.unmarkModified('token');
  req.user = user;
  next();
});

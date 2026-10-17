import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken, verifyAccessToken } from '../utils/token.js';
import { serializeUser } from '../utils/serialize.js';

let dummyHashPromise;

function getDummyHash() {
  if (!dummyHashPromise) {
    dummyHashPromise = bcrypt.hash('not-a-real-password', 10);
  }
  return dummyHashPromise;
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  const hash = user?.passwordHash || (await getDummyHash());
  const passwordMatches = await bcrypt.compare(password, hash);

  if (!user || !passwordMatches) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  const token = signAccessToken(user);
  await User.updateOne(
    { _id: user._id }, 
    { $push: { token } }
  );

  return {
    token,
    user: serializeUser(user),
  };
}

export async function logout(token) {
  if (!token) return;
  try {
    const payload = verifyAccessToken(token);
    await User.updateOne({ _id: payload.sub }, { $pull: { token } });
  } catch {
    // An expired or malformed token is already unusable.
  }
}

export async function getProfile(user) {
  return serializeUser(user);
}

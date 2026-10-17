import * as authService from '../services/authService.js';
import { clearAccessTokenCookie, readAccessToken, setAccessTokenCookie } from '../utils/cookies.js';
import { sendSuccess } from '../utils/response.js';

export async function login(req, res) {
  const result = await authService.login(req.validated.body);
  setAccessTokenCookie(res, result.token);
  sendSuccess(res, { message: 'Logged in successfully', data: { token: result.token, user: result.user } });
}

export async function logout(req, res) {
  await authService.logout(readAccessToken(req));
  clearAccessTokenCookie(res);
  sendSuccess(res, { message: 'Logged out successfully', data: null });
}

export async function me(req, res) {
  const user = await authService.getProfile(req.user);
  sendSuccess(res, { message: 'Profile retrieved successfully', data: { user } });
}

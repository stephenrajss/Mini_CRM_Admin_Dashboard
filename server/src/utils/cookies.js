import { getEnv } from '../config/env.js';

export const ACCESS_TOKEN_COOKIE = 'accessToken';

export function readAccessToken(req) {
  const header = req.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    const token = header.slice('Bearer '.length).trim();
    if (token) {
      return token;
    }
  }
  return req.cookies?.[ACCESS_TOKEN_COOKIE] || null;
}

function expiresInToMs(value) {
  const match = /^(\d+)(s|m|h|d)$/.exec(value);
  if (!match) {
    return 8 * 60 * 60 * 1000;
  }
  const amount = Number(match[1]);
  const unit = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 }[match[2]];
  return amount * unit;
}

export function accessTokenCookieOptions() {
  const env = getEnv();
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/',
    maxAge: expiresInToMs(env.JWT_EXPIRES_IN),
  };
}

export function setAccessTokenCookie(res, token) {
  res.cookie(ACCESS_TOKEN_COOKIE, token, accessTokenCookieOptions());
}

export function clearAccessTokenCookie(res) {
  const options = accessTokenCookieOptions();
  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  });
}

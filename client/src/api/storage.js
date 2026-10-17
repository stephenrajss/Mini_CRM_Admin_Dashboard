const USER_INFO_KEY = 'userInfo';

export function getUserInfo() {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed?.token) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setUserInfo(userInfo) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
}

export function clearUserInfo() {
  localStorage.removeItem(USER_INFO_KEY);
}

const TOKEN_KEY = "nutritrack_token";

export function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
}

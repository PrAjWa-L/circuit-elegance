import type { AuthTokens } from "./api";

let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAuthTokens(tokens: AuthTokens) {
  accessToken = tokens.access_token;
}

export function clearAuthTokens() {
  accessToken = null;
}

export function hasSession() {
  return Boolean(accessToken);
}

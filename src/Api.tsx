let accessToken = '';

export function setAccessToken(newAccessToken: string) {
  accessToken = newAccessToken;
}

export function getAccessToken(): string {
  return accessToken;
}
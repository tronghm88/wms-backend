export const TOKEN_SERVICE = "TOKEN_SERVICE";

export interface ITokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenService {
  generateTokens(payload: ITokenPayload): Promise<ITokens>;
  generateRefreshToken(): string;
  hashToken(token: string): Promise<string>;
}

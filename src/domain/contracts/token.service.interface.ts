export const TOKEN_SERVICE = "TOKEN_SERVICE";

export interface ITokenPayload {
  userId: number;
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
  /** SHA-256 hash of a token — used as a Redis lookup key for opaque refresh tokens */
  sha256Token(token: string): string;
}

// user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  twoFactorEnabled?: boolean;
  sessions?: Session[];
  accounts?: Account[];
}

export interface Session {
  id: string;
  expiresAt: Date;
  token: string;
  userId: string;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
  user?: User;
}

export interface Account {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  createdAt: Date;
  user?: User;
}

export interface Provider {
  id: string;
  providerId: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  idToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  scope: string;
  createdAt: Date;
  user?: User;
}

export interface Verification {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
}
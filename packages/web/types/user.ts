// user.ts
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified: boolean;
  image?: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  two_factor_enabled: boolean;
  Session: Session[];
  Account: Account[];
}

export interface Session {
  id: string;
  expires_at: Date;
  token: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  ip_address: string;
  user_agent: string;
  user: User;
}

export interface Account {
  id: string;
  account_id: string;
  provider_id: string;
  user_id: number;
  access_token: string;
  refresh_token: string;
  id_token: string;
  access_token_expires_at: Date;
  refresh_token_expires_at: Date;
  scope: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  user: User;
}

export interface Provider {
  id: string;
  provider_id: string;
  user_id: number;
  access_token: string;
  refresh_token: string;
  id_token: string;
  access_token_expires_at: Date;
  refresh_token_expires_at: Date;
  scope: string;
  created_at: Date;
  updated_at: Date;
  user: User;
}

export interface Verification {
  id: string;
  identifier: string;
  value: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}
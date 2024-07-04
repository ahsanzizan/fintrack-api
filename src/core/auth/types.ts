export interface UserPayload {
  sub: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatedUser {
  name: string;
  email: string;
  created_at: Date;
}

export interface UpdateProfileResult {
  name: string;
  email: string;
  verification_token: string;
  is_verified: boolean;
}

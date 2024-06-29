export interface UserPayload {
  sub: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date | null;
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

export interface UserPayload {
  sub: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface CreatedUser {
  username: string;
  email: string;
  created_at: Date;
}

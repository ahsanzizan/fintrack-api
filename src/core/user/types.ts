export interface Profile {
  name: string;
  email: string;
  verification_token: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export type Role = 'admin' | 'cust' | 'guest';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  roles: Role[];
}

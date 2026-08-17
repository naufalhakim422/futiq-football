export type RoleType =
  | "SUPER_ADMIN"
  | "EDITOR_IN_CHIEF"
  | "SENIOR_EDITOR"
  | "CONTRIBUTOR"
  | "READER";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  roles: RoleType[];
  permissions: string[];
}

export interface SessionPayload {
  sub: string; // User ID
  email: string;
  fullName: string;
  roles: RoleType[];
  permissions: string[];
  iat: number;
  exp: number;
}

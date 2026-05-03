export type JwtPayload = {
  id: number;
  email: string;
};

export type AuthUser = JwtPayload & {
  refreshToken?: string;
};

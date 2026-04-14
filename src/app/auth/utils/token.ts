import JWT from "jsonwebtoken";

export interface UserTokenPayload {
  id: string;
}

export function createUserToken(payload: UserTokenPayload) {
  const token = JWT.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "15m",
  });
  return token;
}

export function createRefreshToken(payload: UserTokenPayload) {
  const refreshToken = JWT.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });
  return refreshToken;
}
export function verifyUserToken(token: string) {
  try {
    const payload = JWT.verify(
      token,
      process.env.JWT_ACCESS_SECRET!,
    ) as UserTokenPayload;
    return payload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string) {
  try {
    const payload = JWT.verify(
      token,
      process.env.JWT_REFRESH_SECRET!,
    ) as UserTokenPayload;
    return payload;
  } catch (err) {
    return null;
  }
}

import type { Request, Response } from "express";
import { signInPayload, signUpPayload } from "./model";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { userTable } from "../../db/schema";
import {
  createUserToken,
  verifyUserToken,
  createRefreshToken,
  verifyRefreshToken,
} from "./utils/token";
import bcrypt from "bcryptjs";

class AuthController {
  public async handleSignup(req: Request, res: Response) {
    const validationResult = await signUpPayload.safeParseAsync(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid signup data",
        error: validationResult.error.issues,
      });
    }

    const { first_name, last_name, email, password } = validationResult.data;

    const userEmailResult = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));

    if (userEmailResult.length > 0) {
      return res.status(409).json({
        error: "email already exists",
        message: `User with email ${email} already exists`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db
      .insert(userTable)
      .values({
        firstName: first_name,
        lastName: last_name,
        email,
        password: hashedPassword,
      })
      .returning({ id: userTable.uuid });

    const created = result[0];
    if (!created) {
      return res.status(500).json({
        message: "Failed to create user",
        error: "User creation failed",
      });
    }

    const accessToken = createUserToken({ id: created.id });

    return res.status(201).json({
      message: "User created successfully",
      accessToken,
    });
  }

  public async handleSignin(req: Request, res: Response) {
    const validationResult = await signInPayload.safeParseAsync(req.body);

    if (!validationResult.success)
      return res.status(400).json({
        message: "Invalid singin data",
        error: validationResult.error.issues,
      });

    const { email, password } = validationResult.data;

    const [userSelect] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));

    if (!userSelect?.password)
      return res.status(401).json({
        message: "Invalid credentials",
        error: `Invalid email or password`,
      });

    const matchPassword = await bcrypt.compare(password, userSelect.password);

    if (!matchPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
        error: "Email or password is incorrect",
      });
    }

    const accessToken = createUserToken({ id: userSelect.uuid });
    const refreshToken = createRefreshToken({ id: userSelect.uuid });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(200).json({
      message: "User signed in successfully",
      accessToken,
    });
  }

  public async getMe(req: Request, res: Response) {
    const userId = res.locals.id as string;

    const user = await db
      .select({
        id: userTable.uuid,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
        email: userTable.email,
        emailVerified: userTable.emailVerified,
        createdAt: userTable.createdAt,
      })
      .from(userTable)
      .where(eq(userTable.uuid, userId));

    if (user.length === 0) {
      return res.status(404).json({
        message: "User not found ",
      });
    }

    return res.status(200).json({
      message: "User details fetched successfully",
      data: user[0],
    });
  }

  public async handleRefresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        message: "No refresh token provided",
      });
    }
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const accessToken = createUserToken({ id: payload.id });

    return res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken,
    });
  }

  public async handleLogout(req: Request, res: Response) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    return res.status(200).json({
      message: "Logged out successfully",
    });
  }
}
export { AuthController };

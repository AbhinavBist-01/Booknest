import express from "express";
import type { Router } from "express";
import { AuthController } from "./controller";
import { authMiddleware } from "./middlewares/middleware";

const authRouter = express.Router() as Router;
const authController = new AuthController();

//Auth routes

authRouter.post("/signup", authController.handleSignup.bind(authController));

authRouter.post("/login", authController.handleSignin.bind(authController));

authRouter.get(
  "/me",
  authMiddleware,
  authController.getMe.bind(authController),
);

authRouter.post("/refresh", authController.handleRefresh.bind(authController));

authRouter.post("/logout", authController.handleLogout.bind(authController));

export { authRouter };

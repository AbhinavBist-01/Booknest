import express from "express";
import type { Express } from "express";
import { authRouter } from "./auth/routes";
import cookieParser from "cookie-parser";
import { bookingRouter } from "./booking/booking.route";
import { legacySeatRouter } from "./legacy/legacy.route";
import path from "node:path";

export function createExpressApp(): Express {
  const app = express();

  // middleware

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use("/ui", express.static(path.join(process.cwd(), "src/app/frontend")));

  app.get("/ui", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "src/app/frontend/index.html"));
  });

  app.get("/ui/signup", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "src/app/frontend/signup.html"));
  });

  app.get("/ui/login", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "src/app/frontend/login.html"));
  });

  app.get("/ui/booking", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "src/app/frontend/booking.html"));
  });

  // routers
  app.get("/", (_req, res) => {
    return res.redirect("/ui/signup.html");
  });

  app.use("/auth", authRouter);
  app.use("/bookings", bookingRouter);
  app.use("/", legacySeatRouter);
  return app;
}

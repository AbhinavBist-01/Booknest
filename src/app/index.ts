import express from "express";
import type { ErrorRequestHandler, Express } from "express";
import { authRouter } from "./auth/routes";
import cookieParser from "cookie-parser";
import { bookingRouter } from "./booking/booking.route";
import { legacySeatRouter } from "./legacy/legacy.route";
import path from "node:path";
import { db } from "../db";
import { sql } from "drizzle-orm";

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

  app.get("/health", (_req, res) => {
    return res.status(200).json({
      status: "ok",
      service: "booknest-api",
    });
  });

  app.get("/health/db", async (_req, res) => {
    try {
      await db.execute(sql`select 1`);
      return res.status(200).json({
        status: "ok",
        database: "reachable",
      });
    } catch {
      return res.status(503).json({
        status: "error",
        database: "unreachable",
      });
    }
  });

  app.get("/health/env", (_req, res) => {
    return res.status(200).json({
      status: "ok",
      jwt_access_secret: Boolean(process.env.JWT_ACCESS_SECRET),
      jwt_refresh_secret: Boolean(process.env.JWT_REFRESH_SECRET),
      database_url: Boolean(
        process.env.DATABASE_URL || process.env.POSTGRES_URL,
      ),
    });
  });

  // routers
  app.get("/", (_req, res) => {
    return res.redirect("/ui/signup.html");
  });

  app.use("/auth", authRouter);
  app.use("/bookings", bookingRouter);
  app.use("/", legacySeatRouter);

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error("Unhandled app error:", err);
    if (res.headersSent) return;
    res.status(500).json({
      message: "Internal server error",
    });
  };

  app.use(errorHandler);

  return app;
}

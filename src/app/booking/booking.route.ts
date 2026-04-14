import express from "express";
import type { Router } from "express";
import { authMiddleware } from "../auth/middlewares/middleware";
import { BookingController } from "./booking.controller";

const bookingRouter = express.Router() as Router;

const bookingController = new BookingController();

//Routes

bookingRouter.post(
  "/",
  authMiddleware,
  bookingController.handleBooking.bind(bookingController),
);

bookingRouter.get(
  "/my",
  authMiddleware,
  bookingController.getMyBookings.bind(bookingController),
);

bookingRouter.delete(
  "/:id",
  authMiddleware,
  bookingController.cancelBooking.bind(bookingController),
);

export { bookingRouter };

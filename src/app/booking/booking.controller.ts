import { Request, Response } from "express";
import { createBookingSchema, cancelBookingSchema } from "./booking.model";
import { db } from "../../db";
import { eq, and } from "drizzle-orm";
import { bookingTable, showTable } from "../../db/schema";

class BookingController {
  public async handleBooking(req: Request, res: Response) {
    const validationResult = await createBookingSchema.safeParseAsync(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid booking data",
        error: validationResult.error.issues,
      });
    }

    const { showId, seats } = validationResult.data;

    const [showResult] = await db
      .select()
      .from(showTable)
      .where(eq(showTable.uuid, showId));

    if (!showResult) {
      return res.status(404).json({
        message: "Show not found",
        error: `No show found with id ${showId}`,
      });
    }

    if (showResult.availableSeats < seats) {
      return res.status(400).json({
        message: "Not enough seats available",
        error: `Only ${showResult.availableSeats} seats are available for this show`,
      });
    }

    const totalPrice = showResult.price * seats;

    const bookingResult = await db
      .insert(bookingTable)
      .values({
        userId: res.locals.id,
        showId: showId,
        seats: seats,
        total_price: totalPrice,
      })
      .returning({ id: bookingTable.uuid });

    const createdBooking = bookingResult[0];

    if (!createdBooking) {
      return res.status(500).json({
        message: "Failed to create booking",
        error: "Booking creation failed",
      });
    }

    await db
      .update(showTable)
      .set({
        availableSeats: showResult.availableSeats - seats,
      })
      .where(eq(showTable.uuid, showId));

    return res.status(201).json({
      message: "Booking created successfully",
      bookingId: createdBooking.id,
    });
  }

  public async getMyBookings(req: Request, res: Response) {
    const booking = await db
      .select()
      .from(bookingTable)
      .where(eq(bookingTable.userId, res.locals.id));

    return res.status(200).json({
      message: "Bookings retrieved successfully",
      bookings: booking,
    });
  }

  public async cancelBooking(req: Request, res: Response) {
    const parsedResult = await cancelBookingSchema.safeParseAsync({
      bookingId: req.params.id,
    });

    if (!parsedResult.success) {
      return res.status(400).json({
        message: "Invalid booking id",
      });
    }

    const { bookingId } = parsedResult.data;

    const deleted = await db
      .delete(bookingTable)
      .where(
        and(
          eq(bookingTable.userId, res.locals.id),
          eq(bookingTable.uuid, bookingId),
        ),
      )
      .returning({
        id: bookingTable.uuid,
        showId: bookingTable.showId,
        seats: bookingTable.seats,
      });
    const deletedBooking = deleted[0];

    if (!deletedBooking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const [show] = await db
      .select({ availableSeats: showTable.availableSeats })
      .from(showTable)
      .where(eq(showTable.uuid, deletedBooking.showId));

    if (!show) {
      return res.status(404).json({
        message: "Show not found",
      });
    }

    await db
      .update(showTable)
      .set({
        availableSeats: show.availableSeats + deletedBooking.seats,
      })
      .where(eq(showTable.uuid, deletedBooking.showId));

    return res.status(200).json({
      message: "Booking cancelled successfully",
    });
  }
}

export { BookingController };

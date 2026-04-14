import { z } from "zod";

export const createBookingSchema = z.object({
  showId: z.string().uuid(),
  seats: z.number().int().positive(),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
});

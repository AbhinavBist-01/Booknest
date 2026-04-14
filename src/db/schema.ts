// Tables define
import {
  integer,
  uuid,
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  time,
} from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),

  firstName: varchar("first_name", { length: 45 }).notNull(),
  lastName: varchar("last_name", { length: 45 }),

  email: varchar("email", { length: 322 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),

  password: varchar("password", { length: 66 }),
  salt: text("salt"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const movieTable = pgTable("movies", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  genre: varchar("genre", { length: 50 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  releaseDate: timestamp("release_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const showTable = pgTable("shows", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  movieId: uuid("movie_id")
    .references(() => movieTable.uuid)
    .notNull(),
  theatreName: varchar("theatre_name", { length: 100 }).notNull(),
  showTime: timestamp("show_time").notNull(),
  price: integer("price").notNull(),
  availableSeats: integer("available_seats").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const bookingTable = pgTable("bookings", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => userTable.uuid)
    .notNull(),
  showId: uuid("show_id")
    .references(() => showTable.uuid)
    .notNull(),
  seats: integer("seats").notNull(),
  total_price: integer("total_price").notNull(),
  bookingStatus: varchar("booking_status", { length: 20 })
    .notNull()
    .default("CONFIRMED"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

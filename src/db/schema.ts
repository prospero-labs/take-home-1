import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const bookingStatusEnum = pgEnum("booking_status", [
  "PENDING",
  "APPROVED",
  "DENIED",
  "CANCELLED",
]);

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`NOW()`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`NOW()`)
    .notNull(),
  orgId: uuid("org_id").notNull(),
  status: bookingStatusEnum("status").default("PENDING").notNull(),
  contactName: varchar("contact_name").notNull(),
  contactEmail: varchar("contact_email").notNull(),
  eventTitle: varchar("event_title").notNull(),
  event_location_id: uuid("event_location_id").notNull(),
  eventStart: timestamp("event_start", { withTimezone: true }).notNull(),
  eventEnd: timestamp("event_end", { withTimezone: true }).notNull(),
  eventDetails: text("event_details").notNull(),
  requestNote: text("request_note"),
});

export type Booking = typeof bookings.$inferSelect;

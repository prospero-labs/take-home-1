import { z } from "zod";

export const BookingSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  orgId: z.string().uuid(),
  status: z.enum(["PENDING", "APPROVED", "DENIED", "CANCELLED"]),
  contact: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  event: z.object({
    title: z.string(),
    locationId: z.string().uuid(),
    start: z.string().datetime(),
    end: z.string().datetime(),
    details: z.string(),
  }),
  requestNote: z.string().optional(),
});

export type Booking = z.infer<typeof BookingSchema>;

// /** A UUID */
export type Id = string;

// /** A UTC datetime string, formatted as YYYY-MM-DDThh:mm:ssZ */
export type ISO8601DateTime = string;

export enum BookingStatus {
  PENDING = 0,
  APPROVED = 1,
  DENIED = 2,
  CANCELLED = 3,
}

export const CreateBookingDTO = BookingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const stringToBookingStatus = {
  PENDING: BookingStatus.PENDING,
  APPROVED: BookingStatus.APPROVED,
  DENIED: BookingStatus.DENIED,
  CANCELLED: BookingStatus.CANCELLED,
};

export type InsertBooking = z.infer<typeof CreateBookingDTO>;

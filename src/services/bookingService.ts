import db from "../db";
import { bookings } from "../db/schema";
import {
  Booking,
  BookingStatus,
  InsertBooking,
  CreateBookingDTO,
} from "../types/index";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import emailService from "../services/emailService";
class BookingService {
  // Map database row to Booking object
  private mapRowToBooking(row: any): Booking {
    return {
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      orgId: row.orgId,
      status: row.status,
      contact: {
        name: row.contactName,
        email: row.contactEmail,
      },
      event: {
        title: row.eventTitle,
        locationId: row.locationId,
        start: row.eventStart.toISOString(),
        end: row.eventEnd.toISOString(),
        details: row.eventDetails,
      },
      requestNote: row.requestNote,
    };
  }

  async getAllBookings(): Promise<Booking[]> {
    const result = await db.select().from(bookings).orderBy(bookings.createdAt);

    return result.map((row) => this.mapRowToBooking(row));
  }

  async getBookingById(id: string): Promise<Booking | null> {
    const result = await db.select().from(bookings).where(eq(bookings.id, id));

    if (result.length === 0) {
      return null;
    }
    return this.mapRowToBooking(result[0]);
  }

  async deleteBookingById(id: string): Promise<{ deletedId: string }[]> {
    const result = await db
      .delete(bookings)
      .where(eq(bookings.id, id))
      .returning({ deletedId: bookings.id });

    return result;
  }

  async approveBooking(id: string): Promise<Booking | null> {
    const booking = await this.getBookingById(id);

    if (!booking) {
      return null;
    }

    const values = Object.values(BookingStatus);
    //get PENDING status from ENUM as string
    if (booking.status !== values[BookingStatus["PENDING"]]) {
      throw new Error("Cannot approve it is not in pending status");
    }

    const approved = await db
      .update(bookings)
      .set({ status: "APPROVED", updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();

    if (approved.length === 0) {
      return null;
    }

    const approvedBooking = this.mapRowToBooking(approved[0]);
    await emailService.sendApprovalEmail(approvedBooking);

    return approvedBooking;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    try {
      const id = uuidv4();
      const createdAt = new Date().toISOString();
      const updatedAt = new Date().toISOString();

      const validatedData = CreateBookingDTO.parse(booking);

      const dbBooking = {
        orgId: validatedData.orgId,
        status: validatedData.status,
        contactName: validatedData.contact.name,
        contactEmail: validatedData.contact.email,
        eventTitle: validatedData.event.title,
        eventLocationId: validatedData.event.locationId,
        eventStart: new Date(validatedData.event.start),
        eventEnd: new Date(validatedData.event.end),
        eventDetails: validatedData.event.details,
        requestNote: validatedData.requestNote,
      };

      const [insertedRecord] = await db
        .insert(bookings)
        .values(dbBooking)
        .returning();

      return {
        id: insertedRecord.id,
        createdAt: insertedRecord.createdAt.toISOString(),
        updatedAt: insertedRecord.updatedAt.toISOString(),
        orgId: insertedRecord.orgId,
        status: "PENDING",
        contact: {
          name: insertedRecord.contactName,
          email: insertedRecord.contactEmail,
        },
        event: {
          title: insertedRecord.eventTitle,
          locationId: insertedRecord.eventLocationId,
          start: insertedRecord.eventStart.toISOString(),
          end: insertedRecord.eventEnd.toISOString(),
          details: insertedRecord.eventDetails,
        },
        requestNote: insertedRecord.requestNote || undefined,
      };
    } catch (error: any) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }
}

export default new BookingService();

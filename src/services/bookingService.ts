import db from "../db";
import { bookings } from "../db/schema";
import { Booking } from "../types/index";
import { eq } from "drizzle-orm";

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
        locationId: row.event_location_id,
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
}

export default new BookingService();

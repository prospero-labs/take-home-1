import { Request, Response } from "express";
import bookingService from "../services/bookingService";

class BookingController {
  async getAllBookings(req: Request, res: Response): Promise<void> {
    try {
      const bookings = await bookingService.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error getting all bookings:", error);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving bookings" });
    }
  }
}

export default new BookingController();

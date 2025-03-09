import express from "express";
import bookingController from "../controllers/bookingController";

const router = express.Router();

router.get("/bookings", bookingController.getAllBookings);
router.get("/bookings/:id", bookingController.getBookingById);
router.delete("/bookings/:id", bookingController.deleteBookingById);
router.post("/bookings/:id/approve", bookingController.approveBookingById);
router.post("/bookings", bookingController.createBooking);

export default router;

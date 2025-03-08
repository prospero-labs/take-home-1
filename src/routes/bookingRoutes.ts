import express from "express";
import bookingController from "../controllers/bookingController";

const router = express.Router();

router.get("/bookings", bookingController.getAllBookings);
router.get("/bookings/:id", bookingController.getBookingById);
router.delete("/bookings/:id", bookingController.deleteBookingById);

export default router;

import express from "express";
import bookingController from "../controllers/bookingController";

const router = express.Router();

router.get("/bookings", bookingController.getAllBookings);
router.get("/bookings/:id", bookingController.getBookingById);

export default router;

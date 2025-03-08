import express from "express";
import bookingController from "../controllers/bookingController";

const router = express.Router();

router.get("/bookings", bookingController.getAllBookings);

export default router;

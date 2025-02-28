import express from 'express';
import { getAllBookings, createBooking } from '../controllers/bookings';

const router = express.Router();

router.get('/', getAllBookings);
router.post('/', createBooking);

export default router;

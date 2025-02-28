import express from 'express';
import {
  getAllBookings,
  getBooking,
  createBooking,
} from '../controllers/bookings';

const router = express.Router();

router.get('/', getAllBookings);
router.get('/:id', getBooking);
router.post('/', createBooking);

export default router;

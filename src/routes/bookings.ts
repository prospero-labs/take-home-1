import express from 'express';
import {
  getAllBookings,
  getBooking,
  createBooking,
  deleteBooking,
} from '../controllers/bookings';

const router = express.Router();

router.get('/', getAllBookings);
router.get('/:id', getBooking);
router.post('/', createBooking);
router.delete('/:id', deleteBooking);

export default router;

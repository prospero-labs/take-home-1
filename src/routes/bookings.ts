import express from 'express';
import {
  getAllBookings,
  getBooking,
  createBooking,
  deleteBooking,
  approveBooking,
  editBooking,
} from '../controllers/bookings';

const router = express.Router();

router.get('/', getAllBookings);
router.get('/:id', getBooking);
router.post('/', createBooking);
router.post('/:id/approve', approveBooking);
router.delete('/:id', deleteBooking);
router.patch('/:id', editBooking);

export default router;

import express from 'express';
import { getAllBookings } from '../controllers/bookings';

const router = express.Router();

router.all('/', getAllBookings);

export default router;

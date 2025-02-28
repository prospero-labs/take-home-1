import { Request, Response } from 'express';
import db from '../db';
import { Booking, BookingRow } from '../types';

// GET ALL query
const getAllBookings = (req: Request, res: Response) => {
  const sql = `SELECT * FROM bookings`;

  db.all(sql, [], (err, rows: BookingRow[]) => {
    if (err) {
      console.log(
        `[error] Error while getting all the bookings, error message: \n ${err.message}`
      );
      return res.status(500).json({
        status: 500,
        message: 'Error while getting all the bookings',
        data: [],
      });
    }

    // No data in the table
    if (!rows || rows.length === 0) {
      console.log(`[info] No data found for bookings table`);
      return res.status(404).json({
        status: 404,
        message: 'No data for the bookings table',
        data: [],
      });
    }

    const data: Booking[] = rows.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      orgId: row.org_id,
      status: row.status_id,
      contact: {
        name: row.contact_name,
        email: row.contact_email,
      },
      event: {
        title: row.event_title,
        locationId: row.event_location_id,
        start: row.event_start,
        end: row.event_end,
        details: row.event_details,
      },
      requestNote: row.request_note || undefined,
    }));

    res.status(200).json({
      status: 200,
      message: `Retrieved all data from bookings table`,
      data,
    });
  });
};

export { getAllBookings };

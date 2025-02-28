import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { Booking, BookingRow, BookingStatus } from '../types';

// GET ALL bookings
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

// GET booking
const getBooking = (req: Request, res: Response) => {
  const sql = `SELECT * FROM bookings WHERE id=?`;

  //The booking id from the params
  const { id } = req.params;

  db.get(sql, [id], (err, row: BookingRow) => {
    if (err) {
      console.log(
        `[error] Error while getting booking ${id}, error message: \n ${err.message}`
      );
      return res.status(500).json({
        status: 500,
        message: `Error while getting the booking id: ${id}`,
        data: [],
      });
    }

    // No data in the table
    if (!row) {
      console.log(`[info] No booking with id: ${id} found`);
      return res.status(404).json({
        status: 404,
        message: `No booking with id: ${id} found`,
        data: [],
      });
    }

    const data: Booking = {
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
    };

    res.status(200).json({
      status: 200,
      message: `Retrieved booking id: ${id} data`,
      data,
    });
  });
};

//POST new booking
const createBooking = (req: Request, res: Response) => {
  const sql = `INSERT INTO bookings (
    org_id,
    status_id,
    contact_name,
    contact_email,
    event_title,
    event_location_id,
    event_start,
    event_end,
    event_details,
    request_note
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const {
    contact_name,
    contact_email,
    event_title,
    event_start,
    event_end,
    event_details,
    request_note,
  } = req.body;

  // Formatting the event_start and event_end to reflect the ISO8601DateTime type requirement
  const eventStartDateFormatted = new Date(event_start).toISOString();
  const eventEndDateFormatted = new Date(event_end).toISOString();

  // Created random id for org_id and event_location_id
  const orgId = uuidv4();
  const eventLocationId = uuidv4();

  // By default the status_id is 0 => PENDING
  // Use of the function because of this.lastID
  db.run(
    sql,
    [
      orgId,
      BookingStatus.PENDING,
      contact_name,
      contact_email,
      event_title,
      eventLocationId,
      eventStartDateFormatted,
      eventEndDateFormatted,
      event_details,
      request_note,
    ],
    function (err) {
      if (err) {
        console.log(`[error] Error while creating a new booking`);
        return res.status(500).json({
          status: 500,
          message: 'Error while creating a new booking',
        });
      }

      const lastId = this.lastID;

      res.status(200).json({
        status: 200,
        message: `New booking with booking id: ${lastId} created`,
      });
    }
  );
};

//DELETE booking
const deleteBooking = (req: Request, res: Response) => {
  const sql = `DELETE FROM bookings WHERE id=?`;

  //The booking id from the params
  const { id } = req.params;

  db.run(sql, [id], function (err) {
    if (err) {
      console.log(
        `[error] Error while deleting booking ${id}, error message: \n ${err.message}`
      );
      return res.status(500).json({
        status: 500,
        message: `Error while deleting booking id: ${id}`,
        data: [],
      });
    }

    // changes === 0 it means that nothing happened in the table
    if (this.changes === 0) {
      console.log(
        `[info] The booking id:${id} does not exist or has already been deleted`
      );
      return res.status(404).json({
        status: 404,
        message: `The booking id:${id} does not exist or has already been deleted`,
      });
    }

    res.status(200).json({
      status: 200,
      message: `Deleted booking id:${id}`,
    });
  });
};

export { getAllBookings, getBooking, createBooking, deleteBooking };

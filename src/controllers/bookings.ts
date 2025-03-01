import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { Booking, BookingRow, BookingStatus } from '../types';
import {
  getPrivateId,
  handleDbError,
  mapRowToBooking,
  sendConfirmationEmail,
} from '../utils';

// GET ALL bookings
const getAllBookings = (req: Request, res: Response) => {
  const sql = `SELECT * FROM bookings`;

  db.all(sql, [], (err, rows: BookingRow[]) => {
    if (err) {
      handleDbError(res, 'getting all the bookings')(err);
      return;
    }

    // No data in the table
    if (!rows || rows.length === 0) {
      console.log(`[info] No data found for bookings table`);
      res.status(404).json({
        status: 404,
        message: 'No data for the bookings table',
        data: [],
      });
      return;
    }

    const data: Booking[] = rows.map(mapRowToBooking);

    res.status(200).json({
      status: 200,
      message: `Retrieved all data from bookings table`,
      data,
    });
  });
};

// GET booking
const getBooking = async (req: Request, res: Response) => {
  const sql = `SELECT * FROM bookings WHERE private_id=?`;
  const { id } = req.params;

  try {
    const private_id = await getPrivateId(id);

    db.get(sql, [private_id], (err, row: BookingRow) => {
      if (err) {
        handleDbError(res, 'getting the booking id:', id)(err);
        return;
      }

      // No data in the table
      if (!row) {
        console.log(`[info] No booking with id: ${id} found`);
        res.status(404).json({
          status: 404,
          message: `No booking with id: ${id} found`,
          data: [],
        });
        return;
      }

      const data = mapRowToBooking(row);

      res.status(200).json({
        status: 200,
        message: `Retrieved booking id:${id} data`,
        data,
      });
    });
  } catch (err) {
    // Make sure it's Error before accessing the message property
    if (err instanceof Error) {
      if (err.message.includes('No booking')) {
        res.status(404).json({
          status: 404,
          message: err.message,
          data: [],
        });
      } else {
        res.status(500).json({
          status: 500,
          message: err.message,
          data: [],
        });
      }
    }
  }
};

// POST new booking
const createBooking = (req: Request, res: Response) => {
  const sql = `INSERT INTO bookings (
    id,
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
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const {
    contact_name,
    contact_email,
    event_title,
    event_start,
    event_end,
    event_details,
    request_note,
  } = req.body;

  // Validate required fields
  if (
    !contact_name ||
    !contact_email ||
    !event_title ||
    !event_start ||
    !event_end
  ) {
    res.status(400).json({
      status: 400,
      message: 'Missing required fields for booking',
    });
    return;
  }

  try {
    // Formatting the event_start and event_end to reflect the ISO8601DateTime type requirement
    const eventStartDateFormatted = new Date(event_start).toISOString();
    const eventEndDateFormatted = new Date(event_end).toISOString();

    // Created random id for org_id and event_location_id
    const id = uuidv4();
    const orgId = uuidv4();
    const eventLocationId = uuidv4();

    // By default the status_id is 0 => PENDING
    db.run(
      sql,
      [
        id,
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
          handleDbError(res, 'creating a new booking')(err);
          return;
        }

        res.status(201).json({
          status: 201,
          message: `New booking with booking id: ${id} created`,
          data: { id },
        });
      }
    );
  } catch (error) {
    console.log(`[error] Invalid date format: ${error}`);
    res.status(400).json({
      status: 400,
      message: 'Invalid date format provided',
    });
  }
};

// DELETE booking
const deleteBooking = async (req: Request, res: Response) => {
  const sql = `DELETE FROM bookings WHERE private_id=?`;
  const { id } = req.params;

  try {
    const private_id = await getPrivateId(id);

    db.run(sql, [private_id], function (err) {
      if (err) {
        handleDbError(res, 'deleting booking id:', id)(err);
        return;
      }

      // changes === 0 it means that nothing happened in the table
      if (this.changes === 0) {
        console.log(
          `[info] The booking id:${id} does not exist or has already been deleted`
        );
        res.status(404).json({
          status: 404,
          message: `The booking id:${id} does not exist or has already been deleted`,
        });
        return;
      }

      res.status(200).json({
        status: 200,
        message: `Deleted booking id:${id}`,
      });
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('No booking')) {
        res.status(404).json({
          status: 404,
          message: err.message,
          data: [],
        });
      } else {
        res.status(500).json({
          status: 500,
          message: err.message,
          data: [],
        });
      }
    }
  }
};

// PATCH booking
const editBooking = async (req: Request, res: Response) => {
  const getPreviousBookingSql = `SELECT * FROM bookings WHERE private_id=?`;
  const updateBookingSql = `UPDATE bookings SET
    updated_at = ?,
    status_id = ?,
    contact_name = ?,
    contact_email = ?,
    event_title = ?,
    event_start = ?,
    event_end = ?,
    event_details = ?,
    request_note = ?
    WHERE private_id=?`;

  const { id } = req.params;

  try {
    const private_id = await getPrivateId(id);

    db.get(getPreviousBookingSql, [private_id], (err, row: BookingRow) => {
      if (err) {
        handleDbError(res, 'getting booking id:', id)(err);
        return;
      }

      // No data in the table
      if (!row) {
        console.log(`[info] No booking with id: ${id} found`);
        res.status(404).json({
          status: 404,
          message: `No booking with id: ${id} found`,
          data: [],
        });
        return;
      }

      // Handle date conversions for event_start and event_end if they are provided
      let eventStart = row.event_start;
      let eventEnd = row.event_end;

      try {
        if (req.body.event_start) {
          eventStart = new Date(req.body.event_start).toISOString();
        }
        if (req.body.event_end) {
          eventEnd = new Date(req.body.event_end).toISOString();
        }
      } catch (error) {
        console.log(`[error] Invalid date format: ${error}`);
        res.status(400).json({
          status: 400,
          message: 'Invalid date format provided',
        });
        return;
      }

      // Merge existing data with updates
      const updates = {
        updated_at: new Date().toISOString(),
        status_id: req.body.status_id ?? row.status_id,
        contact_name: req.body.contact_name ?? row.contact_name,
        contact_email: req.body.contact_email ?? row.contact_email,
        event_title: req.body.event_title ?? row.event_title,
        event_start: eventStart,
        event_end: eventEnd,
        event_details: req.body.event_details ?? row.event_details,
        request_note: req.body.hasOwnProperty('request_note')
          ? req.body.request_note === null
            ? undefined
            : req.body.request_note
          : row.request_note,
      };

      db.run(
        updateBookingSql,
        [
          updates.updated_at,
          updates.status_id,
          updates.contact_name,
          updates.contact_email,
          updates.event_title,
          updates.event_start,
          updates.event_end,
          updates.event_details,
          updates.request_note,
          private_id,
        ],
        (err) => {
          if (err) {
            handleDbError(res, 'editing booking id:', id)(err);
            return;
          }

          res.status(200).json({
            status: 200,
            message: `Updated booking id:${id} with new data`,
            data: {
              id: row.id,
              ...updates,
              contact: {
                name: updates.contact_name,
                email: updates.contact_email,
              },
              event: {
                title: updates.event_title,
                locationId: row.event_location_id,
                start: updates.event_start,
                end: updates.event_end,
                details: updates.event_details,
              },
            },
          });
        }
      );
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('No booking')) {
        res.status(404).json({
          status: 404,
          message: err.message,
          data: [],
        });
      } else {
        res.status(500).json({
          status: 500,
          message: err.message,
          data: [],
        });
      }
    }
  }
};

// APPROVE booking and send email to booking contact
const approveBooking = async (req: Request, res: Response) => {
  const getBookingSql = `SELECT * FROM bookings WHERE private_id=?`;
  const updateStatusSql = `UPDATE bookings SET
    status_id = ?,
    updated_at = ?
    WHERE private_id=?`;

  const { id } = req.params;

  try {
    const private_id = await getPrivateId(id);

    db.get(getBookingSql, [private_id], async (err, row: BookingRow) => {
      if (err) {
        handleDbError(res, 'getting booking id:', id)(err);
        return;
      }

      // No data in the table
      if (!row) {
        console.log(`[info] No booking with id:${id} found`);
        res.status(404).json({
          status: 404,
          message: `No booking with id:${id} found`,
          data: [],
        });
        return;
      }

      // Don't approve again if already approved
      if (row.status_id === BookingStatus.APPROVED) {
        res.status(400).json({
          status: 400,
          message: `Booking id:${id} is already approved`,
        });
        return;
      }

      // Update booking status to APPROVED
      const updatedAt = new Date().toISOString();

      db.run(
        updateStatusSql,
        [BookingStatus.APPROVED, updatedAt, private_id],
        async (updateErr) => {
          if (updateErr) {
            handleDbError(
              res,
              'updating booking status for id:',
              id
            )(updateErr);
            return;
          }

          // Send confirmation email
          const emailSent = await sendConfirmationEmail(row);
          if (!emailSent) {
            res.status(500).json({
              status: 500,
              message: `Failed to send confirmation email for booking id:${id}`,
            });
            return;
          }

          res.status(200).json({
            status: 200,
            message: `Booking id:${id} has been approved and confirmation email sent to ${row.contact_email}`,
          });
        }
      );
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('No booking')) {
        res.status(404).json({
          status: 404,
          message: err.message,
          data: [],
        });
      } else {
        res.status(500).json({
          status: 500,
          message: err.message,
          data: [],
        });
      }
    }
  }
};

export {
  getAllBookings,
  getBooking,
  createBooking,
  deleteBooking,
  editBooking,
  approveBooking,
};

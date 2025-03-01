import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { Booking, BookingRow, BookingStatus } from '../types';
import { getPrivateId, sendConfirmationEmail } from '../utils';

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
const getBooking = async (req: Request, res: Response) => {
  const sql = `SELECT * FROM bookings WHERE private_id=?`;
  //The booking id from the params
  const { id } = req.params;

  try {
    const private_id = await getPrivateId(id);

    db.get(sql, [private_id], (err, row: BookingRow) => {
      if (err) {
        console.log(
          `[error] Error while getting data for booking ${id}, error message: \n ${err.message}`
        );
        res.status(500).json({
          status: 500,
          message: `Error while getting the booking id: ${id}`,
          data: [],
        });
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
        return;
      } else {
        res.status(500).json({
          status: 500,
          message: err.message,
          data: [],
        });
        return;
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
        console.log(`[error] Error while creating a new booking`);
        return res.status(500).json({
          status: 500,
          message: 'Error while creating a new booking',
        });
      }

      res.status(200).json({
        status: 200,
        message: `New booking with booking id: ${id} created`,
      });
    }
  );
};

// DELETE booking
const deleteBooking = async (req: Request, res: Response) => {
  const sql = `DELETE FROM bookings WHERE private_id=?`;

  //The booking id from the params
  const { id } = req.params;
  try {
    const private_id = await getPrivateId(id);

    db.run(sql, [private_id], function (err) {
      if (err) {
        console.log(
          `[error] Error while deleting booking ${id}, error message: \n ${err.message}`
        );
        res.status(500).json({
          status: 500,
          message: `Error while deleting booking id: ${id}`,
        });
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
    // Make sure it's Error before accessing the message property
    if (err instanceof Error) {
      if (err.message.includes('No booking')) {
        res.status(404).json({
          status: 404,
          message: err.message,
          data: [],
        });
        return;
      } else {
        res.status(500).json({
          status: 500,
          message: err.message,
          data: [],
        });
        return;
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

  //The booking id from the params
  const { id } = req.params;

  try {
    const private_id = await getPrivateId(id);

    db.get(getPreviousBookingSql, [private_id], (err, row: BookingRow) => {
      if (err) {
        console.log(
          `[error] Error while getting booking ${id}, error message: \n ${err.message}`
        );
        res.status(500).json({
          status: 500,
          message: `Error while getting the booking id: ${id}`,
          data: [],
        });
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

      // Merge existing data with updates
      const updates = {
        updated_at: new Date().toISOString(),
        status_id: req.body.status_id ?? row.status_id,
        contact_name: req.body.contact_name ?? row.contact_name,
        contact_email: req.body.contact_email ?? row.contact_email,
        event_title: req.body.event_title ?? row.event_title,
        event_start: req.body.event_start ?? row.event_start,
        event_end: req.body.event_end ?? row.event_end,
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
            console.log(
              `[error] Error while editing booking ${id}, error message: \n ${err.message}`
            );
            res.status(500).json({
              status: 500,
              message: `Error while editing the booking id:${id}`,
              data: [],
            });
            return;
          }

          res.status(200).json({
            status: 200,
            message: `Updated booking id:${id} with new data`,
            data: updates,
          });
        }
      );
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
        return;
      } else {
        res.status(500).json({
          status: 500,
          message: err.message,
          data: [],
        });
        return;
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

  // The booking id from the params
  const { id } = req.params;

  try {
    const private_id = await getPrivateId(id);

    db.get(getBookingSql, [private_id], async (err, row: BookingRow) => {
      if (err) {
        console.log(
          `[error] Error while getting booking ${id}, error message: \n ${err.message}`
        );
        res.status(500).json({
          status: 500,
          message: `Error while getting the booking id: ${id}`,
          data: [],
        });
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

      // Update booking status to APPROVED
      const updatedAt = new Date().toISOString();

      db.run(
        updateStatusSql,
        [BookingStatus.APPROVED, updatedAt, private_id],
        async (updateErr) => {
          if (updateErr) {
            console.log(
              `[error] Error while updating booking status ${id}, error message: \n ${updateErr.message}`
            );
            res.status(500).json({
              status: 500,
              message: `Error while updating booking status for id: ${id}`,
            });
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
    // Make sure it's Error before accessing the message property
    if (err instanceof Error) {
      if (err.message.includes('No booking')) {
        res.status(404).json({
          status: 404,
          message: err.message,
          data: [],
        });
        return;
      } else {
        res.status(500).json({
          status: 500,
          message: err.message,
          data: [],
        });
        return;
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

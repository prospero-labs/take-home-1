import path from 'path';
import sqlite3 from 'sqlite3';
// For debugging -> verbose
const sql3 = sqlite3.verbose();

const db = new sql3.Database(
  path.resolve(__dirname, './database.db'),
  (err: Error | null) => {
    if (err) {
      console.log(
        `[error] Error while creating the SQLite DB, error message: \n ${err.message}`
      );
      return;
    }

    console.log(`[info] Created SQLite DB or already exists`);
  }
);

const createBookingsTableQuery = `
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (Datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (Datetime('now')),
    org_id TEXT NOT NULL,
    status_id INTEGER NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    event_title TEXT NOT NULL,
    event_location_id TEXT NOT NULL,
    event_start TEXT NOT NULL,
    event_end TEXT NOT NULL,
    event_details TEXT NOT NULL,
    request_note TEXT,
    FOREIGN KEY (status_id) REFERENCES booking_status(id)
  )
`;

const createBookingStatusTable = `
  CREATE TABLE IF NOT EXISTS booking_status (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  )
`;

const populateBookingStatusTable = `
  INSERT OR IGNORE INTO booking_status (id, name) VALUES
    ('0', 'PENDING'),
    ('1', 'APPROVED'),
    ('2', 'DENIED'),
    ('3', 'CANCELLED')
`;

db.serialize(() => {
  // Create the bookings table
  db.run(createBookingsTableQuery, [], (err) => {
    if (err) {
      console.log(
        `[error] Error while creating the bookings table, error message: \n ${err.message}`
      );
      return;
    }

    console.log(`[info] bookings table correctly created`);
  });

  // Create the booking_status table
  db.run(createBookingStatusTable, [], (err) => {
    if (err) {
      console.log(
        `[error] Error while creating the booking_status table, error message: \n ${err.message}`
      );
      return;
    }

    console.log(`[info] booking_status table correctly created`);
  });

  // Populate the booking_status table
  db.run(populateBookingStatusTable, [], (err) => {
    if (err) {
      console.log(
        `[error] Error while populating the booking_status table, error message: \n ${err.message}`
      );
      return;
    }

    console.log(`[info] booking_status table correctly populated`);
  });
});

export default db;

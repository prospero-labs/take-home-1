# Take-Home Assignment

This assignment should take approximately 2-3 hours to complete. If it's taking significantly longer, please let us know.

## Scenario

You are building the backend of a room booking system for a theater. This is the `Booking` interface the team has agreed upon:

```typescript
interface Booking {
  id: Id;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
  orgId: Id;
  status: BookingStatus;
  contact: {
    name: string;
    email: string;
  };
  event: {
    title: string;
    locationId: Id;
    start: ISO8601DateTime;
    end: ISO8601DateTime;
    details: string;
  }
  requestNote?: string;
}

/** A UUID */
type Id = string;

/** A UTC datetime string, formatted as YYYY-MM-DDThh:mm:ssZ */
type ISO8601DateTime = string;

enum BookingStatus {
  PENDING = 0,
  APPROVED = 1,
  DENIED = 2,
  CANCELLED = 3,
}
```

Your task is to create HTTP API endpoints for managing bookings. Create the following endpoints:

- `POST /bookings`: Submit a new booking
- `GET /bookings`: Retrieve a list of all bookings
- `GET /bookings/:id`: Retrieve a specific booking
- `DELETE /bookings/:id`: Delete a booking
- `POST /bookings/:id/approve`: Approve a booking
  - _**Optional:** send an email to the booking contact notifying them of the approval_

Requirements:

- Use TypeScript
- Use JSON for I/O
- Use a SQL database (MySQL, PostgreSQL, SQLite, etc.)

## Developing

Fork this repository and make changes on your fork.

This repository has been initialized with a basic hot-reloading node script. You can start by running the following commands:

```bash
npm install
npm start
```

The script will re-run whenever you save changes to the source files.

Use whatever server runtime environment you are most comfortable with. Install whatever dependencies you need.

Our work is highly collaborative and often ambiguous- we encourage you to ask clarifying questions via the Slack channel we opened!

When you are ready to submit your work, create a pull request against the `main` branch of this repository.

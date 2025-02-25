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
- `POST /bookings/:id/approve`: Approve a booking and send an email to the booking contact notifying them of the approval

Requirements:

- Use TypeScript
- Use JSON for I/O
- Use MySQL for the DB

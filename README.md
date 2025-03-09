# Prospero - Theater Room Booking System

Prospero is a backend API for managing stage room bookings. It provides a complete solution for creating, retrieving, approving, and deleting bookings for theater spaces.

## Features

- Create new booking requests
- Retrieve all bookings or a specific booking by ID
- Delete bookings
- Approve bookings with automatic email notifications
- Conflict detection to prevent double-booking of spaces
- TypeScript type safety with Zod validation
- PostgreSQL database integration via Drizzle ORM

## Tech Stack

- **TypeScript** - For type-safe code
- **Express.js** - Web server framework
- **PostgreSQL** - Database
- **Drizzle ORM** - Database ORM
- **Zod** - Schema validation
- **UUID** - For generating unique identifiers

## API Endpoints

| Method | Endpoint                | Description                                   |
| ------ | ----------------------- | --------------------------------------------- |
| GET    | `/bookings`             | Retrieve all bookings                         |
| GET    | `/bookings/:id`         | Retrieve a specific booking by ID             |
| POST   | `/bookings`             | Create a new booking                          |
| DELETE | `/bookings/:id`         | Delete a booking                              |
| POST   | `/bookings/:id/approve` | Approve a booking and send confirmation email |

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/FCimendere/take-home-1.git
   cd take-home-1
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with the following variables:

   ```
   PORT=3000
   PG_USER=postgres
   PG_HOST=localhost
   PG_DB_NAME=prospero
   PG_PASSWORD=your_password
   PG_PORT=5432
   ```

4. Set up the database:
5. Create the database in PostgreSQL

- Find the initial script for DB in **take-home-1/init_db/schema.sql** file.

6. Start the development server:
   ```bash
   npm start
   ```

The server will be available at `http://localhost:3000`.

## API Usage

- Find POSTMAN collection in **/take-home-1/Prospero.postman_collection.json** file.

## Data Models

### Booking

```typescript
interface Booking {
  id: Id; // UUID string
  createdAt: ISO8601DateTime; // Creation timestamp
  updatedAt: ISO8601DateTime; // Last update timestamp
  orgId: Id; // Organization ID
  status: BookingStatus; // PENDING, APPROVED, DENIED, or CANCELLED
  contact: {
    name: string; // Contact person name
    email: string; // Contact email address
  };
  event: {
    title: string; // Event title
    locationId: Id; // Location ID (theater room)
    start: ISO8601DateTime; // Start time
    end: ISO8601DateTime; // End time
    details: string; // Event details
  };
  requestNote?: string; // Optional note from requester
}
```

### Booking Status

```typescript
enum BookingStatus {
  PENDING = 0,
  APPROVED = 1,
  DENIED = 2,
  CANCELLED = 3,
}
```

## Features in Detail

### Conflict Detection

When a new booking is created, the system checks for any overlapping approved bookings for the same location. If a conflict is found, the booking is automatically marked as DENIED.

### Email Notifications

When a booking is approved, the system sends an email notification to the contact person. In the current implementation, this is mocked with console output, but can be integrated with a real email service.

## Improvement Points

- **Unit Tests** for service checks.
- **Docker** for DB and App.
- **PATCH** | `/bookings/:id` | Update current booking's event time, contact details.
- **Automatic DENIED mechanism** – When one of the **PENDING** bookings is **APPROVED**, others will be **DENIED**.
- **DB Migration** can be added.

## Author

Fulya Cimendere

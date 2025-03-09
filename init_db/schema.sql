-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create booking_status type
CREATE TYPE booking_status AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'CANCELLED');

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  org_id UUID NOT NULL,
  status booking_status NOT NULL DEFAULT 'PENDING',
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  event_title VARCHAR(255) NOT NULL,
  event_location_id UUID NOT NULL,
  event_start TIMESTAMP WITH TIME ZONE NOT NULL,
  event_end TIMESTAMP WITH TIME ZONE NOT NULL,
  event_details TEXT NOT NULL,
  request_note TEXT
);

export interface Booking {
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
  };
  requestNote?: string;
}

// Flatten the Booking interface
export interface BookingRow {
  id: string;
  created_at: string;
  updated_at: string;
  org_id: string;
  status_id: number;
  name: string;
  email: string;
  title: string;
  location_id: string;
  start: string;
  end: string;
  details: string;
  request_note?: string | null;
}

/** A UUID */
type Id = string;

/** A UTC datetime string, formatted as YYYY-MM-DDThh:mm:ssZ */
type ISO8601DateTime = string;

export enum BookingStatus {
  PENDING = 0,
  APPROVED = 1,
  DENIED = 2,
  CANCELLED = 3,
}

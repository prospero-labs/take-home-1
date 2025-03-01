export interface BookingDatabase {
  private_id: PrivateId;
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

export interface Booking extends Omit<BookingDatabase, 'private_id'> {}

// Flatten the Booking interface
export interface BookingRow {
  private_id: PrivateId;
  id: Id;
  created_at: ISO8601DateTime;
  updated_at: ISO8601DateTime;
  org_id: Id;
  status_id: BookingStatus;
  contact_name: string;
  contact_email: string;
  event_title: string;
  event_location_id: Id;
  event_start: ISO8601DateTime;
  event_end: ISO8601DateTime;
  event_details: string;
  request_note?: string | null;
}

/* INTEGER in DB to make internal operations faster */
export type PrivateId = number;

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

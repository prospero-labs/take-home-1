/** A UUID */
export type Id = string;

/** A UTC datetime string, formatted as YYYY-MM-DDThh:mm:ssZ */
export type ISO8601DateTime = string;

export enum BookingStatus {
  PENDING = 0,
  APPROVED = 1,
  DENIED = 2,
  CANCELLED = 3,
}

export interface Contact {
  name: string;
  email: string;
}

export interface Event {
  title: string;
  locationId: Id;
  start: ISO8601DateTime;
  end: ISO8601DateTime;
  details: string;
}

export interface Booking {
  id: Id;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
  orgId: Id;
  status: BookingStatus;
  contact: Contact;
  event: Event;
  requestNote?: string;
}

//Data Transfer Object
export interface CreateBookingDTO {
  orgId: Id;
  contact: Contact;
  event: Event;
  requestNote?: string;
}

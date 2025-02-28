import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { BookingRow } from '../types';

function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }

    return dateObj.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // 24-hour format
    });
  } catch (error) {
    console.error('[error] Error formatting date:', error);
    return 'Invalid date';
  }
}

async function sendConfirmationEmail(booking: BookingRow): Promise<boolean> {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: process.env.MAILGUN_USERNAME || 'api',
    key: process.env.MAILGUN_API_KEY || 'API_KEY',
  });

  // Validate required environment variables
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    console.error('[error] Missing required Mailgun configuration');
    return false;
  }

  try {
    const data = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Prospero Bookings <postmaster@${process.env.MAILGUN_DOMAIN}>`,
      to: [booking.contact_email],
      subject: `Booking Confirmation - ${booking.event_title}`,
      text: `
        Dear ${booking.contact_name},

        Your room booking has been confirmed. Here are the details of your reservation:

        Event: ${booking.event_title}
        Date: ${formatDate(booking.event_start)} to ${formatDate(
        booking.event_end
      )}
        Details: ${booking.event_details}
        ${
          booking.request_note
            ? `\nAdditional Notes: ${booking.request_note}`
            : ''
        }

        If you need to make any changes to your booking or have any questions, please don't hesitate to contact us.

        Thank you for your booking!

        Best regards,
        Prospero`,
    });

    console.log(`[info] mailgun info: ${JSON.stringify(data)}`);
    return true;
  } catch (err) {
    console.error(
      `[error] it was not possible to send the confirmation email, error message: \n ${err}`
    );
    return false;
  }
}

export { formatDate, sendConfirmationEmail };

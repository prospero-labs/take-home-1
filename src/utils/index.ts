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

async function sendConfirmationEmail(booking: BookingRow) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: 'prospero',
    key: process.env.MAILGUN_API_KEY || 'API_KEY',
  });

  try {
    const data = await mg.messages.create(
      'sandbox3e3b7c05691c447685c33a057e28fff0.mailgun.org',
      {
        from: 'Mailgun Sandbox <postmaster@sandbox3e3b7c05691c447685c33a057e28fff0.mailgun.org>',
        // I will keep it hardcoded because I only approved my email address to receive emails from mailgun
        // so I guess you have to call me to the office to check if it works ;)
        to: ['Alessio Mazzella <alessiomazzella00@icloud.com>'],
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
      }
    );

    console.log(`[info] mailgun info: ${JSON.stringify(data)}`);
  } catch (err) {
    console.log(
      `[error] it was not possible to send the confirmation email, error message: \n ${err}`
    );
    return;
  }
}

export { formatDate, sendConfirmationEmail };

import { Booking } from "../types/index";

class EmailService {
  async sendApprovalEmail(booking: Booking): Promise<void> {
    console.log(`
      ===== MOCK EMAIL =====
      To: ${booking.contact.email}
      Subject: Your booking has been approved!
      
      Dear ${booking.contact.name},
      
      We're pleased to inform you that your booking for "${
        booking.event.title
      }" 
      has been approved. The event is scheduled for:
      
      Start: ${new Date(booking.event.start).toLocaleString()}
      End: ${new Date(booking.event.end).toLocaleString()}
      
      Event Details:
      ${booking.event.details}
      
      Thank you for choosing our stage!
      
      ===== END MOCK EMAIL =====
    `);
    return Promise.resolve();
  }
}

export default new EmailService();

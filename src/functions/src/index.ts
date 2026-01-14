
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as nodemailer from "nodemailer";

setGlobalOptions({ 
    maxInstances: 10,
    secrets: ["EMAIL_HOST", "EMAIL_PORT", "EMAIL_USER", "EMAIL_PASS"],
});

// A function to create and configure the email transporter
const createTransporter = () => {
    const port = parseInt(process.env.EMAIL_PORT || '587', 10);
    if (isNaN(port)) {
        throw new Error(`Invalid EMAIL_PORT value: "${process.env.EMAIL_PORT}". It must be a number.`);
    }
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

// Callable function to send a payment receipt
export const sendPaymentReceipt = onCall(async (request) => {
    const { tenantEmail, tenantName, amount, date, propertyName, unitName, notes } = request.data;

    // Validate essential data
    if (!tenantEmail || !tenantName || !amount || !date || !propertyName || !unitName) {
        logger.error("Missing required data for sending a receipt.", request.data);
        throw new HttpsError('invalid-argument', 'Missing required data for sending a receipt.');
    }

    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        logger.error("Email environment variables are not set.");
        throw new HttpsError('internal', 'Server is not configured for sending emails.');
    }
    
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Eracov Properties" <${process.env.EMAIL_USER}>`,
        to: tenantEmail,
        subject: "Your Payment Receipt",
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333; text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Payment Received</h2>
                <p>Dear ${tenantName},</p>
                <p>We have successfully received your payment. Thank you!</p>
                <h3 style="color: #333; border-top: 1px solid #ddd; padding-top: 15px; margin-top: 20px;">Receipt Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background-color: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">Amount Paid:</td><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Ksh ${amount.toLocaleString()}</td></tr>
                    <tr><td style="padding: 10px; border: 1px solid #ddd;">Payment Date:</td><td style="padding: 10px; border: 1px solid #ddd;">${date}</td></tr>
                    <tr style="background-color: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">Property:</td><td style="padding: 10px; border: 1px solid #ddd;">${propertyName}</td></tr>
                    <tr><td style="padding: 10px; border: 1px solid #ddd;">Unit:</td><td style="padding: 10px; border: 1px solid #ddd;">${unitName}</td></tr>
                    ${notes ? `<tr style="background-color: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">Notes:</td><td style="padding: 10px; border: 1px solid #ddd;">${notes}</td></tr>` : ''}
                </table>
                <p style="margin-top: 25px; font-size: 0.9em; color: #555;">If you have any questions about this payment, please don't hesitate to contact us.</p>
                <p style="margin-top: 20px; text-align: center; color: #888; font-size: 0.8em;">Sincerely,<br>The Eracov Properties Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Receipt sent to ${tenantEmail}`);
        return { success: true, message: "Receipt sent successfully." };
    } catch (error) {
        logger.error("Error sending email:", error);
        // Throw a specific error for the client
        throw new HttpsError("internal", "Failed to send email. Please check server logs for details.");
    }
});

/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as nodemailer from "nodemailer";
import {defineString} from "firebase-functions/params";

// Define environment variables for email configuration
const emailHost = defineString("EMAIL_HOST");
const emailPort = defineString("EMAIL_PORT");
const emailUser = defineString("EMAIL_USER");
const emailPass = defineString("EMAIL_PASS");

setGlobalOptions({ maxInstances: 10 });

// A function to create and configure the email transporter
const createTransporter = () => {
    const port = parseInt(emailPort.value(), 10);
    if (isNaN(port)) {
        throw new Error("Invalid EMAIL_PORT value. It must be a number.");
    }
    return nodemailer.createTransport({
        host: emailHost.value(),
        port: port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
            user: emailUser.value(),
            pass: emailPass.value(),
        },
    });
};

// Callable function to send a payment receipt
export const sendPaymentReceipt = onCall(async (request) => {
    const { tenantEmail, tenantName, amount, date, propertyName, unitName, notes } = request.data;

    const transporter = createTransporter();

    const mailOptions = {
        from: `"Eracov Properties" <${emailUser.value()}>`,
        to: tenantEmail,
        subject: "Your Payment Receipt",
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
                <h2 style="color: #333;">Payment Received</h2>
                <p>Dear ${tenantName},</p>
                <p>We have successfully received your payment. Thank you!</p>
                <h3>Receipt Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px; border: 1px solid #ddd;">Amount Paid:</td><td style="padding: 8px; border: 1px solid #ddd;">Ksh ${amount.toLocaleString()}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;">Payment Date:</td><td style="padding: 8px; border: 1px solid #ddd;">${date}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;">Property:</td><td style="padding: 8px; border: 1px solid #ddd;">${propertyName}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;">Unit:</td><td style="padding: 8px; border: 1px solid #ddd;">${unitName}</td></tr>
                    ${notes ? `<tr><td style="padding: 8px; border: 1px solid #ddd;">Notes:</td><td style="padding: 8px; border: 1px solid #ddd;">${notes}</td></tr>` : ''}
                </table>
                <p style="margin-top: 20px;">If you have any questions, feel free to contact us.</p>
                <p>Sincerely,<br>The Eracov Properties Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Receipt sent to ${tenantEmail}`);
        return { success: true, message: "Receipt sent successfully." };
    } catch (error) {
        logger.error("Error sending email:", error);
        throw new functions.https.HttpsError("internal", "Failed to send email.");
    }
});

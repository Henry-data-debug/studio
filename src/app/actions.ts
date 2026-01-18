import { generateMaintenanceResponseDraft, type MaintenanceRequestInput } from '@/ai/flows/automated-maintenance-response-drafts';
import { generatePropertyInsights, type PropertyInsightsInput } from '@/ai/flows/property-data-insights';
import { sendCustomEmail, checkAndSendLeaseReminders } from '@/lib/firebase';

export async function performSendCustomEmail(recipients: string[], subject: string, body: string) {
  try {
    const result = await sendCustomEmail({ recipients, subject, body });
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error sending custom email:", error);
    return { success: false, error: 'Failed to send email. please try again.' };
  }
}

export async function performCheckLeaseReminders() {
  try {
    const result = await checkAndSendLeaseReminders();
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error checking lease reminders:", error);
    return { success: false, error: 'Failed to run automation. Please try again.' };
  }
}

export async function getMaintenanceResponseDraft(input: MaintenanceRequestInput) {
  try {
    const result = await generateMaintenanceResponseDraft(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate draft. Please try again.' };
  }
}

export async function getAIDataInsights(input: PropertyInsightsInput) {
  try {
    const result = await generatePropertyInsights(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate AI insights.' };
  }
}

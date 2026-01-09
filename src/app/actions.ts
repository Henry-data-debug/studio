
'use server';

import { generateMaintenanceResponseDraft, type MaintenanceRequestInput } from '@/ai/flows/automated-maintenance-response-drafts';

export async function getMaintenanceResponseDraft(input: MaintenanceRequestInput) {
  try {
    const result = await generateMaintenanceResponseDraft(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate draft. Please try again.' };
  }
}

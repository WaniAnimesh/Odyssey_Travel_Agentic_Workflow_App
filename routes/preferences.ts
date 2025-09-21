import type { UserPreferences, Itinerary } from '../types';
import { generateDraftItinerary } from '../orchestrator';

/**
 * Route handler for submitting user preferences.
 * This function starts the planning workflow by generating a draft itinerary.
 * @param prefs The user's travel preferences.
 * @returns A promise that resolves to the draft Itinerary object.
 */
export async function submitPreferences(prefs: UserPreferences): Promise<Itinerary> {
    return await generateDraftItinerary(prefs);
}
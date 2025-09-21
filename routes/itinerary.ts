import type { FlightOption, UserPreferences } from '../types';
import { findFlightOptions } from '../orchestrator';

/**
 * Route handler for finding flights for a given set of preferences.
 * This is called after the user accepts the draft itinerary.
 * @param prefs The original user preferences.
 * @returns A promise that resolves to an array of flight options.
 */
export async function findFlights(prefs: UserPreferences): Promise<FlightOption[]> {
    return await findFlightOptions(prefs);
}
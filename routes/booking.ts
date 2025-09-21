import type { Itinerary, BookingDetails, FlightOption } from '../types';
import { generateBookingDetails } from '../orchestrator';

/**
 * Route handler for confirming an itinerary and getting booking details.
 * It combines the draft itinerary with the selected flight and generates final confirmations.
 * @param draftItinerary The draft itinerary object.
 * @param selectedFlight The flight the user chose.
 * @returns A promise that resolves to the final BookingDetails and the complete Itinerary.
 */
export async function confirmBooking(draftItinerary: Itinerary, selectedFlight: FlightOption): Promise<{ bookingDetails: BookingDetails, finalItinerary: Itinerary }> {
    
    // 1. Combine the draft and the flight to create the final itinerary
    const finalItinerary: Itinerary = {
        ...draftItinerary,
        flight: selectedFlight,
    };

    // 2. Generate booking details for the complete itinerary
    const bookingDetails = await generateBookingDetails(finalItinerary);

    // 3. Return both for the UI to use
    return { bookingDetails, finalItinerary };
}
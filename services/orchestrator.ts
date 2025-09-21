import type { UserPreferences, Itinerary, FlightOption, Accommodation, BookingDetails, PlanningContext, LocationData } from '../types';
import { getLocationData, searchFlights, searchAccommodation, getWeatherForecast, findNearbyActivities } from './tools';
import { comprehensiveItineraryAgent, bookingDetailsAgent } from './agents';
import { getTripDurationInDays } from '../utils';

/**
 * Generates a draft itinerary containing everything except flight details.
 * This is the first major step in the new user flow.
 * @param prefs The user's travel preferences.
 * @returns A promise that resolves to a partial Itinerary object.
 */
export async function generateDraftItinerary(prefs: UserPreferences): Promise<Itinerary> {
    console.log("--- Starting Draft Itinerary Workflow ---");

    // Step 1: Get destination location data
    console.log(`[Orchestrator] Step 1: Fetching location data for ${prefs.destination}`);
    const destinationLocation = await getLocationData(prefs.destination);
    console.log(`[Orchestrator] -> Received location data.`);

    // Step 2: Search for accommodation using a tool
    console.log(`[Orchestrator] Step 2: Searching for accommodation`);
    const accommodation: Accommodation = await searchAccommodation(prefs.destination, destinationLocation, prefs);
    console.log(`[Orchestrator] -> Found accommodation:`, accommodation);
    
    // Step 3: Find potential activities to ground the planning agent
    console.log(`[Orchestrator] Step 3: Finding potential activities near accommodation.`);
    const potentialActivities = await findNearbyActivities(accommodation.location, prefs.interests);
    console.log(`[Orchestrator] -> Found ${potentialActivities.length} potential activities.`);

    // Step 4: Get weather forecast to inform the agent
    console.log(`[Orchestrator] Step 4: Fetching weather forecast.`);
    const weatherForecast = await getWeatherForecast(prefs.destination, prefs.startDate);

    // Step 5: Engage the single, comprehensive Itinerary Agent to generate the plan,
    // packing list, and unique experiences all at once. This avoids rate limit errors.
    const duration = getTripDurationInDays(prefs.startDate, prefs.endDate);
    console.log(`[Orchestrator] Step 5: Engaging Comprehensive Itinerary Agent for a ${duration}-day trip.`);
    const { dailyPlans, packingList, authenticExperiences, unexpectedDiscoveries } = await comprehensiveItineraryAgent(
        prefs,
        duration,
        accommodation,
        potentialActivities,
        weatherForecast
    );
    console.log(`[Orchestrator] -> Comprehensive Agent created full draft itinerary.`);

    // Step 6: Assemble the draft itinerary from the single agent response.
    const draftItinerary: Itinerary = {
        destination: prefs.destination,
        accommodation: accommodation,
        dailyPlans: dailyPlans,
        packingList: packingList,
        authenticExperiences: authenticExperiences,
        unexpectedDiscoveries: unexpectedDiscoveries,
    };

    console.log("--- Draft Itinerary Workflow Complete ---");
    return draftItinerary;
}

/**
 * Finds flight options for the user after they have accepted the draft itinerary.
 * @param prefs The user's travel preferences.
 * @returns An array of flight options.
 */
export async function findFlightOptions(prefs: UserPreferences): Promise<FlightOption[]> {
    console.log("--- Starting Flight Search Workflow ---");
    
    const [departureLocation, destinationLocation] = await Promise.all([
        getLocationData(prefs.departure),
        getLocationData(prefs.destination)
    ]);

    const flightOptions = await searchFlights(
        departureLocation.iata,
        destinationLocation.iata,
        prefs.startDate,
        prefs.travelers
    );

    console.log(`--- Found ${flightOptions.length} Flight Options ---`);
    return flightOptions;
}

/**
 * Generates final, simulated booking details for all components of the trip.
 * @param itinerary The complete and final itinerary, including the selected flight.
 * @returns A BookingDetails object with all confirmation info.
 */
export async function generateBookingDetails(itinerary: Itinerary): Promise<BookingDetails> {
    console.log("--- Starting Final Booking Details Workflow ---");
    
    if (!itinerary.flight) {
        throw new Error("Cannot generate booking details without a selected flight.");
    }
    
    console.log(`[Orchestrator] Engaging Booking Agent for all trip components.`);

    const [flightBooking, accommodationBooking, activityBookings] = await Promise.all([
        bookingDetailsAgent('Flight', itinerary.flight.airline, itinerary.flight),
        bookingDetailsAgent('Accommodation', itinerary.accommodation.name, itinerary.accommodation),
        Promise.all(
            itinerary.dailyPlans
                .flatMap(day => day.activities)
                .slice(0, 3) // Create bookings for the first 3 activities
                .map(async (activity) => ({
                    activityDescription: activity.description,
                    bookingInfo: await bookingDetailsAgent('Activity', activity.description, activity)
                }))
        )
    ]);
    
    console.log(`[Orchestrator] -> Booking Agent returned all confirmation details.`);

    const finalBookingDetails: BookingDetails = {
        flightBooking,
        accommodationBooking,
        activityBookings,
    };

    console.log("--- Booking Details Workflow Complete ---");
    return finalBookingDetails;
}

// These functions support the old "flight-first" workflow and are kept for potential future use,
// but the main application now uses the "draft-first" workflow above.

/**
 * Starts the planning workflow by finding flight options for the user.
 * @param prefs The user's travel preferences.
 * @returns An object containing flight options and a planning context for the next step.
 */
export async function startPlanningWorkflow(prefs: UserPreferences): Promise<{ flightOptions: FlightOption[], context: PlanningContext }> {
    console.log("--- Starting Planning Workflow (Part 1: Flight Search) ---");
    
    const [departureLocation, destinationLocation]: [LocationData, LocationData] = await Promise.all([
        getLocationData(prefs.departure),
        getLocationData(prefs.destination)
    ]);

    const flightOptions = await searchFlights(
        departureLocation.iata,
        destinationLocation.iata,
        prefs.startDate,
        prefs.travelers
    );

    const context: PlanningContext = {
        prefs,
        departureLocation,
        destinationLocation,
    };

    console.log(`--- Found ${flightOptions.length} flights. Returning options and context. ---`);
    return { flightOptions, context };
}

/**
 * Continues the planning workflow after a flight has been selected.
 * Generates the full itinerary details around the chosen flight.
 * @param selectedFlight The flight option chosen by the user.
 * @param context The planning context from the previous workflow step.
 * @returns A promise that resolves to the complete Itinerary object.
 */
export async function continuePlanningWorkflow(selectedFlight: FlightOption, context: PlanningContext): Promise<Itinerary> {
    console.log("--- Continuing Planning Workflow (Part 2: Itinerary Generation) ---");
    const { prefs, destinationLocation } = context;

    console.log(`[Orchestrator] Step 1: Searching for accommodation`);
    const accommodation: Accommodation = await searchAccommodation(prefs.destination, destinationLocation, prefs);
    console.log(`[Orchestrator] -> Found accommodation:`, accommodation);
    
    console.log(`[Orchestrator] Step 2: Finding potential activities.`);
    const potentialActivities = await findNearbyActivities(accommodation.location, prefs.interests);
    console.log(`[Orchestrator] -> Found ${potentialActivities.length} potential activities.`);

    console.log(`[Orchestrator] Step 3: Fetching weather forecast.`);
    const weatherForecast = await getWeatherForecast(prefs.destination, prefs.startDate);

    const duration = getTripDurationInDays(prefs.startDate, prefs.endDate);
    console.log(`[Orchestrator] Step 4: Engaging Comprehensive Itinerary Agent.`);
    const { dailyPlans, packingList, authenticExperiences, unexpectedDiscoveries } = await comprehensiveItineraryAgent(
        prefs,
        duration,
        accommodation,
        potentialActivities,
        weatherForecast
    );
    console.log(`[Orchestrator] -> Agent returned full itinerary details.`);

    const finalItinerary: Itinerary = {
        destination: prefs.destination,
        flight: selectedFlight,
        accommodation: accommodation,
        dailyPlans: dailyPlans,
        packingList: packingList,
        authenticExperiences: authenticExperiences,
        unexpectedDiscoveries: unexpectedDiscoveries,
    };

    console.log("--- Full Itinerary Generation Complete ---");
    return finalItinerary;
}

/**
 * A workflow wrapper for generating the final booking details.
 * @param itinerary The complete itinerary.
 * @returns A promise resolving to the booking details.
 */
export async function getBookingDetailsWorkflow(itinerary: Itinerary): Promise<BookingDetails> {
    return generateBookingDetails(itinerary);
}

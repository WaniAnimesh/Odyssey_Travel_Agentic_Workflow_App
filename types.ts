export interface UserPreferences {
    departure: string;
    destination: string;
    startDate: string;
    endDate:string;
    budget: "Budget" | "Moderate" | "Luxury" | string;
    travelers: string;
    travelStyle: string[];
    interests: string[];
    pace: "Relaxed" | "Balanced" | "Fast-paced" | string;
    specificNeeds: string;
}

export interface FlightOption {
    airline: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    price: string;
    stops: number;
    duration: string;
}

export interface Accommodation {
    name: string;
    details: string;
    price: string;
    location: {
        latitude: number;
        longitude: number;
    };
}

export interface Activity {
    description: string;
    location: {
        latitude: number;
        longitude: number;
    };
    price: string;
}

export interface DiningSuggestion {
    name: string;
    description: string;
    priceRange: string;
}

export interface DailyDiningOptions {
    breakfast: DiningSuggestion;
    lunch: DiningSuggestion;
    dinner: DiningSuggestion;
}

export interface DailyPlan {
    day: number;
    theme: string;
    activities: Activity[];
    dining: DailyDiningOptions;
}

export interface PackingList {
    clothing: string[];
    documents: string[];
    toiletries: string[];
    miscellaneous: string[];
}

export interface Experience {
    title: string;
    description: string;
}

export interface Itinerary {
    destination: string;
    flight?: FlightOption; // Made optional for draft itinerary
    accommodation: Accommodation;
    dailyPlans: DailyPlan[];
    packingList: PackingList;
    authenticExperiences: Experience[];
    unexpectedDiscoveries: Experience[];
}

// --- NEW TYPES FOR BOOKING CONFIRMATION PAGE ---

/**
 * Represents the confirmation details for a single bookable item.
 */
export interface BookingInfo {
    confirmationCode: string;
    bookingLink: string;
    notes: string;
}

/**
 * Aggregates all booking information for the trip.
 */
export interface BookingDetails {
    flightBooking: BookingInfo;
    accommodationBooking: BookingInfo;
    activityBookings: {
        activityDescription: string;
        bookingInfo: BookingInfo;
    }[];
}

// --- NEW TYPES FOR MULTI-STEP WORKFLOW ---
export interface LocationData {
    iata: string;
    latitude: number;
    longitude: number;
}

export interface PlanningContext {
    prefs: UserPreferences;
    departureLocation: LocationData;
    destinationLocation: LocationData;
}


// Add global type definition for Google Maps API to avoid TypeScript errors
// when the script is loaded dynamically.
declare global {
  interface Window {
    google: any;
  }
}
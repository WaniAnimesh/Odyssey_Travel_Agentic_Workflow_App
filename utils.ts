
/**
 * Calculates the total number of days for a trip, inclusive of start and end dates.
 * @param startDate - The start date of the trip in 'YYYY-MM-DD' format.
 * @param endDate - The end date of the trip in 'YYYY-MM-DD' format.
 * @returns The total number of days.
 */
export function getTripDurationInDays(startDate: string, endDate: string): number {
    // Gracefully handle invalid or empty date strings to prevent crashes.
    if (!startDate || !endDate) {
        return 0;
    }
    
    // Use UTC parsing to avoid timezone-related off-by-one errors.
    // new Date('2024-10-15') can be interpreted as midnight in the local timezone,
    // which could be Oct 14th in UTC. Appending 'T00:00:00Z' ensures consistency.
    const start = new Date(startDate + 'T00:00:00Z');
    const end = new Date(endDate + 'T00:00:00Z');

    // Check if dates are valid after parsing.
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 0;
    }

    const diffTime = end.getTime() - start.getTime();
    // Ensure the result is non-negative.
    if (diffTime < 0) {
        return 0;
    }

    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Add 1 to make the duration inclusive of the end date.
}

/**
 * Parses the traveler string to determine the number of adult passengers.
 * @param travelers - A string like "Solo", "Couple", "2 adults".
 * @returns The number of adult travelers. Defaults to 1.
 */
export function parseTravelerCount(travelers: string): number {
    const lowerTravelers = travelers.toLowerCase();
    if (lowerTravelers.includes('solo')) {
        return 1;
    }
    if (lowerTravelers.includes('couple')) {
        return 2;
    }
    // Try to extract a number from the string
    const match = lowerTravelers.match(/\d+/);
    if (match) {
        return parseInt(match[0], 10);
    }
    return 1; // Default to 1 if no number is found
}

/**
 * Formats an ISO 8601 duration string (e.g., "PT5H30M") into a human-readable format (e.g., "5h 30m").
 * @param isoDuration The ISO 8601 duration string.
 * @returns A human-readable duration string.
 */
export function formatIsoDuration(isoDuration: string): string {
    if (!isoDuration || !isoDuration.startsWith('PT')) {
        return '';
    }
    // Remove 'PT' prefix
    const timeStr = isoDuration.substring(2);
    
    let hours = 0;
    let minutes = 0;
    
    const hoursMatch = timeStr.match(/(\d+)H/);
    if (hoursMatch) {
        hours = parseInt(hoursMatch[1], 10);
    }
    
    const minutesMatch = timeStr.match(/(\d+)M/);
    if (minutesMatch) {
        minutes = parseInt(minutesMatch[1], 10);
    }

    let result = '';
    if (hours > 0) {
        result += `${hours}h `;
    }
    if (minutes > 0) {
        result += `${minutes}m`;
    }
    
    return result.trim();
}


const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
let googleMapsPromise: Promise<void> | null = null;

/**
 * Dynamically loads the Google Maps JavaScript API script.
 * Ensures the script is only loaded once.
 * @returns A promise that resolves when the API is ready.
 */
export function loadGoogleMapsAPI(): Promise<void> {
    if (googleMapsPromise) {
        return googleMapsPromise;
    }

    googleMapsPromise = new Promise((resolve, reject) => {
        // If the script is already on the page, resolve immediately.
        if (window.google && window.google.maps) {
            resolve();
            return;
        }

        if (!GOOGLE_MAPS_API_KEY) {
            console.error("Google Maps API Key is not configured in environment variables.");
            reject(new Error("Failed to load Google Maps API: Key not found."));
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => {
            googleMapsPromise = null; // Reset promise on failure to allow retry
            reject(new Error('Failed to load Google Maps API.'));
        }
        document.head.appendChild(script);
    });

    return googleMapsPromise;
}

import type { UserPreferences, FlightOption, Accommodation, Activity } from './types';
import { loadGoogleMapsAPI, parseTravelerCount, formatIsoDuration } from './utils';
import { iataCodeAgent } from './agents';

// Helper function to convert price level to a string
const formatPrice = (priceLevel?: number): string => {
    if (priceLevel === undefined) return "Price varies";
    if (priceLevel <= 1) return "$ - Budget-friendly";
    if (priceLevel === 2) return "$$ - Moderately priced";
    if (priceLevel >= 3) return "$$$ - Upscale";
    return "Price varies";
};

/**
 * Tool: Fetches the coordinates for a given location name using Google Places API,
 * and uses an AI agent to determine the correct IATA code for flight searches.
 * @param locationName - e.g., "Paris, France" or "San Francisco"
 * @throws {Error} if locationName is empty or not found.
 */
export async function getLocationData(locationName: string): Promise<{ iata: string; latitude: number; longitude: number; }> {
  console.log(`[Tool] Fetching REAL location data for: ${locationName}`);
  
  if (!locationName || locationName.trim() === '') {
      throw new Error('Location name cannot be empty.');
  }

  await loadGoogleMapsAPI();
  const service = new window.google.maps.places.PlacesService(document.createElement('div'));

  const place = await new Promise<any>((resolve, reject) => {
      service.findPlaceFromQuery({
          query: locationName,
          fields: ['geometry.location', 'name'],
      }, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0]?.geometry?.location) {
              resolve(results[0]);
          } else {
              reject(new Error(`Could not find location data for "${locationName}". Status: ${status}`));
          }
      });
  });

  const latitude = place.geometry.location.lat();
  const longitude = place.geometry.location.lng();

  // Use the new IATA Code Agent to dynamically find the correct airport code.
  // This is far more robust than a hardcoded list.
  console.log(`[Tool] -> Engaging IATA Code Agent for "${locationName}"...`);
  const { iataCode } = await iataCodeAgent(locationName);
  if (!iataCode || iataCode.length !== 3) {
      throw new Error(`The IATA Code Agent failed to return a valid 3-letter code for ${locationName}.`);
  }
  
  console.log(`[Tool] -> Found coordinates: ${latitude}, ${longitude} and IATA code: ${iataCode}`);
  return { iata: iataCode, latitude, longitude };
}


// A cache for the Amadeus token to avoid re-requesting it every time.
let amadeusToken: { token: string; expires: number } | null = null;

/**
 * Retrieves an Amadeus API access token, using a cached token if available and valid.
 * @returns A valid Amadeus access token.
 * @throws {Error} if API keys are missing or authentication fails.
 */
async function getAmadeusToken(): Promise<string> {
    const apiKey = "Zsww9QnqaqiA7Bg4HqtlfF30UMDq26VA";
    const apiSecret = "Gh6HFCwDOl6WAPVO";

    if (!apiKey || !apiSecret) {
        throw new Error("Amadeus API Key/Secret is not configured. Please set AMADEUS_API_KEY and AMADEUS_API_SECRET environment variables.");
    }
    
    // If we have a token and it's not expired, return it.
    if (amadeusToken && amadeusToken.expires > Date.now()) {
        return amadeusToken.token;
    }

    console.log('[Tool:Amadeus] Auth token expired or not found. Requesting new token...');
    
    const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`,
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Amadeus auth failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();

    // Cache the new token with an expiry time (e.g., expires_in is in seconds, so convert to ms).
    // Set a 10-second buffer before expiry.
    amadeusToken = {
        token: data.access_token,
        expires: Date.now() + (data.expires_in - 10) * 1000,
    };
    
    console.log('[Tool:Amadeus] -> Successfully obtained new auth token.');
    return amadeusToken.token;
}


/**
 * Tool: Searches for flights. First, it looks for direct flights. If none are found,
 * it automatically searches again for connecting flights.
 * @returns An array of flight options.
 * @throws {Error} if the API call fails for reasons other than not finding flights.
 */
export async function searchFlights(departureCode: string, destinationCode: string, startDate: string, travelers: string): Promise<FlightOption[]> {
    console.log(`[Tool] Searching flights from ${departureCode} to ${destinationCode} for ${travelers} on ${startDate}`);
    
    const apiKey = "Zsww9QnqaqiA7Bg4HqtlfF30UMDq26VA";
    const apiSecret = "Gh6HFCwDOl6WAPVO";
    
    if (!apiKey || !apiSecret) {
        console.warn("[Tool:searchFlights] Amadeus API keys not configured. Returning mocked flight data.");
        // Mock data now includes stops and duration
        return Promise.resolve([
            {
                airline: "SkyLink Airlines (Mocked)",
                flightNumber: "SL815",
                departureTime: `${startDate}T09:00:00`,
                arrivalTime: `${startDate}T12:30:00`,
                price: "$350.00",
                stops: 0,
                duration: "3h 30m"
            },
            {
                airline: "Horizon Connect (Mocked)",
                flightNumber: "HC442",
                departureTime: `${startDate}T11:00:00`,
                arrivalTime: `${startDate}T17:00:00`,
                price: "$280.00",
                stops: 1,
                duration: "6h 00m"
            }
        ]);
    }
    
    console.log('[Tool:searchFlights] Amadeus API keys found. Attempting real flight search.');

    try {
        const token = await getAmadeusToken();
        const numAdults = parseTravelerCount(travelers);

        const baseParams = {
            originLocationCode: departureCode,
            destinationLocationCode: destinationCode,
            departureDate: startDate,
            adults: numAdults.toString(),
            'currencyCode': 'USD',
            'max': '5',
        };

        const performSearch = async (nonStop: boolean): Promise<FlightOption[]> => {
            const searchParams = new URLSearchParams({ ...baseParams, nonStop: String(nonStop) });

            const flightResponse = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?${searchParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!flightResponse.ok) {
                const errorBody = await flightResponse.text();
                throw new Error(`Amadeus flight search failed (nonStop=${nonStop}) with status ${flightResponse.status}: ${errorBody}`);
            }

            const flightData = await flightResponse.json();

            if (!flightData.data || flightData.data.length === 0) {
                return [];
            }
            
            console.log(`[Tool] -> Found ${flightData.data.length} flight options (nonStop=${nonStop}).`);

            return flightData.data.map((offer: any): FlightOption => {
                const itinerary = offer.itineraries[0];
                const firstSegment = itinerary.segments[0];
                const lastSegment = itinerary.segments[itinerary.segments.length - 1];
                const airlineCode = firstSegment.carrierCode;
                const airlineName = flightData.dictionaries.carriers[airlineCode] || airlineCode;
                const stops = itinerary.segments.length - 1;

                return {
                    airline: airlineName,
                    flightNumber: `${airlineCode} ${firstSegment.number}`,
                    departureTime: firstSegment.departure.at,
                    arrivalTime: lastSegment.arrival.at,
                    price: `$${offer.price.total}`,
                    stops: stops,
                    duration: formatIsoDuration(itinerary.duration),
                };
            });
        };

        // Attempt 1: Search for direct flights first, as they are often preferred by travelers.
        console.log('[Tool] Attempting to find DIRECT flights...');
        let flights = await performSearch(true);

        // Fallback Step: If no direct flights are found, automatically search again for connecting flights.
        // This makes the tool more robust and ensures the user sees options if they exist.
        if (flights.length === 0) {
            console.warn(`[Tool] No direct flights found. Searching for CONNECTING flights...`);
            flights = await performSearch(false);
        }

        if (flights.length === 0) {
            console.warn(`[Tool:searchFlights] No flights found at all for the route from ${departureCode} to ${destinationCode}.`);
        }

        return flights;

    } catch (error) {
        console.error("[Tool:searchFlights] An error occurred during the real API call:", error);
        throw error;
    }
}

/**
 * Tool: Fetches a weather forecast for a given location.
 * NOTE: This is a MOCKED function. To implement a real weather forecast, you would
 * use an API from a service like OpenWeatherMap.
 * @param destinationName The name of the destination city.
 * @param startDate The start date of the trip.
 * @returns A string describing the weather forecast.
 */
export async function getWeatherForecast(destinationName: string, startDate: string): Promise<string> {
    console.log(`[Tool] Getting weather forecast for ${destinationName} starting on ${startDate}`);

    // --- REAL API INTEGRATION POINT (e.g., OpenWeatherMap) ---
    // const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
    //
    // 1. You would first need to get the latitude/longitude for the destinationName.
    //    (This is already done in `getLocationData`, so you could pass those coordinates here).
    //
    // 2. Call the weather API.
    // const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast/daily?lat={lat}&lon={lon}&cnt=7&appid=${OPENWEATHER_API_KEY}`);
    // const weatherData = await weatherResponse.json();
    //
    // 3. Format the response into a human-readable string for the agent.
    // const day = weatherData.list[0];
    // return `Expected weather is ${day.weather[0].description} with temperatures around ${day.temp.day}°C.`;
    // ---

    // For now, return a dynamic mock based on the destination name.
    const normalizedDest = destinationName.toLowerCase();
    if (normalizedDest.includes("tokyo") || normalizedDest.includes("kyoto")) {
        return "Mild and pleasant, with a mix of sun and clouds. Average temperature around 18°C (64°F).";
    }
    if (normalizedDest.includes("paris")) {
        return "Cool and crisp with a chance of light showers. Average temperature around 12°C (54°F).";
    }
    if (normalizedDest.includes("san francisco")) {
        return "Cool with morning fog, clearing to a sunny afternoon. Average temperature around 15°C (59°F).";
    }
    return "Sunny and warm, with average temperatures around 25°C (77°F).";
}


/**
 * Tool: Searches for accommodation using Google Places API with a robust fallback system.
 * It tries a wide nearby search first, then falls back to a text search if needed.
 * @param destinationName - The name of the destination city.
 * @param location - The coordinates to search around.
 * @param prefs - User's budget and style preferences.
 * @throws {Error} if no accommodation is found even with fallbacks.
 */
export async function searchAccommodation(destinationName: string, location: { latitude: number; longitude: number; }, prefs: UserPreferences): Promise<Accommodation> {
    console.log(`[Tool] Searching for REAL accommodation in ${destinationName} with budget ${prefs.budget}`);
    await loadGoogleMapsAPI();
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    // Helper to perform a nearby search with an expanded radius
    const nearbySearchRequest = (minPrice: number, maxPrice: number): Promise<any[]> => {
        return new Promise((resolve) => {
            service.nearbySearch({
                location: new window.google.maps.LatLng(location.latitude, location.longitude),
                radius: 20000, // Increased radius to 20km for better coverage
                type: 'lodging',
                minPriceLevel: minPrice,
                maxPriceLevel: maxPrice,
            }, (res, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && res && res.length > 0) {
                    resolve(res);
                } else {
                    if (status !== window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                        console.warn(`Nearby search failed with status: ${status}`);
                    }
                    resolve([]); // Always resolve to allow next steps to proceed
                }
            });
        });
    };

    // Helper to perform a text search as a fallback for broad queries
    const textSearchRequest = (): Promise<any[]> => {
        console.log(`[Tool] Fallback: Performing text search for "lodging in ${destinationName}"`);
        return new Promise((resolve) => {
            service.textSearch({
                query: `lodging in ${destinationName}`,
                type: 'lodging',
            }, (res, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && res && res.length > 0) {
                    resolve(res);
                } else {
                    resolve([]);
                }
            });
        });
    };

    let minPrice, maxPrice;
    switch (prefs.budget) {
        case 'Budget': minPrice = 0; maxPrice = 1; break;
        case 'Moderate': minPrice = 2; maxPrice = 2; break;
        case 'Luxury': minPrice = 3; maxPrice = 4; break;
        default: minPrice = 0; maxPrice = 4;
    }

    // Attempt 1: Nearby search with specific budget and wide radius
    let results = await nearbySearchRequest(minPrice, maxPrice);

    // Attempt 2: Nearby search with broad budget if first attempt fails
    if (results.length === 0) {
        console.log(`[Tool] No results for '${prefs.budget}' budget in nearby search. Broadening search to all price levels.`);
        results = await nearbySearchRequest(0, 4);
    }
    
    // Attempt 3: Text search if all nearby searches fail (best for broad areas like "Goa")
    if (results.length === 0) {
        console.log(`[Tool] All nearby searches failed to find lodging. Falling back to a more general text search.`);
        results = await textSearchRequest();
    }
    
    if (results.length === 0) {
        throw new Error(`Could not find any accommodation in ${destinationName}, even with a broad budget search.`);
    }

    // Sort by rating (if available) to pick the best option
    const bestOption = results.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
    
    return {
        name: bestOption.name,
        details: `A well-rated hotel with a rating of ${bestOption.rating || 'N/A'}/5. Located at: ${bestOption.vicinity || bestOption.formatted_address}`,
        price: formatPrice(bestOption.price_level),
        location: {
            latitude: bestOption.geometry.location.lat(),
            longitude: bestOption.geometry.location.lng(),
        }
    };
}


/**
 * Tool: Finds activities and points of interest using Google Places API.
 * @param location - The coordinates to search around.
 * @param interests - A list of user interests like 'history', 'art', 'food'.
 */
export async function findNearbyActivities(location: { latitude: number; longitude: number; }, interests: string[]): Promise<Activity[]> {
    console.log(`[Tool] Finding REAL activities for interests: ${interests.join(', ')}`);
    await loadGoogleMapsAPI();
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    
    const results = await new Promise<any[]>((resolve, reject) => {
        service.nearbySearch({
            location: new window.google.maps.LatLng(location.latitude, location.longitude),
            radius: 10000, // 10km radius for activities
            keyword: interests.join(' '), // Combine interests as keywords
            type: 'tourist_attraction',
        }, (res, status) => {
             if (status === window.google.maps.places.PlacesServiceStatus.OK && res) {
                resolve(res);
            } else {
                console.warn(`Could not find activities. Status: ${status}`);
                resolve([]); // Not a critical error, return empty array
            }
        });
    });
    
    return results.slice(0, 10).map(place => ({
        description: place.name,
        price: formatPrice(place.price_level),
        location: {
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
        }
    }));
}
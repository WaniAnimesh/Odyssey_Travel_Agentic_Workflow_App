import { GoogleGenAI, Type } from "@google/genai";
import type { UserPreferences, Accommodation, Activity, PackingList, DailyPlan, BookingInfo, Experience, ContingencyPlan, LanguageGuide } from '../types';

// The API key must be passed in an object with the `apiKey` property.
// It is sourced from the environment variable `process.env.API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Reusable helper function to call the Gemini API and get a structured JSON response.
 * @param prompt The text prompt to send to the AI.
 * @param schema The response schema for the JSON output.
 * @returns A promise that resolves to the parsed JSON object.
 */
async function generateStructuredJson(prompt: string, schema: any): Promise<any> {
    console.log("[AI Helper] Generating structured JSON...");
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    console.log("[AI Helper] Received structured response from AI.");
    
    // The response text should be a valid JSON string based on the schema.
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
}

/**
 * Agent: IATA Code Finder
 * This agent identifies the primary 3-letter IATA airport code for a given city.
 * This is crucial for grounding flight searches with real-world data.
 */
export async function iataCodeAgent(locationName: string): Promise<{ iataCode: string }> {
    console.log(`[Agent: IATA Finder] Finding IATA code for: ${locationName}`);
    
    const prompt = `
        You are a travel data API. Your sole function is to identify the primary 3-letter IATA airport code for a major city or location.
        For example, for "Paris, France" you would return "CDG". For "New York City" you would return "JFK". For "Kyoto, Japan", you might return "KIX" (Kansai International), as it's the main international gateway.
        
        Location: "${locationName}"
        
        Return ONLY a JSON object with the single key "iataCode".
    `;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            iataCode: {
                type: Type.STRING,
                description: "The 3-letter IATA airport code.",
            },
        },
        required: ["iataCode"],
    };

    return await generateStructuredJson(prompt, schema);
}


/**
 * Agent: Comprehensive Itinerary Generator
 * This single, powerful agent takes all grounded information and generates the daily plans,
 * packing list, authentic experiences, and unexpected discoveries in one consolidated call
 * to avoid hitting API rate limits.
 */
export async function comprehensiveItineraryAgent(
    prefs: UserPreferences,
    duration: number,
    accommodation: Accommodation,
    potentialActivities: Activity[],
    weatherForecast: string
): Promise<{ tripTitle: string, dailyPlans: DailyPlan[], packingList: PackingList, authenticExperiences: Experience[], unexpectedDiscoveries: Experience[], contingencyPlans: ContingencyPlan[], languageGuide: LanguageGuide }> {
    console.log(`[Agent: Comprehensive Itinerary] Generating full draft for a ${duration}-day trip to ${prefs.destination}.`);

    const activityListContext = potentialActivities.length > 0
        ? `Please select from the following list of real-world activities found near the user's accommodation to build your plan: ${JSON.stringify(potentialActivities, null, 2)}`
        : `No specific activities were found nearby, so you must generate 2-3 plausible activities per day based on the user's interests.`;
    
    const prompt = `
        You are an expert travel planner. Your task is to create a complete, detailed, and enjoyable ${duration}-day itinerary for a trip to ${prefs.destination}. You must also provide a packing list, suggest unique local experiences, create a title for the trip, devise contingency plans, and a language guide.

        **User Context:**
        - Destination: ${prefs.destination}
        - Trip Start Date: ${prefs.startDate}
        - Budget: ${prefs.budget}
        - Interests: ${prefs.interests.join(', ')}
        - Pace: ${prefs.pace}
        - Travelers: ${prefs.travelers}
        - Accommodation: Staying at ${accommodation.name}.
        - Expected Weather: ${weatherForecast}

        **Your Required Tasks (in a single JSON response):**
        1.  **Generate a Trip Title:** Create a catchy, descriptive title for this entire journey (e.g., "Kyoto's Ancient Wonders & Modern Delights" or "Goa on a Shoestring: A Culinary Journey").

        2.  **Create Daily Plans:**
            - Structure the trip into ${duration} days.
            - For each day, assign a creative theme.
            - Select or generate 2-3 activities per day that match the user's interests and are logically sequenced.
            - For each day, suggest one thematically appropriate restaurant for breakfast, lunch, and dinner, considering the day's activities and user budget. Provide a name, a brief description, and a price range ("$", "$$", "$$$").

        3.  **Packing List (Packing Agent):**
            - Generate a helpful 'packingList' based on the destination, duration, the expected weather ("${weatherForecast}"), and the planned daily activities.
            - You MUST structure this into logical categories using these exact keys in the JSON: "documentsAndEssentials", "clothing", "toiletries", and "electronics".
            - Tailor the clothing suggestions specifically to the activities and weather. For example, suggest "hiking boots for outdoor days" if hiking is planned, or "a smart outfit for fine dining" if upscale restaurants are included.

        4.  **Suggest Authentic Experiences:**
            - Suggest 2 unique, off-the-beaten-path local experiences a typical tourist might miss, tailored to user interests. Provide a short, compelling title and a description for each.

        5.  **Suggest Unexpected Discoveries:**
            - Suggest 2 serendipitous or seasonal activities (e.g., local festivals, special exhibits, natural phenomena) available around the trip's start date. Provide a short, intriguing title and a description for each.

        6.  **Generate Contingency Plans:** Suggest 2 plausible contingency plans for potential issues on this trip (e.g., 'Heavy Rainfall', 'Flight Delays from Origin'). For each, provide a short "risk" title and a "plan" of action.

        7.  **Create a Language Guide:** Generate a brief language and cultural guide for the primary local language spoken at the destination. Provide the "languageName" and a few essential phrases (e.g., Hello, Thank you, How much is this?, Excuse me/Sorry, Yes, No). For each phrase, include the "english" version, the "translation", and a simple "phonetic" pronunciation.

        **Available Activities for Planning:**
        ${activityListContext}
        
        Respond with a single JSON object that strictly adheres to the provided schema. Do not add any commentary.
    `;

    const suggestionSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING }, description: { type: Type.STRING }, priceRange: { type: Type.STRING }
        },
        required: ["name", "description", "priceRange"]
    };

    const experienceSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
        },
        required: ["title", "description"]
    };

    const schema = {
        type: Type.OBJECT,
        properties: {
            tripTitle: {
                type: Type.STRING,
                description: "A catchy, descriptive title for the entire travel itinerary.",
            },
            dailyPlans: {
                type: Type.ARRAY,
                description: "The array of daily plans for the itinerary.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        day: { type: Type.INTEGER },
                        theme: { type: Type.STRING },
                        activities: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    description: { type: Type.STRING },
                                    location: {
                                        type: Type.OBJECT,
                                        properties: {
                                            latitude: { type: Type.NUMBER },
                                            longitude: { type: Type.NUMBER }
                                        },
                                        required: ["latitude", "longitude"]
                                    },
                                    price: { type: Type.STRING },
                                },
                                required: ["description", "location", "price"],
                            },
                        },
                        dining: {
                            type: Type.OBJECT,
                            properties: {
                                breakfast: suggestionSchema,
                                lunch: suggestionSchema,
                                dinner: suggestionSchema,
                            },
                             required: ["breakfast", "lunch", "dinner"]
                        },
                    },
                     required: ["day", "theme", "activities", "dining"],
                },
            },
            packingList: {
                type: Type.OBJECT,
                properties: {
                    documentsAndEssentials: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "List of essential documents and items like passport, visa, travel insurance, etc."
                    },
                    clothing: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "List of clothing items tailored to weather and activities."
                    },
                    toiletries: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "List of personal toiletries."
                    },
                    electronics: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "List of electronic devices and accessories like chargers, adapters."
                    }
                },
                required: ["documentsAndEssentials", "clothing", "toiletries", "electronics"]
            },
            authenticExperiences: {
                type: Type.ARRAY,
                description: "An array of 2 unique, authentic local experiences.",
                items: experienceSchema
            },
            unexpectedDiscoveries: {
                type: Type.ARRAY,
                description: "An array of 2 seasonal or serendipitous discoveries.",
                items: experienceSchema
            },
            contingencyPlans: {
                type: Type.ARRAY,
                description: "An array of 2 contingency plans for the trip.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        risk: { type: Type.STRING, description: "The title of the potential risk." },
                        plan: { type: Type.STRING, description: "The suggested plan to mitigate the risk." }
                    },
                    required: ["risk", "plan"]
                }
            },
            languageGuide: {
                type: Type.OBJECT,
                description: "A guide to the local language.",
                properties: {
                    languageName: { type: Type.STRING, description: "The name of the local language." },
                    phrases: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                english: { type: Type.STRING },
                                translation: { type: Type.STRING },
                                phonetic: { type: Type.STRING }
                            },
                            required: ["english", "translation", "phonetic"]
                        }
                    }
                },
                required: ["languageName", "phrases"]
            }
        },
         required: ["tripTitle", "dailyPlans", "packingList", "authenticExperiences", "unexpectedDiscoveries", "contingencyPlans", "languageGuide"],
    };

    return await generateStructuredJson(prompt, schema);
}

/**
 * Agent: Booking Details Generator
 * This agent creates simulated, realistic-looking booking confirmation details
 * for a given travel item (flight, hotel, etc.).
 */
export async function bookingDetailsAgent(itemType: 'Flight' | 'Accommodation' | 'Activity', itemName: string, itemDetails: any): Promise<BookingInfo> {
    console.log(`[Agent: Booking] Generating confirmation details for ${itemType}: ${itemName}`);

    const prompt = `
        You are a travel booking confirmation API. Your job is to create a realistic-looking (but fake) booking confirmation for a travel item.
        
        **Booking Item Details:**
        - Item Type: ${itemType}
        - Name/Identifier: ${itemName}
        - Full Details: ${JSON.stringify(itemDetails, null, 2)}
        
        **Your Task:**
        Generate a JSON object with the following information:
        1.  "confirmationCode": A plausible alphanumeric confirmation code (e.g., "AZ8-T4K").
        2.  "bookingLink": A plausible but fake booking management URL (e.g., "https://book.fakedestination.com/manage/AZ8-T4K").
        3.  "notes": A concise, helpful note relevant to the booking type. For a flight, mention checking in online. For a hotel, mention check-in time. For an activity, mention bringing the ticket.
        
        Respond ONLY with the JSON object. Do not add any other commentary.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            confirmationCode: { type: Type.STRING, description: "A fake alphanumeric confirmation code." },
            bookingLink: { type: Type.STRING, description: "A fake URL to manage the booking." },
            notes: { type: Type.STRING, description: "A short, helpful note for the traveler." },
        },
        required: ["confirmationCode", "bookingLink", "notes"],
    };

    return await generateStructuredJson(prompt, schema);
}
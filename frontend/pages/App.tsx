import React, { useState } from 'react';
import type { UserPreferences, Itinerary, BookingDetails, FlightOption } from '../../types';
import { submitPreferences } from '../../routes/preferences';
import { findFlights } from '../../routes/itinerary';
import { confirmBooking } from '../../routes/booking';
import PreferenceForm from '../components/PreferenceForm';
import ItineraryDisplay from '../components/ItineraryDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import LogDisplay from '../components/LogDisplay';
import Header from '../components/Header';
import BookingDetailsDisplay from '../components/BookingDetailsDisplay';
import FlightSelectionDisplay from '../components/FlightSelectionDisplay';

const App: React.FC = () => {
    const [view, setView] = useState<'form' | 'flightSelection' | 'itinerary' | 'booking'>('form');
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
    const [itinerary, setItinerary] = useState<Itinerary | null>(null);
    const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [flightOptions, setFlightOptions] = useState<FlightOption[] | null>(null);

    const startLogging = () => {
        setLogs([]);
        const originalConsoleLog = console.log;
        console.log = (...args: any[]) => {
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            setLogs(prev => [...prev, message]);
            originalConsoleLog(...args);
        };
        return originalConsoleLog;
    }
    
    const [originalConsoleLog] = useState(() => console.log);
    const stopLogging = () => {
        console.log = originalConsoleLog;
    };

    const handleGenerateItinerary = async (prefs: UserPreferences) => {
        setIsLoading(true);
        setError(null);
        setItinerary(null);
        startLogging();

        try {
            const draftItinerary = await submitPreferences(prefs);
            setItinerary(draftItinerary);
            setUserPreferences(prefs); // Save prefs for flight search later
            setView('itinerary');
        } catch (err) {
            console.error("Workflow failed (Draft Itinerary):", err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Failed to generate draft itinerary. Error: ${errorMessage}`);
            setView('form'); // Go back to form on error
        } finally {
            setIsLoading(false);
            stopLogging();
        }
    };

    const handleFindFlights = async () => {
        if (!userPreferences) return;
        
        setIsLoading(true);
        setError(null);
        setFlightOptions(null);
        startLogging();

        try {
            const options = await findFlights(userPreferences);
            if (options.length === 0) {
                setError("Sorry, no direct or connecting flights were found for your selected route and date. Please try different dates or start a new plan.");
                setView('itinerary'); // Stay on itinerary view to show error
            } else {
                setFlightOptions(options);
                setView('flightSelection');
            }
        } catch (err) {
            console.error("Workflow failed (Flight Search):", err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Failed to find flights. Error: ${errorMessage}`);
            setView('itinerary');
        } finally {
            setIsLoading(false);
            stopLogging();
        }
    };

    const handleSelectFlight = async (flight: FlightOption) => {
        if (!itinerary) return;

        setView('booking');
        setIsLoading(true);
        setError(null);
        setBookingDetails(null);
        startLogging();

        try {
            const { bookingDetails: newBookingDetails, finalItinerary } = await confirmBooking(itinerary, flight);
            setBookingDetails(newBookingDetails);
            setItinerary(finalItinerary); // Update itinerary with the selected flight
        } catch(err) {
            console.error("Booking Details Workflow failed:", err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Failed to generate booking details. Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
            stopLogging();
        }
    };

    const handleStartNewPlan = () => {
        setView('form');
        setItinerary(null);
        setBookingDetails(null);
        setError(null);
        setIsLoading(false);
        setLogs([]);
        setFlightOptions(null);
        setUserPreferences(null);
    };

    const renderContent = () => {
        if (isLoading && (view === 'form' || view === 'booking')) {
            return <div className="mt-10"><LoadingSpinner /></div>;
        }

        switch (view) {
            case 'form':
                return (
                    <div className="flex items-center justify-center py-10">
                        <div className="max-w-4xl w-full">
                            <PreferenceForm onSubmit={handleGenerateItinerary} isLoading={isLoading} error={error} />
                        </div>
                    </div>
                );
            case 'itinerary':
                if (!itinerary || !userPreferences) return null;
                const formattedStartDate = new Date(userPreferences.startDate + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
                const formattedEndDate = new Date(userPreferences.endDate + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

                return (
                    <div className="space-y-6 animate-fade-in">
                        {/* Itinerary Header */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">{itinerary.tripTitle}</h2>
                                <p className="text-gray-500 mt-1">{formattedStartDate} to {formattedEndDate}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors">Share</button>
                                <button onClick={handleStartNewPlan} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors">New Plan</button>
                            </div>
                        </div>

                        {/* Flight Plan Card */}
                         <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Your Flight Plan</p>
                                    <p className="font-bold text-lg text-gray-800">{itinerary.departureIata} &rarr; {itinerary.destinationIata}</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleFindFlights}
                                disabled={isLoading}
                                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-blue-300 disabled:transform-none"
                            >
                                {isLoading ? 'Searching...' : 'Search Flights'}
                            </button>
                        </div>
                        {error && <div className="my-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert"><p>{error}</p></div>}
                        <ItineraryDisplay itinerary={itinerary} />
                    </div>
                );
            case 'flightSelection':
                 return (
                    <div>
                        <div className="mb-6 flex justify-end">
                            <button onClick={handleStartNewPlan} className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">&#8592; Start New Plan</button>
                        </div>
                         {flightOptions && (
                            <FlightSelectionDisplay 
                                flightOptions={flightOptions}
                                onSelectFlight={handleSelectFlight}
                                destination={userPreferences?.destination || ''}
                            />
                        )}
                    </div>
                );
            case 'booking':
                 return (
                    <div>
                        <div className="mb-6 flex justify-end">
                            <button onClick={handleStartNewPlan} className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">&#8592; Start New Plan</button>
                        </div>
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg"><h3 className="font-bold text-lg mb-2">Error</h3><p>{error}</p></div>}
                        {bookingDetails && itinerary && itinerary.flight && (
                            <BookingDetailsDisplay 
                                details={bookingDetails} 
                                destination={itinerary.destination}
                                flight={itinerary.flight}
                                packingList={itinerary.packingList}
                            />
                        )}
                    </div>
                );
        }
    };
    
    return (
        <div className="min-h-screen font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-8 w-full">
                {renderContent()}
                {logs.length > 0 && <LogDisplay logs={logs} />}
            </main>
        </div>
    );
};

export default App;

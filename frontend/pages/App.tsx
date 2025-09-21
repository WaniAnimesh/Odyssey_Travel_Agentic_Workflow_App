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
        } finally {
            setIsLoading(false);
            stopLogging();
        }
    };

    const handleAcceptItinerary = async () => {
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
        if (isLoading && view !== 'flightSelection') {
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
                return (
                    <div>
                        <div className="mb-6 flex justify-end">
                            <button onClick={handleStartNewPlan} className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">&#8592; Start New Plan</button>
                        </div>
                        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg"><h3 className="font-bold text-lg mb-2">Error</h3><p>{error}</p></div>}
                        {itinerary && <ItineraryDisplay itinerary={itinerary} onAccept={handleAcceptItinerary} isAccepting={isLoading} />}
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
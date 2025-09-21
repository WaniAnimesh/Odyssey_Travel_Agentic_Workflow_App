import React from 'react';
import type { FlightOption } from '../types';

const PlaneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const DurationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

interface FlightSelectionDisplayProps {
    flightOptions: FlightOption[];
    onSelectFlight: (flight: FlightOption) => void;
    destination: string;
}

const FlightSelectionDisplay: React.FC<FlightSelectionDisplayProps> = ({ flightOptions, onSelectFlight, destination }) => {
    
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Select Your Flight to {destination}</h2>
                <p className="text-gray-500 mt-2">We found a few options for you. Please choose the one that works best.</p>
            </div>
            <div className="space-y-4">
                {flightOptions.map((flight, index) => (
                    <div key={index} className="flex flex-col md:flex-row items-stretch justify-between gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50/50 hover:shadow-md hover:border-blue-300 transition-all">
                        
                        {/* Airline Info */}
                        <div className="flex items-center gap-4 w-full md:w-1/3">
                             <PlaneIcon />
                             <div className="flex-grow">
                                <p className="font-bold text-gray-800">{flight.airline}</p>
                                <p className="text-sm text-gray-500">Flight {flight.flightNumber}</p>
                             </div>
                        </div>
                        
                        {/* Flight Details (Time, Stops, Duration) */}
                        <div className="flex flex-col sm:flex-row justify-around items-start sm:items-center gap-2 sm:gap-6 text-sm text-gray-600 w-full md:w-1/3 border-t md:border-t-0 md:border-x border-gray-200 py-2 md:py-0 px-0 md:px-6">
                            <div className="flex items-center gap-2" title="Departure and Arrival Times">
                                <ClockIcon />
                                <span>{formatTime(flight.departureTime)} &rarr; {formatTime(flight.arrivalTime)}</span>
                            </div>
                            <div className="flex items-center gap-2" title="Total Flight Duration">
                                <DurationIcon /> 
                                <span>{flight.duration}</span>
                            </div>
                            <div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${flight.stops === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                                </span>
                            </div>
                        </div>

                        {/* Price & Select Button */}
                        <div className="flex items-center gap-4 w-full md:w-1/3 justify-between md:justify-end">
                            <p className="font-semibold text-lg text-blue-600">{flight.price}</p>
                            <button 
                                onClick={() => onSelectFlight(flight)} 
                                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                            >
                                Select
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FlightSelectionDisplay;
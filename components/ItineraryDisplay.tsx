import React, { useState } from 'react';
import type { Itinerary, DailyPlan } from '../types';

// Icons as React Components for reusability and styling
const BuildingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4a2 2 0 012-2h6a2 2 0 012 2v4m-6 0h-2" /></svg>
);
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
);
const ActivityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
);
const CoffeeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5h8m-8 0a4 4 0 100 8h8V5M2 21h12a4 4 0 004-4v-4a4 4 0 00-4-4H6a4 4 0 00-4 4v4a4 4 0 004 4z" /></svg>
);
const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
);

// Helper component for a consistent card layout
const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-slate-100/80 p-5 rounded-lg border border-gray-200">
        <div className="flex items-center mb-4">
            <div className="text-blue-600">{icon}</div>
            <h3 className="ml-3 text-xl font-semibold text-gray-700">{title}</h3>
        </div>
        <div className="space-y-2 text-gray-600">
            {children}
        </div>
    </div>
);

// Collapsible component for each day in the plan
const DailyPlanDay: React.FC<{ day: DailyPlan }> = ({ day }) => {
    const [isOpen, setIsOpen] = useState(day.day === 1); // Open Day 1 by default

    return (
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200 transition-all duration-300">
            <button
                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-blue-50"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls={`day-${day.day}-content`}
            >
                <div className="flex flex-col">
                    <span className="font-bold text-lg text-gray-700">Day {day.day}</span>
                    <span className="text-sm text-blue-600/80">{day.theme}</span>
                </div>
                <ChevronDownIcon isOpen={isOpen} />
            </button>
            {isOpen && (
                <div id={`day-${day.day}-content`} className="p-4 border-t border-gray-200 space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Activities</h4>
                        <ul className="space-y-3">
                            {day.activities.map((activity, index) => (
                                <li key={index} className="flex items-start text-gray-600">
                                    <ActivityIcon />
                                    <div>
                                        <p>{activity.description}</p>
                                        <p className="text-sm text-gray-500">{activity.price}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {day.dining && (
                         <div className="pt-4 border-t border-gray-100">
                            <h4 className="font-semibold text-gray-700 mb-2">Dining Suggestions</h4>
                            <ul className="space-y-3">
                                <li className="flex items-start text-gray-600">
                                    <CoffeeIcon />
                                    <div>
                                        <p className="font-semibold">{day.dining.breakfast.name} <span className="text-gray-400 font-normal">{day.dining.breakfast.priceRange}</span></p>
                                        <p className="text-sm">{day.dining.breakfast.description}</p>
                                    </div>
                                </li>
                                <li className="flex items-start text-gray-600">
                                    <SunIcon />
                                    <div>
                                        <p className="font-semibold">{day.dining.lunch.name} <span className="text-gray-400 font-normal">{day.dining.lunch.priceRange}</span></p>
                                        <p className="text-sm">{day.dining.lunch.description}</p>
                                    </div>
                                </li>
                                 <li className="flex items-start text-gray-600">
                                    <MoonIcon />
                                    <div>
                                        <p className="font-semibold">{day.dining.dinner.name} <span className="text-gray-400 font-normal">{day.dining.dinner.priceRange}</span></p>
                                        <p className="text-sm">{day.dining.dinner.description}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface ItineraryDisplayProps {
    itinerary: Itinerary;
    onConfirm: () => void;
    isConfirming: boolean;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onConfirm, isConfirming }) => {
    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-lg space-y-8 animate-fade-in">
            <div className="text-center">
                <p className="text-lg text-gray-500">Your Proposed Itinerary To</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-blue-600">{itinerary.destination}</h2>
            </div>
            
            <InfoCard title="Accommodation" icon={<BuildingIcon />}>
                <p><strong>Name:</strong> {itinerary.accommodation.name}</p>
                <p><strong>Details:</strong> {itinerary.accommodation.details}</p>
                <p className="font-semibold text-blue-700">{itinerary.accommodation.price}</p>
            </InfoCard>

            {/* Daily Plan Section */}
            <div>
                 <div className="flex items-center mb-4">
                    <div className="text-blue-600"><CalendarIcon /></div>
                    <h3 className="ml-3 text-2xl font-semibold text-gray-700">Your Daily Adventure</h3>
                </div>
                <div className="space-y-4">
                    {itinerary.dailyPlans.sort((a, b) => a.day - b.day).map(day => (
                        <DailyPlanDay key={day.day} day={day} />
                    ))}
                </div>
            </div>
            
            <div className="text-center pt-6 border-t border-gray-200">
                <button 
                    onClick={onConfirm}
                    disabled={isConfirming}
                    className="w-full md:w-auto px-12 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105 disabled:bg-green-300 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isConfirming ? 'Confirming...' : 'Confirm & Get Booking Details'}
                </button>
            </div>
        </div>
    );
};

export default ItineraryDisplay;
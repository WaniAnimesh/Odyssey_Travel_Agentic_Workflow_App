import React, { useState, useEffect } from 'react';
import type { Itinerary, DailyPlan, Accommodation } from '../../types';
import MapView from './MapView';

// --- ICONS ---
const StayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4a2 2 0 012-2h6a2 2 0 012 2v4m-6 0h-2" /></svg>
);
const HighlightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const DiningSummaryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0c-.454-.303-.977-.454-1.5-.454V5.454c.523 0 1.046-.151 1.5-.454a2.704 2.704 0 013 0 2.704 2.704 0 003 0 2.704 2.704 0 013 0 2.704 2.704 0 003 0c.454.303.977.454 1.5.454v10.092zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const AccommodationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4a2 2 0 012-2h6a2 2 0 012 2v4m-6 0h-2" /></svg>;
const ActivitiesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const DiningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0c-.454-.303-.977-.454-1.5-.454V5.454c.523 0 1.046-.151 1.5-.454a2.704 2.704 0 013 0 2.704 2.704 0 003 0 2.704 2.704 0 013 0 2.704 2.704 0 003 0c.454.303.977.454 1.5.454v10.092zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.975-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.05 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.95-.69L11.049 2.927z" /></svg>;
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;


// --- SUB-COMPONENTS for Detailed View ---
const DetailCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <div className="space-y-4 text-gray-700 text-sm">
            {children}
        </div>
    </div>
);

// --- MAIN DISPLAY COMPONENT ---
interface ItineraryDisplayProps {
    itinerary: Itinerary;
    onAccept: () => void;
    isAccepting: boolean;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onAccept, isAccepting }) => {
    const [activeDay, setActiveDay] = useState<number>(1);
    const [isDetailedView, setIsDetailedView] = useState(false);

    // Reset to summary view when changing days
    useEffect(() => {
        setIsDetailedView(false);
    }, [activeDay]);
    
    const selectedDayPlan = itinerary.dailyPlans.find(p => p.day === activeDay);

    if (!selectedDayPlan) {
        return <div>Error: Could not find plan for day {activeDay}.</div>;
    }

    const dayHighlight = selectedDayPlan.activities.length > 0 ? selectedDayPlan.activities[0].description : "Relax and explore the area.";
    
    // --- RENDER FUNCTIONS for Summary vs. Detailed ---

    const renderSummaryView = () => (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-6 h-full flex flex-col justify-between">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Day {selectedDayPlan.day}: {selectedDayPlan.theme}</h2>
                <div className="space-y-5 mt-6 text-gray-700">
                    <div className="flex items-start gap-4">
                        <StayIcon />
                        <div>
                            <p className="font-semibold">Stay</p>
                            <p className="text-sm text-gray-600">{itinerary.accommodation.name}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <HighlightIcon />
                        <div>
                            <p className="font-semibold">Highlight</p>
                            <p className="text-sm text-gray-600">{dayHighlight}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <DiningSummaryIcon />
                        <div>
                            <p className="font-semibold">Dining</p>
                            <p className="text-sm text-gray-600">Enjoy local flavors for dinner.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="pt-4">
                <button 
                    onClick={() => setIsDetailedView(true)}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                >
                    View Full Day Plan
                </button>
            </div>
        </div>
    );
    
    const renderDetailedView = () => (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Day {selectedDayPlan.day}: {selectedDayPlan.theme}</h2>
            
            <DetailCard title="Accommodation" icon={<AccommodationIcon/>}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold">{itinerary.accommodation.name}</p>
                        <p className="mt-1">{itinerary.accommodation.details}</p>
                        <p className="font-semibold text-blue-700 mt-2">{itinerary.accommodation.price}</p>
                    </div>
                </div>
            </DetailCard>

             <DetailCard title="Activities & Sightseeing" icon={<ActivitiesIcon/>}>
                 {selectedDayPlan.activities.map((activity, index) => (
                    <div key={index} className="pb-3 border-b border-gray-100 last:border-b-0">
                        <p className="font-semibold text-gray-600">{["Morning", "Afternoon", "Evening"][index] || 'Activity'}</p>
                        <p>{activity.description}</p>
                    </div>
                 ))}
            </DetailCard>

             <DetailCard title="Dining Suggestions" icon={<DiningIcon/>}>
                <div>
                    <p className="font-semibold">Breakfast</p>
                    <p>{selectedDayPlan.dining.breakfast.name}: {selectedDayPlan.dining.breakfast.description}</p>
                </div>
                 <div>
                    <p className="font-semibold">Lunch</p>
                    <p>{selectedDayPlan.dining.lunch.name}: {selectedDayPlan.dining.lunch.description}</p>
                </div>
                 <div>
                    <p className="font-semibold">Dinner</p>
                    <p>{selectedDayPlan.dining.dinner.name}: {selectedDayPlan.dining.dinner.description}</p>
                </div>
            </DetailCard>

            {itinerary.authenticExperiences && itinerary.authenticExperiences.length > 0 && (
                <DetailCard title="Authentic Experiences" icon={<StarIcon/>}>
                    {itinerary.authenticExperiences.map((exp, index) => (
                         <div key={index} className="pb-3 border-b border-gray-100 last:border-b-0">
                            <p className="font-semibold">{exp.title}</p>
                            <p>{exp.description}</p>
                        </div>
                    ))}
                </DetailCard>
            )}

            {itinerary.unexpectedDiscoveries && itinerary.unexpectedDiscoveries.length > 0 && (
                <DetailCard title="Unexpected Discoveries" icon={<LightbulbIcon/>}>
                    {itinerary.unexpectedDiscoveries.map((exp, index) => (
                         <div key={index} className="pb-3 border-b border-gray-100 last:border-b-0">
                            <p className="font-semibold">{exp.title}</p>
                            <p>{exp.description}</p>
                        </div>
                    ))}
                </DetailCard>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                 <button 
                    onClick={onAccept}
                    disabled={isAccepting}
                    className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105 disabled:bg-green-300 disabled:cursor-not-allowed"
                >
                    {isAccepting ? 'Finding Flights...' : 'Accept Itinerary & Find Flights'}
                </button>
                 <button 
                    onClick={() => setIsDetailedView(false)}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors"
                >
                    Show Summary
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Day Selection Tabs */}
            <div className="bg-white p-1 rounded-xl shadow-md border border-gray-200">
                <nav className="flex space-x-1" aria-label="Tabs">
                    {itinerary.dailyPlans.sort((a,b) => a.day - b.day).map((plan) => (
                        <button
                            key={plan.day}
                            onClick={() => setActiveDay(plan.day)}
                            className={`flex-1 whitespace-nowrap py-3 px-2 text-center rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                                activeDay === plan.day
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
                            }`}
                        >
                           <div className="flex flex-col">
                                <span className="font-bold">Day {plan.day}</span>
                                <span className="text-xs font-normal hidden sm:block">{plan.theme}</span>
                           </div>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Daily Plan (Summary or Detailed) */}
                <div className="w-full">
                    {isDetailedView ? renderDetailedView() : renderSummaryView()}
                </div>

                {/* Right Side: Map */}
                <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 h-[400px] lg:h-full">
                    <MapView 
                        accommodation={itinerary.accommodation} 
                        activities={selectedDayPlan.activities} 
                    />
                </div>
            </div>
        </div>
    );
};

export default ItineraryDisplay;
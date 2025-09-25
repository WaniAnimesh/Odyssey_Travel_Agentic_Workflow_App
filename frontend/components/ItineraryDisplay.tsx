import React, { useState } from 'react';
import type { Itinerary, DailyPlan, Experience } from '../../types';
import MapView from './MapView';

// --- ICONS ---
const ItineraryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const PrepIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const StoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const StayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const HighlightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const DiningSummaryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L11 15l-4 6h10l-4-6 4.707-4.707a1 1 0 011.414 0L19 9" /></svg>;
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;


type MainTab = 'Itinerary & Plan' | 'Trip Preparation' | 'Visual Story';

const ExperienceCard: React.FC<{ title: string; icon: React.ReactNode; experiences: Experience[], borderColor: string, bgColor: string }> = ({ title, icon, experiences, borderColor, bgColor }) => (
    <div className={`${bgColor} p-6 rounded-xl shadow-md border-2 ${borderColor}`}>
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <div className="space-y-4">
            {experiences.map((exp, index) => (
                <div key={index} className="text-sm">
                    <p className="font-semibold text-gray-700">{exp.title}</p>
                    <p className="text-gray-600">{exp.description}</p>
                </div>
            ))}
        </div>
    </div>
);

const DayPlanSummary: React.FC<{ dayPlan: DailyPlan, accommodationName: string, onViewDetail: () => void }> = ({ dayPlan, accommodationName, onViewDetail }) => {
    const dayHighlight = dayPlan.activities.length > 0 ? dayPlan.activities[0].description : "Relax and explore the area.";
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-6 h-full flex flex-col justify-between">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Day {dayPlan.day}: {dayPlan.theme}</h2>
                <div className="space-y-5 mt-6 text-gray-700">
                    <div className="flex items-start gap-4">
                        <StayIcon />
                        <div>
                            <p className="font-semibold text-sm">Stay</p>
                            <p className="text-sm text-gray-600">{accommodationName}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <HighlightIcon />
                        <div>
                            <p className="font-semibold text-sm">Highlight</p>
                            <p className="text-sm text-gray-600">{dayHighlight}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <DiningSummaryIcon />
                        <div>
                            <p className="font-semibold text-sm">Dining</p>
                            <p className="text-sm text-gray-600">Enjoy local flavors for dinner.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-100">
                <button 
                    onClick={onViewDetail}
                    className="w-full px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    View Full Day Plan
                </button>
            </div>
        </div>
    )
};


const ItineraryDisplay: React.FC<{ itinerary: Itinerary }> = ({ itinerary }) => {
    const [mainTab, setMainTab] = useState<MainTab>('Itinerary & Plan');
    const [activeDay, setActiveDay] = useState<number>(1);
    
    const selectedDayPlan = itinerary.dailyPlans.find(p => p.day === activeDay);

    const formatCategoryTitle = (key: string) => {
        return key
            .replace(/([A-Z])/g, ' $1') // insert a space before all caps
            .replace(/^./, (str) => str.toUpperCase()); // uppercase the first character
    }

    const renderItineraryPlan = () => {
        if (!selectedDayPlan) return <div>Error: Day plan not found.</div>;
        return (
            <div className="space-y-6 mt-4 animate-fade-in">
                {/* Day Selection Tabs */}
                 <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 inline-block">
                    <nav className="flex space-x-1" aria-label="Tabs">
                        {itinerary.dailyPlans.sort((a,b) => a.day - b.day).map((plan) => (
                            <button
                                key={plan.day}
                                onClick={() => setActiveDay(plan.day)}
                                className={`flex-1 whitespace-nowrap py-2 px-4 text-center rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                                    activeDay === plan.day
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-blue-50'
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
                    <DayPlanSummary 
                        dayPlan={selectedDayPlan} 
                        accommodationName={itinerary.accommodation.name} 
                        onViewDetail={() => alert('Detailed view coming soon!')}
                    />
                    <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 h-[350px] lg:h-full">
                         <MapView 
                            accommodation={itinerary.accommodation} 
                            activities={selectedDayPlan.activities} 
                        />
                    </div>
                </div>

                {/* Experience Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ExperienceCard 
                        title="Authentic Local Experiences" 
                        icon={<StarIcon/>} 
                        experiences={itinerary.authenticExperiences} 
                        borderColor="border-orange-300"
                        bgColor="bg-orange-50/80"
                    />
                    <ExperienceCard 
                        title="Discover the Unexpected" 
                        icon={<LightbulbIcon/>} 
                        experiences={itinerary.unexpectedDiscoveries} 
                        borderColor="border-purple-300"
                        bgColor="bg-purple-50/80"
                    />
                </div>
            </div>
        )
    };

    const renderTripPreparation = () => (
         <div className="space-y-8 mt-6 animate-fade-in">
            {/* Contingency Plans */}
            <div className="bg-yellow-50/70 p-6 rounded-xl shadow-md border border-yellow-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Contingency Plans: Be Prepared</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {itinerary.contingencyPlans.map((contingency, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <WarningIcon />
                            <div>
                                <p className="font-semibold text-yellow-800">{contingency.risk}</p>
                                <p className="text-sm text-yellow-700">{contingency.plan}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Language Guide */}
            <div className="bg-purple-50/50 p-6 rounded-xl shadow-md border border-purple-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Language & Cultural Guide for {itinerary.languageGuide.languageName}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-6">
                    {itinerary.languageGuide.phrases.map((phrase, index) => (
                        <div key={index} className="border-b border-purple-100 pb-2">
                            <p className="text-xs text-gray-500">"{phrase.english}"</p>
                            <p className="text-lg font-semibold text-purple-800">{phrase.translation}</p>
                            <p className="text-sm text-purple-600 italic">{phrase.phonetic}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Packing List */}
            <div className="bg-green-50/50 p-6 rounded-xl shadow-md border border-green-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">AI-Powered Packing List</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                    {Object.entries(itinerary.packingList).map(([category, items]) => (
                        <div key={category}>
                            <h4 className="font-semibold text-green-800 mb-2 border-b border-green-200 pb-1">{formatCategoryTitle(category)}</h4>
                            <ul className="space-y-2 text-gray-700">
                                {(items as string[]).map((item, index) => (
                                    <li key={index} className="flex items-center">
                                        <input type="checkbox" readOnly className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3 cursor-pointer" />
                                        <label>{item}</label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderVisualStory = () => (
         <div className="mt-6 bg-white p-10 rounded-xl shadow-md border border-gray-200 text-center">
            <h3 className="text-2xl font-bold text-gray-800">Visual Story</h3>
            <p className="text-gray-500 mt-2">This feature is coming soon! It will generate a beautiful visual preview of your trip.</p>
        </div>
    );

    const mainTabs: { name: MainTab, icon: React.ReactNode }[] = [
        { name: 'Itinerary & Plan', icon: <ItineraryIcon /> },
        { name: 'Trip Preparation', icon: <PrepIcon /> },
        { name: 'Visual Story', icon: <StoryIcon /> },
    ];

    return (
        <div className="w-full">
            {/* Main Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {mainTabs.map(tab => (
                        <button
                            key={tab.name}
                            onClick={() => setMainTab(tab.name)}
                            className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none ${
                                mainTab === tab.name
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.icon} {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            
            {/* Content based on tab */}
            {mainTab === 'Itinerary & Plan' && renderItineraryPlan()}
            {mainTab === 'Trip Preparation' && renderTripPreparation()}
            {mainTab === 'Visual Story' && renderVisualStory()}
        </div>
    );
};

export default ItineraryDisplay;
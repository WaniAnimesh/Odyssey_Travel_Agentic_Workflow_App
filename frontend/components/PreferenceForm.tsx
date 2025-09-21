import React, { useState } from 'react';
import type { UserPreferences } from '../../types';

interface PreferenceFormProps {
    onSubmit: (prefs: UserPreferences) => void;
    isLoading: boolean;
    error: string | null;
}

const interestsOptions = ["History", "Art & Culture", "Food & Cuisine", "Nature & Outdoors", "Adventure & Sports", "Nightlife", "Shopping", "Relaxation", "Technology"];
const travelStyleOptions = ["Luxury", "Budget-Friendly", "Family-Friendly", "Romantic Getaway", "Backpacking", "Cultural Immersion"];
const paceOptions = ["Relaxed", "Balanced", "Action-packed"];

const FormLabel: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const PreferenceForm: React.FC<PreferenceFormProps> = ({ onSubmit, isLoading, error }) => {
    const [prefs, setPrefs] = useState<UserPreferences>({
        departure: '',
        destination: '',
        startDate: '',
        endDate: '',
        budget: 'Moderate',
        travelers: 'Solo',
        travelStyle: ['Cultural Immersion'],
        interests: ['History', 'Food & Cuisine'],
        pace: 'Balanced',
        specificNeeds: '',
    });

    const getTodayString = () => {
        return new Date().toISOString().split('T')[0];
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        setPrefs(prev => ({
            ...prev,
            startDate: newStartDate,
            // Reset end date if it's before the new start date
            endDate: prev.endDate && prev.endDate < newStartDate ? '' : prev.endDate,
        }));
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPrefs(prev => ({ ...prev, [name]: value }));
    };

    const handleTagToggle = (field: 'interests' | 'travelStyle', value: string) => {
        setPrefs(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value],
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(prefs);
    };
    
    // Validation logic
    const isEndDateInvalid = !!prefs.startDate && !!prefs.endDate && new Date(prefs.endDate) < new Date(prefs.startDate);
    const isFormIncomplete = !prefs.departure || !prefs.destination || !prefs.startDate || !prefs.endDate;
    const isSubmitDisabled = isLoading || isFormIncomplete || isEndDateInvalid;

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Plan Your Perfect Trip</h2>
                <p className="text-gray-500 mt-2">Tell us your travel dreams, and our AI will craft the perfect itinerary for you.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {error && (
                    <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-lg text-sm">
                        <p className="font-semibold">Something went wrong</p>
                        <p>{error}</p>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <FormLabel htmlFor="departure">Departure</FormLabel>
                        <input type="text" name="departure" id="departure" value={prefs.departure} onChange={handleChange} placeholder="e.g., San Francisco" required className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <FormLabel htmlFor="destination">Destination</FormLabel>
                        <input type="text" name="destination" id="destination" value={prefs.destination} onChange={handleChange} placeholder="e.g., Kyoto, Japan" required className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <FormLabel htmlFor="startDate">Start Date</FormLabel>
                        <input type="date" name="startDate" id="startDate" value={prefs.startDate} onChange={handleStartDateChange} min={getTodayString()} required className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <FormLabel htmlFor="endDate">End Date</FormLabel>
                        <input type="date" name="endDate" id="endDate" value={prefs.endDate} onChange={handleChange} min={prefs.startDate || getTodayString()} disabled={!prefs.startDate} required className={`mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${isEndDateInvalid ? 'border-red-500 ring-red-500' : ''}`} />
                         {isEndDateInvalid && <p className="text-xs text-red-600 mt-1">End date cannot be before start date.</p>}
                    </div>
                     <div>
                        <FormLabel htmlFor="budget">Budget</FormLabel>
                        <select name="budget" id="budget" value={prefs.budget} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            <option>Budget</option>
                            <option>Moderate</option>
                            <option>Luxury</option>
                        </select>
                    </div>
                    <div>
                        <FormLabel htmlFor="travelers">Travelers</FormLabel>
                        <select name="travelers" id="travelers" value={prefs.travelers} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            <option>Solo</option>
                            <option>Couple</option>
                            <option>Family with kids</option>
                            <option>Group of friends</option>
                        </select>
                    </div>
                </div>

                <div>
                    <FormLabel htmlFor="interests">Interests</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {interestsOptions.map(interest => (
                            <button key={interest} type="button" onClick={() => handleTagToggle('interests', interest)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${prefs.interests.includes(interest) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                {interest}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <FormLabel htmlFor="travelStyle">Travel Style</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {travelStyleOptions.map(style => (
                            <button key={style} type="button" onClick={() => handleTagToggle('travelStyle', style)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${prefs.travelStyle.includes(style) ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                {style}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <FormLabel htmlFor="pace">Desired Pace</FormLabel>
                    <div className="mt-2 flex bg-gray-100 rounded-lg p-1">
                        {paceOptions.map(option => (
                             <button key={option} type="button" onClick={() => setPrefs(p => ({...p, pace: option}))} className={`w-full py-2 text-sm font-medium rounded-md transition-all ${prefs.pace === option ? 'bg-white shadow text-blue-600' : 'bg-transparent text-gray-600 hover:bg-white/50'}`}>
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <FormLabel htmlFor="specificNeeds">Specific Needs or Requests</FormLabel>
                    <textarea name="specificNeeds" id="specificNeeds" value={prefs.specificNeeds} onChange={handleChange} rows={3} placeholder="e.g., accessibility requirements, dietary restrictions" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>

                <div className="text-center pt-2">
                    <button type="submit" disabled={isSubmitDisabled} className="w-full md:w-auto px-12 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-blue-300 disabled:cursor-not-allowed disabled:transform-none">
                        {isLoading ? 'Generating Draft Itinerary...' : 'Create My Itinerary'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PreferenceForm;
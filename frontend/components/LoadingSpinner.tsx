
import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white/80 border border-gray-200 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="mt-4 text-lg text-gray-700">Agents are planning your trip...</p>
            <p className="text-sm text-gray-500">This may take a moment.</p>
        </div>
    );
};

export default LoadingSpinner;

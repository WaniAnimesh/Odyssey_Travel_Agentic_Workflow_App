import React from 'react';
import type { BookingDetails, FlightOption, PackingList } from '../types';

const PlaneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);
const BuildingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4a2 2 0 012-2h6a2 2 0 012 2v4m-6 0h-2" /></svg>
);
const TicketIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
);
const SuitcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

interface BookingDetailsDisplayProps {
    details: BookingDetails;
    destination: string;
    flight: FlightOption;
    packingList: PackingList;
}

const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-slate-100/80 p-5 rounded-lg border border-gray-200 h-full">
        <div className="flex items-center mb-4">
            <div className="text-blue-600">{icon}</div>
            <h3 className="ml-3 text-xl font-semibold text-gray-700">{title}</h3>
        </div>
        <div className="space-y-2 text-gray-600">
            {children}
        </div>
    </div>
);

const BookingCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
        <div className="flex items-center mb-4">
            <div className="text-blue-600">{icon}</div>
            <h3 className="ml-3 text-xl font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="space-y-3 text-gray-700">
            {children}
        </div>
    </div>
);

const BookingDetailsDisplay: React.FC<BookingDetailsDisplayProps> = ({ details, destination, flight, packingList }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
                <h2 className="text-3xl sm:text-4xl font-bold text-green-600">Your Trip is Confirmed!</h2>
                <p className="text-lg text-gray-600 mt-2">Here are your booking details and final prep for your adventure to <span className="font-semibold">{destination}</span>.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InfoCard title="Final Flight Details" icon={<PlaneIcon />}>
                    <p><strong>Airline:</strong> {flight.airline} ({flight.flightNumber})</p>
                    <p><strong>Departure:</strong> {new Date(flight.departureTime).toLocaleString()}</p>
                    <p><strong>Arrival:</strong> {new Date(flight.arrivalTime).toLocaleString()}</p>
                    <p className="font-semibold text-blue-700">{flight.price}</p>
                </InfoCard>

                 <InfoCard title="Personalized Packing List" icon={<SuitcaseIcon />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        {Object.entries(packingList).map(([category, items]) => (
                            <div key={category}>
                                <h4 className="font-semibold text-gray-700 capitalize mb-2">{category.replace('_', ' ')}</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {(items as string[]).map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </InfoCard>
            </div>

            <div className="text-center pt-4">
                 <h3 className="text-2xl font-semibold text-gray-800">Booking Confirmations</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Flight Booking */}
                <BookingCard title="Flight Confirmation" icon={<PlaneIcon />}>
                    <div>
                        <p className="font-semibold">Confirmation Code:</p>
                        <p className="font-mono bg-gray-100 px-2 py-1 rounded text-blue-700">{details.flightBooking.confirmationCode}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Manage Booking:</p>
                        <a href="#" className="text-blue-500 hover:underline break-all" onClick={(e) => e.preventDefault()}>{details.flightBooking.bookingLink}</a>
                    </div>
                    <div className="flex items-start pt-2">
                        <CheckCircleIcon />
                        <p className="text-sm text-gray-600">{details.flightBooking.notes}</p>
                    </div>
                </BookingCard>

                {/* Accommodation Booking */}
                <BookingCard title="Accommodation Confirmation" icon={<BuildingIcon />}>
                     <div>
                        <p className="font-semibold">Confirmation Code:</p>
                        <p className="font-mono bg-gray-100 px-2 py-1 rounded text-blue-700">{details.accommodationBooking.confirmationCode}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Manage Booking:</p>
                        <a href="#" className="text-blue-500 hover:underline break-all" onClick={(e) => e.preventDefault()}>{details.accommodationBooking.bookingLink}</a>
                    </div>
                    <div className="flex items-start pt-2">
                        <CheckCircleIcon />
                        <p className="text-sm text-gray-600">{details.accommodationBooking.notes}</p>
                    </div>
                </BookingCard>

                {/* Activity Bookings */}
                {details.activityBookings.map((activity, index) => (
                    <BookingCard key={index} title={activity.activityDescription} icon={<TicketIcon />}>
                         <div>
                            <p className="font-semibold">Confirmation Code:</p>
                            <p className="font-mono bg-gray-100 px-2 py-1 rounded text-blue-700">{activity.bookingInfo.confirmationCode}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Manage Booking:</p>
                            <a href="#" className="text-blue-500 hover:underline break-all" onClick={(e) => e.preventDefault()}>{activity.bookingInfo.bookingLink}</a>
                        </div>
                        <div className="flex items-start pt-2">
                            <CheckCircleIcon />
                            <p className="text-sm text-gray-600">{activity.bookingInfo.notes}</p>
                        </div>
                    </BookingCard>
                ))}
            </div>
        </div>
    );
};

export default BookingDetailsDisplay;
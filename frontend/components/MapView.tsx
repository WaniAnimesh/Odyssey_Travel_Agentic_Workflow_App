import React, { useEffect, useRef } from 'react';
import { loadGoogleMapsAPI } from '../../utils';
import type { Accommodation, Activity } from '../../types';

interface MapViewProps {
    accommodation: Accommodation;
    activities: Activity[];
}

// Minimalist map styles to match the requested UX
const mapStyles = [
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }]
    },
    {
        "featureType": "administrative.country",
        "elementType": "geometry",
        "stylers": [{ "visibility": "on" }]
    },
    {
        "featureType": "administrative.country",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#a0a4a5" }]
    },
    {
        "featureType": "administrative.province",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#62838e" }]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#dde3e3" }]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#3f4a51" }, { "weight": "0.30" }]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [{ "visibility": "simplified" }]
    },
    {
        "featureType": "poi.attraction",
        "elementType": "all",
        "stylers": [{ "visibility": "on" }]
    },
    {
        "featureType": "poi.business",
        "elementType": "all",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "poi.government",
        "elementType": "all",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "all",
        "stylers": [{ "visibility": "on" }]
    },
    {
        "featureType": "poi.place_of_worship",
        "elementType": "all",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "poi.school",
        "elementType": "all",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "poi.sports_complex",
        "elementType": "all",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [{ "saturation": "-100" }, { "visibility": "on" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [{ "visibility": "on" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#b4b4b4" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#b4b4b4" }, { "lightness": "0" }]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#ffffff" }]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "black" }]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [{ "visibility": "simplified" }]
    },
    {
        "featureType": "transit.station",
        "elementType": "all",
        "stylers": [{ "visibility": "on" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#a3c7df" }]
    }
];


const MapView: React.FC<MapViewProps> = ({ accommodation, activities }) => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let map: any; // google.maps.Map
        let directionsService: any;
        let directionsRenderer: any;
        
        // This ensures we don't re-initialize the map unnecessarily
        if (!mapRef.current || mapRef.current.innerHTML !== "") {
            // If the div isn't empty, assume map is initialized.
            // A more robust way in larger apps would be to store map instance in state or ref.
        }

        loadGoogleMapsAPI().then(() => {
            if (!mapRef.current) return;

            const mapCenter = activities.length > 0 ? activities[0].location : accommodation.location;

            map = new window.google.maps.Map(mapRef.current, {
                center: mapCenter,
                zoom: 12,
                disableDefaultUI: true,
                zoomControl: true,
                styles: mapStyles,
            });
            
            directionsService = new window.google.maps.DirectionsService();
            directionsRenderer = new window.google.maps.DirectionsRenderer({
                map: map,
                suppressMarkers: true, // We will add our own custom markers
                polylineOptions: {
                    strokeColor: '#4A90E2',
                    strokeOpacity: 0.9,
                    strokeWeight: 6
                }
            });

            // Create a bounds object to fit all markers on the map
            const bounds = new window.google.maps.LatLngBounds();

            // Add accommodation marker
            const accommodationMarker = new window.google.maps.Marker({
                position: accommodation.location,
                map: map,
                title: `Stay: ${accommodation.name}`,
                 icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#4285F4",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "white",
                }
            });
            bounds.extend(accommodationMarker.getPosition());
            
            // Add activity markers
            activities.forEach((activity, index) => {
                 const activityMarker = new window.google.maps.Marker({
                    position: activity.location,
                    map: map,
                    title: activity.description,
                    label: {
                        text: `${index + 1}`,
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "bold",
                    },
                });
                 bounds.extend(activityMarker.getPosition());
            });

            // Calculate and draw the route if there are activities
            if (activities.length > 0) {
                const waypoints = activities.slice(0, activities.length).map(a => ({ 
                    location: new window.google.maps.LatLng(a.location.latitude, a.location.longitude),
                    stopover: true 
                }));

                const request = {
                    origin: new window.google.maps.LatLng(accommodation.location.latitude, accommodation.location.longitude),
                    destination: new window.google.maps.LatLng(accommodation.location.latitude, accommodation.location.longitude),
                    waypoints: waypoints,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                    optimizeWaypoints: true
                };
                
                directionsService.route(request, (result: any, status: any) => {
                    if (status === 'OK') {
                        directionsRenderer.setDirections(result);
                    } else {
                        console.warn(`Directions request failed due to ${status}. This can happen if points are too close or routes are unavailable.`);
                        // If directions fail, still fit the map to markers.
                        map.fitBounds(bounds);
                    }
                });
            } else {
                 map.fitBounds(bounds);
            }
            
            if (activities.length === 1) {
                map.setZoom(14); // Zoom in more if there's only one activity
            }


        }).catch(err => console.error("Error loading Google Maps", err));

    }, [accommodation, activities]); // Rerun effect when the selected day's accommodation or activities change

    return <div ref={mapRef} className="w-full h-full rounded-lg" style={{ minHeight: '400px' }} aria-label="Map of daily activities" />;
};

export default MapView;
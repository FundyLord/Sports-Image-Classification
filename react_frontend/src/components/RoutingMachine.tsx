import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

interface RoutingMachineProps {
  source: [number, number] | null;
  destination: [number, number] | null;
  onRouteFound?: (summary: { totalDistance: number; totalTime: number }) => void;
  onRouteClear?: () => void;
}

const RoutingMachine: React.FC<RoutingMachineProps> = ({ 
  source, 
  destination, 
  onRouteFound,
  onRouteClear 
}) => {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    // Clean up previous route if it exists
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
      if (onRouteClear) onRouteClear();
    }

    // Only create route if both source and destination are provided
    if (!source || !destination) {
      return;
    }

    // Create new routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(source[0], source[1]),
        L.latLng(destination[0], destination[1])
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      // Use free OSRM demo server (no API key needed)
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      lineOptions: {
        styles: [
          { color: '#6366f1', weight: 6, opacity: 0.8 },
          { color: '#8b5cf6', weight: 4, opacity: 1 }
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error - createMarker exists but types are incomplete
      createMarker: function(i: number, waypoint: L.Routing.Waypoint) {
        const isStart = i === 0;
        const icon = L.divIcon({
          html: `<div style="
            background: ${isStart ? '#22c55e' : '#ef4444'};
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          className: 'routing-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        return L.marker(waypoint.latLng, { icon });
      }
    });

    // Handle route found event
    routingControl.on('routesfound', function(e: L.Routing.RoutingResultEvent) {
      const routes = e.routes;
      if (routes.length > 0 && onRouteFound) {
        const summary = routes[0].summary;
        if (summary) {
          onRouteFound({
            totalDistance: summary.totalDistance,
            totalTime: summary.totalTime
          });
        }
      }
    });

    // Handle routing errors
    routingControl.on('routingerror', function(e: unknown) {
      console.error('Routing error:', e);
    });

    routingControl.addTo(map);
    routingControlRef.current = routingControl;

    // Cleanup on unmount or when dependencies change
    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [map, source, destination, onRouteFound, onRouteClear]);

  return null;
};

export default RoutingMachine;

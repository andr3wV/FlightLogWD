import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  Collapse, // Import Collapse
} from '@mui/material';
import { 
  Flight, 
  Speed, 
  Height, 
  DirectionsRun,
  ExpandLess, // Import ExpandLess icon
  ExpandMore, // Import ExpandMore icon
} from '@mui/icons-material';
import UpcomingFlightIcon from '../../assets/static/images/airplane.png';
import LiveFlightIcon from '../../assets/static/images/airplane-green.png';
import data from '../../assets/static/data/active.json';
import { fetchAirportLongLatByCode } from '../../services/AirlineService';
import { fetchAllFlights } from '../../services/flightService';
import * as turf from '@turf/turf';

const FlightMap2D = () => {
  // Combined state for active and upcoming flights
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [flightPaths, setFlightPaths] = useState([]);
  const mapRef = useRef(null);

  // State for collapsible sections
  const [activeOpen, setActiveOpen] = useState(true);
  const [upcomingOpen, setUpcomingOpen] = useState(true);

  const handleActiveClick = () => {
    setActiveOpen(!activeOpen);
  };

  const handleUpcomingClick = () => {
    setUpcomingOpen(!upcomingOpen);
  };

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        // Fetch active flights from JSON
        const activeFlights = data.data.filter(
          (flight) =>
            flight.live !== null &&
            flight.live.latitude != null &&
            flight.live.longitude != null
        );

        // Normalize active flights to include a 'type' property
        const normalizedActiveFlights = activeFlights.map((flight) => ({
          ...flight,
          type: 'active',
        }));

        // Fetch upcoming flights from API or service
        const allFlights = await fetchAllFlights();
        const upcomingFlightsRaw = allFlights
          .filter((flight) => new Date(flight.departureDate) > new Date())
          .sort(
            (a, b) =>
              new Date(a.departureDate) - new Date(b.departureDate)
          ); // Sort by soonest departure time

        // Fetch departure and arrival coordinates for upcoming flights
        const upcomingFlights = await Promise.all(
          upcomingFlightsRaw.map(async (flight) => {
            const departure = await fetchAirportLongLatByCode(
              flight.departureAirportCode
            );
            const arrival = await fetchAirportLongLatByCode(
              flight.arrivalAirportCode
            );
            return {
              ...flight,
              departure: departure, // Assume { latitude, longitude, iata, airport }
              arrival: arrival, // Assume { latitude, longitude, iata, airport }
              type: 'upcoming',
            };
          })
        );

        console.log("Upcoming11: ", upcomingFlights);

        // Normalize upcoming flights to match active flights schema where possible
        const normalizedUpcomingFlights = upcomingFlights.map((flight) => ({
          flight: {
            iata: flight.flightNumber,
            airline: {
              name: flight.airline,
            },
          },
          departure: flight.departure, // { latitude, longitude, iata, airport }
          arrival: flight.arrival, // { latitude, longitude, iata, airport }
          arrivalAirport: flight.arrivalAirportCode,
          departureAirport: flight.departureAirportCode,
          live: {
            latitude: flight.departure[0].latitude, // Corrected to use object properties directly
            longitude: flight.departure[0].longitude,
            speed_horizontal: 0, // No speed info for upcoming flights
            altitude: 0, // No altitude info for upcoming flights
            is_ground: true, // Upcoming flights are on ground
            updated: flight.departureDate, // Use departureDate as the last update
          },
          flight_status: 'Scheduled',
          passengerName: flight.passengerName,
          departureDate: flight.departureDate,
          arrivalDate: flight.arrivalDate,
          id: flight.id,
          type: 'upcoming', // Distinguish flight type
        }));

        // Combine active and upcoming flights
        const combinedFlights = [
          ...normalizedActiveFlights,
          ...normalizedUpcomingFlights,
        ];
        console.log('Active Flights:', normalizedActiveFlights);
        console.log('Upcoming Flights:', normalizedUpcomingFlights);

        setFlights(combinedFlights);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching flight data:', error);
        setLoading(false);
      }
    };

    fetchFlights();
  }, []);

  const activeFlightIcon = new Icon({
    iconUrl: LiveFlightIcon,
    iconSize: [32, 32],
  });

  const upcomingFlightIcon = new Icon({
    iconUrl: UpcomingFlightIcon,
    iconSize: [32, 32],
  });

  // Helper function to generate arc coordinates
  const generateArcCoordinates = (from, to, numPoints = 50) => {
    const fromPoint = turf.point([from[1], from[0]]);
    const toPoint = turf.point([to[1], to[0]]);
    const line = turf.greatCircle(fromPoint, toPoint, { npoints: numPoints });
    return line.geometry.coordinates.map(coord => [coord[1], coord[0]]);
  };

  const handleFlightClick = (flight) => {
    setSelectedFlight(flight);
    if (mapRef.current) {
      const position = [flight.live.latitude, flight.live.longitude];
      mapRef.current.flyTo(position, 8);
    }

    if (flight.type === 'upcoming') {
      const from = [
        flight.departure[0].latitude,
        flight.departure[0].longitude,
      ];
      const to = [
        flight.arrival[0].latitude,
        flight.arrival[0].longitude,
      ];
      const arc = generateArcCoordinates(from, to);
      setFlightPaths(prevPaths => {
        const exists = prevPaths.find(path => path.id === flight.id);
        if (exists) {
          // Remove the path
          return prevPaths.filter(path => path.id !== flight.id);
        } else {
          // Add the new path
          return [...prevPaths, { id: flight.id, coordinates: arc }];
        }
      });
    }
  };

  const MapController = () => {
    const map = useMap();
    mapRef.current = map;
    return null;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Separate flights by type
  const activeFlights = flights.filter(flight => flight.type === 'active');
  const upcomingFlights = flights.filter(flight => flight.type === 'upcoming');

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <Paper
        elevation={3}
        sx={{ width: '300px', overflowY: 'auto', p: 2 }}
      >
        {/* Upcoming Flights Section */}
        <List component="nav" aria-labelledby="upcoming-flights-section">
          <ListItemButton onClick={handleUpcomingClick}>
            <ListItemText primary={`Upcoming Flights (${upcomingFlights.length})`} />
            {upcomingOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={upcomingOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {upcomingFlights.map((flight, index) => (
                <React.Fragment key={`upcoming-${flight.flight.iata}-${flight.id || index}`}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleFlightClick(flight)}>
                      <ListItemText
                        primary={`${flight.flight.airline.name} - Flight ${flight.flight.iata}`}
                        secondary={`${flight.departureAirport} → ${flight.arrivalAirport}`}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < upcomingFlights.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {upcomingFlights.length === 0 && (
                <ListItem>
                  <ListItemText primary="No Upcoming Flights" />
                </ListItem>
              )}
            </List>
          </Collapse>
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Active Flights Section */}
        <List component="nav" aria-labelledby="active-flights-section">
          <ListItemButton onClick={handleActiveClick}>
            <ListItemText primary={`Live Flights (${activeFlights.length})`} />
            {activeOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={activeOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {activeFlights.map((flight, index) => (
                <React.Fragment key={`active-${flight.flight.iata}-${flight.id || index}`}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleFlightClick(flight)}>
                      <ListItemText
                        primary={`${flight.airline.name} ${flight.flight.iata}`}
                        secondary={`${flight.departure.iata} → ${flight.arrival.iata}`}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < activeFlights.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {activeFlights.length === 0 && (
                <ListItem>
                  <ListItemText primary="No Active Flights" />
                </ListItem>
              )}
            </List>
          </Collapse>
        </List>
      </Paper>
      <Box sx={{ flexGrow: 1 }}>
        <MapContainer
          center={[30, 0]}
          zoom={3}
          style={{ height: '100%', width: '100%' }}
        >
          <MapController />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Render Flight Paths */}
          {flightPaths.map(path => (
            <Polyline
              key={`path-${path.id}`}
              positions={path.coordinates}
              color="blue" // Choose a color that distinguishes flight paths
              weight={2}
              dashArray="5,10" // Optional: Make the line dashed
            />
          ))}

          {/* Existing Markers */}
          {flights.map((flight, index) => {
            const position = [flight.live.latitude, flight.live.longitude];
            const isUpcoming = flight.type === 'upcoming';
            const icon = isUpcoming ? upcomingFlightIcon : activeFlightIcon;
            return (
              <Marker
                key={`${flight.type}-${flight.flight.iata}-${flight.id || index}`}
                position={position}
                icon={icon}
              >
                <Popup>
                  <Card sx={{ minWidth: 275, maxWidth: 400 }}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        component="div"
                        gutterBottom
                      >
                        {flight.type === 'active'
                          ? `${flight.airline.name} - ${flight.flight.iata}`
                          : `${flight.flight.airline.name} - Flight ${flight.flight.iata}`}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            From:{' '}
                            {flight.type === 'active'
                              ? `${flight.departure.airport} (${flight.departure.iata})`
                              : `${flight.departureAirport}`}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            To:{' '}
                            {flight.type === 'active'
                              ? `${flight.arrival.airport} (${flight.arrival.iata})`
                              : `${flight.arrivalAirport}`}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          icon={<Flight />}
                          label={`Status: ${
                            flight.type === 'active'
                              ? flight.flight_status
                              : flight.type === 'upcoming'
                              ? 'Scheduled'
                              : 'Unknown'
                          }`}
                          sx={{ mr: 1, mb: 1 }}
                        />
                        {flight.type === 'active' && (
                          <>
                            <Chip
                              icon={<Speed />}
                              label={`Speed: ${Math.round(
                                flight.live.speed_horizontal
                              )} km/h`}
                              sx={{ mr: 1, mb: 1 }}
                            />
                            <Chip
                              icon={<Height />}
                              label={`Altitude: ${Math.round(
                                flight.live.altitude
                              )} m`}
                              sx={{ mr: 1, mb: 1 }}
                            />
                            <Chip
                              icon={<DirectionsRun />}
                              label={`On Ground: ${
                                flight.live.is_ground ? 'Yes' : 'No'
                              }`}
                              sx={{ mb: 1 }}
                            />
                          </>
                        )}
                        {flight.type === 'upcoming' && (
                          <>
                            <Chip
                              icon={<Flight />}
                              label={`Passenger: ${flight.passengerName}`}
                              sx={{ mr: 1, mb: 1 }}
                            />
                            <Chip
                              icon={<DirectionsRun />}
                              label={`Status: On Ground`}
                              sx={{ mb: 1 }}
                            />
                          </>
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        {flight.type === 'active'
                          ? `Last Updated: ${new Date(
                              flight.live.updated
                            ).toLocaleString()}`
                          : `Departure: ${new Date(
                              flight.departureDate
                            ).toLocaleString()}`}
                      </Typography>
                    </CardContent>
                  </Card>
                </Popup>
              </Marker>
            );
          })}

          {/* Selected Flight Popup */}
          {selectedFlight && (
            <Marker
              position={[selectedFlight.live.latitude, selectedFlight.live.longitude]}
              icon={selectedFlight.type === 'upcoming' ? upcomingFlightIcon : activeFlightIcon}
            >
              <Popup autoOpen>
                <Card sx={{ minWidth: 275, maxWidth: 400 }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      component="div"
                      gutterBottom
                    >
                      {selectedFlight.type === 'active'
                        ? `${selectedFlight.airline.name} - ${selectedFlight.flight.iata}`
                        : `${selectedFlight.flight.airline.name} - Flight ${selectedFlight.flight.iata}`}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          From:{' '}
                          {selectedFlight.type === 'active'
                            ? `${selectedFlight.departure.airport} (${selectedFlight.departure.iata})`
                            : `${selectedFlight.departureAirport}`}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          To:{' '}
                          {selectedFlight.type === 'active'
                            ? `${selectedFlight.arrival.airport} (${selectedFlight.arrival.iata})`
                            : `${selectedFlight.arrivalAirport}`}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        icon={<Flight />}
                        label={`Status: ${
                          selectedFlight.type === 'active'
                            ? selectedFlight.flight_status
                            : 'Scheduled'
                        }`}
                        sx={{ mr: 1, mb: 1 }}
                      />
                      {selectedFlight.type === 'active' && (
                        <>
                          <Chip
                            icon={<Speed />}
                            label={`Speed: ${Math.round(
                              selectedFlight.live.speed_horizontal
                            )} km/h`}
                            sx={{ mr: 1, mb: 1 }}
                          />
                          <Chip
                            icon={<Height />}
                            label={`Altitude: ${Math.round(
                              selectedFlight.live.altitude
                            )} m`}
                            sx={{ mr: 1, mb: 1 }}
                          />
                          <Chip
                            icon={<DirectionsRun />}
                            label={`On Ground: ${
                              selectedFlight.live.is_ground ? 'Yes' : 'No'
                            }`}
                            sx={{ mb: 1 }}
                          />
                        </>
                      )}
                      {selectedFlight.type === 'upcoming' && (
                        <>
                          <Chip
                            icon={<Flight />}
                            label={`Passenger: ${selectedFlight.passengerName}`}
                            sx={{ mr: 1, mb: 1 }}
                          />
                          <Chip
                            icon={<DirectionsRun />}
                            label={`Status: On Ground`}
                            sx={{ mb: 1 }}
                          />
                        </>
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      {selectedFlight.type === 'active'
                        ? `Last Updated: ${new Date(
                            selectedFlight.live.updated
                          ).toLocaleString()}`
                        : `Departure: ${new Date(
                            selectedFlight.departureDate
                          ).toLocaleString()}`}
                    </Typography>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default FlightMap2D;
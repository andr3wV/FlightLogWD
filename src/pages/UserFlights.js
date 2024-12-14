import React, { useEffect, useState, useContext } from 'react';
import {
  Container,
  Typography,
  List,
  CircularProgress,
  Box,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Divider,
} from '@mui/material';
import Flight from '../components/flights/Flight';
import { fetchUserFlights } from '../services/flightService';
import { AuthContext } from '../contexts/AuthContext';

const UserFlights = () => {
  // AuthContext provides user authentication information
  const { user, loading: authLoading } = useContext(AuthContext);

  // State variables for managing flights, filters, and UI feedback
  const [flights, setFlights] = useState([]); // All flights
  const [filteredFlights, setFilteredFlights] = useState([]); // Filtered flights to display
  const [loading, setLoading] = useState(true); // Loading indicator
  const [error, setError] = useState(null); // Error message
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  }); // Snackbar feedback

  // State variables for filters
  const [sortOption, setSortOption] = useState('earliestDeparture');
  const [passengerNames, setPassengerNames] = useState([]);
  const [selectedPassenger, setSelectedPassenger] = useState('');
  const [airlines, setAirlines] = useState([]);
  const [selectedAirline, setSelectedAirline] = useState('');
  const [departureAirports, setDepartureAirports] = useState([]);
  const [selectedDepartureAirport, setSelectedDepartureAirport] = useState('');
  const [arrivalAirports, setArrivalAirports] = useState([]);
  const [selectedArrivalAirport, setSelectedArrivalAirport] = useState('');
  const [selectedDepartureDate, setSelectedDepartureDate] = useState('');
  const [selectedArrivalDate, setSelectedArrivalDate] = useState('');

  // Effect to load user flights when the component mounts
  useEffect(() => {
    const loadUserFlights = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch flights from the service
        const userFlights = await fetchUserFlights(user);
        setFlights(userFlights);
        setFilteredFlights(sortFlights(userFlights, 'earliestDeparture')); // Sort by default

        // Sort flights by default sort option
        setFilteredFlights(sortFlights(userFlights, 'earliestDeparture'));

        // Extract unique filter options from flights
        setPassengerNames(Array.from(new Set(userFlights.map((flight) => flight.passengerName))));
        setAirlines(Array.from(new Set(userFlights.map((flight) => flight.airline))));
        setDepartureAirports(Array.from(new Set(userFlights.map((flight) => flight.departureAirportCode))));
        setArrivalAirports(Array.from(new Set(userFlights.map((flight) => flight.arrivalAirportCode))));

        setSnackbar({
          open: true,
          message: 'Your flights loaded successfully.',
          severity: 'success',
        });
      } catch (err) {
        setError('Failed to load your flights. Please try again later.');
        setSnackbar({
          open: true,
          message: 'Failed to load your flights.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserFlights();
  }, [user]);

  // Function to sort flights based on the selected option
  const sortFlights = (flights, option) => {
    return [...flights].sort((a, b) => {
      if (option === 'earliestDeparture') {
        return new Date(a.departureDate) - new Date(b.departureDate);
      } else if (option === 'latestDeparture') {
        return new Date(b.departureDate) - new Date(a.departureDate);
      } else if (option === 'earliestArrival') {
        return new Date(a.arrivalDate) - new Date(b.arrivalDate);
      } else if (option === 'latestArrival') {
        return new Date(b.arrivalDate) - new Date(a.arrivalDate);
      } else if (option === 'shortestFlight') {
        return (
          new Date(a.arrivalDate) -
          new Date(a.departureDate) -
          (new Date(b.arrivalDate) - new Date(b.departureDate))
        );
      } else if (option === 'longestFlight') {
        return (
          new Date(b.arrivalDate) -
          new Date(b.departureDate) -
          (new Date(a.arrivalDate) - new Date(a.departureDate))
        );
      }
      return 0;
    });
  };

  // Handlers for filter changes
  const handleSortChange = (event) => {
    const option = event.target.value;
    setSortOption(option);
    applyFilters(option, selectedPassenger, selectedAirline, selectedDepartureAirport, selectedArrivalAirport);
  };

  const handlePassengerChange = (event) => {
    const passenger = event.target.value;
    setSelectedPassenger(passenger);
    applyFilters(sortOption, passenger, selectedAirline, selectedDepartureAirport, selectedArrivalAirport);
  };

  const handleAirlineChange = (event) => {
    const airline = event.target.value;
    setSelectedAirline(airline);
    applyFilters(sortOption, selectedPassenger, airline, selectedDepartureAirport, selectedArrivalAirport);
  };

  const handleDepartureAirportChange = (event) => {
    const airport = event.target.value;
    setSelectedDepartureAirport(airport);
    applyFilters(sortOption, selectedPassenger, selectedAirline, airport, selectedArrivalAirport);
  };

  const handleArrivalAirportChange = (event) => {
    const airport = event.target.value;
    setSelectedArrivalAirport(airport);
    applyFilters(sortOption, selectedPassenger, selectedAirline, selectedDepartureAirport, airport);
  };

  const handleDepartureDateChange = (event) => {
    const date = event.target.value;
    setSelectedDepartureDate(date);
    applyFilters(sortOption, selectedPassenger, selectedAirline, selectedDepartureAirport, selectedArrivalAirport, date, selectedArrivalDate);
  };

  const handleArrivalDateChange = (event) => {
    const date = event.target.value;
    setSelectedArrivalDate(date);
    applyFilters(sortOption, selectedPassenger, selectedAirline, selectedDepartureAirport, selectedArrivalAirport, selectedDepartureDate, date);
  };

  // Apply all filters to the flights
  const applyFilters = (sortOption, passenger, airline, depAirport, arrAirport, depDate, arrDate) => {
    let result = sortFlights(flights, sortOption);
    if (passenger) result = result.filter((flight) => flight.passengerName === passenger);
    if (airline) result = result.filter((flight) => flight.airline === airline);
    if (depAirport) result = result.filter((flight) => flight.departureAirportCode === depAirport);
    if (arrAirport) result = result.filter((flight) => flight.arrivalAirportCode === arrAirport);
    if (depDate) result = result.filter((flight) => new Date(flight.departureDate).toISOString().split('T')[0] === depDate);
    if (arrDate) result = result.filter((flight) => new Date(flight.arrivalDate).toISOString().split('T')[0] === arrDate);
    setFilteredFlights(result);
  };

  // Close the snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Render loading spinner while fetching data
  if (authLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      {/* Main Header */}
      <Typography variant="h4" gutterBottom>
        My Flights
      </Typography>

      {/* Filters and Sorting */}
      {flights.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {/* Sort Options */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="sort-label">Sort By</InputLabel>
              <Select
                labelId="sort-label"
                value={sortOption}
                onChange={handleSortChange}
                label="Sort By"
              >
                <MenuItem value="earliestDeparture">Earliest Departure</MenuItem>
                <MenuItem value="latestDeparture">Latest Departure</MenuItem>
                <MenuItem value="earliestArrival">Earliest Arrival</MenuItem>
                <MenuItem value="latestArrival">Latest Arrival</MenuItem>
                <MenuItem value="shortestFlight">Shortest Flight</MenuItem>
                <MenuItem value="longestFlight">Longest Flight</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Divider */}
          <Divider sx={{ my: 2 }} />

          {/* Filters on a new line */}
          <Typography variant="h6" gutterBottom>
            Filter By
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* Passenger Filter */}
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="passenger-label">Passenger</InputLabel>
              <Select
                labelId="passenger-label"
                value={selectedPassenger}
                onChange={handlePassengerChange}
                label="Passenger"
              >
                <MenuItem value="">All</MenuItem>
                {passengerNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="airline-label">Airline</InputLabel>
              <Select
                labelId="airline-label"
                value={selectedAirline}
                onChange={handleAirlineChange}
                label="Airline"
              >
                <MenuItem value="">All</MenuItem>
                {airlines.map((airline) => (
                  <MenuItem key={airline} value={airline}>
                    {airline}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="departure-airport-label">Departure Airport</InputLabel>
              <Select
                labelId="departure-airport-label"
                value={selectedDepartureAirport}
                onChange={handleDepartureAirportChange}
                label="Departure Airport"
              >
                <MenuItem value="">All</MenuItem>
                {departureAirports.map((airport) => (
                  <MenuItem key={airport} value={airport}>
                    {airport}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="arrival-airport-label">Arrival Airport</InputLabel>
              <Select
                labelId="arrival-airport-label"
                value={selectedArrivalAirport}
                onChange={handleArrivalAirportChange}
                label="Arrival Airport"
              >
                <MenuItem value="">All</MenuItem>
                {arrivalAirports.map((airport) => (
                  <MenuItem key={airport} value={airport}>
                    {airport}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <TextField
                label="Departure Date"
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                value={selectedDepartureDate}
                onChange={handleDepartureDateChange}
              />
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <TextField
                label="Arrival Date"
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                value={selectedArrivalDate}
                onChange={handleArrivalDateChange}
              />
            </FormControl>
          </Box>
        </Box>
      )}

      {/* Flight List */}
      {flights.length === 0 ? (
        // No flights at all
        <Typography variant="h6" color="textSecondary">
          You have no flights scheduled. Start by adding a new flight!
        </Typography>
      ) : filteredFlights.length === 0 ? (
        // Flights exist, but no matches for filters
        <Typography variant="h6" color="textSecondary">
          No matching flights found.
        </Typography>
      ) : (
        // Show filtered flights
        <List>
          {filteredFlights.map((flight) => (
            <Flight key={flight.id} flight={flight} />
          ))}
        </List>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {error && (
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={3000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
};

export default UserFlights;
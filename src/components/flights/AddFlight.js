import React, { useState } from 'react';
import {
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  Autocomplete,
} from '@mui/material';
import algoliasearch from 'algoliasearch/lite';

// Initialize Algolia search client
const searchClient = algoliasearch(
  'U9F4V3JVO0',
  'd06eb0d72bb6d1d1cbf13f96992324da'
);

// Fetch airlines matching the query
const fetchAirlines = async (query) => {
  if (!query) return [];
  const { results } = await searchClient.search([
    { indexName: 'Airline', query, params: { hitsPerPage: 5 } },
  ]);
  return results[0]?.hits || []; // Return airline hits or empty array if no results
};

// Fetch airports matching the query
const fetchAirports = async (query) => {
  if (!query) return [];
  const { results } = await searchClient.search([
    { indexName: 'Airport', query, params: { hitsPerPage: 5 } },
  ]);
  return results[0]?.hits || []; // Return airport hits or empty array if no results
};

const AddFlight = ({ addFlight }) => {
  // State variables for form inputs
  const [passengerName, setPassengerName] = useState('');
  const [departureAirportCode, setDepartureAirportCode] = useState('');
  const [arrivalAirportCode, setArrivalAirportCode] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [airlineName, setAirlineName] = useState('');
  const [airlineId, setAirlineId] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [error, setError] = useState(null);
  const [airlineOptions, setAirlineOptions] = useState([]);
  const [departureAirportOptions, setDepartureAirportOptions] = useState([]);
  const [arrivalAirportOptions, setArrivalAirportOptions] = useState([]);

  // Handle airline search suggestions
  const handleAirlineSearch = async (event, value) => {
    setAirlineName(value);
    if (value.length > 0) {
      const airlines = await fetchAirlines(value);
      setAirlineOptions(airlines); // Update airline options
    } else {
      setAirlineOptions([]); // Clear suggestions if input is empty
    }
  };

  // Handle departure airport search suggestions
  const handleDepartureSearch = async (event, value) => {
    if (value.length > 0) {
      const airports = await fetchAirports(value);
      setDepartureAirportOptions(airports); // Update departure airport options
    } else {
      setDepartureAirportOptions([]); // Clear suggestions if input is empty
    }
  };

  // Handle arrival airport search suggestions
  const handleArrivalSearch = async (event, value) => {
    if (value.length > 0) {
      const airports = await fetchAirports(value);
      setArrivalAirportOptions(airports); // Update arrival airport options
    } else {
      setArrivalAirportOptions([]); // Clear suggestions if input is empty
    }
  };

  // Handle airline suggestion selection
  const handleSuggestionClick = (event, value) => {
    if (value) {
      setAirlineName(value.name);
      setAirlineId(value.objectId); // Save airline ID
    } else {
      setAirlineName('');
      setAirlineId('');
    }
  };

  // Handle departure airport selection
  const handleDepartureClick = (event, value) => {
    if (value) {
      setDepartureAirportCode(value.IATA); // Save departure airport IATA code
    } else {
      setDepartureAirportCode('');
    }
  };

  // Handle arrival airport selection
  const handleArrivalClick = (event, value) => {
    if (value) {
      setArrivalAirportCode(value.IATA); // Save arrival airport IATA code
    } else {
      setArrivalAirportCode('');
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate input fields
    if (!passengerName || !departureAirportCode || !arrivalAirportCode || !flightNumber || !airlineId || !departureDate || !arrivalDate) {
      setError('All fields are required.');
      return;
    }

    // Validate that arrival time is after departure time
    if (arrivalDate <= departureDate) {
      setError('Arrival time must be after departure time.');
      return;
    }

    // Create a new flight object
    const newFlight = {
      passengerName,
      departureAirportCode,
      arrivalAirportCode,
      flightNumber: Number(flightNumber),
      airlineId,
      departureDate,
      arrivalDate,
      airlineName,
    };

    // Add the new flight using the provided function
    addFlight(newFlight);
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
      <Typography variant="h6" gutterBottom>
        Add Flight
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Passenger Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Passenger Name"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              required
              fullWidth
              margin="normal"
            />
          </Grid>

          {/* Airline Selection */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              freeSolo
              disableClearable
              options={airlineOptions}
              getOptionLabel={(option) => option.name || ''}
              inputValue={airlineName}
              onInputChange={handleAirlineSearch}
              onChange={handleSuggestionClick}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Airline"
                  margin="normal"
                  fullWidth
                  required
                />
              )}
            />
          </Grid>

          {/* Flight Number */}
          <Grid item xs={12} sm={2.4}>
            <TextField
              label="Flight Number"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              required
              fullWidth
              type="number"
              margin="normal"
              inputProps={{ min: 0 }}
            />
          </Grid>

          {/* Departure Airport */}
          <Grid item xs={12} sm={4.8}>
            <Autocomplete
              freeSolo
              disableClearable
              options={departureAirportOptions}
              getOptionLabel={(option) =>
                option.Name && option.IATA ? `${option.Name} (${option.IATA})` : ''
              }
              filterOptions={(options, { inputValue }) =>
                options.filter(
                  (option) =>
                    option.Name ||
                    option.IATA
                )
              }
              onInputChange={handleDepartureSearch}
              onChange={handleDepartureClick}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Departure Airport"
                  margin="normal"
                  required
                  fullWidth
                />
              )}
            />
          </Grid>

          {/* Arrival Airport */}
          <Grid item xs={12} sm={4.8}>
            <Autocomplete
              freeSolo
              disableClearable
              options={arrivalAirportOptions}
              getOptionLabel={(option) =>
                option.Name && option.IATA ? `${option.Name} (${option.IATA})` : ''
              }
              filterOptions={(options, { inputValue }) =>
                options.filter(
                  (option) =>
                    option.Name ||
                    option.IATA
                )
              }
              onInputChange={handleArrivalSearch}
              onChange={handleArrivalClick}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Arrival Airport"
                  margin="normal"
                  required
                  fullWidth
                />
              )}
            />
          </Grid>

          {/* Departure Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Departure Date and Time"
              type="datetime-local"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              required
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Arrival Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Arrival Date and Time"
              type="datetime-local"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              required
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Add Flight
            </Button>
          </Grid>

          {/* Error Message */}
          {error && (
            <Grid item xs={12}>
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </Grid>
          )}
        </Grid>
      </form>
    </Paper>
  );
};

export default AddFlight;
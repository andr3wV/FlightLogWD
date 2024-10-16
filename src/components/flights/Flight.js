import React from 'react';
import { ListItem, ListItemText, Divider } from '@mui/material';

// Flight component to display flight details
const Flight = ({ flight }) => {
  // Constructing the secondary text with airline and route information
  const secondaryText = (
    <>
      <strong>Airline:</strong> {flight.airline} <br />
      <strong>Route:</strong> {flight.departureAirportCode.toUpperCase()} &rarr; {flight.arrivalAirportCode.toUpperCase()}
    </>
  );

  return (
    <>
      {/* ListItem to display passenger name and flight details */}
      <ListItem alignItems="flex-start">
        <ListItemText
          primary={flight.passengerName}
          secondary={secondaryText}
        />
      </ListItem>
      {/* Divider to separate list items */}
      <Divider component="li" />
    </>
  );
};

export default Flight;

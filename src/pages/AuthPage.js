import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SearchIcon from '@mui/icons-material/Search';
import ViewListIcon from '@mui/icons-material/ViewList';
import MapIcon from '@mui/icons-material/Map';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import HeroImage from '../assets/static/images/jorgen-hendriksen-UfVy7UjQ_rA-unsplash.jpg';

const AuthModule = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const featureItems = [
    { icon: <SearchIcon />, title: 'Search Flights', description: 'Easily search for flights based on your preferences and requirements.' },
    { icon: <ViewListIcon />, title: 'View Your Flights', description: 'Keep track of all your booked flights in one place.' },
    { icon: <MapIcon />, title: 'Live Flight Map', description: 'Visualize live flight paths and monitor selected flights in real-time.' },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center',
      background: `linear-gradient(to bottom, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
      color: 'white',
    }}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Left Side: Text and Buttons */}
          <Grid item xs={12} md={6}>
            <Typography variant={isSmallScreen ? "h3" : "h2"} component="h1" gutterBottom fontWeight="bold">
              Welcome to <span style={{ color: theme.palette.primary.main }}>Flight Tracker</span>
            </Typography>
            <Typography variant="h6" paragraph sx={{ mb: 4 }}>
              Your ultimate solution to manage and monitor flights effortlessly. Whether you're planning a trip, tracking your flights, or viewing live flight paths, Flight Tracker has got you covered.
            </Typography>

            {/* Feature Items */}
            <Grid container spacing={3}>
              {featureItems.map((item, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Paper elevation={3} sx={{ 
                    p: 2, 
                    height: '100%',
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'flex-start', 
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: theme.shadows[10],
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {React.cloneElement(item.icon, { color: "primary", sx: { fontSize: 30, mr: 1 } })}
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {item.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Call to Action Buttons */}
            <Box sx={{ mt: 6, display: 'flex', gap: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={RouterLink}
                to="/register"
                sx={{ 
                  py: 1.5, 
                  px: 4, 
                  fontSize: '1.1rem',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  }
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to="/login"
                sx={{ 
                  py: 1.5, 
                  px: 4, 
                  fontSize: '1.1rem',
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: theme.palette.primary.light,
                    color: theme.palette.primary.light,
                  }
                }}
              >
                Login
              </Button>
            </Box>
          </Grid>

          {/* Right Side: Illustration or Image */}
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={HeroImage}
              alt="Flight Illustration"
              sx={{
                width: '100%',
                height: '100%',
                maxHeight: 600,
                borderRadius: 4,
                boxShadow: theme.shadows[10],
                objectFit: 'cover',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AuthModule;
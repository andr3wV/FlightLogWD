import React, { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Flight as FlightIcon,
  FlightTakeoff as FlightTakeoffIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const Header = ({ title = 'Flight Tracker' }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openUserMenu = Boolean(anchorEl);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleUserMenuClose();
    navigate('/auth');
  };

  const navLinks = [
    { title: 'Flights', path: '/flights', icon: <FlightIcon /> },
    { title: 'My Flights', path: '/my-flights', icon: <FlightTakeoffIcon /> },
    { title: 'Map', path: '/map', icon: <MapIcon /> }
  ];

  const NavButton = ({ item }) => (
    <Button
      color="inherit"
      component={RouterLink}
      to={item.path}
      startIcon={item.icon}
      sx={{
        textTransform: 'none',
        mr: 2,
        fontWeight: 'medium',
        fontSize: '1rem',
        transition: 'all 0.2s',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {item.title}
    </Button>
  );

  const DrawerItem = ({ item, onClick }) => (
    <ListItem 
      button 
      component={RouterLink} 
      to={item.path} 
      onClick={onClick}
      sx={{
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }}
    >
      <ListItemIcon>{item.icon}</ListItemIcon>
      <ListItemText primary={item.title} />
    </ListItem>
  );

  const drawerContent = (
    <Box
      sx={{ 
        width: 250,
        height: '100%',
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
      role="presentation"
      onClick={() => setDrawerOpen(false)}
      onKeyDown={() => setDrawerOpen(false)}
    >
      <List>
        {navLinks.map((item) => (
          <DrawerItem key={item.title} item={item} onClick={() => setDrawerOpen(false)} />
        ))}
        {user ? (
          <DrawerItem 
            item={{ title: 'Logout', icon: <LogoutIcon /> }} 
            onClick={handleLogout} 
          />
        ) : (
          <DrawerItem 
            item={{ title: 'Login/Register', path: '/auth', icon: <AccountCircleIcon /> }}
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          backgroundColor: theme.palette.primary.main,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <FlightIcon sx={{ mr: 1, fontSize: 32, color: theme.palette.primary }} />
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  background:  'white',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {title}
              </Typography>
            </Box>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {navLinks.map((item) => (
                <NavButton key={item.title} item={item} />
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {user ? (
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleUserMenuOpen}
                  size="small"
                  sx={{ 
                    ml: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <Avatar 
                    alt={user.get('firstName')} 
                    src="/static/images/avatar/2.jpg"
                    sx={{ 
                      width: 40, 
                      height: 40,
                      border: `2px solid white`,
                    }}
                  />
                </IconButton>
              </Tooltip>
            ) : (
              !isMobile && (
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/auth"
                  startIcon={<AccountCircleIcon />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'medium',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Login/Register
                </Button>
              )
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={openUserMenu}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
        PaperProps={{
          elevation: 4,
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          component={RouterLink} 
          to="/profile"
          sx={{ 
            py: 1.5,
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <AccountCircleIcon fontSize="small" sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        <MenuItem 
          onClick={handleLogout}
          sx={{ 
            py: 1.5,
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <LogoutIcon fontSize="small" sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Header;


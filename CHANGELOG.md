# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2024-12-14
### Fixed

### Added

- Filtering in My Flights
- Autocomplete on Flights page with Algolia
- Deployment of [yanni-feature6](https://flight-log-wd.vercel.app/flights) and [andrew-feature6](https://flight-log-wd-andrew.vercel.app/flights) on separate links using Vercel

### Changed

- My Flights on Flights page to Upcoming Flights

### Fixed

## [0.5.0] - 2024-11-05
### Added

- User authentication
- Public and Protected Routes

### Changed

- Landing Page

### Fixed

## [0.4.0] - 2024-10-18
### Added
- Initial creation of `CHANGELOG.md`.
- Added React routing
- New airplane class and service

### Changed
- Restructured repository 

### Fixed

## [0.3.0] - 2024-11-01
### Added
- Enhanced welcome page with improved styling, feature highlights, and responsive design.
- Implemented `/my-flights` route to display user-specific flights.
- Integrated user authentication in `Header.js` with responsive navigation and user avatar menu.
- Associated flights with authenticated users in `FlightService.js`.
- Added error handling and loading states across various components for better UX.
- Introduced a mobile-friendly drawer menu for navigation on smaller screens. This was easy with MUI.
- Included a user profile dropdown with options like "Profile" and "Logout".

### Changed
- Updated `AddFlight.js` to associate new flights with the current authenticated user.
- Improved `FlightList.js` to use unique keys (`flight.id`) and enhanced styling for better readability.
- Redesigned `Header.js` for better UI/UX, including responsive design, icons, and accessibility enhancements.
- Modified routing configuration in `AppRoutes.js` to include protected routes and new profile page.
- Enhanced `AuthContext.js` to ensure proper user state management and integration with flight services.

### Fixed
- Resolved issues with the `Add Flight` functionality by correcting service and component logic.
- Ensured unique keys in `FlightList.js` to prevent rendering issues.
- Fixed authentication flow to correctly redirect users upon login and logout.


## [0.2.0] - 2024-10-18
### Added
- Initial creation of `CHANGELOG.md`.
- Added React routing.
- New airplane class and service.

### Changed
- Restructured repository.

### Fixed

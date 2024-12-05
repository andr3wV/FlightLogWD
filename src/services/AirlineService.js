import Parse from "../services/parseService";

/**
 * Fetch all flights from Parse server.
 * @returns {Promise<Array>} List of fetched flights.
 */
export const fetchAirportLongLatByCode= async (code) => {
  try {
    const query = new Parse.Query("AirportLocation");
    query.equalTo("IATA", code); // Filter by current user
    const results = await query.find();

    // Map Parse objects to plain JavaScript objects
    const result =  results.map(item => ({
        longitude: item.get("Longitude"),
        latitude: item.get("Latitude"),
    }));
    return result;
  } catch (error) {
    console.error("Error fetching flights:", error);
    throw error;
  }
};
import axios from "axios";
import getBaseUrl from "profile-tracker-react-sdk";

const API_BASE_URL = getBaseUrl() + "/api/v1";

export const fetchProfiles = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/profile/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching profiles:", error);
        return [];
    }
};

export const fetchUserDetails = async (profileId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${profileId}/profile`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user details for ${profileId}:`, error);
        return null;
    }
};

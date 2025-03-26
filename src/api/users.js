import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1";

export const fetchProfiles = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/profile/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching profiles:", error);
        return [];
    }
};

export const fetchUserDetails = async (permaId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${permaId}/profile`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user details for ${permaId}:`, error);
        return null;
    }
};

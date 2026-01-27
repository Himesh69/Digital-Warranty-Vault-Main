import api from '../config/api';

const authService = {
    // Register new user
    async register(email, name, password) {
        const response = await api.post('/auth/register/', {
            email,
            name,
            password,
            password2: password,
        });

        // Store tokens
        if (response.data.access && response.data.refresh) {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
        }

        return response.data;
    },

    // Login user
    async login(email, password) {
        const response = await api.post('/auth/login/', {
            email,
            password,
        });

        // Store tokens
        if (response.data.access && response.data.refresh) {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
        }

        return response.data;
    },

    // Logout user
    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },

    // Get user profile
    async getProfile() {
        const response = await api.get('/auth/profile/');
        return response.data;
    },

    // Update user profile
    async updateProfile(data) {
        const response = await api.put('/auth/profile/', data);
        return response.data;
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem('access_token');
    },
};

export default authService;

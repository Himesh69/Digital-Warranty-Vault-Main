import api from '../config/api';

const warrantyService = {
    // Get all warranties for the authenticated user
    async getWarranties() {
        const response = await api.get('/warranties/');
        console.log('Warranties response:', response.data);
        // Handle both array and paginated response
        if (Array.isArray(response.data)) {
            return response.data;
        }
        if (response.data.results) {
            return response.data.results;
        }
        return response.data || [];
    },

    // Get single warranty by ID
    async getWarranty(id) {
        const response = await api.get(`/warranties/${id}/`);
        return response.data;
    },

    // Create new warranty
    async createWarranty(data) {
        const isFormData = data instanceof FormData;

        const response = await api.post('/warranties/', data, isFormData ? {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        } : undefined);
        return response.data;
    },

    // Update warranty
    async updateWarranty(id, data) {
        const response = await api.put(`/warranties/${id}/`, data);
        return response.data;
    },

    // Delete warranty
    async deleteWarranty(id) {
        const response = await api.delete(`/warranties/${id}/`);
        return response.data;
    },

    // Get dashboard statistics
    async getStats() {
        const response = await api.get('/warranties/stats/');
        return response.data;
    },

    // Scan receipt using OCR
    async scanReceipt(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/warranties/scan_receipt/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get public warranty (for QR code)
    async getPublicWarranty(id) {
        const response = await api.get(`/warranty/${id}/`);
        return response.data;
    },
};

export default warrantyService;

// MediFlow Medicine Store - Zustand State Management
// Manages medicine data and operations

import { create } from 'zustand';
import databaseService from '../services/databaseService';
import apiService from '../services/apiService';

const useMedicineStore = create((set, get) => ({
    // State
    medicines: [],
    loading: false,
    error: null,
    searchResults: [],
    currentMedicine: null,

    // Actions

    /**
     * Load all medicines for a user
     */
    loadMedicines: async (userId) => {
        set({ loading: true, error: null });
        try {
            const medicines = await databaseService.getMedicines(userId);
            set({ medicines, loading: false });
            return medicines;
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Error loading medicines:', error);
            return [];
        }
    },

    /**
     * Add a new medicine
     */
    addMedicine: async (userId, medicineData) => {
        set({ loading: true, error: null });
        try {
            const medId = await databaseService.saveMedicine({
                ...medicineData,
                user_id: userId,
            });

            // Reload medicines
            await get().loadMedicines(userId);

            set({ loading: false });
            return medId;
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Error adding medicine:', error);
            throw error;
        }
    },

    /**
     * Update an existing medicine
     */
    updateMedicine: async (medId, updates, userId) => {
        set({ loading: true, error: null });
        try {
            await databaseService.updateMedicine(medId, updates);

            // Reload medicines
            await get().loadMedicines(userId);

            set({ loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Error updating medicine:', error);
            throw error;
        }
    },

    /**
     * Delete a medicine
     */
    deleteMedicine: async (medId, userId) => {
        set({ loading: true, error: null });
        try {
            await databaseService.deleteMedicine(medId);

            // Reload medicines
            await get().loadMedicines(userId);

            set({ loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Error deleting medicine:', error);
            throw error;
        }
    },

    /**
     * Search medicines in database
     */
    searchMedicines: async (userId, searchTerm) => {
        if (!searchTerm || searchTerm.trim() === '') {
            set({ searchResults: [] });
            return [];
        }

        set({ loading: true, error: null });
        try {
            const results = await databaseService.searchMedicines(userId, searchTerm);
            set({ searchResults: results, loading: false });
            return results;
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Error searching medicines:', error);
            return [];
        }
    },

    /**
     * Search medicine in OpenFDA API
     */
    searchMedicineAPI: async (medicineName) => {
        set({ loading: true, error: null });
        try {
            const result = await apiService.searchMedicine(medicineName);
            set({ loading: false });

            if (result.success) {
                return result.medicines;
            } else {
                set({ error: result.error });
                return [];
            }
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Error searching medicine API:', error);
            return [];
        }
    },

    /**
     * Get a single medicine by ID
     */
    getMedicineById: async (medId) => {
        set({ loading: true, error: null });
        try {
            const medicine = await databaseService.getMedicineById(medId);
            set({ currentMedicine: medicine, loading: false });
            return medicine;
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Error getting medicine:', error);
            return null;
        }
    },

    /**
     * Set current medicine
     */
    setCurrentMedicine: (medicine) => {
        set({ currentMedicine: medicine });
    },

    /**
     * Clear search results
     */
    clearSearchResults: () => {
        set({ searchResults: [] });
    },

    /**
     * Clear error
     */
    clearError: () => {
        set({ error: null });
    },

    /**
     * Get medicine count
     */
    getMedicineCount: () => {
        return get().medicines.length;
    },

    /**
     * Check if medicine limit reached (for free tier)
     */
    isLimitReached: (limit = 10) => {
        return get().medicines.length >= limit;
    },
}));

export default useMedicineStore;

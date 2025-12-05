import { create } from 'zustand';
import databaseService from '../services/databaseService';

const useHealthStore = create((set, get) => ({
    measurements: [],
    loading: false,
    error: null,

    loadMeasurements: async (userId) => {
        set({ loading: true, error: null });
        try {
            // We'll need to implement this in databaseService
            const data = await databaseService.getHealthMeasurements(userId);
            set({ measurements: data, loading: false });
        } catch (error) {
            console.error('Error loading health measurements:', error);
            set({ error: error.message, loading: false });
        }
    },

    addMeasurement: async (userId, type, value, unit, notes = '') => {
        set({ loading: true, error: null });
        try {
            const measurement = {
                user_id: userId,
                type,
                value,
                unit,
                notes,
                date: new Date().toISOString(),
            };

            // Implement in databaseService
            const id = await databaseService.addHealthMeasurement(measurement);

            const newMeasurement = { ...measurement, id };
            set(state => ({
                measurements: [newMeasurement, ...state.measurements],
                loading: false
            }));
            return id;
        } catch (error) {
            console.error('Error adding measurement:', error);
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteMeasurement: async (id) => {
        set({ loading: true, error: null });
        try {
            await databaseService.deleteHealthMeasurement(id);
            set(state => ({
                measurements: state.measurements.filter(m => m.id !== id),
                loading: false
            }));
        } catch (error) {
            console.error('Error deleting measurement:', error);
            set({ error: error.message, loading: false });
        }
    }
}));

export default useHealthStore;

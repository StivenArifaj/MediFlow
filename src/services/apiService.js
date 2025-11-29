// MediFlow API Service - OpenFDA Integration
// Free, official FDA medicine database API

const OPENFDA_BASE_URL = 'https://api.fda.gov/drug';

class APIService {
    /**
     * Search for medicine by name using OpenFDA API
     * @param {string} medicineName - Name of the medicine to search
     * @returns {Promise<Object>} Medicine data or error
     */
    async searchMedicine(medicineName) {
        try {
            // Clean the search term
            const cleanName = medicineName.trim().toLowerCase();

            // Try brand name search first
            const brandResponse = await fetch(
                `${OPENFDA_BASE_URL}/label.json?search=openfda.brand_name:"${encodeURIComponent(cleanName)}"&limit=5`
            );

            if (brandResponse.ok) {
                const data = await brandResponse.json();
                if (data.results && data.results.length > 0) {
                    return this.parseOpenFDAResponse(data);
                }
            }

            // Fallback to generic name search
            return await this.searchByGenericName(cleanName);

        } catch (error) {
            console.error('Medicine API Error:', error);
            return {
                success: false,
                error: 'Failed to search medicine database',
                message: error.message,
            };
        }
    }

    /**
     * Search by generic name (fallback)
     */
    async searchByGenericName(name) {
        try {
            const response = await fetch(
                `${OPENFDA_BASE_URL}/label.json?search=openfda.generic_name:"${encodeURIComponent(name)}"&limit=5`
            );

            if (!response.ok) {
                throw new Error('Medicine not found');
            }

            const data = await response.json();
            return this.parseOpenFDAResponse(data);

        } catch (error) {
            return {
                success: false,
                error: 'Medicine not found in database',
                message: 'Try searching with a different name or add manually',
            };
        }
    }

    /**
     * Parse OpenFDA API response into our medicine format
     */
    parseOpenFDAResponse(data) {
        if (!data.results || data.results.length === 0) {
            return {
                success: false,
                error: 'No results found',
            };
        }

        // Get all results for user to choose from
        const medicines = data.results.slice(0, 5).map(result => {
            const openFDA = result.openfda || {};

            return {
                brandName: openFDA.brand_name?.[0] || 'Unknown',
                genericName: openFDA.generic_name?.[0] || 'Unknown',
                manufacturer: openFDA.manufacturer_name?.[0] || 'Unknown',
                productType: openFDA.product_type?.[0] || 'Unknown',
                route: openFDA.route?.[0] || 'Unknown',
                substanceName: openFDA.substance_name?.[0] || 'Unknown',

                // Safe information only (no medical advice)
                purpose: result.purpose?.[0] || '',
                description: result.description?.[0] || '',

                // API metadata
                apiSource: 'OpenFDA',
                apiId: openFDA.application_number?.[0] || null,
                confidence: this.calculateConfidence(result),
            };
        });

        return {
            success: true,
            medicines,
            count: medicines.length,
        };
    }

    /**
     * Calculate confidence score based on data completeness
     */
    calculateConfidence(result) {
        const openFDA = result.openfda || {};
        let score = 0;

        if (openFDA.brand_name?.[0]) score += 25;
        if (openFDA.generic_name?.[0]) score += 25;
        if (openFDA.manufacturer_name?.[0]) score += 20;
        if (openFDA.product_type?.[0]) score += 15;
        if (result.purpose?.[0]) score += 15;

        return Math.min(score, 100);
    }

    /**
     * Get medicine details by API ID
     */
    async getMedicineDetails(apiId) {
        try {
            const response = await fetch(
                `${OPENFDA_BASE_URL}/label.json?search=openfda.application_number:"${apiId}"`
            );

            if (!response.ok) {
                throw new Error('Medicine details not found');
            }

            const data = await response.json();
            return this.parseOpenFDAResponse(data);

        } catch (error) {
            return {
                success: false,
                error: 'Failed to fetch medicine details',
            };
        }
    }

    /**
     * Check API health
     */
    async checkAPIHealth() {
        try {
            const response = await fetch(`${OPENFDA_BASE_URL}/label.json?limit=1`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Export singleton instance
const apiService = new APIService();
export default apiService;
